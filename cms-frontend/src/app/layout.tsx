import type { Metadata } from 'next'
import { Barlow_Condensed, Be_Vietnam_Pro } from 'next/font/google'
import Script from 'next/script'
import 'photoswipe/style.css'
import { getAnalyticsSettings } from '../lib/analytics'
import { SITE_LOGO_PATH } from '../lib/seo'
import { getTenantContext } from '../lib/tenant'

const pickleballBodyFont = Be_Vietnam_Pro({
  subsets: ['vietnamese'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-body',
  display: 'swap',
  preload: false,
})

const pickleballDisplayFont = Barlow_Condensed({
  subsets: ['latin', 'vietnamese'],
  weight: ['600', '700'],
  variable: '--font-display',
  display: 'swap',
  preload: false,
})

const tenantHeadingFont = Barlow_Condensed({
  subsets: ['latin', 'vietnamese'],
  weight: ['700', '800'],
  variable: '--font-heading',
  display: 'swap',
  preload: false,
})

const tenantBodyFont = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '700'],
  variable: '--font-body-base',
  display: 'swap',
  preload: false,
})

export async function generateMetadata(): Promise<Metadata> {
  const tenant = await getTenantContext()
  const ryno = tenant.slug === 'rynosport'
  const badminton = tenant.slug === 'mayaocaulong'
  const pickleball = tenant.slug === 'mayaopickleball'
  const volleyball = tenant.slug === 'mayaobongchuyen'
  const basketball = tenant.slug === 'mayaobongro'
  const running = tenant.slug === 'mayaochaybo'
  const football = tenant.slug === 'mayaobongda'
  const description = ryno
    ? 'Khám phá trang phục thể thao và dịch vụ đặt áo đội tại RynoSport.'
    : badminton || pickleball || volleyball || basketball || running || football
      ? tenant.description
    : tenant.description
  const tenantOgImage = {
    mayaocaulong: {
      url: '/images/mayaocaulong/og-share.webp',
      alt: 'Đội cầu lông mặc áo thi đấu đặt may MayaoCauLong',
    },
    mayaopickleball: {
      url: '/images/mayaopickleball/og-share.webp',
      alt: 'Đội pickleball mặc đồng phục đặt may MayaoPickleball',
    },
    mayaobongchuyen: {
      url: '/images/mayaobongchuyen/og-share.webp',
      alt: 'Đội bóng chuyền mặc đồng phục đặt may MayaoBongChuyen',
    },
    mayaobongro: {
      url: '/images/mayaobongro/og-share.webp',
      alt: 'Đội bóng rổ mặc đồng phục thiết kế riêng',
    },
    mayaochaybo: {
      url: '/images/mayaochaybo/og-share.webp',
      alt: 'Đội chạy bộ mặc áo thiết kế riêng',
    },
    mayaobongda: {
      url: '/images/mayaobongda/og-share.webp',
      alt: 'Mẫu áo bóng đá thiết kế riêng MayaoBongDa',
    },
  } as const
  const mayaoOgImage = tenant.slug in tenantOgImage ? tenantOgImage[tenant.slug as keyof typeof tenantOgImage] : null
  const ogImage = ryno
    ? '/images/rynosport/hero.png'
    : mayaoOgImage?.url || SITE_LOGO_PATH
  const title = badminton
    ? 'MayaoCauLong.vn - Áo cầu lông đặt may cho CLB'
    : pickleball
      ? 'MayaoPickleball.vn - Áo pickleball đặt may cho CLB'
      : volleyball
        ? 'MayaoBongChuyen.vn - Áo bóng chuyền đặt may'
        : basketball
          ? 'MayaoBongRo.vn - Áo bóng rổ thiết kế riêng'
          : running
            ? 'MayaoChayBo.vn - Áo chạy bộ thiết kế riêng'
            : football
              ? 'May Áo Bóng Đá Thiết Kế, Áo Không Logo Giá Xưởng'
      : `${tenant.name}${ryno ? ' -' : ' —'} Trang phục thể thao`
  return {
    metadataBase: new URL(`https://${tenant.domain}`),
    title: badminton || pickleball || volleyball || basketball || running || football ? title : { default: title, template: `%s | ${tenant.name}` },
    description,
    alternates: { canonical: '/' },
    icons: {
      icon: [
        { url: '/icon.png', sizes: '512x512', type: 'image/png' },
      ],
      apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
    },
    openGraph: {
      type: 'website', locale: 'vi_VN', siteName: tenant.name,
      title,
      description,
      images: [{ url: ogImage, width: ryno ? 864 : mayaoOgImage ? 1200 : 1200, height: ryno ? 1821 : mayaoOgImage ? 630 : 158, alt: mayaoOgImage?.alt || (ryno ? 'Trang phục thể thao RynoSport' : `Logo ${tenant.name}`) }],
    },
    twitter: { card: 'summary_large_image' },
    robots: process.env.SITE_ENV === 'preview' ? { index: false, follow: false } : undefined,
  }
}

function getMetaPixelId(analytics: Awaited<ReturnType<typeof getAnalyticsSettings>>) {
  const pixelId = analytics?.metaPixelEnabled && analytics.metaPixelId?.trim()
    ? analytics.metaPixelId.trim()
    : ''
  return /^\d{5,32}$/.test(pixelId) ? pixelId : null
}

function getGoogleTagManagerId(tenantSlug: string) {
  const tagManagerIds: Record<string, string> = {
    mayaochaybo: 'GTM-MLGXWKRS',
  }
  const tagManagerId = tagManagerIds[tenantSlug]?.trim()
  return /^GTM-[A-Z0-9]+$/.test(tagManagerId) ? tagManagerId : null
}

type CustomScriptPosition = 'head' | 'bodyStart' | 'bodyEnd'

function getCustomScripts(
  analytics: Awaited<ReturnType<typeof getAnalyticsSettings>>,
  position: CustomScriptPosition,
) {
  return (analytics?.customScripts || [])
    .filter((item) => item?.enabled !== false && item?.position === position && item?.code?.trim())
    .map((item, index) => ({
      id: `custom-script-${position}-${item.id || index}`,
      code: item.code!.trim(),
    }))
}

function CustomScriptMarkup({
  position,
  scripts,
}: {
  position: CustomScriptPosition
  scripts: Array<{ id: string; code: string }>
}) {
  if (!scripts.length) return null

  return (
    <div
      data-x24-custom-script-position={position}
      dangerouslySetInnerHTML={{ __html: scripts.map((script) => script.code).join('\n') }}
      style={{ display: 'contents' }}
      suppressHydrationWarning
    />
  )
}

function buildHeadMarkup({
  customScripts,
  googleTagManagerId,
  tenantSlug,
}: {
  customScripts: Array<{ id: string; code: string }>
  googleTagManagerId: string | null
  tenantSlug: string
}) {
  const tenantStyles: Record<string, string[]> = {
    mayaocaulong: ['/styles/mayaocaulong.css'],
    mayaopickleball: ['/styles/mayaopickleball.css'],
    mayaobongchuyen: ['/styles/mayaobongchuyen.css'],
    mayaobongro: ['/styles/mayaobongro.css', '/styles/mayaobongro-header.css'],
    mayaochaybo: ['/styles/mayaochaybo.css', '/styles/mayaochaybo-fixes.css'],
    mayaobongda: ['/styles/mayaobongda.css', '/styles/mayaobongda-audience.css'],
  }
  const stylesheets = tenantStyles[tenantSlug] || ['/styles/shared.css']
  const asyncStyles = tenantSlug === 'mayaobongda'

  return [
    '<link rel="preconnect" href="https://static.x24sport.vn" crossorigin="anonymous">',
    '<link rel="preconnect" href="https://cdn.x24sport.vn" crossorigin="anonymous">',
    tenantSlug === 'mayaobongda' ? `<style id="mayaobongda-critical-css">${getMayaobongdaCriticalCss()}</style>` : '',
    ...stylesheets.map((href) => asyncStyles
      ? `<link rel="preload" href="${href}" as="style" onload="this.onload=null;this.rel='stylesheet'"><noscript><link rel="stylesheet" href="${href}"></noscript>`
      : `<link rel="stylesheet" href="${href}">`),
    googleTagManagerId
      ? `<script id="google-tag-manager">(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${googleTagManagerId}');</script>`
      : '',
    ...customScripts.map((script) => script.code),
  ].filter(Boolean).join('\n')
}

function getMayaobongdaCriticalCss() {
  return `body.tenant-mayaobongda{margin:0;background:#f6f7f5;color:#10131a;font-family:var(--font-body-base),ui-sans-serif,system-ui,sans-serif;-webkit-font-smoothing:antialiased;overflow-x:clip}body.tenant-mayaobongda *{box-sizing:border-box}body.tenant-mayaobongda a{color:inherit;text-decoration:none}body.tenant-mayaobongda img,body.tenant-mayaobongda svg{display:block}body.tenant-mayaobongda img{max-width:100%;height:auto}body.tenant-mayaobongda button{font:inherit;color:inherit;background:transparent;border:0}.tenant-mayaobongda .section-shell{width:min(1360px,100% - 32px);margin-inline:auto}.tenant-mayaobongda .mabd-site-header{position:sticky;top:0;z-index:50;border-bottom:1px solid rgba(255,255,255,.1);background:rgba(11,18,32,.95);color:#fff;-webkit-backdrop-filter:blur(24px);backdrop-filter:blur(24px)}.tenant-mayaobongda .mabd-site-header-inner{display:grid;grid-template-columns:1fr auto;align-items:center;gap:16px;min-height:72px;width:100%;max-width:1440px;margin-inline:auto;padding-inline:16px}.tenant-mayaobongda .mabd-site-logo{display:inline-flex;width:fit-content;align-items:center}.tenant-mayaobongda .mabd-site-logo img{width:228px;max-width:calc(100vw - 96px);height:auto}.tenant-mayaobongda .mabd-site-mobile-actions{display:flex;align-items:center;justify-content:flex-end;gap:8px}.tenant-mayaobongda .mabd-site-icon-button{display:grid;width:44px;height:44px;cursor:pointer;place-items:center;border:1px solid rgba(255,255,255,.2);border-radius:8px}.tenant-mayaobongda .tenant-promo-hero{position:relative;overflow:hidden;background:#0b1220;color:#fff}.tenant-mayaobongda .tenant-promo-content{position:relative;z-index:4;display:flex;height:720px;align-items:center;padding-block:32px}.tenant-mayaobongda .tenant-promo-slider{position:absolute;inset:0;z-index:0;overflow:hidden;background:radial-gradient(circle at 78% 20%,rgba(249,82,30,.18),transparent 32%),linear-gradient(90deg,#030712 0%,#06101f 52%,#091221 100%)}.tenant-mayaobongda .tenant-promo-loader{position:absolute;inset:0;z-index:0;display:grid;min-height:100%;place-items:center;color:rgba(255,255,255,.38)}.tenant-mayaobongda .tenant-promo-slide,.tenant-mayaobongda .tenant-promo-picture{position:absolute;inset:0}.tenant-mayaobongda .tenant-promo-slide{z-index:1;opacity:0;animation:tenantPromoHeroFadeTwo 10s infinite}.tenant-mayaobongda .tenant-promo-slider[data-count='1'] .tenant-promo-slide{opacity:1;animation:none}.tenant-mayaobongda .tenant-promo-image{width:100%;height:100%;object-fit:cover;object-position:center;transform:scale(1.012)}.tenant-mayaobongda .tenant-promo-readable-overlay{position:absolute;inset:0;z-index:2;pointer-events:none;background:linear-gradient(90deg,rgba(3,7,18,.92) 0%,rgba(3,7,18,.72) 42%,rgba(3,7,18,.34) 72%,rgba(3,7,18,.18) 100%),linear-gradient(180deg,rgba(3,7,18,.28) 0%,rgba(3,7,18,.1) 38%,rgba(3,7,18,.28) 66%,rgba(3,7,18,.82) 100%)}.tenant-mayaobongda .tenant-promo-dots{position:absolute;right:50%;bottom:20px;z-index:3;display:flex;align-items:center;gap:7px;padding:7px 10px;border:1px solid rgba(255,255,255,.16);border-radius:999px;background:rgba(15,23,42,.68);transform:translateX(50%)}.tenant-mayaobongda .tenant-promo-dots span{width:9px;height:9px;border-radius:999px;background:rgba(255,255,255,.42)}.tenant-mayaobongda .mabd-hero-copy{min-width:0;max-width:768px}.tenant-mayaobongda .mabd-hero-pill{display:inline-flex;max-width:100%;align-items:center;gap:8px;border:1px solid rgba(255,255,255,.15);border-radius:999px;background:rgba(255,255,255,.05);padding:6px 12px;color:#ffd7a8;font-size:10px;font-weight:900;letter-spacing:.1em;text-transform:uppercase}.tenant-mayaobongda .mabd-hero-title{max-width:760px;margin:16px 0 0;font-family:var(--font-heading),ui-sans-serif,system-ui,sans-serif;font-size:2.65rem;font-weight:800;line-height:.9;letter-spacing:.012em}.tenant-mayaobongda .mabd-hero-title span{color:#f15a24}.tenant-mayaobongda .mabd-hero-lead{max-width:672px;margin:12px 0 0;color:#cad5e2;font-size:14px;line-height:24px}.tenant-mayaobongda .mabd-home-audience-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;margin-top:16px;padding:0;list-style:none}.tenant-mayaobongda .mabd-home-audience-card{display:block;height:100%;border:1px solid rgba(255,255,255,.1);border-radius:8px;background:rgba(255,255,255,.055);padding:10px}.tenant-mayaobongda .mabd-home-audience-card svg{color:#f15a24}.tenant-mayaobongda .mabd-home-audience-card strong{display:flex;align-items:center;gap:4px;margin-top:8px;color:#fff;font-size:11px;font-weight:900;line-height:16px}.tenant-mayaobongda .mabd-home-audience-card span{display:none}.tenant-mayaobongda .mabd-hero-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:20px}.tenant-mayaobongda .mabd-hero-primary,.tenant-mayaobongda .mabd-hero-secondary{display:inline-flex;min-height:44px;align-items:center;justify-content:center;gap:8px;border-radius:8px;padding-inline:16px;font-size:14px;font-weight:900}.tenant-mayaobongda .mabd-hero-primary{background:#f15a24;color:#fff}.tenant-mayaobongda .mabd-hero-secondary{border:1px solid rgba(255,255,255,.25);color:#fff}@keyframes tenantPromoHeroFadeTwo{0%,45%{opacity:1}53%,92%{opacity:0}100%{opacity:1}}@media (min-width:640px){.tenant-mayaobongda .section-shell{width:min(1360px,100% - 48px)}.tenant-mayaobongda .mabd-site-header-inner{padding-inline:24px}.tenant-mayaobongda .tenant-promo-content{padding-block:48px}.tenant-mayaobongda .mabd-hero-pill{padding:8px 16px;font-size:12px;letter-spacing:.16em}.tenant-mayaobongda .mabd-hero-title{margin-top:28px;font-size:4.75rem}.tenant-mayaobongda .mabd-hero-lead{margin-top:20px;font-size:18px;line-height:28px}.tenant-mayaobongda .mabd-home-audience-grid{grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:24px}.tenant-mayaobongda .mabd-home-audience-card{border-radius:12px;padding:14px}.tenant-mayaobongda .mabd-home-audience-card strong{margin-top:12px;font-size:14px}.tenant-mayaobongda .mabd-home-audience-card span{display:block;margin-top:4px;color:#90a1b9;font-size:11px;line-height:16px}.tenant-mayaobongda .mabd-hero-actions{gap:12px;margin-top:28px}.tenant-mayaobongda .mabd-hero-primary,.tenant-mayaobongda .mabd-hero-secondary{min-height:52px;padding-inline:24px}}@media (min-width:1024px){.tenant-mayaobongda .section-shell{width:min(1360px,100% - 64px)}.tenant-mayaobongda .mabd-site-header-inner{grid-template-columns:minmax(220px,1fr) auto minmax(220px,1fr);padding-inline:32px}.tenant-mayaobongda .mabd-site-mobile-actions{display:none}.tenant-mayaobongda .mabd-hero-title{font-size:clamp(4.4rem,5.25vw,6.15rem)}}@media (prefers-reduced-motion:reduce){.tenant-mayaobongda .tenant-promo-slide{animation:none}.tenant-mayaobongda .tenant-promo-slide:first-of-type{opacity:1}}`
}

function getTenantFontVariables(tenantSlug: string) {
  if (tenantSlug === 'mayaocaulong' || tenantSlug === 'mayaopickleball') {
    return `${pickleballBodyFont.variable} ${pickleballDisplayFont.variable}`
  }
  if (tenantSlug === 'mayaobongda' || tenantSlug === 'mayaobongro' || tenantSlug === 'mayaochaybo') {
    return `${tenantHeadingFont.variable} ${tenantBodyFont.variable}`
  }
  return ''
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const tenant = await getTenantContext()
  const analytics = await getAnalyticsSettings()
  const measurementId =
    analytics?.ga4Enabled && analytics.gaMeasurementId?.trim()
      ? analytics.gaMeasurementId.trim()
      : null
  const metaPixelId = getMetaPixelId(analytics)
  const googleTagManagerId = getGoogleTagManagerId(tenant.slug)
  const customHeadScripts = getCustomScripts(analytics, 'head')
  const customBodyStartScripts = getCustomScripts(analytics, 'bodyStart')
  const customBodyEndScripts = getCustomScripts(analytics, 'bodyEnd')
  const headMarkup = buildHeadMarkup({ customScripts: customHeadScripts, googleTagManagerId, tenantSlug: tenant.slug })
  const fontVariables = getTenantFontVariables(tenant.slug)

  return <html className={fontVariables} lang="vi"><head dangerouslySetInnerHTML={{ __html: headMarkup }} suppressHydrationWarning /><body className={`tenant-${tenant.slug}`}>{googleTagManagerId ? <noscript><iframe height="0" src={`https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(googleTagManagerId)}`} style={{ display: 'none', visibility: 'hidden' }} width="0" /></noscript> : null}<CustomScriptMarkup position="bodyStart" scripts={customBodyStartScripts} />{measurementId ? <><Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" /><Script id="ga4-tag" strategy="afterInteractive">{`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${measurementId}');`}</Script></> : null}{metaPixelId ? <><Script id="meta-pixel" strategy="afterInteractive">{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js'); fbq('init', ${JSON.stringify(metaPixelId)}); fbq('track', 'PageView');`}</Script><noscript><img alt="" height="1" src={`https://www.facebook.com/tr?id=${encodeURIComponent(metaPixelId)}&ev=PageView&noscript=1`} style={{ display: 'none' }} width="1" /></noscript></> : null}{children}<CustomScriptMarkup position="bodyEnd" scripts={customBodyEndScripts} /></body></html>
}
