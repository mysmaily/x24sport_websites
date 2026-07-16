#!/usr/bin/env ruby

require "json"
require "open3"
require "pathname"

ROOT = Pathname.new(__dir__).parent.expand_path
ENV_FILE = ROOT.join(".website-registry.env")
START_MARKER = "<!-- WEBSITE_REGISTRY_START -->"
END_MARKER = "<!-- WEBSITE_REGISTRY_END -->"
DOMAIN_PATTERN = /\A[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?\z/i

def load_env_file(path)
  return unless path.exist?

  path.each_line do |line|
    stripped = line.strip
    next if stripped.empty? || stripped.start_with?("#")

    key, value = stripped.split("=", 2)
    next if key.nil? || value.nil? || ENV.key?(key)

    ENV[key] = value
  end
end

def connection
  {
    "host" => ENV.fetch("POSTGRES_HOST", "localhost"),
    "port" => ENV.fetch("POSTGRES_PORT", "5432"),
    "database" => ENV.fetch("POSTGRES_DATABASE", "workshop_development"),
    "user" => ENV.fetch("POSTGRES_USER", "postgres"),
    "password" => ENV.fetch("POSTGRES_PASSWORD", "")
  }
end

def psql(sql)
  config = connection
  command = [
    ENV.fetch("PSQL_BIN", "psql"),
    "-h", config.fetch("host"),
    "-p", config.fetch("port"),
    "-U", config.fetch("user"),
    "-d", config.fetch("database"),
    "-v", "ON_ERROR_STOP=1",
    "-A", "-t", "-c", sql
  ]
  stdout, stderr, status = Open3.capture3(
    { "PGPASSWORD" => config.fetch("password") },
    *command
  )
  raise "Registry query failed: #{stderr.strip}" unless status.success?

  stdout.strip
end

def validate_domain!(domain)
  raise "Invalid domain: #{domain}" unless DOMAIN_PATTERN.match?(domain)
end

def registry_records(domain: nil)
  if domain
    validate_domain!(domain)
    domain_filter = "AND LOWER(w.domain) = LOWER('#{domain}')"
    wordpress_filter = ""
  else
    domain_filter = ""
    wordpress_filter = "AND wc.is_wordpress IS TRUE"
  end

  sql = <<~SQL
    SELECT COALESCE(jsonb_agg(profile ORDER BY profile->>'domain'), '[]'::jsonb)
    FROM (
      SELECT jsonb_build_object(
        'website_id', w.id,
        'domain', w.domain,
        'name', w.name,
        'brand_name', w.brand_name,
        'use_cdn', w.use_cdn,
        'allow_copy', w.allow_copy,
        'n8n_capable', w.n8n_capable,
        'nginx_cache_status', w.nginx_cache_status,
        'cloudflare_cache_status', w.cloudflare_cache_status,
        'has_admin_credentials',
          (NULLIF(w.admin_account, '') IS NOT NULL AND NULLIF(w.admin_password, '') IS NOT NULL),
        'config_id', wc.id,
        'config_status', wc.status,
        'is_wordpress', wc.is_wordpress,
        'site_title', wc.site_title,
        'site_description', wc.site_description,
        'application_port', wc.port,
        'root_directory', wc.root_directory,
        'wp_content_directory', wc.wp_content_directory,
        'source_directory', wc.source_directory,
        'root_folder', wc.root_folder,
        'source_folder', wc.source_folder,
        'wp_content_folder', wc.wp_content_folder,
        'database_endpoint', wc.db_host,
        'has_database_password', NULLIF(wc.db_password, '') IS NOT NULL,
        'website_host_id', wh.id,
        'website_host_private_ip', wh.private_ip,
        'website_host_public_ip', wh.public_ip,
        'website_host_is_setup', wh.is_setup,
        'website_proxy_id', wp.id,
        'website_proxy_private_ip', wp.private_ip,
        'website_proxy_public_ip', wp.public_ip,
        'database_host_id', dh.id,
        'database_host_private_ip', dh.private_ip,
        'database_host_public_ip', dh.public_ip,
        'database_host_type', dh.host_type,
        'database_container_name', dh.container_name,
        'has_database_root_password', NULLIF(dh.root_password, '') IS NOT NULL,
        'cloudflare_account_registry_id', ca.id,
        'cloudflare_account_id', ca.account_id,
        'has_cloudflare_api_token', NULLIF(ca.api_token, '') IS NOT NULL,
        'has_cloudflare_api_key', NULLIF(ca.api_key, '') IS NOT NULL,
        'has_r2_credentials',
          (NULLIF(ca.r2_key, '') IS NOT NULL AND NULLIF(ca.r2_secret, '') IS NOT NULL)
      ) AS profile
      FROM websites w
      LEFT JOIN LATERAL (
        SELECT *
        FROM website_configs candidate
        WHERE candidate.website_id = w.id
        ORDER BY candidate.updated_at DESC NULLS LAST, candidate.id DESC
        LIMIT 1
      ) wc ON true
      LEFT JOIN website_hosts wh ON wh.id = wc.website_host_id
      LEFT JOIN website_proxies wp ON wp.id = wc.website_proxy_id
      LEFT JOIN database_hosts dh ON dh.id = wc.database_host_id
      LEFT JOIN cloudflare_accounts ca ON ca.id = wc.cloudflare_account_id
      WHERE NULLIF(BTRIM(w.domain), '') IS NOT NULL
        #{wordpress_filter}
        #{domain_filter}
    ) records;
  SQL

  JSON.parse(psql(sql))
end

def markdown_value(value)
  return "Not configured" if value.nil? || value.to_s.strip.empty?
  return value ? "Yes" : "No" if value == true || value == false

  value.to_s.gsub("|", "\\|").gsub(/\s+/, " ").strip
end

def registry_block(record)
  domain = record.fetch("domain")
  token_command = "ruby ../scripts/website_registry.rb cloudflare-token #{domain}"
  sync_command = "ruby ../scripts/website_registry.rb sync domain=#{domain}"

  fields = [
    ["Website registry ID", record["website_id"]],
    ["Configuration registry ID", record["config_id"]],
    ["Configuration status", record["config_status"]],
    ["Display name", record["name"]],
    ["Brand name", record["brand_name"]],
    ["WordPress", record["is_wordpress"]],
    ["CDN enabled", record["use_cdn"]],
    ["N8N capable", record["n8n_capable"]],
    ["Nginx cache status", record["nginx_cache_status"]],
    ["Cloudflare cache status", record["cloudflare_cache_status"]],
    ["Application port", record["application_port"]],
    ["Root directory", record["root_directory"]],
    ["WordPress content directory", record["wp_content_directory"]],
    ["Source directory", record["source_directory"]],
    ["Root folder", record["root_folder"]],
    ["Source folder", record["source_folder"]],
    ["WordPress content folder", record["wp_content_folder"]],
    ["Website host registry ID", record["website_host_id"]],
    ["Website host private IP", record["website_host_private_ip"]],
    ["Website host public IP", record["website_host_public_ip"]],
    ["Website host setup complete", record["website_host_is_setup"]],
    ["Proxy registry ID", record["website_proxy_id"]],
    ["Proxy private IP", record["website_proxy_private_ip"]],
    ["Proxy public IP", record["website_proxy_public_ip"]],
    ["Database host registry ID", record["database_host_id"]],
    ["Database endpoint", record["database_endpoint"]],
    ["Database host private IP", record["database_host_private_ip"]],
    ["Database host public IP", record["database_host_public_ip"]],
    ["Database host type", record["database_host_type"]],
    ["Database container", record["database_container_name"]],
    ["Cloudflare account registry ID", record["cloudflare_account_registry_id"]],
    ["Cloudflare account ID", record["cloudflare_account_id"]]
  ]

  table = fields.map do |label, value|
    "| #{label} | #{markdown_value(value)} |"
  end.join("\n")

  <<~MARKDOWN.strip
    #{START_MARKER}
    ## Central website registry

    Generated from the latest `website_configs` record. From this website folder,
    run `#{sync_command}` to refresh only this website block. Local notes outside
    the markers are preserved.

    | Field | Value |
    |-------|-------|
    #{table}

    ### Credential availability

    | Credential | Stored in registry |
    |------------|--------------------|
    | Website admin credentials | #{markdown_value(record["has_admin_credentials"])} |
    | Website database password | #{markdown_value(record["has_database_password"])} |
    | Database root password | #{markdown_value(record["has_database_root_password"])} |
    | Cloudflare API token | #{markdown_value(record["has_cloudflare_api_token"])} |
    | Cloudflare global API key | #{markdown_value(record["has_cloudflare_api_key"])} |
    | Cloudflare R2 credentials | #{markdown_value(record["has_r2_credentials"])} |

    Credentials are intentionally excluded from documentation. Retrieve a
    Cloudflare API token only when an explicit task requires it:

    ```bash
    #{token_command}
    ```

    Do not paste runtime secrets into `AGENTS.md`, logs, commits, or handoff messages.
    #{END_MARKER}
  MARKDOWN
end

def base_profile(record, isolated:)
  domain = record.fetch("domain")
  title = isolated ? "_#{domain} — Isolated Website Profile" : "#{domain} — Managed Website Profile"
  scope = if isolated
    <<~SCOPE.strip
      > Scope: This website uses isolated mode. Read `../AGENTS.md` for routing and
      > safety, then use only this local profile. Do not load
      > `../WEBSITE-OPTIMIZATION-GUIDE.md`.
    SCOPE
  else
    <<~SCOPE.strip
      > Scope: This file contains only data and runbooks specific to `#{domain}`.
      > Shared routing is defined in `../AGENTS.md`. Load the optimization guide only
      > when the current request matches a guide-loading trigger.
    SCOPE
  end

  <<~MARKDOWN
    # #{title}

    #{scope}

    #{registry_block(record)}
  MARKDOWN
end

def update_profile(path, record, isolated:)
  block = registry_block(record)
  if path.exist?
    content = path.read
    if content.include?(START_MARKER) && content.include?(END_MARKER)
      pattern = /#{Regexp.escape(START_MARKER)}.*?#{Regexp.escape(END_MARKER)}/m
      path.write(content.sub(pattern, block))
    else
      path.write("#{content.rstrip}\n\n#{block}\n")
    end
  else
    path.write(base_profile(record, isolated: isolated))
  end
end

def sync(domain: nil)
  records = registry_records(domain: domain)
  raise "No website profile found#{domain ? " for #{domain}" : ""}." if records.empty?

  records.each do |record|
    domain = record.fetch("domain").downcase
    validate_domain!(domain)

    managed_folder = ROOT.join(domain)
    isolated_folder = ROOT.join("_#{domain}")
    if managed_folder.exist? && isolated_folder.exist?
      raise "Both managed and isolated folders exist for #{domain}"
    end

    isolated = isolated_folder.exist?
    folder = isolated ? isolated_folder : managed_folder
    folder.mkpath
    update_profile(folder.join("AGENTS.md"), record, isolated: isolated)

    loader = folder.join("CLAUDE.md")
    loader.write("@AGENTS.md\n") unless loader.exist?
  end

  label = domain ? "website profile" : "WordPress website profile"
  puts "Synchronized #{records.length} #{label}#{records.length == 1 ? "" : "s"}."
end

def cloudflare_token(domain)
  validate_domain!(domain)

  sql = <<~SQL
    SELECT ca.api_token
    FROM websites w
    JOIN LATERAL (
      SELECT *
      FROM website_configs candidate
      WHERE candidate.website_id = w.id
      ORDER BY candidate.updated_at DESC NULLS LAST, candidate.id DESC
      LIMIT 1
    ) wc ON true
    JOIN cloudflare_accounts ca ON ca.id = wc.cloudflare_account_id
    WHERE LOWER(w.domain) = LOWER('#{domain}')
    LIMIT 1;
  SQL
  token = psql(sql)
  raise "No Cloudflare API token found for #{domain}" if token.empty?

  $stdout.write(token)
end

load_env_file(ENV_FILE)

def parse_sync_options(args)
  options = {}

  args.each do |arg|
    key, value = arg.split("=", 2)
    case key
    when "domain"
      abort "Usage: ruby scripts/website_registry.rb sync domain=example.com" if value.to_s.strip.empty?
      options[:domain] = value.strip.downcase
    else
      abort "Unknown sync option: #{arg}"
    end
  end

  options
end

case ARGV.first
when "sync"
  sync(**parse_sync_options(ARGV.drop(1)))
when "cloudflare-token"
  domain = ARGV[1].to_s
  abort "Usage: ruby scripts/website_registry.rb cloudflare-token DOMAIN" if domain.empty?
  cloudflare_token(domain)
else
  abort <<~USAGE
    Usage:
      ruby scripts/website_registry.rb sync
      ruby scripts/website_registry.rb sync domain=example.com
      ruby scripts/website_registry.rb cloudflare-token DOMAIN
  USAGE
end
