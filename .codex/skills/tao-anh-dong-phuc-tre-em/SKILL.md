---
name: tao-anh-dong-phuc-tre-em
description: "Tạo bộ ảnh sản phẩm May Áo Đồng Phục cho đồng phục trẻ em từ ảnh áo tham chiếu: mầm non, tiểu học, lớp thiếu nhi, dã ngoại, ngày hội trường; gồm main vuông, image-2 lifestyle, catalog 5:4, product-handoff.json đã validate, và mặc định đăng qua create-tenant-product cho mayaodongphuc.com.vn."
---

# Tạo Ảnh Đồng Phục Trẻ Em

Tạo ba ảnh xuất bản mặc định: `main`, `image-2`, `catalog`, kèm `product-handoff.json` đã validate, rồi đăng sản phẩm qua `create-tenant-product` trong cùng task trừ khi người dùng nói rõ chỉ tạo ảnh/preview/không đăng. Skill này dùng cho tenant `mayaodongphuc`, domain `mayaodongphuc.com.vn`, category `dong-phuc-tre-em`.

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
- Default target: tenant `mayaodongphuc`, domain `mayaodongphuc.com.vn`, category `dong-phuc-tre-em`.
- Default commercial state: quote-only, không tự đặt giá, `isPurchasable=false`, `stockStatus=instock`, currency `VND`.
- Không hỏi lại tenant, category, giá hoặc trạng thái publish khi request đi theo default path.
- Nếu REST/CMS chặn publish, giữ lại ảnh và manifest đã validate, báo blocker cụ thể, và không nói sản phẩm đã đăng.

## Lock The Product

Trước khi tạo ảnh, ghi nhận:

- silhouette, cổ áo, tay áo, bo cổ/bo tay;
- ranh giới màu, gradient, mảng phối, panel hông/vai, gấu áo;
- họa tiết trang trí, vị trí và tỷ lệ in;
- mọi logo, huy hiệu, tên trường/lớp thật, thương hiệu, event, slogan hoặc chữ gốc cần xóa;
- nguồn áo có sát nách/tank/deep armhole cần chuẩn hóa tay ngắn hay không;
- mặt trước/sau nào đủ chắc để thể hiện.

Giữ thiết kế áo giống nhau trên mọi model. Không biến áo thành trơn, đổi cổ áo, đảo gradient, hoặc thêm mark lạ. Quần, váy, short, balo hoặc mũ chỉ là styling phụ, không phải sản phẩm được bán.

### Normalize Sleeveless Inputs

- Nếu nguồn là tank top, áo sát nách, áo ba lỗ, hoặc khoét nách sâu, chuyển thành áo tay ngắn set-in nhất quán ở mọi scene.
- Giữ neckline/collar và thiết kế thân áo; chỉ mở rộng màu/họa tiết vai-thân lên tay áo mới một cách tự nhiên.
- Ghi transformation này trong `product-handoff.json`; `garmentFacts.sleeves` phải mô tả output là `tay ngắn`.
- Reject ảnh final nếu cùng một sản phẩm nhưng model có construction tay áo khác nhau.

### Neutralize Garment Branding And Add Child-Safe Text

- Xóa mọi logo, huy hiệu, tên lớp/trường thật, thương hiệu, event và chữ gốc trên áo.
- Giữ họa tiết phi thương hiệu, color blocking, gradient, panel và texture.
- Đồng phục trẻ em cần khác áo lớp THPT/sinh viên: ưu tiên text ngắn, vui, lành mạnh, dễ đọc, nét chữ tròn hoặc minh họa nhỏ như ngôi sao, bút chì, mặt trời, cầu vồng, hoa, sách, lá cây. Không dùng câu lầy, nổi loạn, tuổi teen, romantic, adult, mỉa mai hoặc quá cá tính.
- Nếu người dùng cung cấp slogan, tên lớp hoặc tên trường được phép dùng, đặt text đó lên áo theo bố cục thân thiện với trẻ em.
- Nếu người dùng chưa cung cấp text áo, chọn một câu ngắn từ `references/short-shirt-text-dictionary.md`. Có thể ghép generic như `KIDS`, `LỚP 1A`, `MẦM NON`, `TIỂU HỌC` khi bố cục cần nhận diện, nhưng không bịa tên trường thật.
- Ưu tiên mark nhỏ-vừa ở ngực trái/ngực giữa. Với ảnh lưng, có thể dùng artwork lớn 25-45% chiều ngang lưng, vẫn mềm mại và dễ thương hơn kiểu áo lớp teen.
- Dùng màu in tương phản theo palette áo, có viền trắng/navy/xanh/hồng khi cần đọc rõ. Tránh text quá nhỏ hoặc sắc cạnh như logo doanh nghiệp.
- Không lặp cùng một slogan lớn ở mọi vị trí; dùng front nhỏ + back lớn khi có cả hai mặt.
- Fallback trung tính khi không muốn dùng slogan trẻ em là `Đồng Phục X24`, căn giữa ngang ngực, cỡ khoảng 20-30% chiều ngang phần thân áo thấy được.
- Logo Mayaodongphuc chỉ là branding của ảnh campaign, không in lên áo.

### Integrate Printed Text Into Fabric

Text áo phải nhìn như hình in thật trên vải, không như một layer đồ họa dán phẳng lên ảnh.

- Prompt rõ rằng artwork là `screen print / sublimation ink integrated into the fabric`, không phải sticker, decal nổi, hoặc overlay hậu kỳ.
- Chữ và viền phải uốn theo phối cảnh thân áo, cong nhẹ theo lưng/ngực, bị nén/giãn theo dáng người, nếp vải và hướng camera.
- Cho phép texture vải, lỗ dệt, bóng đổ mềm, nếp nhăn và highlight của áo xuyên qua màu in ở mức tự nhiên. Màu in vẫn đọc rõ nhưng không sạch bóng tuyệt đối như vector paste.
- Không đặt một artwork lớn y hệt, cùng tỷ lệ và độ sắc nét trên nhiều người nếu thân áo, khoảng cách và góc nhìn khác nhau; mỗi bản in phải có biến dạng riêng theo người mặc.
- Tránh viền sticker quá dày, drop shadow quá đều, mép quá sắc, hoặc không có occlusion/shading ở vùng gập nách, eo, vai, lưng.

## Generate As One Art-Directed Image

Dùng image generation với ảnh áo nguồn và `assets/mayaodongphuc-logo.png`. Tạo photography, layout và campaign graphics trong một visual tích hợp; không tạo ảnh generic rồi dán sidebar lớn.

Prompt theo thứ tự:

1. role ảnh và aspect ratio;
2. khóa thiết kế áo, xóa branding nguồn, text áo ngắn đã chọn hoặc fallback `Đồng Phục X24`, logo campaign riêng;
3. cast trẻ em Việt Nam trong độ tuổi mầm non lớn hoặc tiểu học, hành động, framing, môi trường phù hợp;
4. hierarchy graphic của role;
5. visible copy và kiểu treatment thông tin phù hợp với scene;
6. exclusions/fidelity requirements.

Correction pass chỉ dùng để sửa lỗi cụ thể như typo, tay lỗi, logo lỗi, anatomy lỗi hoặc chi tiết áo sai; yêu cầu giữ nguyên phần còn lại.

## Build Two Distinct Scene Versions

Tạo ít nhất hai scene photo được chấp nhận:

- `Version A`: ảnh main, tối ưu nhận diện áo nhanh trong listing.
- `Version B`: ảnh lifestyle sạch cho `image-2` và làm hero/supporting scene cho catalog, dùng bối cảnh khác hoặc hoạt động khác rõ rệt.

Version B phải khác Version A ít nhất ba yếu tố: số trẻ, formation, hành động, camera distance, angle, đứng/ngồi, hoặc môi trường. Crop lại main không tính là Version B.

## Children Context

Ưu tiên cast trẻ em Việt Nam phù hợp đồng phục mầm non lớn, tiểu học, lớp ngoại khóa, câu lạc bộ thiếu nhi hoặc nhóm dã ngoại. Hình ảnh phải ấm áp, an toàn, có người lớn/giáo viên chỉ khi phù hợp bối cảnh và không làm lu mờ sản phẩm. Tránh tạo cảm giác fashion editorial, quảng cáo người mẫu trẻ em quá trưởng thành, hoặc cảnh thiếu giám sát.

Bối cảnh nên xoay vòng:

- sân trường mầm non, lớp học sáng, kệ sách, bảng lớp, bàn ghế thấp;
- sân trường tiểu học, hành lang, sân chơi, vườn trường;
- ngày hội trường, hoạt động mỹ thuật, đọc sách, STEM đơn giản;
- dã ngoại công viên, picnic trường học, vườn thực vật, bảo tàng thiếu nhi;
- sân thể thao nhẹ, trò chơi vận động an toàn, hoạt động đội nhóm ngoài trời.

Hành động nên tự nhiên:

- đứng theo nhóm nhỏ để khoe áo;
- vẽ tranh, đọc sách, cầm bảng tên lớp generic, xếp hình, tưới cây;
- đi dã ngoại có giáo viên quan sát, ngồi thảm picnic, khám phá thiên nhiên an toàn;
- chơi trò nhẹ như chuyền bóng mềm, đi theo hàng, cười nói, khoác vai nhẹ;
- xoay người hoặc đứng three-quarter để thấy lưng áo nếu sản phẩm có artwork lưng.

Tránh hành động nguy hiểm, xô đẩy, leo trèo cao, chạy hỗn loạn, pose người lớn, trang điểm đậm, crop nhạy cảm, đồ bơi, đồ ngủ, cảnh thiếu an toàn giao thông, hoặc tiếp xúc cơ thể không phù hợp.

## Main Image Contract

Benchmark: `assets/approved-main.png` chỉ dùng để tham khảo độ rõ áo và mật độ thông tin thương mại. Không copy pose, bối cảnh, màu footer hoặc layout thanh dưới.

- Square 1:1.
- Ba đến năm trẻ em Việt Nam, mixed gender khi phù hợp, nét mặt tự nhiên.
- Frame từ đầu tới trên gối hoặc toàn thân nếu trẻ đang vận động nhẹ nhưng áo vẫn chiếm trọng tâm.
- Ưu tiên ít nhất ba mặt trước rõ. Nếu sản phẩm có thiết kế lưng, một three-quarter back hoặc full back có thể thay một mặt trước.
- Áo là trọng tâm chính; bottoms trung tính như short, quần dài, chân váy/skort học đường, không logo lớn.
- Logo Mayaodongphuc xuất hiện một lần ở góc trên sạch.
- Không dùng một bottom rail cố định lặp lại cho mọi ảnh. Mỗi mẫu phải chọn một treatment thông tin khác nhau theo ảnh: micro badge rải góc, sticker label nhỏ, translucent corner panel, short vertical stack, curved ribbon nhẹ, compact contact chip, hoặc một rail mảnh/khuyết chỉ khi scene thật sự cần.
- Vùng thông tin trên main không quá 12% diện tích ảnh, không che áo, không cắt chân người một cách thô, và phải hòa vào palette/bối cảnh thay vì luôn là thanh xanh đậm phủ ngang đáy.
- Main chỉ được dùng các ý copy ngắn từ bộ này, chọn 2-4 ý là đủ thay vì bắt buộc hiện tất cả: `THOÁNG MÁT`, `DỄ MẶC`, `IN TÊN - LOGO LỚP`, `MAY NHANH SỐ LƯỢNG LỚN`, `0982 254 458`.
- Hotline nếu xuất hiện phải là `0982 254 458` và nên là phone chip/contact chip gọn. Không cần hiện hotline trên mọi main nếu ảnh đã có logo và 2-3 feature rõ.
- Không thêm title, slogan, website, paragraph hoặc claims khác trên main.

## Image 2 Contract

- Square 1:1.
- Bốn đến tám trẻ em trong scene trường mầm non/tiểu học/dã ngoại khác main.
- Phải có ít nhất một mặt lưng áo rõ khi nguồn/sản phẩm không khóa chỉ mặt trước; đây là ảnh hỗ trợ chính để người mua thấy bố cục sau áo.
- Có thể có một giáo viên/phụ huynh ở nền xa hoặc cạnh nhóm nếu scene cần giám sát, nhưng trẻ mặc áo phải là chủ thể.
- Không thêm catalog title, feature paragraphs, website hoặc factory footer.
- Chỉ dùng logo Mayaodongphuc và wordmark áo `Đồng Phục X24`, trừ khi người dùng yêu cầu sạch hoàn toàn.

## Catalog Contract

Benchmark: `assets/approved-catalog.png` cho hierarchy và density.

- Landscape 5:4.
- Bốn đến mười trẻ em trong bối cảnh mầm non, tiểu học hoặc dã ngoại rõ ràng.
- Ưu tiên dùng Version B đã được duyệt làm hero/base catalog. Không regenerate lại toàn bộ nhóm người nếu ảnh 2 đã đẹp; chỉ mở rộng canvas, blend vùng thông tin, và thêm close-up/detail windows từ ảnh sản phẩm đã duyệt hoặc crop cùng thiết kế.
- Khi cần generate catalog sau ảnh 2, đưa ảnh 2 vào reference và yêu cầu giữ nguyên nhóm trẻ, mặt, áo, text áo và ánh sáng ở vùng hero; thao tác chính là thiết kế layout catalog quanh ảnh đó.
- Chỉ dựng scene catalog mới khi ảnh 2 không đủ chỗ âm bản, thiếu số người, hoặc không thể dùng làm hero.
- Không dùng nguyên main scene/crop làm catalog hero duy nhất.
- Blend information field mềm vào vùng có negative space, trái/phải đều được.
- Dùng một title pair, một slogan, bốn product properties, bốn close-up windows, factory footer, hotline và website theo `references/approved-output-contract.md`.
- Nhóm trẻ và áo vẫn phải chiếm phần visual dominant.

## Marketing Authority

Có thể dùng như factory-provided claims:

- vải mềm, thoáng mát, dễ mặc;
- form dễ vận động, dễ chia size cho trẻ;
- in tên lớp, logo trường hoặc hình minh họa theo yêu cầu;
- may nhanh số lượng lớn;
- bền màu, dễ bảo quản;
- duyệt thiết kế trước sản xuất;
- giao hàng toàn quốc.

Không bịa thành phần vải, GSM, công nghệ in cụ thể, tiêu chuẩn an toàn, số lần giặt, deadline cố định hoặc giá bán cố định.

## Acceptance Gate

Reject hoặc sửa nếu:

- áo sai construction, màu, gradient, panel hoặc họa tiết so với nguồn;
- branding nguồn, tên lớp/trường thật, event hoặc chữ gốc còn trên áo;
- text áo đã chọn hoặc fallback `Đồng Phục X24` thiếu, sai chính tả, quá nổi, quá nhỏ, lặp lại quá mức hoặc không nhất quán;
- text/artwork trên áo nhìn như layer paste/decal phẳng;
- scene đọc thành áo lớp THPT/sinh viên, team-building doanh nghiệp, fashion editorial hoặc picnic gia đình chung chung thay vì đồng phục trẻ em/trường học;
- main ít hơn ba trẻ, `image-2`/catalog ít hơn bốn trẻ;
- trẻ trông quá trưởng thành, tạo dáng người lớn, trang phục phụ không phù hợp, cảnh nhạy cảm hoặc thiếu an toàn;
- logo Mayaodongphuc thiếu, méo, lặp hoặc in lên áo;
- hotline khác `0982 254 458`, website khác `mayaodongphuc.com.vn`;
- text tiếng Việt sai dấu nghiêm trọng hoặc khó đọc;
- main dùng thanh footer/rail cố định giống hệt nhiều ảnh, chiếm quá nhiều đáy ảnh, che chân/áo thô, hoặc có copy ngoài bộ feature/hotline cho phép;
- overlay che thiết kế áo;
- Version B không khác main;
- catalog chỉ là main với overlay lớn;
- `product-handoff.json` thiếu, checksum mismatch, hoặc fail validator;
- `altSeed`/`captionSeed` dùng phrasing kiểu tồn kho như `Ảnh chụp`, `Bảng catalog`, `Nhóm năm trẻ`.

Inspect ảnh final ở full size trước khi tính checksum. Nếu text lỗi nhưng ảnh tốt, có thể sửa vùng text bằng font hỗ trợ tiếng Việt và giữ thiết kế tích hợp.

## Output And Handoff

Tạo output dưới:

- Directory: `generated/tao-anh-dong-phuc-tre-em/mayaodongphuc-<product>/`
- Main: `generated/tao-anh-dong-phuc-tre-em/mayaodongphuc-<product>/mayaodongphuc-<product>-main.webp`
- Image 2: `generated/tao-anh-dong-phuc-tre-em/mayaodongphuc-<product>/mayaodongphuc-<product>-image-2.webp`
- Catalog: `generated/tao-anh-dong-phuc-tre-em/mayaodongphuc-<product>/mayaodongphuc-<product>-catalog.webp`
- Handoff: `generated/tao-anh-dong-phuc-tre-em/mayaodongphuc-<product>/product-handoff.json`

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
