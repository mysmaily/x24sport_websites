import { ProductMediaGallery, type ProductMediaGalleryImage } from './product-media-gallery'

export function ProductGallery({ images, name }: { images: ProductMediaGalleryImage[]; name: string }) {
  return <ProductMediaGallery fallbackText="24" images={images} productName={name} />
}
