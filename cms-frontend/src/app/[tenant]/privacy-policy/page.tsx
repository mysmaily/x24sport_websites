import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { LegalPage } from '../_x24sport/legal-page'

export const metadata: Metadata = {
  title: 'Chính sách quyền riêng tư',
  description: 'Cách X24Sport thu thập, sử dụng, bảo vệ và xử lý dữ liệu khi khách hàng sử dụng website và dịch vụ Facebook Chat.',
  alternates: { canonical: 'https://x24sport.vn/privacy-policy/' },
  openGraph: {
    title: 'Chính sách quyền riêng tư | X24Sport',
    description: 'Thông tin về cách X24Sport xử lý và bảo vệ dữ liệu người dùng.',
    url: 'https://x24sport.vn/privacy-policy/',
  },
}

export default async function PrivacyPolicyPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  if (tenant !== 'x24sport') notFound()

  return (
    <LegalPage
      eyebrow="Quyền riêng tư tại X24Sport"
      title="Chính sách quyền riêng tư"
      description="Chính sách này giải thích dữ liệu chúng tôi xử lý khi bạn truy cập website, liên hệ X24Sport hoặc trao đổi với các Trang Facebook được kết nối với hệ thống nội bộ."
    >
      <section>
        <h2>1. Phạm vi áp dụng</h2>
        <p>Chính sách này áp dụng cho website x24sport.vn, các biểu mẫu liên hệ và công cụ nội bộ dùng để tiếp nhận, quản lý, phản hồi hội thoại từ những Trang Facebook do X24Sport hoặc đơn vị liên quan được ủy quyền quản lý.</p>
      </section>

      <section>
        <h2>2. Dữ liệu chúng tôi có thể xử lý</h2>
        <p>Tùy cách bạn tương tác, chúng tôi có thể xử lý:</p>
        <ul>
          <li>Thông tin bạn chủ động cung cấp như họ tên, số điện thoại, email, địa chỉ, nhu cầu tư vấn và thông tin đơn hàng.</li>
          <li>Nội dung trao đổi, ảnh, tệp đính kèm và thời điểm gửi khi bạn nhắn tin cho Trang Facebook.</li>
          <li>Thông tin do Meta cung cấp trong phạm vi quyền được cấp, chẳng hạn tên hiển thị, ảnh đại diện, mã định danh theo Trang, danh sách Trang được quản lý và trạng thái gửi, nhận hoặc xem tin nhắn.</li>
          <li>Dữ liệu kỹ thuật cơ bản của website như địa chỉ IP, loại trình duyệt, thiết bị, nhật ký lỗi và dữ liệu đo lường khi công cụ phân tích được bật.</li>
        </ul>
        <p>Chúng tôi không yêu cầu mật khẩu Facebook và không lưu thông tin thanh toán thẻ trên hệ thống chat.</p>
      </section>

      <section>
        <h2>3. Mục đích sử dụng dữ liệu</h2>
        <ul>
          <li>Hiển thị và phản hồi hội thoại Facebook trong dashboard chăm sóc khách hàng.</li>
          <li>Xác định Trang tiếp nhận, trạng thái chưa đọc và nhân viên đang hỗ trợ.</li>
          <li>Liên kết hội thoại với đúng hồ sơ khách hàng để tư vấn, chốt đơn, cập nhật đơn hàng và gửi tài liệu liên quan.</li>
          <li>Duy trì an toàn hệ thống, phòng chống lạm dụng, khắc phục lỗi và đáp ứng nghĩa vụ pháp lý.</li>
        </ul>
      </section>

      <section>
        <h2>4. Cơ sở và phạm vi truy cập Facebook</h2>
        <p>Tài khoản Facebook quản lý Trang phải chủ động đăng nhập và cấp quyền thông qua Meta. Hệ thống chỉ truy cập các Trang và dữ liệu nằm trong phạm vi quyền đã được tài khoản đó chấp thuận. Người quản lý có thể thu hồi quyền trong phần Ứng dụng và trang web của Facebook hoặc ngắt kết nối tài khoản tại hệ thống X24Sport.</p>
      </section>

      <section>
        <h2>5. Chia sẻ dữ liệu</h2>
        <p>Chúng tôi không bán dữ liệu cá nhân. Dữ liệu chỉ được chia sẻ khi cần thiết với nhân viên hoặc đơn vị vận hành được phân quyền, nhà cung cấp hạ tầng phục vụ hệ thống, Meta để thực hiện chức năng Facebook, hoặc cơ quan có thẩm quyền khi pháp luật yêu cầu.</p>
      </section>

      <section>
        <h2>6. Lưu trữ và bảo mật</h2>
        <p>Chúng tôi áp dụng phân quyền theo đơn vị, kiểm soát truy cập, mã hóa thông tin xác thực Facebook và các biện pháp kỹ thuật phù hợp để hạn chế truy cập trái phép. Dữ liệu được lưu trong thời gian cần thiết cho việc chăm sóc khách hàng, xử lý đơn hàng, giải quyết tranh chấp hoặc tuân thủ nghĩa vụ pháp lý, sau đó được xóa hoặc ẩn danh theo quy trình vận hành.</p>
      </section>

      <section>
        <h2>7. Quyền của bạn</h2>
        <p>Bạn có thể yêu cầu xem, chỉnh sửa hoặc xóa dữ liệu cá nhân do X24Sport lưu giữ; phản đối hoặc hạn chế một số hoạt động xử lý; và thu hồi quyền Facebook đã cấp. Xem hướng dẫn tại <a href="/data-deletion/">trang yêu cầu xóa dữ liệu</a>.</p>
      </section>

      <section>
        <h2>8. Liên hệ</h2>
        <p>Mọi câu hỏi về quyền riêng tư vui lòng gửi tới <a href="mailto:x24sport.vn@gmail.com">x24sport.vn@gmail.com</a> hoặc gọi <a href="tel:0989353247">0989 353 247</a>.</p>
      </section>
    </LegalPage>
  )
}
