---
name: tao-anh-ao-ngo-nghinh
description: "Tạo một hoặc nhiều mẫu áo đồng phục ngộ nghĩnh theo cặp: artwork in có chữ trên nền trắng đặt tên theo SKU X24-DP-HHSSMM và ảnh chụp áo thành phẩm chân thực có mã mẫu, dấu Mayaodongphuc, hotline, website, dùng đúng artwork đó. Dùng cho áo lớp, CLB, nhóm bạn, đồng phục dã ngoại hoặc catalog số lượng lớn đến hàng nghìn concept; không dùng cho áo thể thao cần giữ nguyên thiết kế nguồn phức tạp."
---

# Tạo ảnh áo ngộ nghĩnh

Tạo hai ảnh gốc và một derivative website cho mỗi sản phẩm:

1. `print-master`: artwork và text tách biệt trên nền trắng, sẵn sàng tái sử dụng để in.
2. `marketing`: áo thành phẩm dùng chính `print-master`, không tự diễn giải lại thiết kế.
3. `print-preview`: bản WebP 500×500 crop/resize từ master để làm ảnh gallery website.

Đây là workflow `images-only` mặc định. Luôn chuẩn bị handoff cho `create-tenant-product`, nhưng không đăng CMS, không tạo sản phẩm và không triển khai website trừ khi người dùng yêu cầu rõ ở một bước riêng.

## Trước khi tạo

- Xác định số sản phẩm, đối tượng sử dụng và text người dùng đã cung cấp.
- Nếu chưa có text, tự chọn slogan và tên lớp/CLB/nhóm dạng generic; không bịa tên trường hoặc đơn vị có thật.
- Với hơn 10 sản phẩm, đọc [references/creative-system.md](references/creative-system.md), lập `batch-plan.json`, rồi tạo theo đợt 10-25 sản phẩm. Không tạo hàng trăm mẫu mà không có checkpoint kiểm tra.
- Đọc [references/output-contract.md](references/output-contract.md) trước khi xuất file hoặc khi cần quyết định kích thước, định dạng và tên file.
- Đọc [references/product-handoff.md](references/product-handoff.md) trước khi tạo preview website hoặc handoff sang `create-tenant-product`.

## Khóa concept

Mỗi sản phẩm phải khóa trước:

- `sku`, `productSlug`, slogan chính và tên lớp/đơn vị/nhóm;
- `categorySlugs` theo đúng slug danh mục của website Mayaodongphuc; một sản phẩm thuộc nhiều danh mục thì giữ đủ các slug;
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
2. Gọi `imagegen` với `print-master` làm reference để tạo **ảnh chụp sản phẩm áo thật**, chưa cần nhờ model viết SKU/contact. Use case phải là `product-mockup`; prompt phải nói rõ `photorealistic ecommerce product photography`, không dùng từ `illustration`, `vector shirt` hoặc `T-shirt template` cho bản thân chiếc áo.
3. Kiểm tra riêng ảnh áo nền bằng `view_image`. Chỉ khi áo vượt visual gate bên dưới mới dùng logo campaign thật tại `../tao-anh-dong-phuc-tre-em/assets/mayaodongphuc-logo.png` và composite deterministic logo, SKU, hotline, website vào khoảng trống ngoài áo. Ưu tiên ImageMagick hoặc công cụ raster tương đương để contact đúng tuyệt đối; không giao cho imagegen tự vẽ lại logo hoặc tự đánh máy contact.

Prompt ảnh áo phải khóa các dấu hiệu vật lý: áo phông thật đặt flat-lay hoặc chụp studio, vải dệt nhìn thấy được, cổ bo rib-knit có đường may, đường vai và lai tay rõ, thân áo có mép thật, nếp nhăn và bóng đổ tự nhiên. Áo phải nhìn như sản phẩm có thể cầm lên, không phải hình chiếc áo được vẽ.

### Visual gate bắt buộc cho ảnh marketing

Hard reject và tạo lại ảnh áo nền nếu có một trong các dấu hiệu sau:

- canvas dọc/ngang thay vì vuông;
- áo là silhouette phẳng, paper-cut, vector, 3D icon, poster hoặc template 2D;
- lỗ cổ là một hình elip trắng rỗng, không có bo cổ/vải/đường may chân thực;
- thiếu texture vải, đường vai, lai tay, nếp gấp hoặc bóng tiếp xúc;
- artwork nổi như sticker/cardboard, đổ bóng riêng hoặc tràn ra ngoài bề mặt thân áo;
- artwork rộng quá 48% thân áo, chạm cổ, nách, đường may hoặc lai áo;
- bố cục thành poster quảng cáo, contact footer lớn hoặc branding che áo.

Không được chữa một áo 2D bằng cách thêm texture, noise hay shadow giả. Phải regenerate ảnh áo nền từ `print-master` với prompt `photorealistic product photography`, rồi kiểm tra lại.

Invariants bắt buộc:

- giữ nguyên nhân vật, text, dấu, palette và bố cục;
- không thêm, bớt, viết lại hoặc thay slogan;
- nền trắng của file nguồn không trở thành hình chữ nhật in trên áo;
- hình in bám phối cảnh, nếp vải, texture và ánh sáng như mực in thật;
- ảnh marketing vuông 1:1, áo thật nhìn trọn vẹn cả thân và hai tay, artwork đọc rõ, đạo cụ chỉ ở rìa;
- logo Mayaodongphuc xuất hiện đúng một lần như dấu campaign ngoài áo, không in lên áo và không tự vẽ lại logo;
- contact phải ghi đúng nguyên văn `0982 254 458` và `mayaodongphuc.com.vn`;
- mã mẫu phải ghi đúng nguyên văn `MÃ MẪU: <SKU>` trong cùng cụm thông tin thương mại;
- logo/contact/SKU nằm trong chip, corner panel, micro footer hoặc partial rail gọn, tổng vùng branding không quá 12% diện tích ảnh và không che áo hay artwork;
- luân phiên vị trí và treatment giữa các sản phẩm; không dùng một thanh footer toàn chiều ngang làm template mặc định cho cả batch;
- ngoài logo và contact bắt buộc, không thêm watermark, nhãn giả, slogan quảng cáo hoặc copy marketing khác nếu người dùng chưa yêu cầu.

Nếu artwork bị drift, sửa bằng một correction pass sử dụng lại cùng reference; không generate một thiết kế mới rồi coi là cùng sản phẩm. Nếu logo, số điện thoại hoặc website sai, sửa riêng vùng branding hoặc composite lại bằng logo asset thật và font rõ; giữ nguyên áo cùng artwork đã duyệt.

Sau composite, dùng `view_image` kiểm tra file marketing cuối ở full-size và tự trả lời đủ 5 câu: `vuông 1:1?`, `áo là ảnh chụp thật?`, `thấy cấu trúc vải/cổ/đường may?`, `artwork đúng master và nằm trong 35-48% thân áo?`, `logo/contact/SKU đúng và không che áo?`. Chỉ xuất bản khi cả 5 câu đều là `có`.

## Xuất file

Xuất dưới:

```text
generated/tao-anh-ao-ngo-nghinh/<batch-id>/<product-slug>/
  <SKU>.png
  <SKU>-marketing.webp
  <SKU>-print-preview.webp
  product-handoff.json
```

- `<SKU>.png`: print-master nền trắng, 4500×4500 px, 300 DPI. Tên file phải là đúng SKU để có thể tìm trực tiếp trên máy. Ưu tiên nguồn native lớn nhất; nếu phải upscale raster thì dùng Lanczos và báo rõ đây không phải vector.
- `<SKU>-marketing.webp`: ảnh marketing vuông tối thiểu 1200×1200 px, WebP quality 100.
- `<SKU>-print-preview.webp`: bản xem trước website được crop/resize deterministic từ print master, đúng 500×500 px, WebP quality 100. Không dùng imagegen để tạo lại preview.
- `product-handoff.json`: manifest checksum cho `create-tenant-product`; gallery order là marketing trước, print preview sau.
- Hai ảnh được phép upload website là marketing và print preview. Print master PNG 4500px không được upload CMS. Contact sheet và metadata batch không tính là ảnh sản phẩm.

Tạo preview sau khi print master vượt validator:

```bash
python3 scripts/create_print_preview.py /absolute/path/to/<SKU>.png
```

### Lưu kho print master theo danh mục website

Sau khi cặp ảnh vượt validator và visual gate, copy thêm **chỉ print master** vào ổ dữ liệu:

```text
/Volumes/Data/x24_project/mayaodongphuc.vn/<category-slug>/<SKU>.png
```

- Folder danh mục dùng exact slug của website, ví dụ `dong-phuc-ngo-nghinh`, `dong-phuc-truong-hoc`, `dong-phuc-da-ngoai-team-building`; không dùng tên hiển thị có dấu và không tự tạo slug khác.
- Nếu sản phẩm thuộc nhiều danh mục, lưu cùng file `<SKU>.png` vào từng folder danh mục tương ứng.
- Tên file kho chỉ được là `<SKU>.png`; không thêm tên concept, hậu tố, ngày hoặc `print-master`.
- Đây là bản sao lưu của deliverable master, không phải ảnh sản phẩm thứ ba và không thay đổi thư mục output trong workspace.
- Dùng script idempotent, script sẽ từ chối ghi đè nếu cùng SKU nhưng bytes khác:

```bash
python3 scripts/archive_print_master.py \
  /absolute/path/to/<SKU>.png \
  --category dong-phuc-ngo-nghinh \
  --category dong-phuc-truong-hoc
```

- Trước khi copy, xác nhận `/Volumes/Data` đang được mount và đích ghi được. Nếu volume không mount, không tạo giả đường dẫn `/Volumes/Data`; giữ bản workspace và báo rõ bước lưu kho chưa hoàn tất.

Chạy validator sau khi xuất:

```bash
python3 scripts/validate_product_pair.py /absolute/path/to/product-folder
```

Validator trả lỗi thì không được báo hoàn tất, không đăng CMS, không copy vào kho dữ liệu và không dùng ảnh đó làm đầu vào publish. Validator chỉ kiểm tra được cấu trúc file; visual gate ảnh áo thật vẫn phải được kiểm tra bằng `view_image`.

## Handoff sang create-tenant-product

- Tạo `product-handoff.json` theo [references/product-handoff.md](references/product-handoff.md), dùng đường dẫn tuyệt đối và SHA-256 của bytes cuối.
- `acceptedImages` phải có đúng hai ảnh theo thứ tự: `<SKU>-marketing.webp` role `product hero`, rồi `<SKU>-print-preview.webp` role `print artwork preview`.
- Print master chỉ xuất hiện trong `sourceAssets.printMaster`; không được liệt kê trong `acceptedImages`.
- `publishingIntent.action` mặc định là `images-only`. Chỉ đổi thành `publish` hoặc `draft` khi người dùng yêu cầu đăng hoặc tạo nháp.
- Giữ nguyên SKU `X24-DP-HHSSMM` đã cấp trong `productIdentity.sku`, `sourceId`, title và description; publisher không cấp SKU mới.
- Chạy validator handoff và truyền đúng cả hai publishing images:

```bash
python3 scripts/validate_product_handoff.py \
  --manifest /absolute/path/to/product-handoff.json \
  --image /absolute/path/to/<SKU>-marketing.webp \
  --image /absolute/path/to/<SKU>-print-preview.webp \
  --require-publishing-set
```

- Nếu người dùng yêu cầu đăng, invoke `create-tenant-product` bằng manifest đã validate. Publisher phải upload hai WebP, giữ marketing làm hero, dùng preview 500px làm ảnh gallery/contextual và không upload master PNG.

Kiểm tra trực quan master, marketing và preview. Báo SKU, `productTitle`, `productDescription`, đường dẫn ba ảnh, manifest handoff, đường dẫn kho print master theo từng danh mục, kích thước, trạng thái kiểm tra chữ, logo/contact/mã mẫu, kết quả 5 câu visual gate và xác nhận marketing được tạo từ artwork tham chiếu.

## Quy mô lớn

- Mỗi asset riêng biệt dùng một lần gọi `imagegen`; không dùng một ảnh lưới thay cho nhiều deliverable.
- Duy trì `batch-plan.json` và `batch-registry.jsonl` để không lặp `uniquenessSignature`, slogan hoặc palette quá dày.
- Trong cùng 20 sản phẩm liên tiếp, hai concept kề nhau phải khác ít nhất ba trục sáng tạo.
- Sau mỗi đợt, kiểm tra: SKU không trùng, file đúng tên SKU, lỗi chữ, trùng concept, tỷ lệ chủ thể, màu áo, độ trung thành giữa master và marketing, logo đúng asset, mã mẫu/hotline/website đúng tuyệt đối, rồi mới tiếp tục.
- Khi người dùng yêu cầu hàng trăm hoặc hàng nghìn mẫu, ưu tiên tính nhất quán của pipeline hơn tốc độ tạo một mạch.
