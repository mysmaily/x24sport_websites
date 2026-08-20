---
name: chon-nguon-cho-dong-phuc-cong-ty
description: Rà catalog áo thể thao hoặc áo polo, chọn mẫu nguồn phù hợp để chuyển thành đồng phục công ty/doanh nghiệp. Dùng khi cần lọc mẫu, loại biến thể gần trùng và bàn giao ảnh nguồn; không dùng để tạo ảnh hoặc xuất bản sản phẩm.
---

# Chọn nguồn cho đồng phục công ty

Tạo một bộ mẫu nguồn có tính ứng dụng cho nhân sự, sự kiện nội bộ, đội kinh doanh, kỹ thuật hoặc vận hành. Đừng chọn chỉ vì thiết kế nổi bật trên sân thể thao.

## Đầu vào

Xác định URL/catalog nguồn, phạm vi trang, số lượng (nếu có), kích thước lô (mặc định 5), và pipeline nhận bàn giao (nếu người dùng nêu). Không tự mở rộng ra ngoài phạm vi được giao. Khi người dùng yêu cầu toàn bộ 18 trang, rà trang 1–18.

## Quy trình

1. Đọc `AGENTS.md` gốc và profile domain nguồn/đích khi có.
2. Rà mọi sản phẩm trong phạm vi; ghi source ID ổn định, tên, URL sản phẩm, URL ảnh chính, trang xuất hiện và đặc điểm thị giác.
3. Tải ảnh chính rõ nét để đánh giá trực quan. Với catalog lớn, tạo contact sheet theo trang để phát hiện mẫu gần trùng. Không đánh giá chỉ từ tên.
4. Đọc và áp dụng [hợp đồng tuyển chọn](references/selection-contract.md).
5. Chấm từng mẫu trên thang 100, loại các trường hợp vi phạm điều kiện trực tiếp, rồi áp dụng cổng đa dạng.
6. Xếp hạng theo điểm. Với các mẫu gần trùng, giữ mẫu chuyên nghiệp hơn, có vùng đặt nhận diện doanh nghiệp tốt hơn và ít nhận diện nguồn cần xử lý hơn.
7. Nếu không có số lượng được chỉ định, chỉ giữ các mẫu thật sự vượt ngưỡng và khác biệt; không lấp đầy danh sách bằng biến thể đổi màu.
8. Chia theo lô ưu tiên giảm dần nhưng mỗi lô 5 cần cân bằng màu và cấu trúc thị giác.
9. Luôn lưu ảnh nguồn của mẫu được chọn vào thư mục `selected-source-images/` trong thư mục chạy của skill. Có thể xóa ảnh không chọn khi người dùng yêu cầu; nếu không, giữ chúng trong thư mục tạm/rà soát riêng.

## Phạm vi hành động

Mặc định chỉ rà, chọn và bàn giao. Không tạo ảnh, sửa CMS hoặc xuất bản.

Nếu yêu cầu ban đầu bao gồm chuyển đổi tiếp, hoàn thành và lưu danh sách tuyển chọn trước; sau đó giao từng lô cho skill tạo ảnh mà người dùng chỉ định. Chỉ xuất bản khi người dùng đã ủy quyền rõ ràng.

## Bàn giao bắt buộc

Lưu báo cáo Markdown. Khi có pipeline tiếp theo hoặc người dùng yêu cầu dữ liệu máy đọc, tạo thêm JSON theo hợp đồng. Báo cáo phải nêu tổng đã rà/chọn/loại, bảng điểm của mẫu chọn, nhóm gần trùng bị loại, lô thực thi, URL sản phẩm/ảnh, lỗi ảnh hoặc thiếu bằng chứng, và việc chỉ bàn giao hay đã thực thi bước tiếp theo.
