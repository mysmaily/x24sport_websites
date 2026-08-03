import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { LegalPage } from '../_x24sport/legal-page'

export const metadata: Metadata = {
  title: 'Điều khoản sử dụng',
  description: 'Điều khoản áp dụng khi sử dụng website, dịch vụ tư vấn và công cụ Facebook Chat của X24Sport.',
  alternates: { canonical: 'https://x24sport.vn/terms/' },
  openGraph: {
    title: 'Điều khoản sử dụng | X24Sport',
    description: 'Điều kiện sử dụng website và dịch vụ chăm sóc khách hàng của X24Sport.',
    url: 'https://x24sport.vn/terms/',
  },
}

export default async function TermsPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  if (tenant !== 'x24sport') notFound()

  return (
    <LegalPage
      eyebrow="Điều kiện sử dụng dịch vụ"
      title="Điều khoản sử dụng"
      description="Khi truy cập website hoặc sử dụng các kênh tư vấn của X24Sport, bạn đồng ý tuân thủ những điều khoản dưới đây."
    >
      <section>
        <h2>1. Chấp nhận điều khoản</h2>
        <p>Bằng việc truy cập x24sport.vn, gửi yêu cầu tư vấn hoặc tương tác với Trang Facebook được kết nối với X24Sport, bạn xác nhận đã đọc và đồng ý với điều khoản này cùng Chính sách quyền riêng tư.</p>
      </section>

      <section>
        <h2>2. Phạm vi dịch vụ</h2>
        <p>X24Sport cung cấp thông tin sản phẩm, tư vấn thiết kế và sản xuất trang phục thể thao, tiếp nhận yêu cầu đặt hàng và hỗ trợ khách hàng qua website, điện thoại, email và Facebook Messenger. Nội dung báo giá, tiến độ và đặc điểm sản phẩm chỉ được xem là xác nhận chính thức khi hai bên đã thống nhất trong đơn hàng hoặc thông báo xác nhận.</p>
      </section>

      <section>
        <h2>3. Sử dụng Facebook Chat</h2>
        <ul>
          <li>Khách hàng chủ động bắt đầu hội thoại bằng cách nhắn tin cho Trang Facebook.</li>
          <li>Nhân viên được phân quyền có thể xem và phản hồi hội thoại trong dashboard nội bộ thay cho việc mở Meta Business Suite.</li>
          <li>Việc gửi tin tuân theo chính sách, quyền truy cập và thời hạn phản hồi do Meta quy định.</li>
          <li>Người kết nối tài khoản Facebook phải có quyền hợp pháp đối với Trang và không được cấp quyền cho tài sản không thuộc phạm vi quản lý của mình.</li>
        </ul>
      </section>

      <section>
        <h2>4. Trách nhiệm của người dùng</h2>
        <p>Bạn đồng ý cung cấp thông tin chính xác, không gửi nội dung trái pháp luật, mã độc, nội dung xâm phạm quyền của người khác hoặc thực hiện hành vi gây gián đoạn hệ thống. Tài khoản nhân viên phải bảo mật thông tin đăng nhập và chỉ sử dụng dữ liệu khách hàng cho công việc được giao.</p>
      </section>

      <section>
        <h2>5. Nội dung và quyền sở hữu</h2>
        <p>Nhãn hiệu, hình ảnh, giao diện và nội dung do X24Sport tạo ra thuộc quyền của X24Sport hoặc bên cấp phép tương ứng. Logo, hình ảnh và nội dung do khách hàng cung cấp vẫn thuộc quyền của khách hàng; khách hàng cam kết có quyền sử dụng các tài liệu đó cho mục đích thiết kế và sản xuất đã yêu cầu.</p>
      </section>

      <section>
        <h2>6. Tính sẵn sàng và giới hạn trách nhiệm</h2>
        <p>Chúng tôi nỗ lực duy trì dịch vụ ổn định nhưng không đảm bảo hệ thống luôn hoạt động không gián đoạn, đặc biệt khi phụ thuộc vào mạng Internet, Meta hoặc nhà cung cấp hạ tầng. Trong phạm vi pháp luật cho phép, X24Sport không chịu trách nhiệm đối với thiệt hại gián tiếp phát sinh từ việc gián đoạn ngoài khả năng kiểm soát hợp lý.</p>
      </section>

      <section>
        <h2>7. Tạm ngừng truy cập</h2>
        <p>X24Sport có thể giới hạn hoặc tạm ngừng quyền truy cập khi phát hiện hành vi vi phạm điều khoản, rủi ro bảo mật, sử dụng trái phép dữ liệu hoặc khi cần bảo trì hệ thống.</p>
      </section>

      <section>
        <h2>8. Thay đổi điều khoản</h2>
        <p>Điều khoản có thể được cập nhật để phản ánh thay đổi của dịch vụ, chính sách Meta hoặc quy định pháp luật. Phiên bản mới có hiệu lực từ ngày được công bố trên trang này.</p>
      </section>

      <section>
        <h2>9. Liên hệ</h2>
        <p>Nếu có câu hỏi, vui lòng gửi email tới <a href="mailto:x24sport.vn@gmail.com">x24sport.vn@gmail.com</a> hoặc gọi <a href="tel:0989353247">0989 353 247</a>.</p>
      </section>
    </LegalPage>
  )
}
