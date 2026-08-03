import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { LegalPage } from '../_x24sport/legal-page'

export const metadata: Metadata = {
  title: 'Yêu cầu xóa dữ liệu',
  description: 'Hướng dẫn thu hồi quyền Facebook và yêu cầu X24Sport xóa dữ liệu liên quan.',
  alternates: { canonical: 'https://x24sport.vn/data-deletion/' },
  openGraph: {
    title: 'Yêu cầu xóa dữ liệu | X24Sport',
    description: 'Các bước thu hồi quyền Facebook và gửi yêu cầu xóa dữ liệu tại X24Sport.',
    url: 'https://x24sport.vn/data-deletion/',
  },
}

export default async function DataDeletionPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  if (tenant !== 'x24sport') notFound()

  return (
    <LegalPage
      eyebrow="Kiểm soát dữ liệu của bạn"
      title="Yêu cầu xóa dữ liệu"
      description="Bạn có thể thu hồi quyền Facebook và yêu cầu xóa dữ liệu đã lưu trong hệ thống X24Sport theo các bước dưới đây."
    >
      <section>
        <h2>1. Thu hồi quyền trên Facebook</h2>
        <ol>
          <li>Đăng nhập Facebook và mở <strong>Cài đặt & quyền riêng tư</strong>, sau đó chọn <strong>Cài đặt</strong>.</li>
          <li>Mở mục <strong>Ứng dụng và trang web</strong>.</li>
          <li>Tìm ứng dụng <strong>Hacado</strong>, chọn <strong>Gỡ</strong> và xác nhận.</li>
        </ol>
        <p>Thao tác này ngăn ứng dụng tiếp tục sử dụng quyền Facebook của tài khoản. Nếu bạn là nhân viên được phân quyền, bạn cũng có thể ngắt kết nối tài khoản ngay trong dashboard Facebook của hệ thống.</p>
      </section>

      <section>
        <h2>2. Gửi yêu cầu xóa dữ liệu đã lưu</h2>
        <p>Sau khi thu hồi quyền, hãy gửi email tới <a href="mailto:x24sport.vn@gmail.com?subject=Y%C3%AAu%20c%E1%BA%A7u%20x%C3%B3a%20d%E1%BB%AF%20li%E1%BB%87u%20Facebook">x24sport.vn@gmail.com</a> với tiêu đề <strong>Yêu cầu xóa dữ liệu Facebook</strong> và cung cấp:</p>
        <ul>
          <li>Tên tài khoản Facebook đã dùng để kết nối hoặc nhắn tin.</li>
          <li>Tên Trang Facebook liên quan.</li>
          <li>Email, số điện thoại hoặc thông tin phù hợp để chúng tôi xác minh yêu cầu.</li>
          <li>Phạm vi dữ liệu bạn muốn xóa, nếu chỉ yêu cầu xóa một phần.</li>
        </ul>
        <p>Không gửi mật khẩu Facebook, mã đăng nhập, access token hoặc thông tin thẻ thanh toán qua email.</p>
      </section>

      <section>
        <h2>3. Quy trình xử lý</h2>
        <p>Chúng tôi sẽ xác nhận người yêu cầu có liên quan đến dữ liệu cần xóa, thông báo khi tiếp nhận và xử lý trong thời gian hợp lý, thông thường không quá 30 ngày. Dữ liệu có thể được giữ lại lâu hơn khi pháp luật yêu cầu, khi cần hoàn thành nghĩa vụ đơn hàng hoặc để giải quyết tranh chấp; trong trường hợp đó chúng tôi sẽ thông báo phạm vi và lý do lưu giữ.</p>
      </section>

      <section>
        <h2>4. Dữ liệu được xử lý theo yêu cầu</h2>
        <p>Tùy phạm vi hợp lệ, việc xóa có thể bao gồm thông tin kết nối Facebook, token đã mã hóa, liên kết giữa hội thoại và hồ sơ khách hàng, nội dung hoặc tệp đính kèm được lưu trong hệ thống. Việc xóa tại X24Sport không tự động xóa bản gốc đang được Meta lưu giữ; bạn cần sử dụng công cụ của Facebook cho dữ liệu thuộc nền tảng Meta.</p>
      </section>

      <section>
        <h2>5. Hỗ trợ thêm</h2>
        <p>Nếu không thể gửi email, vui lòng gọi <a href="tel:0989353247">0989 353 247</a> để được hướng dẫn xác minh và gửi yêu cầu.</p>
      </section>
    </LegalPage>
  )
}
