import type { Metadata } from 'next'
import { Barlow_Condensed, Be_Vietnam_Pro } from 'next/font/google'
import Script from 'next/script'
import 'photoswipe/style.css'
import { getAnalyticsSettings } from '../lib/analytics'
import { SITE_LOGO_PATH } from '../lib/seo'
import { getPublicStoreSettings } from '../lib/store-settings'
import { getTenantContext } from '../lib/tenant'
import { getTenantNavigationState } from '../lib/navigation'
import { NavigationProvider } from './_components/navigation-provider'
import { TenantBottomContactBar } from './_components/tenant-bottom-contact-bar'

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
  const pndsport = tenant.slug === 'pndsport'
  const uniforms = tenant.slug === 'mayaodongphuc'
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
  const ogImage = pndsport
    ? '/images/pndsport/logo.webp'
    : ryno
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
        ...(uniforms
          ? [
              { url: '/images/mayaodongphuc/favicon.svg', type: 'image/svg+xml' },
              { url: '/images/mayaodongphuc/favicon-512.png', sizes: '512x512', type: 'image/png' },
            ]
          : [{ url: pndsport ? '/images/pndsport/logo.webp' : '/icon.png', sizes: pndsport ? undefined : '512x512', type: pndsport ? 'image/webp' : 'image/png' }]),
      ],
      apple: [{ url: uniforms ? '/images/mayaodongphuc/apple-touch-icon.png' : '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
    },
    openGraph: {
      type: 'website', locale: 'vi_VN', siteName: tenant.name,
      title,
      description,
      images: [{ url: ogImage, width: ryno ? 864 : mayaoOgImage ? 1200 : 1200, height: ryno ? 1821 : mayaoOgImage ? 630 : pndsport ? 315 : 158, alt: mayaoOgImage?.alt || (ryno ? 'Trang phục thể thao RynoSport' : `Logo ${tenant.name}`) }],
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
    mayaopickleball: ['/styles/mayaopickleball.css?v=20260818f'],
    mayaobongchuyen: ['/styles/mayaobongchuyen.css?v=20260815b', '/styles/mayaobongchuyen-fixes.css?v=20260822e'],
    mayaobongro: ['/styles/mayaobongro.css', '/styles/mayaobongro-header.css'],
    mayaochaybo: ['/styles/mayaochaybo.css', '/styles/mayaochaybo-fixes.css'],
    mayaobongda: ['/styles/mayaobongda.css?v=20260816b', '/styles/mayaobongda-audience.css', '/styles/mayaobongda-header.css?v=20260816e'],
  }
  const stylesheets = tenantStyles[tenantSlug] || ['/styles/shared.css?v=20260817e']

  return [
    '<link rel="preconnect" href="https://static.x24sport.vn" crossorigin="anonymous">',
    '<link rel="preconnect" href="https://cdn.x24sport.vn" crossorigin="anonymous">',
    '<link rel="stylesheet" href="/styles/contact-bar.css?v=20260814d">',
    ...stylesheets.map((href) => `<link rel="stylesheet" href="${href}">`),
    '<link rel="stylesheet" href="/styles/pagination.css?v=20260816b">',
    '<link rel="stylesheet" href="/styles/product-viewer.css?v=20260818a">',
    googleTagManagerId
      ? `<script id="google-tag-manager">(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${googleTagManagerId}');</script>`
      : '',
    ...customScripts.map((script) => script.code),
  ].filter(Boolean).join('\n')
}

function getTenantFontVariables(tenantSlug: string) {
  if (tenantSlug === 'mayaocaulong' || tenantSlug === 'mayaopickleball') {
    return `${pickleballBodyFont.variable} ${pickleballDisplayFont.variable}`
  }
  if (tenantSlug === 'mayaobongda' || tenantSlug === 'mayaobongro' || tenantSlug === 'mayaochaybo' || tenantSlug === 'pndsport') {
    return `${tenantHeadingFont.variable} ${tenantBodyFont.variable}`
  }
  return ''
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const tenant = await getTenantContext()
  const [analytics, storeSettings, navigationState] = await Promise.all([
    getAnalyticsSettings(),
    getPublicStoreSettings(),
    getTenantNavigationState(),
  ])
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

  return <html className={fontVariables} lang="vi"><head dangerouslySetInnerHTML={{ __html: headMarkup }} suppressHydrationWarning /><body className={`tenant-${tenant.slug}`}>{googleTagManagerId ? <noscript><iframe height="0" src={`https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(googleTagManagerId)}`} style={{ display: 'none', visibility: 'hidden' }} width="0" /></noscript> : null}<CustomScriptMarkup position="bodyStart" scripts={customBodyStartScripts} />{measurementId ? <><Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" /><Script id="ga4-tag" strategy="afterInteractive">{`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${measurementId}');`}</Script></> : null}{metaPixelId ? <><Script id="meta-pixel" strategy="afterInteractive">{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js'); fbq('init', ${JSON.stringify(metaPixelId)}); fbq('track', 'PageView');`}</Script><noscript><img alt="" height="1" src={`https://www.facebook.com/tr?id=${encodeURIComponent(metaPixelId)}&ev=PageView&noscript=1`} style={{ display: 'none' }} width="1" /></noscript></> : null}<NavigationProvider state={navigationState}>{children}</NavigationProvider><TenantBottomContactBar settings={storeSettings} tenantName={tenant.name} /><CustomScriptMarkup position="bodyEnd" scripts={customBodyEndScripts} /></body></html>
}
