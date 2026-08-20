---
name: tao-anh-dong-phuc-lop-truong-hoc
description: "Tạo bộ ảnh sản phẩm May Áo Đồng Phục cho đồng phục lớp, trường học, CLB học sinh/sinh viên từ ảnh áo tham chiếu: ảnh main vuông, ảnh 2 lifestyle sạch, ảnh catalog 5:4, product-handoff.json đã validate, và mặc định đăng sản phẩm qua create-tenant-product. Dùng khi người dùng yêu cầu áo lớp, đồng phục lớp, đồng phục trường học, áo nhóm học sinh/sinh viên, ảnh main, ảnh catalog, poster giới thiệu áo lớp hoặc ảnh nhúng bài viết cho mayaodongphuc.com.vn."
---

# Tạo Ảnh Đồng Phục Lớp - Trường Học

Tạo ba ảnh xuất bản mặc định: `main`, `image-2`, `catalog`, kèm `product-handoff.json` đã validate, rồi đăng sản phẩm qua `create-tenant-product` trong cùng task trừ khi người dùng nói rõ chỉ tạo ảnh/preview/không đăng. Skill này dùng cho tenant `mayaodongphuc`, domain `mayaodongphuc.com.vn`, category `dong-phuc-truong-hoc`.

Đọc `references/approved-output-contract.md` trước khi tạo ảnh. Đọc `references/short-shirt-text-dictionary.md` khi cần chọn text tạm để đặt lên áo. Đọc `references/product-handoff.md` trước khi viết manifest. Xem ảnh áo nguồn và benchmark phù hợp trong `assets/` bằng `view_image`.

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

### Neutralize Garment Branding And Add Class Text

- Xóa mọi logo, huy hiệu, tên lớp/trường thật, thương hiệu, event và chữ gốc trên áo.
- Giữ họa tiết phi thương hiệu, color blocking, gradient, panel và texture.
- Đồng phục lớp/trường học cần khác đồng phục công ty: ưu tiên text vui, có cá tính lớp, typography sticker/bubble/comic, chữ bo viền, shadow, sao/tia sáng/icon nhỏ, hoặc bố cục nhiều dòng kiểu áo lớp thật.
- Nếu người dùng cung cấp slogan, tên lớp hoặc class code được phép dùng, đặt text đó lên áo theo bố cục vui, dễ đọc, không quá corporate.
- Nếu người dùng chưa cung cấp text áo, chọn một câu ngắn từ `references/short-shirt-text-dictionary.md` làm placeholder. Có thể ghép thêm class code generic như `12A1`, `10A3`, `9A` khi bố cục cần điểm nhận diện lớp, nhưng không dùng tên trường/lớp thật nếu người dùng chưa đưa.
- Ưu tiên hệ front/back: ngực trái hoặc ngực giữa dùng class code/mark nhỏ; lưng áo dùng artwork lớn 35-60% chiều ngang lưng với slogan vui. Với ảnh chỉ thấy mặt trước, vẫn dùng mark nhỏ-vừa; với ảnh thấy lưng, phải cho thấy artwork lưng rõ.
- Text lưng có thể dài hơn mặt trước nếu tách thành 2-4 dòng lớn, ví dụ `MÃI BÊN NHAU / BẠN NHÉ`, `LỚP TÔI / HƠI BỊ CHẤT`, `NHẤT QUỶ / NHÌ MA`, hoặc `I CAN'T / YOU CAN'T / BUT WE CAN`.
- Dùng màu in tương phản theo palette áo, có viền trắng/navy/hồng/xanh để đọc được. Tránh text nhạt, nhỏ, thẳng hàng như đồng phục doanh nghiệp.
- Không lặp cùng một slogan lớn ở mọi vị trí; dùng front nhỏ + back lớn khi có cả hai mặt.
- Fallback trung tính khi không muốn dùng slogan lớp là `Đồng Phục X24`, căn giữa ngang ngực, cỡ khoảng 20-30% chiều ngang phần thân áo thấy được.
- Logo Mayaodongphuc chỉ là branding của ảnh campaign, không in lên áo.

### Integrate Printed Text Into Fabric

Text áo lớp phải nhìn như hình in thật trên vải, không như một layer đồ họa dán phẳng lên ảnh.

- Prompt rõ rằng artwork là `screen print / sublimation ink integrated into the fabric`, không phải sticker, decal nổi, hoặc overlay hậu kỳ.
- Chữ và viền phải uốn theo phối cảnh thân áo, cong nhẹ theo lưng/ngực, bị nén/giãn theo dáng người, nếp vải và hướng camera.
- Cho phép texture vải, lỗ dệt, bóng đổ mềm, nếp nhăn và highlight của áo xuyên qua màu in ở mức tự nhiên. Màu in vẫn đọc rõ nhưng không sạch bóng tuyệt đối như vector paste.
- Với áo đang xoay hoặc lưng không phẳng, artwork phải bám theo mặt phẳng vải: mép chữ không song song tuyệt đối với khung ảnh nếu áo đang nghiêng.
- Không đặt một artwork lớn y hệt, cùng tỷ lệ và độ sắc nét trên nhiều người nếu thân áo, khoảng cách và góc nhìn khác nhau; mỗi bản in phải có biến dạng riêng theo người mặc.
- Tránh viền sticker quá dày, drop shadow quá đều, mép quá sắc, hoặc không có occlusion/shading ở vùng gập nách, eo, vai, lưng.

## Generate As One Art-Directed Image

Dùng image generation với ảnh áo nguồn và `assets/mayaodongphuc-logo.png`. Tạo photography, layout và campaign graphics trong một visual tích hợp; không tạo ảnh generic rồi dán sidebar lớn.

Prompt theo thứ tự:

1. role ảnh và aspect ratio;
2. khóa thiết kế áo, xóa branding nguồn, text áo ngắn đã chọn hoặc fallback `Đồng Phục X24`, logo campaign riêng;
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

Ưu tiên cast Việt Nam trẻ, phù hợp áo lớp/trường học: học sinh THPT lớn, sinh viên, CLB/khoa, hoặc nhóm lớp. Tinh thần nên vui, thân thiết, nô đùa có kiểm soát, đúng năng lượng tuổi học trò; tránh biểu cảm, dáng pose hoặc trang phục phụ quá công sở, team-building doanh nghiệp, nightlife, wedding, hoặc fashion editorial xa ngữ cảnh học đường.

Bối cảnh nên xoay vòng:

- sân trường, hành lang lớp học, cầu thang/courtyard;
- lớp học sáng, bảng lớp, bàn ghế gọn;
- thư viện, phòng CLB, studio kỷ yếu tối giản;
- khuôn viên đại học, hàng cây, sân cờ;
- sân thể thao trường, nhà đa năng, ngày hội trường;
- outing/kỷ yếu ngoài trời, sân bóng rổ, sân trường sau giờ học, ngày hội CLB khi cần thể hiện áo lớp trẻ trung.

Hành động nên tự nhiên:

- chụp ảnh tập thể lớp hoặc CLB;
- cùng xem bản thiết kế, danh sách size, hoặc poster sự kiện;
- chuẩn bị gian hàng/ngày hội trường;
- trò chuyện, chạy nhẹ, đuổi bắt vui, khoác vai, xoay người khoe lưng áo ở sân trường;
- sinh hoạt CLB, rehearsal, hoặc ngày hội thể thao;
- tạo dáng kỷ yếu hiện đại nhưng không dùng áo choàng tốt nghiệp trừ khi người dùng yêu cầu.

Tránh pose high-five lặp lại, clapping, tay giơ đồng loạt, dấu hiệu cổ vũ thể thao quá mạnh, hoặc cảnh picnic doanh nghiệp nếu không được yêu cầu. Nô đùa phải an toàn, không xô ngã, không hành vi nguy hiểm hoặc nhạy cảm.

## Main Image Contract

Benchmark: `assets/approved-main.png` cho độ rõ áo và bottom rail, không copy pose.

- Square 1:1.
- Ba đến năm model Việt Nam trẻ, mixed gender khi phù hợp, nét mặt tự nhiên.
- Frame từ đầu tới trên gối. Nếu sản phẩm cần thể hiện áo lớp, ưu tiên ít nhất hai mặt trước rõ và một đến hai mặt lưng/three-quarter back để thấy artwork lưng.
- Áo là trọng tâm chính; bottoms trung tính như jeans, quần dài, chân váy/skort học đường hiện đại, không logo lớn.
- Logo Mayaodongphuc xuất hiện một lần ở góc trên sạch.
- Bottom rail không quá 14% chiều cao ảnh.
- Rail copy duy nhất: `THOÁNG MÁT`, `DỄ MẶC`, `IN TÊN - LOGO LỚP`, `MAY NHANH SỐ LƯỢNG LỚN`, `0982 254 458` với phone icon.
- Không thêm title, slogan, website, paragraph hoặc claims khác trên main.

## Image 2 Contract

- Square 1:1.
- Bốn đến tám model trong scene học đường/lớp/CLB khác main.
- Phải có ít nhất một mặt lưng áo rõ khi nguồn/sản phẩm không khóa chỉ mặt trước; đây là ảnh hỗ trợ chính để người mua thấy bố cục sau áo.
- Cho phép hoạt động vui hơn main: khoác vai, chạy nhẹ qua sân, quay lưng cười với bạn, chuẩn bị ngày hội trường, chơi mini game CLB an toàn.
- Không thêm catalog title, feature paragraphs, website hoặc factory footer.
- Chỉ dùng logo Mayaodongphuc và wordmark áo `Đồng Phục X24`, trừ khi người dùng yêu cầu sạch hoàn toàn.

## Catalog Contract

Benchmark: `assets/approved-catalog.png` cho hierarchy và density.

- Landscape 5:4.
- Bốn đến mười model trong bối cảnh lớp/trường/CLB rõ ràng.
- Ưu tiên dùng Version B đã được duyệt làm hero/base catalog. Không regenerate lại toàn bộ nhóm người nếu ảnh 2 đã đẹp; chỉ mở rộng canvas, blend vùng thông tin, và thêm close-up/detail windows từ ảnh sản phẩm đã duyệt hoặc crop cùng thiết kế.
- Khi cần generate catalog sau ảnh 2, đưa ảnh 2 vào reference và yêu cầu giữ nguyên nhóm người, mặt, áo, text áo và ánh sáng ở vùng hero; thao tác chính là thiết kế layout catalog quanh ảnh đó.
- Chỉ dựng scene catalog mới khi ảnh 2 không đủ chỗ âm bản, thiếu số người, hoặc không thể dùng làm hero.
- Không dùng nguyên main scene/crop làm catalog hero duy nhất.
- Blend information field mềm vào vùng có negative space, trái/phải đều được.
- Dùng một title pair, một slogan, bốn product properties, bốn close-up windows, factory footer, hotline và website theo `references/approved-output-contract.md`.
- Nếu catalog cần một phrase ngắn trên áo và người dùng chưa cung cấp, dùng `references/short-shirt-text-dictionary.md`; không đưa các câu hài/lầy vào catalog title hoặc feature copy.
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
- text áo đã chọn hoặc fallback `Đồng Phục X24` thiếu, sai chính tả, quá nổi, quá nhỏ, lặp lại quá mức hoặc không nhất quán;
- text/artwork trên áo nhìn như layer paste/decal phẳng: mép quá sắc, không bám phối cảnh, không theo nếp vải, không nhận ánh sáng/bóng của áo, hoặc lặp cùng biến dạng trên nhiều thân áo;
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
- Main: `generated/tao-anh-dong-phuc-lop-truong-hoc/mayaodongphuc-<product>/mayaodongphuc-<product>-main.webp`
- Image 2: `generated/tao-anh-dong-phuc-lop-truong-hoc/mayaodongphuc-<product>/mayaodongphuc-<product>-image-2.webp`
- Catalog: `generated/tao-anh-dong-phuc-lop-truong-hoc/mayaodongphuc-<product>/mayaodongphuc-<product>-catalog.webp`
- Handoff: `generated/tao-anh-dong-phuc-lop-truong-hoc/mayaodongphuc-<product>/product-handoff.json`

WebP Q100 là file xuất bản và master. Sau khi tạo ảnh, chuyển file final sang WebP quality 100, kiểm tra ảnh WebP ở full size, rồi tính SHA-256 và viết manifest từ đúng file WebP đó.

Khi publish qua `create-tenant-product`, luôn dùng `uploadFormat: "webp"` và `webpQuality: 100`. Không dùng PNG trong bộ ảnh xuất bản hay upload.

```bash
python3 scripts/validate_product_handoff.py \
  --manifest=/absolute/path/product-handoff.json \
  --image=/absolute/path/mayaodongphuc-<product>-main.webp \
  --image=/absolute/path/mayaodongphuc-<product>-image-2.webp \
  --image=/absolute/path/mayaodongphuc-<product>-catalog.webp \
  --require-default-set
```

Set `consumerPolicy.visualInspection` to `not-required-after-validation`. Set `publishingIntent.action` to `publish` by default, `draft` when requested, or `images-only` when CMS mutation is disabled. On default path, pass manifest and images into `create-tenant-product` immediately after validation.
