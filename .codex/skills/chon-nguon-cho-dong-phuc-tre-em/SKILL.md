---
name: chon-nguon-cho-dong-phuc-tre-em
description: Rà catalog áo thể thao hoặc áo polo, chấm điểm và chọn mẫu nguồn phù hợp để chuyển thành đồng phục trẻ em, mầm non, thiếu nhi, câu lạc bộ hoặc hoạt động ngoại khóa cho trẻ. Dùng khi cần lọc mẫu, loại biến thể gần trùng và bàn giao ảnh nguồn; không dùng để tạo ảnh hoặc xuất bản sản phẩm.
---

# Chọn nguồn cho đồng phục trẻ em

Chọn một bộ mẫu nguồn vui tươi, dễ mặc, dễ chuyển đổi thành đồng phục cho trẻ em và có bằng chứng truy xuất rõ ràng. Đừng chọn chỉ vì mẫu nổi bật trên sân thể thao hoặc trông hợp người lớn.

## Đầu vào

Xác định URL/catalog nguồn, phạm vi trang hoặc danh mục, số lượng cần chọn nếu có, kích thước lô (mặc định 5), nhóm tuổi/ngữ cảnh sử dụng nếu người dùng nêu, và pipeline nhận bàn giao nếu có. Không tự mở rộng ra ngoài phạm vi được giao.

Nếu thiếu nhóm tuổi, mặc định chọn theo hướng an toàn cho trẻ mầm non đến tiểu học: màu sáng, hình khối thân thiện, ít cảm giác thi đấu chuyên nghiệp, dễ đọc tên lớp/nhóm/trường.

## Quy trình

1. Đọc `AGENTS.md` gốc và profile domain nguồn/đích khi có.
2. Rà mọi sản phẩm trong phạm vi. Ghi source ID ổn định, tên, URL sản phẩm, URL ảnh chính, trang xuất hiện, nhóm tuổi/ngữ cảnh phù hợp và đặc điểm thị giác.
3. Tải ảnh chính rõ nét để đánh giá trực quan. Với catalog lớn, tạo contact sheet theo trang để phát hiện mẫu gần trùng. Không đánh giá chỉ từ tên.
4. Đọc và áp dụng [hợp đồng tuyển chọn](references/selection-contract.md).
5. Chấm từng mẫu trên thang 100, loại các trường hợp vi phạm điều kiện trực tiếp, rồi áp dụng cổng đa dạng.
6. Xếp hạng theo điểm. Với các mẫu gần trùng, giữ mẫu thân thiện với trẻ em hơn, có vùng đặt tên/nhóm rõ hơn, ảnh nguồn tốt hơn và ít nhận diện nguồn cần xử lý hơn.
7. Nếu không có số lượng được chỉ định, chỉ giữ các mẫu thật sự vượt ngưỡng và khác biệt; không lấp đầy danh sách bằng biến thể đổi màu.
8. Chia theo lô ưu tiên giảm dần nhưng mỗi lô 5 cần cân bằng màu, độ sáng và cấu trúc thị giác.
9. Luôn lưu ảnh nguồn của mẫu được chọn vào thư mục `selected-source-images/` trong thư mục chạy của skill. Có thể xóa ảnh không chọn khi người dùng yêu cầu; nếu không, giữ chúng trong thư mục tạm/rà soát riêng.

## Phạm vi hành động

Mặc định chỉ rà, chọn và bàn giao. Không tạo ảnh, sửa CMS hoặc xuất bản.

Nếu yêu cầu ban đầu bao gồm chuyển đổi tiếp, hoàn thành và lưu danh sách tuyển chọn trước; sau đó giao từng lô cho skill tạo ảnh mà người dùng chỉ định. Khi đích là sản phẩm Mayaodongphuc cho trẻ em mà chưa có skill tạo ảnh chuyên biệt, bàn giao JSON/Markdown rõ ràng để người dùng hoặc pipeline tiếp theo sử dụng; không tự chuyển sang skill học sinh nếu brief là trẻ em ngoài bối cảnh trường/lớp.

## Bàn giao bắt buộc

Lưu báo cáo Markdown. Khi có pipeline tiếp theo hoặc người dùng yêu cầu dữ liệu máy đọc, tạo thêm JSON theo hợp đồng. Báo cáo phải nêu tổng đã rà/chọn/loại, bảng điểm của mẫu chọn, nhóm gần trùng bị loại, lô thực thi, URL sản phẩm/ảnh, ảnh nguồn đã lưu, lỗi ảnh hoặc thiếu bằng chứng, và việc chỉ bàn giao hay đã thực thi bước tiếp theo.
