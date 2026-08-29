# Chuyển ảnh nguồn thành bộ master

Đọc khi người dùng cung cấp poster, ảnh áo thật, mockup, sketch, trang sản phẩm hoặc bộ ảnh nguồn và muốn chuyển thành mẫu có thể tiếp tục sản xuất.

## Nguyên tắc

Ảnh nguồn chỉ là bằng chứng thị giác. Không tạo mockup bán hàng trực tiếp từ nó. Chuỗi bắt buộc:

```text
source analysis -> front flat master -> back flat master -> mockup -> sales image
```

Nếu người dùng muốn tái tạo chính xác logo, huy hiệu, sponsor, nhân vật hoặc artwork bên thứ ba, cần xác nhận họ có quyền sử dụng. Mặc định loại bỏ:

- watermark, hotline, website, social handle và logo shop nguồn;
- logo nhà sản xuất, nhãn cổ, dấu tam giác/V hoặc maker mark;
- tên/số cầu thủ và copy quảng cáo;
- crest, sponsor và tài sản đội bóng khi chưa được phép giữ.

Không chỉnh sửa để xóa watermark trên file nguồn. Chỉ loại watermark khỏi artwork mới được tái tạo.

## Phân tích nguồn

Tạo `source-analysis.json` trước khi sinh master:

- đường dẫn/URL nguồn và checksum nếu có file;
- mặt nào nhìn thấy: front, back, sleeves, shorts;
- palette, motif, collar, seam/panel và các vùng bị che;
- assets được phép giữ và marks bắt buộc loại;
- mức chắc chắn của từng side: `observed`, `partially-observed`, `inferred`;
- điểm không thể phục hồi chính xác từ nguồn.

Text trên poster chỉ là reference. Không sao chép tiêu đề, giá, hotline, website hoặc bố cục seller.

## Dựng front master

Dùng `imagegen` chế độ `precise-object-edit`, gắn ảnh nguồn là design reference:

- tái tạo đồ họa in thành canvas phẳng full-bleed;
- giữ palette, tỷ lệ motif và vị trí tương đối có thể quan sát;
- bỏ áo, model, cổ/tay, nếp vải, ánh sáng, bóng, phối cảnh, text và logo không được phép;
- tái dựng vùng bị che theo logic pattern, ghi rõ là inferred;
- không đưa texture vải vào master.

Hard reject nếu output còn silhouette áo, đường may, người, text, watermark hoặc ánh sáng mockup.

## Dựng back master

- Nếu back quan sát rõ: tái tạo như front và giữ đúng quan hệ cạnh.
- Nếu back chỉ quan sát một phần: giữ phần có bằng chứng, suy luận phần còn lại tối thiểu và ghi `partially-observed`.
- Nếu không có back: tạo một back nguyên bản cùng hệ với front, giữ vùng tên/số sạch và ghi `inferred`; không tuyên bố đây là bản sao chính xác của nguồn.
- Không mirror front để giả back.

Sau khi hai side đạt visual gate, tiếp tục contract master, mockup và ảnh chào hàng của skill chính.

## Chất lượng và dừng retry

Cho phép một bản đầu và tối đa hai correction pass có mục tiêu cho mỗi side. Dừng nếu nguồn quá nhỏ, bị che quá nhiều hoặc correction làm drift. Báo rõ phần nào cần file gốc/vector/ảnh chụp bổ sung thay vì bịa độ chính xác.
