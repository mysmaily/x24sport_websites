export type RegionalSalesContact = {
  name: string
  phone: string
  phoneLabel: string
  region: 'Miền Bắc' | 'Miền Trung' | 'Miền Nam'
}

export const regionalSalesContacts: RegionalSalesContact[] = [
  { region: 'Miền Bắc', name: 'Thu Hiền', phone: '0989353247', phoneLabel: '0989 353 247' },
  { region: 'Miền Trung', name: 'Thanh Nga', phone: '0988643904', phoneLabel: '0988 643 904' },
  { region: 'Miền Nam', name: 'Hà Phương', phone: '0982254458', phoneLabel: '0982 254 458' },
]

export function regionalSalesRole(region: RegionalSalesContact['region']) {
  return `Sale/Tư vấn thiết kế ${region}`
}

export function regionalSalesZaloHref(phone: string) {
  return `https://zalo.me/${phone}`
}
