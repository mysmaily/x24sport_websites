export type BasketballAudience = {
  slug: string
  path: string
  eyebrow: string
  title: string
  shortTitle: string
  description: string
  heroTitle: string
  heroDescription: string
  metaTitle: string
  metaDescription: string
  primaryCta: string
  secondaryCta: string
  proof: string[]
  pain: string
  outcome: string
  useCases: string[]
  benefits: { title: string; text: string }[]
  checklist: string[]
  steps: { title: string; text: string }[]
  faq: { question: string; answer: string }[]
}

export const BASKETBALL_AUDIENCES = [
  {
    slug: 'lop-truong-hoc',
    path: '/ao-bong-ro-lop-truong-hoc/',
    eyebrow: 'Lớp & Trường học',
    title: 'May áo bóng rổ cho lớp, trường học và đội tuyển sinh viên',
    shortTitle: 'Lớp & Trường học',
    description: 'Dành cho lớp học, đội tuyển trường, khoa, sinh viên và các giải nội bộ.',
    heroTitle: 'Đồng phục bóng rổ để cả lớp mặc đẹp, dễ chia size và kịp ngày thi đấu.',
    heroDescription: 'Từ áo lớp, đội khoa đến giải nội bộ, đội bạn có thể bắt đầu bằng màu trường, logo lớp hoặc mẫu áo yêu thích rồi duyệt maket trước khi may.',
    metaTitle: 'May Áo Bóng Rổ Cho Lớp & Trường Học',
    metaDescription: 'Landing page may áo bóng rổ cho lớp học, trường học, khoa, sinh viên và giải nội bộ: tư vấn size, thiết kế logo, tên số và duyệt maket trước.',
    primaryCta: 'Gửi yêu cầu cho lớp',
    secondaryCta: 'Xem mẫu học sinh',
    proof: ['Phù hợp đội lớp, khoa, trường', 'Dễ gom size theo danh sách', 'Duyệt tên số trước khi may'],
    pain: 'Lớp thường có nhiều chiều cao, cân nặng và ý kiến thiết kế khác nhau. Nếu không gom thông tin sớm, phần size, tên số và màu áo dễ phải sửa nhiều vòng.',
    outcome: 'Một bộ áo đồng bộ để đi tập, thi đấu, chụp ảnh kỷ yếu thể thao hoặc tham gia giải nội bộ mà vẫn vừa với từng thành viên.',
    useCases: ['Áo đội lớp THCS, THPT', 'Đội tuyển trường', 'Đội khoa, câu lạc bộ sinh viên', 'Giải bóng rổ nội bộ'],
    benefits: [
      { title: 'Dễ gom thông tin', text: 'Có checklist logo, tên số, size và ngày cần nhận để lớp trưởng hoặc ban cán sự chốt nhanh hơn.' },
      { title: 'Thiết kế đúng màu lớp', text: 'Phối màu theo trường, khoa, logo riêng hoặc concept mà cả lớp đã thống nhất.' },
      { title: 'Tư vấn form dễ mặc', text: 'Ưu tiên form vận động thoải mái, phù hợp nhiều vóc dáng học sinh và sinh viên.' },
    ],
    checklist: ['Logo lớp, khoa hoặc trường', 'Tên đội, tên cầu thủ và số áo', 'Danh sách chiều cao, cân nặng hoặc size', 'Ngày cần mặc cho giải hoặc sự kiện', 'Mẫu áo hoặc màu chủ đạo cả lớp thích'],
    steps: [
      { title: 'Gom danh sách', text: 'Chuẩn bị số lượng, size dự kiến, tên số và deadline nhận áo.' },
      { title: 'Chọn hướng áo', text: 'Gửi màu trường, logo lớp hoặc mẫu áo muốn tham khảo.' },
      { title: 'Duyệt maket', text: 'Kiểm tra chính tả tên số, vị trí logo và phối màu trước khi sản xuất.' },
      { title: 'Nhận và phân áo', text: 'Đơn hàng được đóng gói theo thông tin đã chốt để lớp dễ kiểm tra.' },
    ],
    faq: [
      { question: 'Lớp chưa có logo thì bắt đầu thế nào?', answer: 'Có thể bắt đầu bằng tên lớp, màu trường và một mẫu áo tham khảo. Logo hoặc chữ đội có thể trao đổi tiếp trong bước maket.' },
      { question: 'Có hỗ trợ chọn size cho học sinh không?', answer: 'Có. Bạn có thể gửi chiều cao, cân nặng hoặc size dự kiến để được đối chiếu trước khi chốt danh sách.' },
    ],
  },
  {
    slug: 'clb-doi-bong-phong-trao',
    path: '/ao-bong-ro-clb-doi-phong-trao/',
    eyebrow: 'CLB & Đội bóng phong trào',
    title: 'May áo bóng rổ cho câu lạc bộ và đội phong trào',
    shortTitle: 'CLB & Đội phong trào',
    description: 'Dành cho nhóm bạn, câu lạc bộ, trung tâm đào tạo và đội bóng công ty.',
    heroTitle: 'Áo bóng rổ riêng cho đội chơi thường xuyên, nhìn đồng bộ từ sân tập đến trận giao hữu.',
    heroDescription: 'Thiết kế theo màu đội, tên số và logo riêng để nhóm bạn, CLB, trung tâm đào tạo hoặc đội bóng công ty có nhận diện rõ ràng hơn mỗi lần ra sân.',
    metaTitle: 'May Áo Bóng Rổ Cho CLB & Đội Phong Trào',
    metaDescription: 'May áo bóng rổ cho nhóm bạn, câu lạc bộ, trung tâm đào tạo và đội công ty: thiết kế logo, tên số, phối màu đội và tư vấn chất liệu.',
    primaryCta: 'Tư vấn cho CLB',
    secondaryCta: 'Xem mẫu CLB',
    proof: ['Đồng bộ màu và logo đội', 'Phù hợp tập luyện thường xuyên', 'Có thể may bổ sung theo đội'],
    pain: 'Đội phong trào cần áo bền, dễ vận động và vẫn có cá tính riêng. Vấn đề thường nằm ở việc cân bằng ngân sách, chất liệu và thiết kế sao cho cả đội đều muốn mặc.',
    outcome: 'Một bộ áo có nhận diện rõ, đủ thoải mái cho lịch tập đều đặn và đủ nổi bật khi thi đấu giao hữu, giải phong trào hoặc hoạt động công ty.',
    useCases: ['Nhóm bạn chơi cố định', 'Câu lạc bộ bóng rổ', 'Trung tâm đào tạo', 'Đội bóng công ty'],
    benefits: [
      { title: 'Nhận diện đội rõ hơn', text: 'Logo, tên đội, số áo và màu chủ đạo được đưa vào maket để cả đội duyệt trước.' },
      { title: 'Chất liệu theo tần suất chơi', text: 'Tư vấn vải theo nhu cầu tập luyện, thi đấu và ngân sách của đội.' },
      { title: 'Dễ đặt lại khi cần', text: 'Thông tin tên số, màu và maket giúp đội thuận tiện hơn khi cần may bổ sung.' },
    ],
    checklist: ['Logo hoặc tên đội', 'Số lượng bộ hiện tại và dự kiến may thêm', 'Màu chủ đạo, màu phụ', 'Danh sách tên số', 'Chất liệu hoặc ngân sách mong muốn'],
    steps: [
      { title: 'Chọn bản sắc đội', text: 'Xác định màu, logo và phong cách mạnh mẽ, tối giản hoặc nổi bật.' },
      { title: 'Khớp chất liệu', text: 'Chọn vải theo tần suất tập, cảm giác mặc và mức giá phù hợp.' },
      { title: 'Duyệt tên số', text: 'Rà lại danh sách cá nhân hóa để tránh sai sót khi in.' },
      { title: 'Chốt sản xuất', text: 'Xác nhận size, số lượng và thời gian giao trước khi may.' },
    ],
    faq: [
      { question: 'Đội công ty có thể thêm logo doanh nghiệp không?', answer: 'Có. Bạn gửi logo và vị trí mong muốn để đưa vào maket trước khi xác nhận.' },
      { question: 'CLB muốn may thêm sau này có được không?', answer: 'Có thể trao đổi dựa trên mẫu đã chốt. Nên giữ lại mã mẫu, màu và danh sách tên số để đặt bổ sung thuận tiện hơn.' },
    ],
  },
  {
    slug: 'giai-dau-su-kien',
    path: '/ao-bong-ro-giai-dau-su-kien/',
    eyebrow: 'Giải đấu & Sự kiện',
    title: 'May áo bóng rổ cho giải đấu, sự kiện và ban tổ chức',
    shortTitle: 'Giải đấu & Sự kiện',
    description: 'Dành cho ban tổ chức, giải học sinh – sinh viên, giải phong trào và sự kiện bóng rổ.',
    heroTitle: 'Bộ áo giải đấu cần rõ tiến độ, đúng nhận diện và dễ bàn giao cho nhiều đội.',
    heroDescription: 'Hỗ trợ ban tổ chức chuẩn bị áo thi đấu, áo staff hoặc đồng phục sự kiện với danh sách đội, size, logo tài trợ và mốc giao hàng rõ ràng.',
    metaTitle: 'May Áo Bóng Rổ Cho Giải Đấu & Sự Kiện',
    metaDescription: 'Landing page may áo bóng rổ cho ban tổ chức, giải học sinh sinh viên, giải phong trào và sự kiện bóng rổ: tiến độ, size, logo tài trợ, bàn giao.',
    primaryCta: 'Gửi brief giải đấu',
    secondaryCta: 'Xem bảng giá',
    proof: ['Phù hợp nhiều đội cùng lúc', 'Rõ deadline và bàn giao', 'Hỗ trợ logo tài trợ'],
    pain: 'Giải đấu có nhiều đầu việc chạy song song: đội tham gia, lịch thi đấu, truyền thông, tài trợ và thời điểm nhận áo. Nếu file size hoặc logo không rõ, ban tổ chức rất dễ trễ tiến độ.',
    outcome: 'Một phương án áo dễ kiểm soát cho nhiều đội hoặc nhóm staff, giúp ban tổ chức chốt nhận diện, deadline và thông tin bàn giao trước ngày sự kiện.',
    useCases: ['Giải học sinh, sinh viên', 'Giải phong trào', 'Sự kiện bóng rổ cộng đồng', 'Áo staff, trọng tài, ban tổ chức'],
    benefits: [
      { title: 'Quản lý nhiều nhóm rõ ràng', text: 'Tách thông tin theo đội, nhóm staff hoặc nhóm ban tổ chức để hạn chế nhầm size và tên số.' },
      { title: 'Logo tài trợ có vị trí duyệt trước', text: 'Các logo tài trợ, logo giải và thông tin nhận diện được kiểm tra trong maket.' },
      { title: 'Tập trung vào mốc giao hàng', text: 'Brief bắt đầu từ ngày sự kiện để chọn phương án sản xuất phù hợp với tiến độ.' },
    ],
    checklist: ['Ngày tổ chức và ngày cần nhận áo', 'Số đội, số bộ mỗi đội', 'Logo giải và logo tài trợ', 'Danh sách size theo từng nhóm', 'Yêu cầu áo thi đấu, áo staff hoặc cả hai'],
    steps: [
      { title: 'Gửi brief sự kiện', text: 'Cung cấp deadline, số đội, số lượng và yêu cầu nhận diện.' },
      { title: 'Chia nhóm đơn hàng', text: 'Tách thông tin theo đội, staff, trọng tài hoặc ban tổ chức.' },
      { title: 'Duyệt nhận diện', text: 'Kiểm tra logo giải, logo tài trợ, màu và vị trí in trên áo.' },
      { title: 'Bàn giao theo lịch', text: 'Chốt địa chỉ, người nhận và phương án giao trước ngày diễn ra.' },
    ],
    faq: [
      { question: 'Có làm áo cho nhiều đội trong cùng một giải không?', answer: 'Có. Bạn nên gửi bảng số lượng và size theo từng đội để tư vấn phương án rõ ràng hơn.' },
      { question: 'Logo nhà tài trợ cần chuẩn bị file gì?', answer: 'Nên gửi file rõ nét như AI, PDF, SVG hoặc PNG chất lượng cao. Nếu chỉ có ảnh, có thể gửi trước để kiểm tra khả năng dùng trong maket.' },
    ],
  },
  {
    slug: 'doi-tuyen-chuyen-nghiep',
    path: '/ao-bong-ro-doi-tuyen-chuyen-nghiep/',
    eyebrow: 'Đội tuyển & Chuyên nghiệp',
    title: 'May áo bóng rổ cho học viện, đội tuyển và câu lạc bộ chuyên nghiệp',
    shortTitle: 'Đội tuyển & Chuyên nghiệp',
    description: 'Dành cho học viện, đội tuyển, câu lạc bộ bán chuyên và chuyên nghiệp.',
    heroTitle: 'Đồng phục thi đấu cần giữ chuẩn nhận diện, form vận động và chi tiết cá nhân hóa.',
    heroDescription: 'Dành cho học viện, đội tuyển và câu lạc bộ cần bộ áo có hệ nhận diện rõ ràng, chất liệu phù hợp thi đấu và quy trình duyệt kỹ trước sản xuất.',
    metaTitle: 'May Áo Bóng Rổ Cho Đội Tuyển & Chuyên Nghiệp',
    metaDescription: 'May áo bóng rổ cho học viện, đội tuyển, câu lạc bộ bán chuyên và chuyên nghiệp: nhận diện đội, chất liệu thi đấu, tên số, logo và duyệt maket.',
    primaryCta: 'Trao đổi bộ nhận diện',
    secondaryCta: 'Xem chất liệu',
    proof: ['Duyệt kỹ từng chi tiết', 'Phù hợp thi đấu nghiêm túc', 'Đồng bộ nhận diện đội'],
    pain: 'Đội tuyển và học viện thường cần áo có tiêu chuẩn nhận diện chặt hơn: màu, logo, số áo, nhà tài trợ, chất liệu và form mặc phải nhất quán qua nhiều đợt sử dụng.',
    outcome: 'Một bộ đồng phục thể hiện đúng tinh thần đội, ổn định khi thi đấu và đủ rõ ràng để duy trì nhận diện qua mùa giải hoặc chương trình đào tạo.',
    useCases: ['Học viện bóng rổ', 'Đội tuyển trường hoặc tỉnh', 'Câu lạc bộ bán chuyên', 'Câu lạc bộ chuyên nghiệp'],
    benefits: [
      { title: 'Giữ chuẩn nhận diện', text: 'Màu, logo, số áo, tên đội và nhà tài trợ được đưa vào hệ thống maket để duyệt kỹ.' },
      { title: 'Chọn chất liệu theo cường độ', text: 'Tư vấn vải theo nhu cầu tập luyện, thi đấu và hình ảnh chuyên nghiệp của đội.' },
      { title: 'Quy trình chốt rõ', text: 'Các điểm cần xác nhận được gom thành checklist để giảm rủi ro khi sản xuất số lượng lớn.' },
    ],
    checklist: ['Brand guideline hoặc màu nhận diện', 'Logo đội và logo nhà tài trợ', 'Quy định vị trí tên, số, biểu trưng', 'Danh sách size và vai trò thành viên', 'Lịch thi đấu, lịch chụp ảnh hoặc ngày ra mắt áo'],
    steps: [
      { title: 'Rà nhận diện', text: 'Kiểm tra màu, logo, quy chuẩn đặt tên số và tài trợ.' },
      { title: 'Chọn cấu hình áo', text: 'Trao đổi form, chất liệu và mức hoàn thiện theo nhu cầu thi đấu.' },
      { title: 'Duyệt maket chi tiết', text: 'Xác nhận từng vị trí in, tên số và các điểm nhận diện.' },
      { title: 'Sản xuất theo danh sách', text: 'Chốt số lượng, size và lịch bàn giao theo kế hoạch của đội.' },
    ],
    faq: [
      { question: 'Có thể làm theo bộ nhận diện sẵn của đội không?', answer: 'Có. Bạn gửi màu, logo, quy chuẩn hoặc hình tham khảo để đối chiếu trong quá trình lên maket.' },
      { question: 'Đội cần chất liệu thi đấu nên chọn gì?', answer: 'Tùy cảm giác mặc và ngân sách. Bạn có thể xem trang chất liệu hoặc gửi yêu cầu để được tư vấn phương án phù hợp hơn.' },
    ],
  },
] as const satisfies BasketballAudience[]

export function getBasketballAudience(slug: string) {
  return BASKETBALL_AUDIENCES.find((audience) => audience.slug === slug)
}
