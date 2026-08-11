export type FootballAudienceLanding = {
  slug: string
  navLabel: string
  eyebrow: string
  title: string
  tagline?: string
  description: string
  heroImage: string
  heroImages?: Array<{ src: string; alt: string }>
  heroAlt: string
  contexts: string[]
  problemTitle: string
  problemText: string
  challenges: Array<{ title: string; text: string }>
  benefits: Array<{ title: string; text: string }>
  briefTitle: string
  briefItems: string[]
  processNote: string
  faq: Array<{ question: string; answer: string }>
  ctaTitle: string
  ctaText: string
  categorySlug?: string
  categoryLabel?: string
  metaTitle: string
  metaDescription: string
}

export const FOOTBALL_AUDIENCE_LANDINGS: FootballAudienceLanding[] = [
  {
    slug: 'ao-bong-da-doi-bong-cau-lac-bo',
    navLabel: 'Đội bóng & câu lạc bộ',
    eyebrow: 'Áo bóng đá cho đội bóng & CLB',
    title: 'Thiết kế áo bóng đá đội bóng, câu lạc bộ',
    tagline: 'Mặc cùng một màu. Chơi đúng một tinh thần.',
    description: 'Thiết kế áo bóng đá theo tên đội, màu sắc và cá tính riêng cho lịch tập hằng tuần, trận giao hữu và những mùa giải mà cả đội muốn được nhận ra.',
    heroImage: '/images/mayaobongda/audience-landings/doi-bong-cau-lac-bo.webp',
    heroAlt: 'Đội bóng phong trào Việt Nam mặc áo thi đấu xanh cam thiết kế đồng bộ',
    contexts: ['Đội bóng phong trào', 'Câu lạc bộ cố định', 'Đội lớp, trường và khu vực'],
    problemTitle: 'Một bộ áo tốt phải hợp với cả đội, không chỉ đẹp trên maket.',
    problemText: 'Đội cần một thiết kế có bản sắc, nhưng người đại diện cũng phải chốt được size, tên số và ý kiến của nhiều thành viên mà không rối.',
    challenges: [
      { title: 'Có tên đội nhưng chưa có hình ảnh', text: 'Ý tưởng, màu yêu thích và mẫu tham khảo thường còn rời rạc, chưa thành một thiết kế thống nhất.' },
      { title: 'Mỗi người một vóc dáng', text: 'Đội hình có nhiều chiều cao, cân nặng và thói quen mặc khác nhau nên cần rà soát size trước khi chốt.' },
      { title: 'Tên số dễ nhầm', text: 'Danh sách cá nhân hóa cần được tập hợp rõ để người đại diện kiểm tra một lượt trước khi sản xuất.' },
    ],
    benefits: [
      { title: 'Nhận diện đúng chất đội', text: 'Phối màu, logo, tên đội và họa tiết được đặt trong cùng một hướng thiết kế.' },
      { title: 'Cả đội dễ cùng duyệt', text: 'Maket giúp thành viên hình dung mẫu áo trước khi người đại diện xác nhận phương án.' },
      { title: 'Thông tin được gom gọn', text: 'Mẫu áo, bảng size và danh sách tên số có đầu mối rõ ràng để thuận tiện kiểm tra.' },
    ],
    briefTitle: 'Sáu thứ giúp ý tưởng của đội thành một mẫu áo rõ ràng.',
    briefItems: ['Tên đội hoặc logo đang có', 'Màu chủ đạo và màu muốn tránh', 'Mẫu áo cả đội yêu thích', 'Số lượng thành viên', 'Danh sách size dự kiến', 'Tên và số cần in riêng'],
    processNote: 'Bạn chưa cần có sẵn một bản thiết kế hoàn chỉnh. Tên đội, màu sắc và vài mẫu tham khảo đã đủ để bắt đầu trao đổi.',
    faq: [
      { question: 'Đội chưa có logo thì bắt đầu từ đâu?', answer: 'Bạn có thể gửi tên đội, chữ viết tắt, màu sắc hoặc biểu tượng có ý nghĩa chung. Đội ngũ sẽ dựa trên những dữ liệu đó để trao đổi hướng thể hiện phù hợp trên áo.' },
      { question: 'Có thể in tên và số riêng cho từng thành viên không?', answer: 'Có thể trao đổi danh sách cá nhân hóa cho từng áo. Người đại diện nên tổng hợp tên, số và size trong một danh sách để cùng kiểm tra trước khi chốt.' },
      { question: 'Làm sao chọn size cho đội có nhiều dáng người?', answer: 'Website có bảng size làm mốc. Nếu đội có nhiều vóc dáng khác nhau, bạn có thể gửi thêm chiều cao và cân nặng để được tư vấn trước khi tổng hợp.' },
    ],
    ctaTitle: 'Đội đã có tên. Giờ hãy cho cái tên ấy một diện mạo.',
    ctaText: 'Gửi màu sắc, logo hoặc mẫu áo cả đội đang thích để bắt đầu phát triển phương án riêng.',
    metaTitle: 'May Áo Bóng Đá Đội Bóng & Câu Lạc Bộ Thiết Kế Riêng',
    metaDescription: 'Thiết kế và may áo bóng đá cho đội bóng, câu lạc bộ: phối màu riêng, thêm logo, in tên số, tư vấn size và duyệt maket trước sản xuất.',
  },
  {
    slug: 'ao-bong-da-giai-phong-trao',
    navLabel: 'Giải phong trào',
    eyebrow: 'Áo bóng đá cho giải phong trào',
    title: 'Thiết kế áo bóng đá giải phong trào',
    tagline: 'Để mỗi đội ra sân khác màu, nhưng cùng thuộc về một giải đấu.',
    description: 'Phát triển hệ thống áo thi đấu theo chủ đề giải, màu đội và vị trí nhận diện — giúp ban tổ chức tạo nên hình ảnh đồng bộ từ lễ khai mạc đến trận chung kết.',
    heroImage: '/images/mayaobongda/audience-landings/giai-phong-trao.webp',
    heroAlt: 'Hai đội bóng phong trào Việt Nam trong trang phục xanh và cam bước ra sân thi đấu',
    contexts: ['Giải sân 5 và sân 7', 'Giải lớp, trường và địa phương', 'Giải nội bộ nhiều đội'],
    problemTitle: 'Ban tổ chức không chỉ đặt áo. Ban tổ chức đang dựng hình ảnh cho cả giải.',
    problemText: 'Nhiều đội, nhiều màu và nhiều lớp logo khiến việc duyệt dễ kéo dài. Một hệ thống rõ ràng ngay từ đầu giúp hình ảnh trên sân và trong ảnh sự kiện nhất quán hơn.',
    challenges: [
      { title: 'Nhiều đội cần dễ phân biệt', text: 'Màu áo và họa tiết cần đủ khác nhau để các đội dễ nhận diện khi thi đấu.' },
      { title: 'Logo có thứ tự ưu tiên', text: 'Tên giải, đơn vị tổ chức và nhà tài trợ cần được sắp xếp có chủ đích, tránh cạnh tranh trên cùng mặt áo.' },
      { title: 'Mốc thời gian đã cố định', text: 'Danh sách đội, số lượng, size và nội dung in cần được chốt theo một đầu mối trước ngày khai mạc.' },
    ],
    benefits: [
      { title: 'Một ngôn ngữ chung cho giải', text: 'Chủ đề, màu sắc và cách đặt nhận diện được phát triển thành hệ thống có tính liên kết.' },
      { title: 'Từng đội vẫn có cá tính', text: 'Mỗi đội có thể giữ màu và tinh thần riêng trong giới hạn hình ảnh chung của giải.' },
      { title: 'Dễ rà soát theo danh sách', text: 'Maket và thông tin từng đội giúp ban tổ chức kiểm tra trước khi xác nhận sản xuất.' },
    ],
    briefTitle: 'Sáu dữ liệu nên có trước khi duyệt hệ thống áo của giải.',
    briefItems: ['Tên và chủ đề giải đấu', 'Danh sách đội tham gia', 'Màu nhận diện từng đội', 'Logo ban tổ chức, nhà tài trợ', 'Số lượng và cơ cấu size', 'Ngày dự kiến cần nhận áo'],
    processNote: 'Nếu danh sách đội chưa hoàn tất, hãy bắt đầu từ chủ đề giải, hệ thống logo và số lượng dự kiến để định hình nguyên tắc chung trước.',
    faq: [
      { question: 'Có thể làm nhiều màu áo cho các đội trong cùng giải không?', answer: 'Có thể trao đổi nhu cầu màu của từng đội và hướng nhận diện chung. Ban tổ chức nên gửi danh sách màu sớm để rà soát khả năng phân biệt giữa các đội.' },
      { question: 'Nhiều logo nhà tài trợ nên bố trí thế nào?', answer: 'Hãy gửi đầy đủ file logo và thứ tự ưu tiên. Vị trí, kích thước tương đối và cách sắp xếp sẽ được thể hiện trên maket để ban tổ chức cùng kiểm tra.' },
      { question: 'Cần chốt những gì trước ngày sản xuất?', answer: 'Nên xác nhận thiết kế của từng đội, danh sách size, tên số nếu có, số lượng cuối cùng và mốc cần nhận. Các thông tin này càng tập trung, việc rà soát càng thuận tiện.' },
    ],
    ctaTitle: 'Một giải đấu đáng nhớ bắt đầu từ hình ảnh được chuẩn bị kỹ.',
    ctaText: 'Gửi chủ đề giải, danh sách đội và hệ thống logo để cùng xây dựng hướng áo thi đấu thống nhất.',
    metaTitle: 'May Áo Bóng Đá Giải Phong Trào Theo Yêu Cầu',
    metaDescription: 'Thiết kế áo bóng đá cho giải phong trào, giải sân 5, sân 7 và giải nội bộ: phối màu từng đội, bố trí logo và duyệt maket trước sản xuất.',
  },
  {
    slug: 'thiet-ke-ao-bong-da-cong-ty',
    categorySlug: 'ao-bong-da-cong-ty',
    categoryLabel: 'Áo bóng đá công ty',
    navLabel: 'Công ty',
    eyebrow: 'Thiết kế áo bóng đá công ty',
    title: 'Thiết kế áo bóng đá công ty',
    tagline: 'Một bộ áo riêng cho tinh thần doanh nghiệp trên sân bóng.',
    description: 'Thiết kế áo bóng đá theo màu thương hiệu, logo và tinh thần tập thể cho giải nội bộ, team building thể thao và những trận giao lưu giữa phòng ban.',
    heroImage: '/images/mayaobongda/audience-landings/thiet-ke-ao-bong-da-cong-ty.webp',
    heroAlt: 'Đội bóng công ty Việt Nam mặc áo thi đấu đỏ trắng trên sân bóng gần khu văn phòng',
    contexts: ['Giải bóng đá nội bộ', 'Team building thể thao', 'Giao lưu giữa phòng ban'],
    problemTitle: 'Chiếc áo phải đủ thể thao để ra sân, đủ chỉn chu để đại diện cho tổ chức.',
    problemText: 'Người phụ trách cần cân bằng màu thương hiệu, logo, sự thoải mái khi vận động và ý kiến của nhiều bên trước khi chốt một mẫu cho cả công ty.',
    challenges: [
      { title: 'Nhận diện cần đúng mực', text: 'Logo và màu thương hiệu phải dễ nhận ra nhưng vẫn hài hòa với một thiết kế áo thi đấu.' },
      { title: 'Nhiều phòng ban cùng góp ý', text: 'Bộ phận tổ chức, truyền thông và đại diện đội bóng cần nhìn thấy cùng một phương án để duyệt.' },
      { title: 'Danh sách người mặc lớn', text: 'Size, tên và số áo của nhiều nhân sự cần được tổng hợp theo một cấu trúc dễ kiểm tra.' },
    ],
    benefits: [
      { title: 'Bám sát nhận diện công ty', text: 'Màu sắc, logo và nội dung được bố trí trong một tổng thể chuyên nghiệp, dễ nhận ra.' },
      { title: 'Maket thuận tiện để duyệt', text: 'Phương án trực quan giúp các bên liên quan góp ý trên cùng một thiết kế trước khi chốt.' },
      { title: 'Sẵn sàng cho ngày thi đấu', text: 'Mẫu áo, số lượng và danh sách size được tập hợp qua một người phụ trách.' },
    ],
    briefTitle: 'Sáu thông tin giúp người phụ trách làm việc nhanh hơn.',
    briefItems: ['Logo và màu nhận diện', 'Mục đích của hoạt động', 'Số đội hoặc số người tham gia', 'Danh sách size dự kiến', 'Tên, số hoặc nội dung cần in', 'Thời gian cần nhận áo'],
    processNote: 'Bạn có thể bắt đầu bằng logo, màu thương hiệu và mục đích chương trình. Đội ngũ sẽ cùng làm rõ phương án trước khi duyệt maket.',
    faq: [
      { question: 'Có thể thiết kế theo bộ nhận diện của công ty không?', answer: 'Có. Bạn có thể gửi logo, mã màu, quy chuẩn sử dụng thương hiệu và hình ảnh tham khảo để trao đổi cách thể hiện phù hợp trên áo thi đấu.' },
      { question: 'Chưa chốt số lượng chính xác có trao đổi mẫu trước được không?', answer: 'Bạn có thể gửi số lượng dự kiến để bắt đầu định hướng mẫu. Số lượng và danh sách size cuối cùng vẫn cần được xác nhận trước khi sản xuất.' },
      { question: 'Có thể phân biệt nhiều phòng ban không?', answer: 'Hãy cung cấp số đội, màu mong muốn và nội dung cần phân biệt. Đội ngũ sẽ trao đổi cách phối màu hoặc đặt tên phù hợp với hệ thống chung của chương trình.' },
    ],
    ctaTitle: 'Đang chuẩn bị giải nội bộ hay một trận giao lưu?',
    ctaText: 'Gửi logo, màu nhận diện, số lượng dự kiến và thời gian cần áo để bắt đầu trao đổi phương án cho đội công ty.',
    metaTitle: 'Thiết Kế Áo Bóng Đá Công Ty Theo Nhận Diện Riêng',
    metaDescription: 'Thiết kế và may áo bóng đá công ty cho giải nội bộ, team building và giao lưu phòng ban: phối màu thương hiệu, thêm logo, tư vấn size.',
  },
  {
    slug: 'thiet-ke-ao-bong-da-ngan-hang',
    categorySlug: 'ao-bong-da-cong-ty-ngan-hang',
    categoryLabel: 'Áo bóng đá ngân hàng',
    navLabel: 'Ngân hàng',
    eyebrow: 'Thiết kế áo bóng đá ngân hàng',
    title: 'Thiết kế áo bóng đá ngân hàng',
    tagline: 'Chỉn chu như nhận diện thương hiệu. Linh hoạt như một đội bóng.',
    description: 'Thiết kế áo bóng đá cho ngân hàng theo màu nhận diện, logo chi nhánh và tinh thần giải nội bộ, giúp đội hình nổi bật mà vẫn giữ sự chuyên nghiệp.',
    heroImage: '/images/mayaobongda/audience-landings/thiet-ke-ao-bong-da-ngan-hang-nam.webp',
    heroImages: [
      {
        src: '/images/mayaobongda/audience-landings/thiet-ke-ao-bong-da-ngan-hang-nam.webp',
        alt: 'Đội bóng nam ngân hàng Việt Nam mặc áo thi đấu gradient xanh trắng có logo BANK giả trên sân bóng cạnh tòa nhà tài chính',
      },
      {
        src: '/images/mayaobongda/audience-landings/thiet-ke-ao-bong-da-ngan-hang-nu.webp',
        alt: 'Đội bóng nữ ngân hàng Việt Nam mặc áo thi đấu gradient xanh trắng có logo BANK giả trên sân bóng cạnh tòa nhà tài chính',
      },
    ],
    heroAlt: 'Đội bóng ngân hàng Việt Nam mặc áo thi đấu gradient xanh trắng có logo BANK giả trên sân bóng cạnh tòa nhà tài chính',
    contexts: ['Giải ngân hàng nội bộ', 'Giao lưu giữa chi nhánh', 'Team building thể thao'],
    problemTitle: 'Áo thi đấu ngân hàng cần nổi bật trên sân nhưng vẫn đúng tinh thần thương hiệu.',
    problemText: 'Màu chủ đạo, logo, tên chi nhánh và quy chuẩn nhận diện cần được đặt vào một thiết kế thể thao có bố cục gọn, dễ duyệt và dễ sản xuất theo danh sách đông người.',
    challenges: [
      { title: 'Màu thương hiệu cần chính xác', text: 'Sắc độ áo và họa tiết phải giữ cảm giác quen thuộc của ngân hàng nhưng không làm mẫu áo bị nặng.' },
      { title: 'Logo cần đặt đúng vai trò', text: 'Logo ngân hàng, chi nhánh, chương trình hoặc nhà tài trợ cần có thứ tự rõ ràng trên maket.' },
      { title: 'Danh sách thường nhiều người', text: 'Size, tên số và đơn vị tham gia cần được gom thành bảng để giảm nhầm lẫn trước sản xuất.' },
    ],
    benefits: [
      { title: 'Giữ tinh thần thương hiệu', text: 'Màu sắc, logo và các điểm nhấn được phát triển theo hướng chuyên nghiệp, dễ nhận diện.' },
      { title: 'Dễ trình duyệt nội bộ', text: 'Maket thể hiện rõ mặt trước, mặt sau và vị trí nội dung để các bên cùng kiểm tra.' },
      { title: 'Phù hợp giải nhiều chi nhánh', text: 'Có thể phân biệt đội, chi nhánh hoặc khu vực bằng màu phụ, tên đội và nội dung in.' },
    ],
    briefTitle: 'Sáu dữ liệu nên chuẩn bị khi đặt áo bóng đá ngân hàng.',
    briefItems: ['Logo ngân hàng hoặc chi nhánh', 'Màu nhận diện cần ưu tiên', 'Tên giải hoặc chương trình', 'Số đội và số lượng người mặc', 'Danh sách size, tên và số', 'Ngày dự kiến cần nhận áo'],
    processNote: 'Nếu cần trình duyệt nội bộ, hãy gửi trước quy chuẩn logo, màu nhận diện và thông tin chương trình để maket bám đúng yêu cầu ngay từ đầu.',
    faq: [
      { question: 'Có thể thiết kế theo màu nhận diện ngân hàng không?', answer: 'Có. Bạn có thể gửi logo, mã màu hoặc hình ảnh nhận diện hiện có để trao đổi cách phối lên áo thi đấu.' },
      { question: 'Nhiều chi nhánh muốn phân biệt đội thì làm thế nào?', answer: 'Có thể dùng màu phụ, tên đội, tên chi nhánh hoặc chi tiết đồ họa riêng trong cùng một hệ thống thiết kế chung.' },
      { question: 'Có hỗ trợ tổng hợp tên số cho đội đông người không?', answer: 'Người phụ trách nên gửi bảng tên, số và size. Thông tin này sẽ được rà soát cùng maket trước khi xác nhận sản xuất.' },
    ],
    ctaTitle: 'Đang chuẩn bị giải bóng đá cho ngân hàng?',
    ctaText: 'Gửi logo, màu nhận diện, tên chương trình, số đội và thời gian cần áo để bắt đầu phát triển maket.',
    metaTitle: 'Thiết Kế Áo Bóng Đá Ngân Hàng Theo Nhận Diện Riêng',
    metaDescription: 'Thiết kế và may áo bóng đá ngân hàng cho giải nội bộ, giao lưu chi nhánh và team building: phối màu nhận diện, thêm logo, duyệt maket.',
  },
]

const FOOTBALL_AUDIENCE_LANDING_ALIASES: Record<string, string> = {
  'ao-bong-da-cong-ty-ngan-hang': 'thiet-ke-ao-bong-da-ngan-hang',
}

export function getFootballAudienceLanding(slug: string) {
  const resolvedSlug = FOOTBALL_AUDIENCE_LANDING_ALIASES[slug] || slug
  const landing = FOOTBALL_AUDIENCE_LANDINGS.find((item) => item.slug === resolvedSlug)
  if (!landing) throw new Error(`Unknown football audience landing: ${slug}`)
  return landing
}
