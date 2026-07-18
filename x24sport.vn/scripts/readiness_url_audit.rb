#!/usr/bin/env ruby
# frozen_string_literal: true

require 'json'
require 'net/http'
require 'openssl'
require 'rexml/document'
require 'thread'
require 'time'
require 'uri'

SOURCE = URI(ENV.fetch('SOURCE_URL', 'https://x24sport.vn'))
TARGET = URI(ENV.fetch('TARGET_URL', 'https://next.x24sport.vn'))
THREADS = Integer(ENV.fetch('AUDIT_THREADS', '16'))
FAILURE_LIMIT = Integer(ENV.fetch('AUDIT_FAILURE_LIMIT', '50'))

def request(uri, method: Net::HTTP::Get)
  request = method.new(uri)
  request['User-Agent'] = 'X24Sport-Readiness-Audit/1.0'
  Net::HTTP.start(uri.host, uri.port, use_ssl: uri.scheme == 'https',
                  open_timeout: 10, read_timeout: 30) do |http|
    http.request(request)
  end
end

def xml_locations(uri, container)
  document = REXML::Document.new(request(uri).body)
  REXML::XPath.match(
    document,
    "//*[local-name()='#{container}']/*[local-name()='loc']"
  ).map(&:text)
end

sitemap_index = URI.join(SOURCE.to_s, '/sitemap_index.xml')
sitemaps = xml_locations(sitemap_index, 'sitemap')
contracts = sitemaps.flat_map do |sitemap_url|
  sitemap = URI(sitemap_url)
  xml_locations(sitemap, 'url').map do |source_url|
    source_uri = URI(source_url)
    {
      sitemap: File.basename(sitemap.path),
      source_url: source_url,
      target_url: URI.join(TARGET.to_s, source_uri.request_uri).to_s
    }
  end
end

queue = Queue.new
contracts.each { |contract| queue << contract }
results = []
mutex = Mutex.new

workers = Array.new(THREADS) do
  Thread.new do
    loop do
      contract = queue.pop(true)
      target_uri = URI(contract[:target_url])
      response = request(target_uri, method: Net::HTTP::Head)
      result = contract.merge(
        status: response.code.to_i,
        location: response['location'],
        direct_200: response.code.to_i == 200 && response['location'].nil?
      )
      mutex.synchronize { results << result }
    rescue ThreadError
      break
    rescue StandardError => error
      mutex.synchronize do
        results << contract.merge(status: 0, location: nil, direct_200: false, error: error.message)
      end
    end
  end
end
workers.each(&:join)

summary = results.group_by { |result| result[:sitemap] }.transform_values do |items|
  statuses = items.group_by { |item| item[:status] }.transform_values(&:length)
  {
    total: items.length,
    direct_200: items.count { |item| item[:direct_200] },
    redirects: items.count { |item| item[:status].between?(300, 399) },
    errors: items.count { |item| item[:status].zero? },
    statuses: statuses.sort.to_h
  }
end

failures = results.reject { |result| result[:direct_200] }
                  .sort_by { |result| [result[:sitemap], result[:source_url]] }
output = {
  source: SOURCE.to_s,
  target: TARGET.to_s,
  checked_at: Time.now.utc.iso8601,
  total: results.length,
  direct_200: results.count { |result| result[:direct_200] },
  summary: summary.sort.to_h,
  failure_count: failures.length,
  failure_examples: failures.first(FAILURE_LIMIT)
}

puts JSON.pretty_generate(output)
