import { ProductMediaGallery, type ProductMediaGalleryImage } from '../../../../_components/product-media-gallery'

type ProductGalleryProps = {
  images: ProductMediaGalleryImage[]
  productName: string
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  return <ProductMediaGallery fallbackText="VB" images={images} productName={productName} variant="utility" />
}
