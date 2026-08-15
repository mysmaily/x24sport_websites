import { notFound } from 'next/navigation'

import BlogPostPage from './blog/[slug]/page'
import BlogPage from './blog/page'
import CategoryPage from './danh-muc/[slug]/page'
import PndPreviewHomePage from './page'
import ProductDetailPage from './san-pham/[slug]/page'
import SeoLandingPage from './thiet-ke-ao-bong-da-doi-nhom/page'

export function VariantPage({ path = [], base, heroImage, heroDescription }: { path?: string[]; base: string; heroImage?: string; heroDescription?: string }) {
  if (path.length === 0) return <PndPreviewHomePage base={base} heroImage={heroImage} heroDescription={heroDescription} />
  if (path.length === 1 && path[0] === 'blog') return <BlogPage base={base} />
  if (path.length === 2 && path[0] === 'blog') return <BlogPostPage base={base} />
  if (path.length === 2 && path[0] === 'danh-muc') return <CategoryPage base={base} />
  if (path.length === 2 && path[0] === 'san-pham') return <ProductDetailPage base={base} />
  if (path.length === 1 && path[0] === 'thiet-ke-ao-bong-da-doi-nhom') return <SeoLandingPage base={base} />
  notFound()
}
