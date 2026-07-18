import { Globe2, Mail, MapPin, MessageCircle, Phone, type LucideIcon } from 'lucide-react'

export type ContactItem = {
  href?: string
  icon: LucideIcon
  label: string
  value: string
}

export const contactItems: ContactItem[] = [
  { icon: MapPin, label: 'Miền Bắc', value: '6 Ngõ 50 Nguyễn Hữu Thọ, Hoàng Liệt, Hà Nội' },
  { icon: MapPin, label: 'Miền Nam', value: '86/10 đường 12, P.Tam Bình, Thủ Đức, TP.HCM' },
  { icon: MapPin, label: 'Xưởng SX', value: 'Ngõ 32 Đại Từ, Hoàng Mai, Hà Nội' },
  { href: 'tel:0989353247', icon: Phone, label: 'Hotline', value: '0989.353.247' },
  { href: 'mailto:x24sport.vn@gmail.com', icon: Mail, label: 'Email', value: 'x24sport.vn@gmail.com' },
  { href: 'https://x24sport.vn/', icon: Globe2, label: 'Website', value: 'https://x24sport.vn' },
  { href: 'https://www.facebook.com/vnx24sport/', icon: MessageCircle, label: 'Facebook', value: 'facebook.com/vnx24sport' },
]
