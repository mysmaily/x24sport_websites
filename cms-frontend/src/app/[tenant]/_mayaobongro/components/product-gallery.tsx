import { ProductMediaGallery } from '../../../_components/product-media-gallery'

import type { LegacyImage } from '../lib/cms'

export function ProductGallery({ images, productName }: { images: LegacyImage[]; productName: string }) {
  return (
    <ProductMediaGallery
      fallbackText="24"
      images={images}
      label="MayAoBongRo / Basketball"
      productName={productName}
      variant="utility"
    />
  )
}
