---
name: tao-anh-dong-phuc-lop-truong-hoc
description: "Tạo bộ ảnh sản phẩm May Áo Đồng Phục cho đồng phục lớp, trường học, CLB học sinh/sinh viên từ ảnh áo tham chiếu: ảnh main vuông, ảnh 2 lifestyle sạch, ảnh catalog 5:4, product-handoff.json đã validate, và mặc định đăng sản phẩm qua create-tenant-product. Dùng khi người dùng yêu cầu áo lớp, đồng phục lớp, đồng phục trường học, áo nhóm học sinh/sinh viên, ảnh main, ảnh catalog, poster giới thiệu áo lớp hoặc ảnh nhúng bài viết cho mayaodongphuc.com.vn."
---

# Tạo Ảnh Đồng Phục Lớp - Trường Học

Tạo ba ảnh xuất bản mặc định: `main`, `image-2`, `catalog`, kèm `product-handoff.json` đã validate, rồi đăng sản phẩm qua `create-tenant-product` trong cùng task trừ khi người dùng nói rõ chỉ tạo ảnh/preview/không đăng. Skill này dùng cho tenant `mayaodongphuc`, domain `mayaodongphuc.com.vn`, category `dong-phuc-truong-hoc`.

Đọc `references/approved-output-contract.md` trước khi tạo ảnh. Đọc `references/product-handoff.md` trước khi viết manifest. Xem ảnh áo nguồn và benchmark phù hợp trong `assets/` bằng `view_image`.

## Deliverable Contract

- Request mặc định chỉ có ảnh áo: tạo đúng ba ảnh xuất bản `main`, `image-2`, `catalog`, và `product-handoff.json`.
- Nếu người dùng chỉ yêu cầu `main`: tạo một ảnh hero vuông.
- Nếu người dùng chỉ yêu cầu `ảnh 2` hoặc clean lifestyle: tạo một ảnh lifestyle vuông sạch.
- Nếu người dùng chỉ yêu cầu `catalog`, `poster`, hoặc `ảnh nhúng bài viết`: tạo một ảnh catalog 5:4, có scene khác với ảnh main nếu main đã có.
- Mọi ảnh xuất bản được trả về phải được liệt kê trong manifest. Không liệt kê ảnh trung gian.

## Default Publish Behavior

- Request mặc định cho phép full pipeline: tạo ảnh, validate manifest, gọi `create-tenant-product`, publish vào `mayaodongphuc.com.vn`, và verify public product URL HTTP 200.
- Dừng ở ảnh local khi người dùng nói rõ `chỉ tạo ảnh`, `không đăng`, `image only`, `preview`, `local only`, hoặc chỉ yêu cầu một role ảnh. Nếu người dùng yêu cầu draft, vẫn gọi publisher nhưng dùng `draft`.
- Default target: tenant `mayaodongphuc`, domain `mayaodongphuc.com.vn`, category `dong-phuc-truong-hoc`.
- Default commercial state: quote-only, không tự đặt giá, `isPurchasable=false`, `stockStatus=instock`, currency `VND`.
- Không hỏi lại tenant, category, giá hoặc trạng thái publish khi request đi theo default path.
- Nếu REST/CMS chặn publish, giữ lại ảnh và manifest đã validate, báo blocker cụ thể, và không nói sản phẩm đã đăng.

## Lock The Product

Trước khi tạo ảnh, ghi nhận:

- silhouette, cổ áo, tay áo, bo cổ/bo tay;
- ranh giới màu, gradient, mảng phối, panel hông/vai, gấu áo;
- họa tiết trang trí, vị trí và tỷ lệ in;
- mọi logo, huy hiệu, tên trường/lớp, thương hiệu, event, slogan hoặc chữ gốc cần xóa;
- nguồn áo có sát nách/tank/deep armhole cần chuẩn hóa tay ngắn hay không;
- mặt trước/sau nào đủ chắc để thể hiện.

Giữ thiết kế áo giống nhau trên mọi model. Không biến áo thành trơn, đổi cổ áo, đảo gradient, hoặc thêm mark lạ. Quần/váy chỉ là styling phụ, không phải sản phẩm được bán.

### Normalize Sleeveless Inputs

- Nếu nguồn là tank top, áo sát nách, áo ba lỗ, hoặc khoét nách sâu, chuyển thành áo tay ngắn set-in nhất quán ở mọi scene.
- Giữ neckline/collar và thiết kế thân áo; chỉ mở rộng màu/họa tiết vai-thân lên tay áo mới một cách tự nhiên.
- Ghi transformation này trong `product-handoff.json`; `garmentFacts.sleeves` phải mô tả output là `tay ngắn`.
- Reject ảnh final nếu cùng một sản phẩm nhưng model có construction tay áo khác nhau.

### Neutralize Garment Branding

- Xóa mọi logo, huy hiệu, tên lớp/trường thật, thương hiệu, event và chữ gốc trên áo.
- Giữ họa tiết phi thương hiệu, color blocking, gradient, panel và texture.
- Thay branding đã xóa bằng chữ `Đồng Phục X24`, căn giữa ngang ngực, cỡ khoảng 20-30% chiều ngang phần thân áo thấy được.
- Dùng màu in tonal ít tương phản, đọc được nhưng không thành sponsor mark lớn. Không thêm icon X24, không lặp lại trên tay/gấu/lưng.
- Logo Mayaodongphuc chỉ là branding của ảnh campaign, không in lên áo.

## Generate As One Art-Directed Image

Dùng image generation với ảnh áo nguồn và `assets/mayaodongphuc-logo.png`. Tạo photography, layout và campaign graphics trong một visual tích hợp; không tạo ảnh generic rồi dán sidebar lớn.

Prompt theo thứ tự:

1. role ảnh và aspect ratio;
2. khóa thiết kế áo, xóa branding nguồn, wordmark `Đồng Phục X24`, logo campaign riêng;
3. cast học sinh/sinh viên Việt Nam, hành động, framing, môi trường trường học;
4. hierarchy graphic của role;
5. exact visible copy;
6. exclusions/fidelity requirements.

Correction pass chỉ dùng để sửa lỗi cụ thể như typo, tay lỗi, logo lỗi hoặc chi tiết áo sai; yêu cầu giữ nguyên phần còn lại.

## Build Two Distinct Scene Versions

Tạo ít nhất hai scene photo được chấp nhận:

- `Version A`: ảnh main, tối ưu nhận diện áo nhanh trong listing.
- `Version B`: ảnh lifestyle sạch cho `image-2` và làm hero/supporting scene cho catalog, dùng bối cảnh khác hoặc hoạt động khác rõ rệt.

Version B phải khác Version A ít nhất ba yếu tố: số người, formation, hành động, camera distance, angle, đứng/ngồi, hoặc môi trường. Crop lại main không tính là Version B.

## School Context

Ưu tiên cast Việt Nam trẻ, phù hợp áo lớp/trường học: học sinh THPT lớn, sinh viên, CLB/khoa, hoặc nhóm lớp. Tránh biểu cảm, dáng pose hoặc trang phục phụ quá công sở, team-building doanh nghiệp, nightlife, wedding, hoặc fashion editorial xa ngữ cảnh học đường.

Bối cảnh nên xoay vòng:

- sân trường, hành lang lớp học, cầu thang/courtyard;
- lớp học sáng, bảng lớp, bàn ghế gọn;
- thư viện, phòng CLB, studio kỷ yếu tối giản;
- khuôn viên đại học, hàng cây, sân cờ;
- sân thể thao trường, nhà đa năng, ngày hội trường;
- outing/kỷ yếu ngoài trời chỉ khi người dùng yêu cầu hoặc thiết kế áo hợp rõ ràng.

Hành động nên tự nhiên:

- chụp ảnh tập thể lớp hoặc CLB;
- cùng xem bản thiết kế, danh sách size, hoặc poster sự kiện;
- chuẩn bị gian hàng/ngày hội trường;
- trò chuyện ở sân trường hoặc thư viện;
- sinh hoạt CLB, rehearsal, hoặc ngày hội thể thao;
- tạo dáng kỷ yếu hiện đại nhưng không dùng áo choàng tốt nghiệp trừ khi người dùng yêu cầu.

Tránh pose high-five lặp lại, clapping, tay giơ đồng loạt, dấu hiệu cổ vũ thể thao quá mạnh, hoặc cảnh picnic doanh nghiệp nếu không được yêu cầu.

## Main Image Contract

Benchmark: `assets/approved-main.png` cho độ rõ áo và bottom rail, không copy pose.

- Square 1:1.
- Ba đến năm model Việt Nam trẻ, mixed gender khi phù hợp, nét mặt tự nhiên.
- Frame từ đầu tới trên gối, giữ ít nhất ba mặt trước áo rõ.
- Áo là trọng tâm chính; bottoms trung tính như jeans, quần dài, chân váy/skort học đường hiện đại, không logo lớn.
- Logo Mayaodongphuc xuất hiện một lần ở góc trên sạch.
- Bottom rail không quá 14% chiều cao ảnh.
- Rail copy duy nhất: `THOÁNG MÁT`, `DỄ MẶC`, `IN TÊN - LOGO LỚP`, `MAY NHANH SỐ LƯỢNG LỚN`, `0982 254 458` với phone icon.
- Không thêm title, slogan, website, paragraph hoặc claims khác trên main.

## Image 2 Contract

- Square 1:1.
- Bốn đến tám model trong scene học đường/lớp/CLB khác main.
- Không thêm catalog title, feature paragraphs, website hoặc factory footer.
- Chỉ dùng logo Mayaodongphuc và wordmark áo `Đồng Phục X24`, trừ khi người dùng yêu cầu sạch hoàn toàn.

## Catalog Contract

Benchmark: `assets/approved-catalog.png` cho hierarchy và density.

- Landscape 5:4.
- Bốn đến mười model trong bối cảnh lớp/trường/CLB rõ ràng.
- Dùng Version B làm hero, có thể kết hợp crop/detail từ Version A.
- Không dùng nguyên main scene/crop làm catalog hero duy nhất.
- Blend information field mềm vào vùng có negative space, trái/phải đều được.
- Dùng một title pair, một slogan, bốn product properties, bốn close-up windows, factory footer, hotline và website theo `references/approved-output-contract.md`.
- Nhóm người và áo vẫn phải chiếm phần visual dominant.

## Marketing Authority

Có thể dùng như factory-provided claims:

- vải thoáng mát, thấm hút;
- form dễ mặc, dễ chia size;
- in tên, logo lớp/trường theo yêu cầu;
- may nhanh số lượng lớn;
- bền màu, dễ bảo quản;
- duyệt thiết kế trước sản xuất;
- giao hàng toàn quốc.

Không bịa thành phần vải, GSM, công nghệ in cụ thể, số lần giặt, deadline cố định hoặc giá bán cố định.

## Acceptance Gate

Reject hoặc sửa nếu:

- áo sai construction, màu, gradient, panel hoặc họa tiết so với nguồn;
- branding nguồn, tên lớp/trường thật, event hoặc chữ gốc còn trên áo;
- `Đồng Phục X24` thiếu, sai chính tả, quá nổi, quá nhỏ, lặp lại hoặc không nhất quán;
- scene đọc thành team-building doanh nghiệp/outdoor picnic thay vì lớp/trường học;
- main ít hơn ba model, `image-2`/catalog ít hơn bốn model;
- người quá nhỏ tuổi theo cách không phù hợp với ảnh thương mại, hoặc cảnh học đường nhạy cảm/không an toàn;
- logo Mayaodongphuc thiếu, méo, lặp hoặc in lên áo;
- hotline khác `0982 254 458`, website khác `mayaodongphuc.com.vn`;
- text tiếng Việt sai dấu nghiêm trọng hoặc khó đọc;
- main có copy ngoài rail cho phép;
- overlay che thiết kế áo;
- Version B không khác main;
- catalog chỉ là main với overlay lớn;
- `product-handoff.json` thiếu, checksum mismatch, hoặc fail validator;
- `altSeed`/`captionSeed` dùng phrasing kiểu tồn kho như `Ảnh chụp`, `Bảng catalog`, `Nhóm năm người`.

Inspect ảnh final ở full size trước khi tính checksum. Nếu text lỗi nhưng ảnh tốt, có thể sửa vùng text bằng font hỗ trợ tiếng Việt và giữ thiết kế tích hợp.

## Output And Handoff

Tạo output dưới:

- Directory: `generated/tao-anh-dong-phuc-lop-truong-hoc/mayaodongphuc-<product>/`
- Main: `generated/tao-anh-dong-phuc-lop-truong-hoc/mayaodongphuc-<product>/mayaodongphuc-<product>-main.png`
- Image 2: `generated/tao-anh-dong-phuc-lop-truong-hoc/mayaodongphuc-<product>/mayaodongphuc-<product>-image-2.png`
- Catalog: `generated/tao-anh-dong-phuc-lop-truong-hoc/mayaodongphuc-<product>/mayaodongphuc-<product>-catalog.png`
- Handoff: `generated/tao-anh-dong-phuc-lop-truong-hoc/mayaodongphuc-<product>/product-handoff.json`

PNG là master. Tính SHA-256 sau khi lưu pixel final, viết manifest từ đúng file đó, rồi chạy:

```bash
python3 scripts/validate_product_handoff.py \
  --manifest=/absolute/path/product-handoff.json \
  --image=/absolute/path/mayaodongphuc-<product>-main.png \
  --image=/absolute/path/mayaodongphuc-<product>-image-2.png \
  --image=/absolute/path/mayaodongphuc-<product>-catalog.png \
  --require-default-set
```

Set `consumerPolicy.visualInspection` to `not-required-after-validation`. Set `publishingIntent.action` to `publish` by default, `draft` when requested, or `images-only` when CMS mutation is disabled. On default path, pass manifest and images into `create-tenant-product` immediately after validation.
