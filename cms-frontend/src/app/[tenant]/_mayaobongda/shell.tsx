import { SiteFooter } from './components/site-footer'
import { SiteHeader } from './components/site-header'
import { getCategories } from './lib/cms'

export async function MayaoBongDaShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const categories = await getCategories()
  return <>
    <a className="skip-link" href="#main">Bỏ qua đến nội dung</a>
    <SiteHeader categories={categories.docs} />
    <main id="main">{children}</main>
    <SiteFooter />
  </>
}
