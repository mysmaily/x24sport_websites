export type AudienceLanding = {
  slug: string
  navLabel: string
  eyebrow: string
  title: string
  description: string
  heroNote: string
  contextLabel: string
  contexts: string[]
  challenges: Array<{ title: string; text: string }>
  benefits: Array<{ title: string; text: string }>
  briefItems: string[]
  faq: Array<{ question: string; answer: string }>
  ctaTitle: string
  ctaText: string
}

export const AUDIENCE_LANDINGS: AudienceLanding[] = [
  {
    slug: 'ao-chay-bo-doanh-nghiep',
    navLabel: 'Công ty & doanh nghiệp',
    eyebrow: 'Áo chạy bộ cho doanh nghiệp',
    title: 'Biến mỗi bước chạy thành một phần của văn hóa doanh nghiệp.',
    description: 'Thiết kế áo chạy bộ theo màu sắc, logo và tinh thần của tổ chức cho giải nội bộ, hoạt động gắn kết và những ngày cả công ty cùng xuất phát.',
    heroNote: 'Một thiết kế thống nhất giúp người tham gia dễ nhận diện tập thể mà vẫn thoải mái khi vận động.',
    contextLabel: 'Phù hợp với',
    contexts: ['Giải chạy nội bộ', 'Team building', 'Hoạt động cộng đồng'],
    challenges: [
      { title: 'Nhận diện dễ bị rời rạc', text: 'Màu thương hiệu, logo và thông điệp cần xuất hiện rõ ràng mà không làm chiếc áo trở nên nặng nề.' },
      { title: 'Nhiều người cùng duyệt', text: 'Bộ phận tổ chức, truyền thông và người phụ trách mua hàng cần nhìn thấy cùng một phương án trước khi chốt.' },
      { title: 'Size của cả tập thể', text: 'Danh sách người tham gia thường có nhiều form và size, cần được tổng hợp rõ trước khi sản xuất.' },
    ],
    benefits: [
      { title: 'Đồng bộ với thương hiệu', text: 'Phối màu, logo và nội dung được đặt trong một tổng thể nhất quán.' },
      { title: 'Dễ trao đổi nội bộ', text: 'Maket trực quan giúp các bên liên quan cùng rà soát trước khi chốt.' },
      { title: 'Sẵn sàng cho ngày hoạt động', text: 'Thông tin mẫu áo, số lượng và bảng size được chuẩn hóa theo một đầu mối.' },
    ],
    briefItems: ['Logo và màu nhận diện', 'Mục đích của hoạt động', 'Số lượng dự kiến', 'Bảng size người tham gia', 'Nội dung hoặc vị trí cần in', 'Thời gian cần nhận áo'],
    faq: [
      { question: 'Có thể thiết kế áo theo bộ nhận diện của công ty không?', answer: 'Có. Bạn có thể gửi logo, mã màu, hình ảnh tham khảo và nội dung cần thể hiện để đội ngũ tư vấn phương án phối phù hợp.' },
      { question: 'Chưa có ý tưởng thiết kế hoàn chỉnh thì bắt đầu thế nào?', answer: 'Bạn chỉ cần gửi mục đích sử dụng, màu chủ đạo, logo và số lượng dự kiến. Từ đó, hai bên sẽ cùng làm rõ hướng thiết kế trước khi duyệt maket.' },
      { question: 'Làm sao tổng hợp size cho nhiều người?', answer: 'MayAoChayBo.vn hỗ trợ bảng size để người phụ trách thu thập và kiểm tra thông tin trước khi chốt đơn.' },
    ],
    ctaTitle: 'Đang chuẩn bị một hoạt động cho công ty?',
    ctaText: 'Gửi logo, màu nhận diện, số lượng dự kiến và thời gian cần nhận để bắt đầu trao đổi phương án.',
  },
  {
    slug: 'ao-giai-chay-su-kien',
    navLabel: 'Giải chạy & sự kiện',
    eyebrow: 'Áo cho giải chạy & sự kiện',
    title: 'Một chiếc áo giúp cả giải chạy được nhận ra từ vạch xuất phát.',
    description: 'Phát triển áo sự kiện và race kit theo chủ đề chương trình, hệ thống nhà tài trợ và trải nghiệm mà ban tổ chức muốn tạo ra cho người tham gia.',
    heroNote: 'Thiết kế cần nổi bật trong đám đông, rõ khi lên hình và giữ được trật tự giữa nhiều lớp thông tin.',
    contextLabel: 'Phù hợp với',
    contexts: ['Giải chạy phong trào', 'Sự kiện cộng đồng', 'Race kit theo chương trình'],
    challenges: [
      { title: 'Nhiều lớp nhận diện', text: 'Tên giải, logo ban tổ chức và nhà tài trợ cần được sắp xếp rõ thứ tự ưu tiên.' },
      { title: 'Hình ảnh phải nổi bật', text: 'Chiếc áo cần dễ nhận ra trên đường chạy, trong ảnh sự kiện và giữa không gian đông người.' },
      { title: 'Thông tin cần được chốt sớm', text: 'Số lượng, size, nội dung in và mốc cần nhận nên được tập hợp trong một bản yêu cầu thống nhất.' },
    ],
    benefits: [
      { title: 'Bám sát chủ đề sự kiện', text: 'Màu sắc và đồ họa được phát triển từ tinh thần chung của chương trình.' },
      { title: 'Sắp xếp logo có chủ đích', text: 'Các vị trí nhận diện được cân đối để dễ nhìn và không cạnh tranh lẫn nhau.' },
      { title: 'Dễ rà soát trước sản xuất', text: 'Maket giúp ban tổ chức kiểm tra tên giải, nội dung và bố cục trước khi chốt.' },
    ],
    briefItems: ['Tên và chủ đề sự kiện', 'Logo ban tổ chức, nhà tài trợ', 'Màu sắc chủ đạo', 'Số lượng và cơ cấu size', 'Các nhóm áo cần phân biệt', 'Ngày dự kiến cần nhận'],
    faq: [
      { question: 'Áo có thể đặt nhiều logo nhà tài trợ không?', answer: 'Có thể. Danh sách logo và mức độ ưu tiên cần được cung cấp từ đầu để bố cục được cân đối ngay trong maket.' },
      { question: 'Có thể làm các nhóm áo khác nhau trong cùng sự kiện không?', answer: 'Bạn có thể trao đổi nhu cầu phân biệt người tham gia, ban tổ chức hoặc nhóm hỗ trợ. Đội ngũ sẽ tư vấn cách dùng màu sắc và nội dung phù hợp với thiết kế chung.' },
      { question: 'Cần chuẩn bị gì trước khi yêu cầu thiết kế?', answer: 'Nên có tên chương trình, logo, màu chủ đạo, số lượng dự kiến, các vị trí cần in và ngày cần nhận áo.' },
    ],
    ctaTitle: 'Bạn đang xây dựng hình ảnh cho một giải chạy?',
    ctaText: 'Gửi chủ đề chương trình, hệ thống logo và số lượng dự kiến để cùng định hình mẫu áo sự kiện.',
  },
  {
    slug: 'ao-chay-bo-doi-nhom-cau-lac-bo',
    navLabel: 'Đội nhóm & câu lạc bộ',
    eyebrow: 'Áo chạy bộ cho đội nhóm',
    title: 'Cho cả đội một diện mạo riêng trên mỗi cung đường.',
    description: 'Thiết kế áo chạy bộ thể hiện tên đội, màu sắc và cá tính chung — để thành viên dễ nhận ra nhau và tự hào khi cùng xuất hiện.',
    heroNote: 'Từ buổi long run cuối tuần đến ngày tham gia giải, chiếc áo là dấu hiệu nhận biết của cả đội.',
    contextLabel: 'Phù hợp với',
    contexts: ['Câu lạc bộ chạy bộ', 'Nhóm chạy phong trào', 'Đội tham gia giải'],
    challenges: [
      { title: 'Muốn khác biệt nhưng vẫn dễ mặc', text: 'Thiết kế cần có cá tính riêng mà vẫn phù hợp với nhiều thành viên trong đội.' },
      { title: 'Ý tưởng thường còn rời rạc', text: 'Tên đội, biểu tượng, màu yêu thích và mẫu tham khảo cần được gom lại thành một hướng rõ ràng.' },
      { title: 'Mỗi người một size', text: 'Thông tin thành viên cần được tổng hợp gọn để người đại diện dễ kiểm tra trước khi chốt.' },
    ],
    benefits: [
      { title: 'Nhận diện riêng của đội', text: 'Tên, logo và màu sắc được phát triển thành một thiết kế có tính thống nhất.' },
      { title: 'Thành viên cùng tham gia duyệt', text: 'Maket giúp cả nhóm hình dung mẫu áo trước khi người đại diện chốt phương án.' },
      { title: 'Thông tin đặt áo rõ ràng', text: 'Mẫu, size và nội dung cá nhân hóa được tập hợp để hạn chế nhầm lẫn.' },
    ],
    briefItems: ['Tên hoặc logo đội', 'Màu sắc yêu thích', 'Mẫu áo tham khảo', 'Số lượng thành viên', 'Bảng size', 'Tên hoặc số cá nhân cần in'],
    faq: [
      { question: 'Đội chưa có logo thì có thể đặt áo không?', answer: 'Có. Bạn có thể bắt đầu từ tên đội, chữ viết tắt, màu sắc hoặc hình ảnh mang ý nghĩa chung để trao đổi hướng nhận diện phù hợp.' },
      { question: 'Có thể in tên hoặc số riêng cho từng thành viên không?', answer: 'Bạn có thể gửi danh sách nội dung cá nhân hóa để đội ngũ kiểm tra khả năng bố trí trên mẫu áo trước khi chốt.' },
      { question: 'Làm thế nào để chọn mẫu phù hợp cho cả nam và nữ?', answer: 'Hãy gửi cơ cấu thành viên và nhu cầu sử dụng. Đội ngũ sẽ tư vấn kiểu áo, form và bảng size để cả nhóm cùng xem xét.' },
    ],
    ctaTitle: 'Đội của bạn đã có tên, màu sắc hoặc một ý tưởng?',
    ctaText: 'Gửi những gì đang có. MayAoChayBo.vn sẽ cùng bạn phát triển thành một mẫu áo thống nhất cho cả đội.',
  },
]

export function getAudienceLanding(slug: string) {
  const landing = AUDIENCE_LANDINGS.find((item) => item.slug === slug)
  if (!landing) throw new Error(`Unknown audience landing: ${slug}`)
  return landing
}
