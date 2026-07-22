#!/usr/bin/env node
import { execFile, spawn } from 'node:child_process'
import { mkdir, mkdtemp, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { basename, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { tmpdir } from 'node:os'

const repoRoot = new URL('../..', import.meta.url).pathname
const auditScript = join(repoRoot, '.codex/skills/develop-x24sport-websites/scripts/audit_page.py')
const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const sites = {
  'x24sport.vn': {
    packageDir: 'x24sport.vn',
    packageName: 'x24sport-frontend',
    defaultPort: 3010,
    publicUrl: 'https://x24sport.vn',
    env: { PAYLOAD_API_URL: 'https://cms.x24sport.vn', TENANT_SLUG: 'x24sport' },
    paths: { home: '/', catalog: '/san-pham/', static: '/lien-he/' },
  },
  'mayaocaulong.vn': {
    packageDir: 'mayaocaulong.vn',
    packageName: 'mayaocaulong-frontend',
    defaultPort: 3002,
    publicUrl: 'https://mayaocaulong.vn',
    env: { PAYLOAD_API_URL: 'https://cms.x24sport.vn', TENANT_SLUG: 'mayaocaulong' },
    paths: { home: '/', catalog: '/san-pham/', static: '/dat-may-ao-cau-long/' },
  },
  'mayaopickleball.vn': {
    packageDir: 'mayaopickleball.vn',
    packageName: 'mayaopickleball-frontend',
    defaultPort: 3004,
    publicUrl: 'https://mayaopickleball.vn',
    env: { PAYLOAD_API_URL: 'https://cms.x24sport.vn', TENANT_SLUG: 'mayaopickleball' },
    paths: { home: '/', catalog: '/san-pham/', static: '/dat-may-ao-pickleball/' },
  },
  'mayaobongchuyen.vn': {
    packageDir: 'mayaobongchuyen.vn',
    packageName: 'mayaobongchuyen-frontend',
    defaultPort: 3003,
    publicUrl: 'https://mayaobongchuyen.vn',
    env: { PAYLOAD_API_URL: 'https://cms.x24sport.vn', TENANT_SLUG: 'mayaobongchuyen' },
    paths: { home: '/', catalog: '/san-pham/', static: '/' },
  },
  'mayaobongro.vn': {
    packageDir: 'mayaobongro.vn',
    packageName: 'mayaobongro-frontend',
    defaultPort: 3005,
    publicUrl: 'https://mayaobongro.vn',
    env: { PAYLOAD_API_URL: 'https://cms.x24sport.vn', TENANT_SLUG: 'mayaobongro' },
    paths: { home: '/', catalog: '/san-pham/', static: '/dat-may-ao-bong-ro/' },
  },
  'mayaochaybo.vn': {
    packageDir: 'mayaochaybo.vn',
    packageName: 'mayaochaybo-frontend',
    defaultPort: 3011,
    publicUrl: 'https://mayaochaybo.vn',
    env: { PAYLOAD_API_URL: 'https://cms.x24sport.vn', TENANT_SLUG: 'mayaochaybo' },
    paths: { home: '/', catalog: '/san-pham/', static: '/lien-he/' },
  },
}

function parseArgs(argv) {
  const args = {
    site: '',
    all: false,
    baseUrl: '',
    out: '',
    runBuild: false,
    runTypecheck: false,
    screenshots: false,
    browserChecks: false,
    timeoutMs: 30000,
  }

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--all') args.all = true
    else if (arg === '--site') args.site = argv[++i] || ''
    else if (arg === '--base-url') args.baseUrl = argv[++i] || ''
    else if (arg === '--out') args.out = argv[++i] || ''
    else if (arg === '--build') args.runBuild = true
    else if (arg === '--typecheck') args.runTypecheck = true
    else if (arg === '--screenshots') args.screenshots = true
    else if (arg === '--browser-checks') args.browserChecks = true
    else if (arg === '--timeout-ms') args.timeoutMs = Number(argv[++i] || args.timeoutMs)
    else if (arg === '--help' || arg === '-h') {
      printHelp()
      process.exit(0)
    } else {
      throw new Error(`Unknown argument: ${arg}`)
    }
  }

  if (!args.all && !args.site) throw new Error('Pass --site <domain> or --all')
  if (args.all && args.baseUrl) throw new Error('--base-url is only valid with one --site')
  if (args.site && !sites[args.site]) throw new Error(`Unknown site: ${args.site}`)
  return args
}

function printHelp() {
  console.log(`Usage:
  node operations/scripts/monorepo-baseline.mjs --site mayaopickleball.vn [--screenshots] [--build] [--typecheck]
  node operations/scripts/monorepo-baseline.mjs --all

Options:
  --site <domain>       Audit one configured site.
  --all                 Audit all configured sites.
  --base-url <url>      Override public URL for one site, such as http://localhost:3004.
  --out <dir>           Evidence root. Default: operations/monorepo-baseline/<YYYYMMDD-HHMMSS>.
  --build               Run pnpm build in the site folder.
  --typecheck           Run pnpm typecheck when script exists.
  --screenshots         Capture Chrome headless screenshots at 390x844 and 1440x900.
  --browser-checks      Run Chrome computed-style/layout checks at 390x844 and 1440x900.
  --timeout-ms <ms>     Per-command timeout. Default: 30000.
`)
}

function todayStamp() {
  return new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '-')
}

function normalizeBaseUrl(value) {
  return value.replace(/\/+$/, '')
}

function urlFor(baseUrl, path) {
  return `${normalizeBaseUrl(baseUrl)}${path.startsWith('/') ? path : `/${path}`}`
}

function run(command, args, options = {}) {
  const timeout = options.timeoutMs || 30000
  return new Promise((resolve) => {
    execFile(command, args, {
      cwd: options.cwd || repoRoot,
      timeout,
      env: { ...process.env, ...(options.env || {}) },
    }, (error, stdout, stderr) => {
      resolve({
        ok: !error,
        command: [command, ...args].join(' '),
        code: error && typeof error.code === 'number' ? error.code : 0,
        stdout,
        stderr,
        error: error ? String(error.message || error) : '',
      })
    })
  })
}

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'))
}

async function listFiles(dir, predicate, output = []) {
  if (!existsSync(dir)) return output
  for (const entry of await readdir(dir)) {
    if (entry === 'node_modules' || entry === '.next') continue
    const full = join(dir, entry)
    const info = await stat(full)
    if (info.isDirectory()) await listFiles(full, predicate, output)
    else if (predicate(full)) output.push(full)
  }
  return output
}

async function fetchText(url, timeoutMs) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'user-agent': 'X24SportMonorepoBaseline/1.0' },
      redirect: 'follow',
    })
    const text = await response.text()
    return {
      ok: response.ok,
      status: response.status,
      finalUrl: response.url,
      contentType: response.headers.get('content-type') || '',
      text,
    }
  } catch (error) {
    return { ok: false, status: 0, finalUrl: url, contentType: '', text: '', error: String(error) }
  } finally {
    clearTimeout(timer)
  }
}

function extractTitle(html) {
  return html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, ' ').trim() || ''
}

function extractH1(html) {
  return html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1]?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || ''
}

function extractCanonical(html) {
  return html.match(/<link\b[^>]*rel=["'][^"']*canonical[^"']*["'][^>]*href=["']([^"']+)["'][^>]*>/i)?.[1] || ''
}

function extractAnalytics(html) {
  return {
    hasGtag: html.includes('googletagmanager.com/gtag/js') || html.includes("gtag('config'"),
    hasMetaPixel: html.includes('connect.facebook.net') || html.includes("fbq('init'"),
    gtagIds: Array.from(html.matchAll(/G-[A-Z0-9]+/g)).map((match) => match[0]),
    metaPixelIds: Array.from(html.matchAll(/fbq\('init',\s*["']?(\d{5,32})/g)).map((match) => match[1]),
  }
}

function sitemapUrls(xml) {
  return Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map((match) => match[1].trim())
}

function chooseRepresentativeDetail(baseUrl, urls) {
  const base = normalizeBaseUrl(baseUrl)
  const excluded = new Set([
    '/',
    '/san-pham',
    '/shop',
    '/blog',
    '/lien-he',
    '/gioi-thieu',
    '/sitemap.xml',
    '/robots.txt',
  ])
  const staticPrefixes = [
    '/bang-gia',
    '/chat-lieu',
    '/dat-may',
    '/mau-',
    '/ao-',
    '/category/',
    '/danh-muc/',
  ]

  const productUrl = urls.find((loc) => {
    if (!loc.startsWith(base)) return false
    const path = new URL(loc).pathname.replace(/\/+$/, '') || '/'
    return path.startsWith('/san-pham/')
  })
  if (productUrl) return new URL(productUrl).pathname

  for (const loc of urls) {
    if (!loc.startsWith(base)) continue
    const path = new URL(loc).pathname.replace(/\/+$/, '') || '/'
    if (excluded.has(path)) continue
    if (staticPrefixes.some((prefix) => path.startsWith(prefix))) continue
    return path
  }
  return ''
}

async function screenshot(url, outputPath, width, height, timeoutMs) {
  if (!existsSync(chromePath)) {
    return { ok: false, error: `Chrome not found at ${chromePath}` }
  }

  const args = [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    `--window-size=${width},${height}`,
    `--screenshot=${outputPath}`,
    url,
  ]
  return run(chromePath, args, { cwd: repoRoot, timeoutMs })
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function waitForFile(path, timeoutMs) {
  const started = Date.now()
  while (Date.now() - started < timeoutMs) {
    if (existsSync(path)) return true
    await sleep(100)
  }
  return false
}

async function launchBrowser(timeoutMs) {
  if (!existsSync(chromePath)) throw new Error(`Chrome not found at ${chromePath}`)
  const userDataDir = await mkdtemp(join(tmpdir(), 'x24sport-cdp-'))
  const proc = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--remote-debugging-port=0',
    `--user-data-dir=${userDataDir}`,
    'about:blank',
  ], { stdio: 'ignore' })

  const activePortFile = join(userDataDir, 'DevToolsActivePort')
  const ready = await waitForFile(activePortFile, timeoutMs)
  if (!ready) {
    proc.kill('SIGKILL')
    await rm(userDataDir, { recursive: true, force: true })
    throw new Error('Timed out waiting for Chrome DevToolsActivePort')
  }

  const [port] = (await readFile(activePortFile, 'utf8')).trim().split('\n')
  return {
    port,
    proc,
    userDataDir,
    async close() {
      proc.kill('SIGTERM')
      await sleep(250)
      if (!proc.killed) proc.kill('SIGKILL')
      await rm(userDataDir, { recursive: true, force: true })
    },
  }
}

class CdpSession {
  constructor(wsUrl) {
    this.wsUrl = wsUrl
    this.ws = null
    this.nextId = 1
    this.pending = new Map()
    this.listeners = new Map()
  }

  async connect() {
    this.ws = new WebSocket(this.wsUrl)
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Timed out opening CDP WebSocket')), 10000)
      this.ws.addEventListener('open', () => {
        clearTimeout(timer)
        resolve()
      }, { once: true })
      this.ws.addEventListener('error', (event) => {
        clearTimeout(timer)
        reject(new Error(`CDP WebSocket error: ${event.message || 'unknown'}`))
      }, { once: true })
    })
    this.ws.addEventListener('message', (event) => this.handleMessage(event.data))
  }

  handleMessage(data) {
    const message = JSON.parse(typeof data === 'string' ? data : Buffer.from(data).toString('utf8'))
    if (message.id && this.pending.has(message.id)) {
      const { resolve, reject } = this.pending.get(message.id)
      this.pending.delete(message.id)
      if (message.error) reject(new Error(JSON.stringify(message.error)))
      else resolve(message.result)
      return
    }
    const callbacks = this.listeners.get(message.method)
    if (callbacks) {
      for (const callback of callbacks) callback(message.params || {})
    }
  }

  send(method, params = {}) {
    const id = this.nextId++
    const payload = JSON.stringify({ id, method, params })
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject })
      this.ws.send(payload)
    })
  }

  once(method, timeoutMs = 15000) {
    return new Promise((resolve, reject) => {
      const callbacks = this.listeners.get(method) || new Set()
      const timer = setTimeout(() => {
        callbacks.delete(callback)
        reject(new Error(`Timed out waiting for ${method}`))
      }, timeoutMs)
      const callback = (params) => {
        clearTimeout(timer)
        callbacks.delete(callback)
        resolve(params)
      }
      callbacks.add(callback)
      this.listeners.set(method, callbacks)
    })
  }

  close() {
    this.ws?.close()
  }
}

async function newCdpPage(browser, url) {
  const endpoint = `http://127.0.0.1:${browser.port}/json/new?${encodeURIComponent(url)}`
  let response = await fetch(endpoint, { method: 'PUT' })
  if (!response.ok) response = await fetch(endpoint)
  if (!response.ok) throw new Error(`Unable to create CDP target: HTTP ${response.status}`)
  const target = await response.json()
  const session = new CdpSession(target.webSocketDebuggerUrl)
  await session.connect()
  return session
}

function browserCheckExpression(pageName) {
  return `(() => {
    const px = (value) => Number.parseFloat(String(value || '0').replace('px', '')) || 0;
    const round = (value) => Math.round(value * 100) / 100;
    const visible = (el) => {
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      return rect.width > 1 && rect.height > 1 && style.visibility !== 'hidden' && style.display !== 'none';
    };
    const explicitCards = Array.from(document.querySelectorAll('article, li, [class*="product-card" i], [class*="catalog-card" i]'))
      .filter((item) => item.querySelector('a[href*="/san-pham/"]') && item.querySelector('img') && visible(item));
    const linkCards = Array.from(document.querySelectorAll('a[href*="/san-pham/"]'))
      .map((anchor) => anchor.closest('article, li, [class*="product-card" i], [class*="catalog-card" i]') || anchor)
      .filter((item) => item && visible(item));
    const cards = (explicitCards.length ? explicitCards : linkCards)
      .filter((item, index, array) => array.indexOf(item) === index);
    const cardRects = cards.map((card) => {
      const rect = card.getBoundingClientRect();
      const heading = card.querySelector('h2, h3') || card.querySelector('a[href*="/san-pham/"]:not([aria-label])');
      const headingStyle = heading ? getComputedStyle(heading) : null;
      const priceHost = card.querySelector('del')?.parentElement || card.querySelector('[class*="price"]');
      const del = priceHost?.querySelector('del');
      const strong = priceHost?.querySelector('strong');
      const delRect = del?.getBoundingClientRect();
      const strongRect = strong?.getBoundingClientRect();
      return {
        top: round(rect.top),
        bottom: round(rect.bottom),
        headingText: heading?.textContent?.replace(/\\s+/g, ' ').trim().slice(0, 120) || '',
        headingFontSize: headingStyle ? round(px(headingStyle.fontSize)) : null,
        hasComparePrice: Boolean(del && strong),
        priceSameRow: del && strong ? Math.abs((delRect.top + delRect.bottom) / 2 - (strongRect.top + strongRect.bottom) / 2) <= 2 : null,
        priceDeltaPx: del && strong ? round(px(getComputedStyle(strong).fontSize) - px(getComputedStyle(del).fontSize)) : null,
      };
    });
    const h1 = document.querySelector('h1');
    const h1Style = h1 ? getComputedStyle(h1) : null;
    const breadcrumb = document.querySelector('nav[aria-label*="breadcrumb" i], [class*="breadcrumb" i], [class*="crumb" i], ol[itemscope], [aria-label*="Breadcrumb" i]');
    const firstCardTop = cardRects.length ? Math.min(...cardRects.map((item) => item.top)) : null;
    const filter = document.querySelector('[class*="filter" i], [aria-label*="filter" i], [aria-label*="loc" i]');
    const filterRect = filter?.getBoundingClientRect();
    const hasHorizontalOverflow = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
    const expectedH1 = innerWidth < 1024 ? 20 : 22;
    const isDetailPage = ${JSON.stringify(pageName)} === 'detail';
    const isCatalogPage = ${JSON.stringify(pageName)} === 'catalog';
    const productNameFonts = cardRects.map((item) => item.headingFontSize).filter((item) => item !== null);
    const comparePriceCards = cardRects.filter((item) => item.hasComparePrice);
    const assertions = {
      productDetailH1Font: isDetailPage && h1Style ? (Math.abs(px(h1Style.fontSize) - expectedH1) < 0.1 ? 'pass' : 'fail') : 'na',
      productDetailBreadcrumbBeforeH1: isDetailPage && breadcrumb && h1 ? (Boolean(breadcrumb.compareDocumentPosition(h1) & Node.DOCUMENT_POSITION_FOLLOWING) ? 'pass' : 'fail') : 'warn',
      catalogFirstProductInViewport: isCatalogPage && firstCardTop !== null ? (firstCardTop < innerHeight ? 'pass' : 'fail') : 'na',
      catalogProductName18px: isCatalogPage && productNameFonts.length ? (productNameFonts.every((font) => Math.abs(font - 18) < 0.1) ? 'pass' : 'fail') : 'warn',
      comparePricesSameRow: comparePriceCards.length ? (comparePriceCards.every((item) => item.priceSameRow === true) ? 'pass' : 'fail') : 'na',
      comparePriceDelta2Px: comparePriceCards.length ? (comparePriceCards.every((item) => item.priceDeltaPx === 2) ? 'pass' : 'fail') : 'na',
      filterToolbarOneRow: isCatalogPage && filterRect ? (filterRect.height <= 56 ? 'pass' : 'fail') : 'warn',
      noHorizontalOverflow: hasHorizontalOverflow ? 'fail' : 'pass',
    };
    return {
      pageName: ${JSON.stringify(pageName)},
      viewport: { width: innerWidth, height: innerHeight },
      url: location.href,
      title: document.title,
      assertions,
      h1: h1 ? {
        text: h1.textContent.replace(/\\s+/g, ' ').trim().slice(0, 160),
        fontSize: h1Style ? round(px(h1Style.fontSize)) : null,
        expectedFontSize: expectedH1,
        fontSizeMatchesContract: h1Style ? Math.abs(px(h1Style.fontSize) - expectedH1) < 0.1 : null,
        hasBreadcrumbBefore: breadcrumb ? Boolean(breadcrumb.compareDocumentPosition(h1) & Node.DOCUMENT_POSITION_FOLLOWING) : null,
      } : null,
      catalog: {
        productCardCount: cardRects.length,
        firstProductTop: firstCardTop,
        firstProductInViewport: firstCardTop === null ? null : firstCardTop < innerHeight,
        productNameFontSamples: cardRects.map((item) => item.headingFontSize).filter((item) => item !== null).slice(0, 12),
        productNameFont18Count: cardRects.filter((item) => item.headingFontSize !== null && Math.abs(item.headingFontSize - 18) < 0.1).length,
      },
      prices: {
        comparePriceSamples: cardRects.filter((item) => item.hasComparePrice).slice(0, 12),
        comparePriceSampleCount: cardRects.filter((item) => item.hasComparePrice).length,
        comparePricesSameRow: cardRects.filter((item) => item.hasComparePrice).every((item) => item.priceSameRow === true),
        comparePriceDelta2Px: cardRects.filter((item) => item.hasComparePrice).every((item) => item.priceDeltaPx === 2),
      },
      filters: filterRect ? {
        height: round(filterRect.height),
        closedToolbarLikelyWithinOneRow: filterRect.height <= 56,
      } : null,
      layout: {
        hasHorizontalOverflow,
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      },
    };
  })()`
}

async function runBrowserChecks(url, pageName, outputPrefix, timeoutMs) {
  const browser = await launchBrowser(timeoutMs)
  const results = {}
  try {
    const session = await newCdpPage(browser, 'about:blank')
    await session.send('Page.enable')
    await session.send('Runtime.enable')
    for (const viewport of [
      { name: '390', width: 390, height: 844, deviceScaleFactor: 1, mobile: true },
      { name: '1440', width: 1440, height: 900, deviceScaleFactor: 1, mobile: false },
    ]) {
      await session.send('Emulation.setDeviceMetricsOverride', viewport)
      const loaded = session.once('Page.loadEventFired', timeoutMs).catch(() => null)
      await session.send('Page.navigate', { url })
      await loaded
      await sleep(1000)
      const evaluated = await session.send('Runtime.evaluate', {
        expression: browserCheckExpression(pageName),
        returnByValue: true,
        awaitPromise: true,
      })
      const screenshotData = await session.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
      await writeFile(`${outputPrefix}-${viewport.name}.png`, Buffer.from(screenshotData.data, 'base64'))
      results[viewport.name] = evaluated.result?.value || { error: 'No Runtime.evaluate value returned' }
    }
    session.close()
  } finally {
    await browser.close()
  }
  return results
}

async function auditSite(siteName, args, evidenceRoot) {
  const config = sites[siteName]
  const baseUrl = args.baseUrl || config.publicUrl
  const siteDir = join(repoRoot, config.packageDir)
  const outDir = join(evidenceRoot, siteName)
  await mkdir(outDir, { recursive: true })

  const packageJson = await readJson(join(siteDir, 'package.json'))
  const gitSha = await run('git', ['rev-parse', 'HEAD'], { timeoutMs: args.timeoutMs })
  const gitStatus = await run('git', ['status', '--short'], { timeoutMs: args.timeoutMs })
  const routeFiles = await listFiles(join(siteDir, 'src/app'), (file) =>
    /\/(page|layout|sitemap|robots|not-found|error)\.(ts|tsx)$/.test(file),
  )
  const sourceFiles = await listFiles(join(siteDir, 'src'), (file) => /\.(ts|tsx)$/.test(file))

  const inventory = {
    site: siteName,
    packageDir: config.packageDir,
    packageName: config.packageName,
    defaultPort: config.defaultPort,
    baseUrl,
    capturedAt: new Date().toISOString(),
    gitSha: gitSha.stdout.trim(),
    gitStatus: gitStatus.stdout.trim(),
    packageJson,
    routeFiles: routeFiles.map((file) => relative(siteDir, file)).sort(),
    sourceFileCount: sourceFiles.length,
  }
  await writeFile(join(outDir, 'inventory.json'), `${JSON.stringify(inventory, null, 2)}\n`)

  const commandResults = {}
  if (args.runTypecheck && packageJson.scripts?.typecheck) {
    commandResults.typecheck = await run('pnpm', ['typecheck'], { cwd: siteDir, env: config.env, timeoutMs: Math.max(args.timeoutMs, 120000) })
  } else if (args.runTypecheck) {
    commandResults.typecheck = { ok: true, skipped: true, reason: 'No typecheck script' }
  }
  if (args.runBuild) {
    commandResults.build = await run('pnpm', ['build'], { cwd: siteDir, env: config.env, timeoutMs: Math.max(args.timeoutMs, 180000) })
  }
  await writeFile(join(outDir, 'commands.json'), `${JSON.stringify(commandResults, null, 2)}\n`)

  const robots = await fetchText(urlFor(baseUrl, '/robots.txt'), args.timeoutMs)
  await writeFile(join(outDir, 'robots.txt'), robots.text || robots.error || '')

  const sitemap = await fetchText(urlFor(baseUrl, '/sitemap.xml'), args.timeoutMs)
  await writeFile(join(outDir, 'sitemap.xml'), sitemap.text || sitemap.error || '')
  const urls = sitemap.ok ? sitemapUrls(sitemap.text) : []

  const detailPath = chooseRepresentativeDetail(baseUrl, urls)
  const pages = {
    home: config.paths.home,
    catalog: config.paths.catalog,
    static: config.paths.static,
    ...(detailPath ? { detail: detailPath } : {}),
  }

  const pageSummaries = {}
  for (const [name, path] of Object.entries(pages)) {
    const pageUrl = urlFor(baseUrl, path)
    const result = await fetchText(pageUrl, args.timeoutMs)
    const htmlPath = join(outDir, `${name}.html`)
    await writeFile(htmlPath, result.text || result.error || '')
    const auditUrl = result.ok && result.finalUrl ? result.finalUrl : pageUrl
    const audit = await run('python3', [auditScript, auditUrl], { timeoutMs: args.timeoutMs })
    await writeFile(join(outDir, `audit-${name}.txt`), `${audit.stdout}${audit.stderr}`)

    pageSummaries[name] = {
      path,
      url: pageUrl,
      status: result.status,
      ok: result.ok,
      finalUrl: result.finalUrl,
      contentType: result.contentType,
      title: extractTitle(result.text),
      h1: extractH1(result.text),
      canonical: extractCanonical(result.text),
      analytics: extractAnalytics(result.text),
      auditUrl,
      auditOk: audit.ok,
    }

    if (args.browserChecks) {
      try {
        const checks = await runBrowserChecks(auditUrl, name, join(outDir, name), args.timeoutMs)
        pageSummaries[name].browserChecks = checks
      } catch (error) {
        pageSummaries[name].browserChecks = { error: String(error) }
      }
    } else if (args.screenshots) {
      const screenshot390 = await screenshot(auditUrl, join(outDir, `${name}-390.png`), 390, 844, args.timeoutMs)
      const screenshot1440 = await screenshot(auditUrl, join(outDir, `${name}-1440.png`), 1440, 900, args.timeoutMs)
      pageSummaries[name].screenshots = {
        mobile390: screenshot390.ok,
        desktop1440: screenshot1440.ok,
        mobile390Error: screenshot390.error || screenshot390.stderr || '',
        desktop1440Error: screenshot1440.error || screenshot1440.stderr || '',
      }
    }
  }

  const dataSamples = {
    sitemap: {
      ok: sitemap.ok,
      status: sitemap.status,
      urlCount: urls.length,
      sampleUrls: urls.slice(0, 20),
      representativeDetailPath: detailPath || null,
    },
    robots: {
      ok: robots.ok,
      status: robots.status,
      finalUrl: robots.finalUrl,
    },
    pages: pageSummaries,
  }
  await writeFile(join(outDir, 'data-samples.json'), `${JSON.stringify(dataSamples, null, 2)}\n`)

  return {
    site: siteName,
    outDir,
    pages: Object.keys(pages),
    sitemapUrls: urls.length,
    detailPath: detailPath || '',
    buildOk: commandResults.build ? commandResults.build.ok : null,
    typecheckOk: commandResults.typecheck ? commandResults.typecheck.ok : null,
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const evidenceRoot = args.out
    ? join(repoRoot, args.out)
    : join(repoRoot, 'operations/monorepo-baseline', todayStamp())
  await mkdir(evidenceRoot, { recursive: true })

  const targetSites = args.all ? Object.keys(sites) : [args.site]
  const summaries = []
  for (const siteName of targetSites) {
    console.log(`Auditing ${siteName}...`)
    summaries.push(await auditSite(siteName, args, evidenceRoot))
  }
  await writeFile(join(evidenceRoot, 'summary.json'), `${JSON.stringify(summaries, null, 2)}\n`)
  console.log(`Evidence written to ${evidenceRoot}`)
  for (const summary of summaries) {
    console.log(`${summary.site}: pages=${summary.pages.join(',')} sitemapUrls=${summary.sitemapUrls} detail=${summary.detailPath || 'none'}`)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
