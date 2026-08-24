---
name: tao-anh-ao-ngo-nghinh
description: "Tạo một hoặc nhiều mẫu áo đồng phục ngộ nghĩnh theo cặp: artwork in có chữ trên nền trắng chất lượng cao và ảnh áo thành phẩm marketing dùng đúng artwork đó. Dùng cho áo lớp, CLB, nhóm bạn, đồng phục dã ngoại hoặc catalog số lượng lớn đến hàng nghìn concept; không dùng cho áo thể thao cần giữ nguyên thiết kế nguồn phức tạp."
---

# Tạo ảnh áo ngộ nghĩnh

Tạo đúng hai ảnh cuối cho mỗi sản phẩm:

1. `print-master`: artwork và text tách biệt trên nền trắng, sẵn sàng tái sử dụng để in.
2. `marketing`: áo thành phẩm dùng chính `print-master`, không tự diễn giải lại thiết kế.

Đây là workflow `images-only`. Không đăng CMS, không tạo sản phẩm và không triển khai website trừ khi người dùng yêu cầu rõ ở một bước riêng.

## Trước khi tạo

- Xác định số sản phẩm, đối tượng sử dụng và text người dùng đã cung cấp.
- Nếu chưa có text, tự chọn slogan và tên lớp/CLB/nhóm dạng generic; không bịa tên trường hoặc đơn vị có thật.
- Với hơn 10 sản phẩm, đọc [references/creative-system.md](references/creative-system.md), lập `batch-plan.json`, rồi tạo theo đợt 10-25 sản phẩm. Không tạo hàng trăm mẫu mà không có checkpoint kiểm tra.
- Đọc [references/output-contract.md](references/output-contract.md) trước khi xuất file hoặc khi cần quyết định kích thước, định dạng và tên file.

## Khóa concept

Mỗi sản phẩm phải khóa trước:

- `productSlug`, slogan chính và tên lớp/đơn vị/nhóm;
- họ chủ thể, phong cách minh họa, bố cục, palette và màu áo;
- exact text có dấu;
- `uniquenessSignature = subject|style|layout|slogan|identity|palette|shirtColor`.

Không dùng nhân vật, logo, huy hiệu hoặc tài sản có bản quyền/thương hiệu. Mặc định động vật không vượt quá 25% batch; phân bổ thêm emoji, hoạt hình người, đồ vật có tính cách, đồ ăn, môn học, thể thao, thiên nhiên và fantasy/sci-fi.

## Tạo ảnh 1: print-master

Dùng `imagegen` tích hợp và tạo mới một ảnh vuông:

- artwork nguyên bản, bố cục gọn, nền trắng thuần `#FFFFFF`;
- không có áo, người mẫu thật, đạo cụ ngoài artwork, watermark hoặc logo;
- slogan và identity là một phần của artwork;
- prompt phải ghi exact text verbatim và yêu cầu đúng dấu tiếng Việt;
- phong cách screen-print/vector-like raster, cạnh sạch, palette có chủ đích;
- chừa lề trắng và giữ toàn bộ artwork trong khung.

Kiểm tra ảnh full-size. Sai một ký tự, dấu, tay, mặt hoặc chi tiết quan trọng thì correction pass có mục tiêu; không chấp nhận lỗi chữ vì ảnh còn lại đẹp.

## Tạo ảnh 2: marketing

Sau khi duyệt `print-master`:

1. Dùng `view_image` để đưa file artwork vào ngữ cảnh.
2. Gọi `imagegen` với `referenced_image_paths` trỏ tới đúng `print-master`.
3. Yêu cầu áp nguyên artwork lên một áo phông cổ tròn nền một màu.

Invariants bắt buộc:

- giữ nguyên nhân vật, text, dấu, palette và bố cục;
- không thêm, bớt, viết lại hoặc thay slogan;
- nền trắng của file nguồn không trở thành hình chữ nhật in trên áo;
- hình in bám phối cảnh, nếp vải, texture và ánh sáng như mực in thật;
- ảnh marketing vuông, áo nhìn trọn vẹn, artwork đọc rõ, đạo cụ chỉ ở rìa;
- không logo, watermark, nhãn giả hoặc copy marketing ngoài áo nếu người dùng chưa yêu cầu.

Nếu artwork bị drift, sửa bằng một correction pass sử dụng lại cùng reference; không generate một thiết kế mới rồi coi là cùng sản phẩm.

## Xuất file

Xuất dưới:

```text
generated/tao-anh-ao-ngo-nghinh/<batch-id>/<product-slug>/
  <product-slug>-print-master.png
  <product-slug>-marketing.webp
```

- `print-master.png`: nền trắng, 4500×4500 px, 300 DPI. Ưu tiên nguồn native lớn nhất; nếu phải upscale raster thì dùng Lanczos và báo rõ đây không phải vector.
- `marketing.webp`: vuông tối thiểu 1200×1200 px, WebP quality 100.
- Mỗi sản phẩm chỉ có hai ảnh xuất bản. Contact sheet và metadata của batch không tính là ảnh sản phẩm.

Chạy validator sau khi xuất:

```bash
python3 scripts/validate_product_pair.py /absolute/path/to/product-folder
```

Kiểm tra trực quan cả hai ảnh cuối ở full-size. Báo đường dẫn từng cặp, kích thước, trạng thái kiểm tra chữ và xác nhận marketing được tạo từ artwork tham chiếu.

## Quy mô lớn

- Mỗi asset riêng biệt dùng một lần gọi `imagegen`; không dùng một ảnh lưới thay cho nhiều deliverable.
- Duy trì `batch-plan.json` và `batch-registry.jsonl` để không lặp `uniquenessSignature`, slogan hoặc palette quá dày.
- Trong cùng 20 sản phẩm liên tiếp, hai concept kề nhau phải khác ít nhất ba trục sáng tạo.
- Sau mỗi đợt, kiểm tra: lỗi chữ, trùng concept, tỷ lệ chủ thể, màu áo, độ trung thành giữa master và marketing, rồi mới tiếp tục.
- Khi người dùng yêu cầu hàng trăm hoặc hàng nghìn mẫu, ưu tiên tính nhất quán của pipeline hơn tốc độ tạo một mạch.
