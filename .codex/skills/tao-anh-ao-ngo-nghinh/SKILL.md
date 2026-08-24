---
name: tao-anh-ao-ngo-nghinh
description: "Tạo một hoặc nhiều mẫu áo đồng phục ngộ nghĩnh theo cặp: artwork in có chữ trên nền trắng đặt tên theo SKU X24-DP-HHSSMM và ảnh áo marketing có mã mẫu, dấu Mayaodongphuc, hotline, website, dùng đúng artwork đó. Dùng cho áo lớp, CLB, nhóm bạn, đồng phục dã ngoại hoặc catalog số lượng lớn đến hàng nghìn concept; không dùng cho áo thể thao cần giữ nguyên thiết kế nguồn phức tạp."
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

- `sku`, `productSlug`, slogan chính và tên lớp/đơn vị/nhóm;
- họ chủ thể, phong cách minh họa, bố cục, palette và màu áo;
- exact text có dấu;
- `uniquenessSignature = subject|style|layout|slogan|identity|palette|shirtColor`.

Không dùng nhân vật, logo, huy hiệu hoặc tài sản có bản quyền/thương hiệu. Mặc định động vật không vượt quá 25% batch; phân bổ thêm emoji, hoạt hình người, đồ vật có tính cách, đồ ăn, môn học, thể thao, thiên nhiên và fantasy/sci-fi.

### Khóa SKU và copy sản phẩm

- SKU có dạng exact `X24-DP-HHSSMM`, trong đó `HH` là giờ, `SS` là giây và `MM` là phút theo múi giờ `Asia/Ho_Chi_Minh`. Không đổi thứ tự thành `HHMMSS`.
- Cấp và giữ chỗ SKU bằng `python3 scripts/allocate_sku.py --registry=/absolute/path/to/batch-registry.jsonl --root=/absolute/path/to/generated/tao-anh-ao-ngo-nghinh`. Script kiểm tra trùng trong registry và tên file đã xuất; nếu candidate đã tồn tại, nó tiến giây cho tới mã chưa dùng.
- Cùng một SKU phải được dùng nguyên vẹn ở tên file thiết kế, tên file marketing, ảnh marketing, tiêu đề và mô tả sản phẩm; không cấp lại SKU ở bước publish.
- Tiêu đề sản phẩm dùng cấu trúc tự nhiên `<tên mẫu> - mã <SKU>` hoặc `<tên mẫu> mã <SKU>`; không nhồi thêm từ khóa chỉ để kéo dài tiêu đề.
- Mô tả ngắn phải có câu `Mã mẫu: <SKU>.` ở phần đầu, rồi mới mô tả màu áo, slogan, đối tượng và khả năng tùy chỉnh dựa trên dữ kiện đã khóa.
- Workflow vẫn là `images-only`: chỉ trả sẵn `productTitle` và `productDescription` trong báo cáo/handoff. Chỉ đăng CMS khi người dùng yêu cầu riêng; khi đó publisher phải giữ nguyên SKU, title và description này.

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
2. Dùng thêm logo campaign thật tại `../tao-anh-dong-phuc-tre-em/assets/mayaodongphuc-logo.png`; gọi `imagegen` với `referenced_image_paths` gồm đúng `print-master` và logo này.
3. Yêu cầu áp nguyên artwork lên một áo phông cổ tròn nền một màu, đồng thời bố trí dấu thương hiệu và contact ở khoảng trống ngoài áo.

Invariants bắt buộc:

- giữ nguyên nhân vật, text, dấu, palette và bố cục;
- không thêm, bớt, viết lại hoặc thay slogan;
- nền trắng của file nguồn không trở thành hình chữ nhật in trên áo;
- hình in bám phối cảnh, nếp vải, texture và ánh sáng như mực in thật;
- ảnh marketing vuông, áo nhìn trọn vẹn, artwork đọc rõ, đạo cụ chỉ ở rìa;
- logo Mayaodongphuc xuất hiện đúng một lần như dấu campaign ngoài áo, không in lên áo và không tự vẽ lại logo;
- contact phải ghi đúng nguyên văn `0982 254 458` và `mayaodongphuc.com.vn`;
- mã mẫu phải ghi đúng nguyên văn `MÃ MẪU: <SKU>` trong cùng cụm thông tin thương mại;
- logo/contact/SKU nằm trong chip, corner panel, micro footer hoặc partial rail gọn, tổng vùng branding không quá 12% diện tích ảnh và không che áo hay artwork;
- luân phiên vị trí và treatment giữa các sản phẩm; không dùng một thanh footer toàn chiều ngang làm template mặc định cho cả batch;
- ngoài logo và contact bắt buộc, không thêm watermark, nhãn giả, slogan quảng cáo hoặc copy marketing khác nếu người dùng chưa yêu cầu.

Nếu artwork bị drift, sửa bằng một correction pass sử dụng lại cùng reference; không generate một thiết kế mới rồi coi là cùng sản phẩm. Nếu logo, số điện thoại hoặc website sai, sửa riêng vùng branding hoặc composite lại bằng logo asset thật và font rõ; giữ nguyên áo cùng artwork đã duyệt.

## Xuất file

Xuất dưới:

```text
generated/tao-anh-ao-ngo-nghinh/<batch-id>/<product-slug>/
  <SKU>.png
  <SKU>-marketing.webp
```

- `<SKU>.png`: print-master nền trắng, 4500×4500 px, 300 DPI. Tên file phải là đúng SKU để có thể tìm trực tiếp trên máy. Ưu tiên nguồn native lớn nhất; nếu phải upscale raster thì dùng Lanczos và báo rõ đây không phải vector.
- `<SKU>-marketing.webp`: ảnh marketing vuông tối thiểu 1200×1200 px, WebP quality 100.
- Mỗi sản phẩm chỉ có hai ảnh xuất bản. Contact sheet và metadata của batch không tính là ảnh sản phẩm.

Chạy validator sau khi xuất:

```bash
python3 scripts/validate_product_pair.py /absolute/path/to/product-folder
```

Kiểm tra trực quan cả hai ảnh cuối ở full-size. Báo SKU, `productTitle`, `productDescription`, đường dẫn từng cặp, kích thước, trạng thái kiểm tra chữ, logo/contact/mã mẫu và xác nhận marketing được tạo từ artwork tham chiếu.

## Quy mô lớn

- Mỗi asset riêng biệt dùng một lần gọi `imagegen`; không dùng một ảnh lưới thay cho nhiều deliverable.
- Duy trì `batch-plan.json` và `batch-registry.jsonl` để không lặp `uniquenessSignature`, slogan hoặc palette quá dày.
- Trong cùng 20 sản phẩm liên tiếp, hai concept kề nhau phải khác ít nhất ba trục sáng tạo.
- Sau mỗi đợt, kiểm tra: SKU không trùng, file đúng tên SKU, lỗi chữ, trùng concept, tỷ lệ chủ thể, màu áo, độ trung thành giữa master và marketing, logo đúng asset, mã mẫu/hotline/website đúng tuyệt đối, rồi mới tiếp tục.
- Khi người dùng yêu cầu hàng trăm hoặc hàng nghìn mẫu, ưu tiên tính nhất quán của pipeline hơn tốc độ tạo một mạch.
