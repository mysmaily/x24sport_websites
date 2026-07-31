import { SiteFooter } from './components/site-footer'
import { SiteHeader } from './components/site-header'

export function MayaoBongDaShell({ children }: Readonly<{ children: React.ReactNode }>) {
  return <>
    <a className="skip-link" href="#main">Bỏ qua đến nội dung</a>
    <SiteHeader />
    <main id="main">{children}</main>
    <SiteFooter />
  </>
}
