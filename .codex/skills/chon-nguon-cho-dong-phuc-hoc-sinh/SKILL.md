---
name: chon-nguon-cho-dong-phuc-hoc-sinh
description: Rà soát catalog hoặc các trang sản phẩm áo thể thao, chấm điểm và chọn những mẫu nguồn phù hợp để chuyển thành áo lớp, đồng phục học sinh hoặc CLB trường học. Dùng khi người dùng yêu cầu lọc mẫu nguồn, lập danh sách chuyển đổi hoặc chia lô cho pipeline tạo ảnh; không dùng cho bước tạo ảnh đơn lẻ khi sản phẩm nguồn đã được chỉ định sẵn.
---

# Chọn nguồn cho đồng phục học sinh

Chọn một tập mẫu nguồn đa dạng, có khả năng chuyển đổi tốt và có bằng chứng truy xuất rõ ràng. Không chọn chỉ vì mẫu trông đẹp trong catalog thể thao.

## Đầu vào

Xác định từ yêu cầu và ngữ cảnh dự án:

- URL hoặc website nguồn;
- phạm vi trang, danh mục hoặc danh sách sản phẩm;
- số lượng cần chọn, nếu có;
- kích thước lô, mặc định 5;
- skill hoặc tenant nhận bàn giao, nếu người dùng yêu cầu tiếp tục chuyển đổi.

Nếu thiếu số lượng cần chọn, rà toàn bộ phạm vi rồi giữ mọi mẫu đạt ngưỡng nhưng áp dụng cổng đa dạng và loại trùng. Không tự mở rộng ra ngoài phạm vi URL/trang người dùng giao.

## Quy trình

1. Đọc `AGENTS.md` của dự án và profile domain nguồn/đích khi có.
2. Rà toàn bộ sản phẩm trong phạm vi. Ghi lại source ID ổn định, tên, URL sản phẩm, URL ảnh chính, trang xuất hiện và đặc điểm thị giác.
3. Tải hoặc mở ảnh chính đủ lớn để đánh giá; không chấm chỉ từ tên sản phẩm. Với catalog lớn, nên tạo contact sheet theo trang để so sánh toàn cục và phát hiện mẫu gần trùng.
4. Đọc và áp dụng đầy đủ [hợp đồng tuyển chọn](references/selection-contract.md).
5. Chấm từng mẫu trên thang 100, loại các trường hợp vi phạm điều kiện loại trực tiếp, rồi áp dụng cổng đa dạng cho toàn bộ danh sách.
6. Xếp hạng theo điểm. Khi hai mẫu gần trùng, chỉ giữ mẫu phù hợp đồng phục học sinh hơn; không dùng số lượng yêu cầu làm lý do hạ chuẩn.
7. Chia các mẫu được chọn thành lô theo kích thước người dùng yêu cầu, mặc định 5. Giữ thứ tự ưu tiên giảm dần nhưng cân bằng màu và kiểu họa tiết trong từng lô.
8. Lưu báo cáo tuyển chọn và bàn giao có thể kiểm tra lại. Phân biệt rõ mẫu được chọn, mẫu bị loại và lý do.

## Cổng quyết định

- Chỉ chọn mẫu đạt ít nhất 70/100.
- Loại ngay mẫu có ảnh nguồn hỏng hoặc không đủ rõ để xác minh màu, form và họa tiết.
- Loại mẫu quá đặc thù thi đấu, quá dày nhận diện đội/nhãn thật, hoặc không còn vùng hợp lý cho mã lớp và slogan.
- Không chọn nhiều biến thể gần trùng chỉ để đủ số lượng.
- Bộ cuối phải có độ phủ hợp lý về độ sáng, bảng màu và ngôn ngữ họa tiết; một mẫu điểm cao vẫn có thể bị loại nếu nó lặp lại gần như nguyên vẹn một mẫu tốt hơn.

## Phạm vi hành động

Mặc định skill này chỉ rà, chọn và bàn giao; không tạo ảnh, sửa CMS hoặc xuất bản.

Nếu yêu cầu ban đầu nói rõ phải tự động chuyển đổi sau khi chọn:

1. Hoàn thành và lưu danh sách tuyển chọn trước.
2. Giao từng lô cho skill tạo ảnh mà người dùng chỉ định. Trong dự án này, dùng `tao-anh-dong-phuc-lop-truong-hoc` khi đích là sản phẩm Mayaodongphuc dành cho lớp/trường học.
3. Chỉ dùng `create-tenant-product` để xuất bản khi yêu cầu đã bao gồm xuất bản hoặc skill tạo ảnh đặt `publishingIntent.action` tương ứng.
4. Không để một lỗi ảnh đơn lẻ làm im lặng bỏ qua sản phẩm: ghi lỗi, thử lại trong giới hạn an toàn, hoặc báo rõ sản phẩm không đạt cổng.

## Bàn giao bắt buộc

Tạo một báo cáo Markdown và, khi có pipeline tiếp theo, một JSON có cấu trúc theo [hợp đồng tuyển chọn](references/selection-contract.md). Báo cáo cuối phải nêu:

- tổng số sản phẩm đã rà;
- số được chọn và số bị loại;
- bảng điểm và lý do ngắn cho từng mẫu được chọn;
- các nhóm trùng đã loại;
- danh sách lô theo thứ tự thực thi;
- nguồn ảnh và URL sản phẩm;
- mẫu nào bị chặn vì ảnh lỗi hoặc thiếu bằng chứng;
- bước tiếp theo đã thực thi hay chỉ bàn giao.

Không mô tả sản phẩm bị loại như đã được đánh giá đầy đủ nếu ảnh nguồn không tải được.
