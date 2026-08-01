import { ProductMediaGallery } from '../../../_components/product-media-gallery'

import type { MediaImage } from '../lib/cms'

export function ProductGallery({ images, productName }: { images: MediaImage[]; productName: string }) {
  return <ProductMediaGallery fallbackText="24" images={images} productName={productName} variant="utility" />
}
