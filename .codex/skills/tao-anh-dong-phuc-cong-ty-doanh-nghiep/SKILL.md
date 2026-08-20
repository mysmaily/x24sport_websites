---
name: tao-anh-dong-phuc-cong-ty-doanh-nghiep
description: "Tạo bộ ảnh sản phẩm May Áo Đồng Phục cho đồng phục công ty, doanh nghiệp, nhà hàng và đội ngũ dịch vụ từ ảnh áo tham chiếu: main vuông, lifestyle sạch, catalog 5:4, product-handoff.json đã validate và mặc định đăng qua create-tenant-product. Dùng khi người dùng yêu cầu ảnh đồng phục công ty/doanh nghiệp hoặc mẫu áo nhân viên cho mayaodongphuc.com.vn."
---

# Tạo Ảnh Đồng Phục Công Ty - Doanh Nghiệp

Từ ảnh áo tham chiếu, tạo ba ảnh xuất bản mặc định: `main`, `image-2`, `catalog`, kèm `product-handoff.json` đã validate. Sau đó gọi `create-tenant-product` trong cùng task, trừ khi người dùng yêu cầu rõ chỉ tạo ảnh, preview hoặc không đăng. Skill cố định cho tenant `mayaodongphuc`, domain `mayaodongphuc.com.vn`, category `dong-phuc-doanh-nghiep`.

Đọc [output contract](references/approved-output-contract.md) trước khi tạo ảnh và [handoff contract](references/product-handoff.md) trước khi viết manifest. Xem áo nguồn và các benchmark trong `assets/` bằng `view_image`.

## Deliverable và publish

- Mặc định tạo đúng `main`, `image-2`, `catalog` và manifest; manifest chỉ liệt kê ảnh publish, không có ảnh trung gian.
- Yêu cầu riêng `main`, `ảnh 2`/lifestyle sạch, hoặc `catalog`/poster/ảnh nhúng bài viết chỉ trả role tương ứng.
- Default path được phép tạo ảnh, validate, idempotently tạo/cập nhật sản phẩm và publish; verify product URL HTTP 200.
- Dừng ở local khi người dùng nói `chỉ tạo ảnh`, `không đăng`, `preview`, `image only`, `local only`, hoặc chỉ yêu cầu một role. `draft` vẫn gọi publisher với action `draft`.
- Trạng thái thương mại mặc định: quote-only, không tự đặt giá, `isPurchasable=false`, `stockStatus=instock`, `VND`.
- Nếu CMS/REST chặn publish, giữ ảnh và manifest đã validate, nêu đúng blocker; không nói sản phẩm đã đăng.

## Khóa sản phẩm trước khi dựng ảnh

Ghi nhận silhouette, cổ áo, tay/bo tay, ranh giới màu, gradient, panel vai-hông, họa tiết, vị trí in, mặt trước/sau có đủ căn cứ, và tất cả logo/tên công ty/nhãn hiệu/event/chữ nguồn cần loại bỏ. Thiết kế áo phải đồng nhất giữa mọi người mẫu. Không làm áo thành trơn, đổi cổ, đảo gradient, thêm mark lạ, hay coi quần/váy là sản phẩm bán kèm.

### Chuẩn hóa áo sát nách

- Tank top, áo ba lỗ hoặc khoét nách sâu phải chuyển thành áo tay ngắn set-in nhất quán trên mọi scene.
- Giữ cổ áo và toàn bộ thiết kế thân; chỉ kéo màu/panel/họa tiết ở vai-thân sang tay mới tự nhiên.
- Ghi vào `sourceTransformations`; `garmentFacts.sleeves` mô tả output là `tay ngắn`.

### Gỡ branding nguồn, dùng dấu hiệu doanh nghiệp trung tính

- Xóa mọi logo, huy hiệu, tên doanh nghiệp thật, thương hiệu, event và chữ gốc trên áo; giữ color blocking, gradient, panel, texture và họa tiết phi thương hiệu.
- Nếu người dùng cung cấp tên/logo/slogan đã được phép dùng, đặt đúng nội dung đó ở vị trí phù hợp với đồng phục doanh nghiệp: logo nhỏ ngực trái hoặc ngực giữa; mặt lưng chỉ dùng khi nguồn/hướng dẫn cho phép.
- Nếu chưa có nội dung được phép, dùng `Đồng Phục X24` một lần ở ngực, khoảng 15–25% bề ngang thân áo, typography sans-serif gọn, mực tonal hoặc tương phản vừa đủ.
- Không dùng chữ kiểu sticker/comic, slogan áo lớp, lời hô hào thể thao, logo Mayaodongphuc trên áo, hoặc lặp cùng wordmark ở nhiều vị trí.
- Chữ/logo phải là in lụa hoặc mực sublimation tích hợp vào vải: bám phối cảnh, nếp vải, ánh sáng và độ cong ngực/lưng; không decal/layer phẳng.

## Dựng một visual art-directed tích hợp

Dùng image generation với ảnh áo nguồn và `assets/mayaodongphuc-logo.png`. Tạo photography, layout và campaign graphics trong một ảnh tích hợp, không tạo ảnh generic rồi dán sidebar lớn.

Prompt theo thứ tự: (1) role và tỷ lệ, (2) garment lock/normalization/gỡ branding/text áo, (3) cast Việt Nam trưởng thành, hoạt động và bối cảnh doanh nghiệp, (4) hierarchy graphic, (5) exact visible copy, (6) exclusions và fidelity. Correction pass chỉ để sửa typo, tay, logo hay chi tiết áo sai, đồng thời khóa phần còn lại.

## Hai scene khác nhau

- `Version A` là main, ưu tiên nhận diện áo thật nhanh.
- `Version B` là lifestyle sạch, dùng cho `image-2` và hero/supporting scene catalog.
- Version B phải khác A ít nhất ba tiêu chí: số người, formation, hành động, góc/khoảng cách camera, đứng-ngồi, hoặc không gian. Recrop không được tính.

## Ngữ cảnh doanh nghiệp

Cast là người Việt Nam trưởng thành, khoảng 22–45 tuổi, đa dạng giới tính vừa đủ theo ngành. Hình ảnh cần chuyên nghiệp, thân thiện, có tinh thần đội ngũ và đúng hoạt động làm việc; không diễn thành áo lớp, team-building dã ngoại, fashion editorial hay buổi họp bàn căng thẳng.

Chọn bối cảnh theo áo và thị trường người dùng mô tả: văn phòng/tiếp tân, showroom, quán cà phê/nhà hàng, khách sạn, cửa hàng bán lẻ, spa/salon, phòng khám/dịch vụ, kho giao nhận sạch, xưởng nhẹ, sự kiện thương hiệu hoặc đội tư vấn. Nếu ngành không rõ, dùng văn phòng hiện đại, quầy tiếp đón hoặc showroom trung tính. Props chỉ để xác nhận nghề nghiệp, không che áo và không biến ảnh thành ảnh stock.

Hành động tự nhiên: chào đón khách, trao đổi tại quầy, kiểm tra sản phẩm, phục vụ bàn, hướng dẫn khách, phối hợp nhẹ trong nhóm, đi qua không gian làm việc, chuẩn bị một điểm dịch vụ. Tránh high-five, giơ tay đồng loạt, bắt tay che ngực, cầm laptop/bảng che logo, và pose đồng phục đứng cứng hàng ngang.

## Contract từng ảnh

### Main

- Vuông 1:1, 3–5 người lớn Việt Nam; frame đầu đến trên gối, tối thiểu ba áo mặt trước rõ.
- Áo chiếm trọng tâm; bottoms trung tính, phù hợp ngành, không logo lớn.
- Logo Mayaodongphuc xuất hiện một lần tại góc trên sạch. Bottom rail không quá 14% chiều cao.
- Rail copy duy nhất: `THOÁNG MÁT`, `DỄ MẶC`, `IN LOGO - NHẬN DIỆN RIÊNG`, `MAY NHANH SỐ LƯỢNG LỚN`, `0982 254 458` kèm phone icon.
- Không title, slogan, website, paragraph hoặc claim khác.

### Image 2

- Vuông 1:1, 4–8 người lớn trong Version B, bối cảnh công việc khác main.
- Có thể cho thấy một lưng áo rõ nếu nguồn hỗ trợ và artwork lưng được xác định; không tự suy diễn mặt lưng.
- Không title catalog, feature paragraph, website hay factory footer. Chỉ dùng logo Mayaodongphuc và wordmark áo khi có.

### Catalog

- Ngang 5:4, 4–10 người lớn; ưu tiên mở rộng Version B làm hero thay vì regenerate cả nhóm.
- Hero khác main; photography/garment vẫn chiếm phần visual dominant. Information field mềm ở negative space, không sidebar opaque che áo.
- Dùng đúng một title pair, slogan, bốn feature, bốn close-up, factory footer, hotline và website từ output contract. Close-up chỉ thể hiện chi tiết có căn cứ: vải, cổ/đường may, panel/in trước, tay hoặc lưng.

## Marketing authority và acceptance

Chỉ dùng các claim factory-provided trong output contract. Không bịa thành phần vải, GSM, công nghệ in cụ thể, số lần giặt, deadline cố định hoặc giá.

Reject/sửa nếu áo sai construction/màu/panel; branding nguồn còn lại; áo sát nách chưa chuẩn hóa; text in phẳng hoặc sai; hình đọc thành học sinh/outdoor team-building; main ít hơn 3 hoặc image-2/catalog hero ít hơn 4 người lớn; logo Mayaodongphuc méo/lặp/in lên áo; hotline/domain sai; Vietnamese text khó đọc; main có copy thừa; A và B không khác đủ; catalog chỉ là main + overlay; hoặc manifest fail/checksum mismatch. Inspect final WebP full-size trước checksum. Nếu ảnh tốt nhưng text tiếng Việt sai, chỉ sửa vùng text bằng font hỗ trợ tiếng Việt và giữ thiết kế tích hợp.

## Output, handoff và validate

Lưu ở `generated/tao-anh-dong-phuc-cong-ty-doanh-nghiep/mayaodongphuc-<product>/`:

- `mayaodongphuc-<product>-main.webp`
- `mayaodongphuc-<product>-image-2.webp`
- `mayaodongphuc-<product>-catalog.webp`
- `product-handoff.json`

WebP Q100 là file publish/master. Chuyển final sang WebP quality 100, kiểm tra đúng file WebP full size, sau đó tính SHA-256 từ bytes đó và viết manifest.

```bash
python3 scripts/validate_product_handoff.py \
  --manifest=/absolute/path/product-handoff.json \
  --image=/absolute/path/mayaodongphuc-<product>-main.webp \
  --image=/absolute/path/mayaodongphuc-<product>-image-2.webp \
  --image=/absolute/path/mayaodongphuc-<product>-catalog.webp \
  --require-default-set
```

Set `consumerPolicy.visualInspection` là `not-required-after-validation`; `publishingIntent.action` là `publish`, `draft` hoặc `images-only` phù hợp request. Default path phải đưa manifest và ảnh đã validate vào `create-tenant-product`, với `uploadFormat: "webp"`, `webpQuality: 100`.
