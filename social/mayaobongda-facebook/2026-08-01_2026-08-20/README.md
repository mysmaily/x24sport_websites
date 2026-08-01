# Lịch nội dung May Áo Bóng Đá — 01/08–20/08/2026

- Kênh: Facebook `May Áo Bóng Đá - VN` và Instagram `mayaobongda.vn`.
- Nhịp đăng: 10:00 và 19:30, giờ Việt Nam, trong 20 ngày, bắt đầu từ 01/08/2026.
- Số bài: 40.
- Định dạng: carousel 5 ảnh vuông/bài.
- Tổng ảnh đã chuẩn bị: 200 ảnh, gồm 40 ảnh chính và 160 ảnh hỗ trợ.
- Luân phiên: bài buổi sáng dùng nhóm sản phẩm mới; bài buổi tối dùng nhóm sản phẩm cũ còn phù hợp.

## Cách ghép ảnh

Mỗi mục trong `campaign.json` có một ảnh chính tại `images/<image_file>`.

- Với bài có `source: new`, ghép thêm bốn ảnh `support-new-NNN.jpg` theo thứ tự, không lặp.
- Với bài có `source: old`, ghép thêm bốn ảnh `support-old-NNN.jpg` theo thứ tự, không lặp.
- Ví dụ bài `new` đầu tiên dùng `support-new-001.jpg` đến `support-new-004.jpg`; bài `new` thứ hai dùng `support-new-005.jpg` đến `support-new-008.jpg`.

## Dòng mở đầu carousel

- Nhóm mới: `⚽ 5 mẫu áo mới để đội bạn tham khảo. Vuốt xem đủ phối màu và chọn mẫu gần nhất với tinh thần của đội.`
- Nhóm cũ: `⚽ 5 mẫu áo vẫn rất đáng tham khảo. Vuốt xem trọn bộ rồi chọn một mẫu làm điểm xuất phát cho phiên bản riêng của đội.`

Caption trong `campaign.json` được đặt sau dòng mở đầu tương ứng. Khi đăng đồng thời lên Instagram, giữ CTA inbox và tên miền `mayaobongda.vn`; liên kết đầy đủ vẫn hữu ích cho bài Facebook.

## Kiểm tra trước khi lên lịch

- Cả Facebook và Instagram đều được chọn ở trường `Đăng lên`.
- Mỗi bài có đúng 5 ảnh và ảnh chính đứng đầu.
- Chế độ lên lịch bật, ngày/giờ đúng theo `campaign.json`.
- Không bật quảng bá tự động và không chia sẻ lên Tin.

## Trạng thái thực hiện

- Hoàn tất phân bổ lịch từ 01/08/2026 đến 20/08/2026, mỗi ngày 2 bài.
- 40 bài trên Facebook và 40 bài trên Instagram; 5 ảnh/bài.
- Đối soát từng đường dẫn sản phẩm ghi nhận đủ 80 mục của chiến dịch, mỗi bài có đúng một bản Facebook và một bản Instagram.
- Từ 02/08 đến 20/08, lịch đăng là 10:00 và 19:30. Riêng ngày bắt đầu 01/08, Meta giữ hai khung 11:00 và 18:30.
- Đã xóa một bản Facebook tạo bù bị trùng; bài tối 09/08 hiện còn đúng một bản trên mỗi kênh.
- Không bật quảng bá tự động và không chia sẻ lên Tin.
