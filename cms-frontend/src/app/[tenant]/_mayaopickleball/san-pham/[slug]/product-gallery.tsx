import { ProductMediaGallery, type ProductMediaGalleryImage } from '../../../../_components/product-media-gallery'

type ProductGalleryProps = {
  discountPercent: number
  images: ProductMediaGalleryImage[]
  productName: string
}

export function ProductGallery({ discountPercent, images, productName }: ProductGalleryProps) {
  return <ProductMediaGallery discountPercent={discountPercent} images={images} productName={productName} />
}
