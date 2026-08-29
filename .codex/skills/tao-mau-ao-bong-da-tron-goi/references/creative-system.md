# Hệ sáng tạo mẫu bóng đá

Đọc khi tạo từ hai mẫu trở lên, hoặc khi cần chứng minh mẫu mới không lặp batch trước.

## Creative lock

Chạy sau khi cấp SKU:

```bash
python3 scripts/choose_creative_direction.py \
  --sku X24-BD-421529 \
  --registry /absolute/path/to/creative-registry.jsonl
```

Script chọn hướng pseudo-random và `productName` ổn định theo SKU rồi ghi registry. Tên lấy từ `assets/football-product-names.json`, đúng 40 tên tiếng Anh ngắn; dùng hết một vòng trước khi dùng lại tên có tần suất thấp nhất. Cùng SKU luôn trả cùng hướng/tên để retry không đổi concept. Output là nền cho `design-spec.json`, không phải prompt hoàn chỉnh và không thay quyết định thẩm mỹ.

Script cũng chọn `colorStrategy` để tránh mẫu bị kẹt vào một vibe tối/neon đơn
sắc, và chọn `salesStyle` ổn định theo SKU từ
`assets/football-sales-styles.json` và `salesComposition` ổn định theo SKU từ
`assets/football-sales-compositions.json`. `salesStyle` điều khiển mood, ánh
sáng, nền và typography; `salesComposition` điều khiển hoán đổi trái/phải, người
mẫu full body hoặc chân dung, và tỷ trọng product matrix. Cả hai không được đổi
master front/back, palette sản phẩm, copy lock hoặc số lượng view bắt buộc.
Script cũng chọn `teamPhoto` ổn định theo SKU: `playerCount` là số nguyên từ
`5` đến `11`, kèm formation/promptNotes cho ảnh tập thể đội bóng. Cùng SKU retry
phải giữ nguyên số người và formation, trừ khi user khóa override rõ trong brief.

Trước khi chốt `design-spec.json`, đọc `user-taste-profile.md` và ghi rõ các
trường taste/market-fit bắt buộc. Output của script không được vượt gu người dùng:
nếu direction sinh ra multi-color, festival, neon hoặc gradient gắt nhưng brief là
công ty/ngân hàng, phải chuyển thành phiên bản restrained với 2-3 màu chính, một
accent nhỏ, vùng nghỉ rõ và pattern sạch hơn.
Các SKU trong taste profile là nhãn feedback bằng chữ trừ khi có ảnh/đường dẫn
rõ. Không dùng chúng như visual reference, không suy diễn chi tiết mẫu không được
mô tả và không dừng workflow chỉ vì không tìm thấy ảnh SKU.

## Trục sáng tạo

- `motifFamily`: đủ rộng, không chỉ Tron/neon: tốc độ, địa hình, quỹ đạo, âm thanh, kiến trúc, lưới chiến thuật, năng lượng, khối mô-đun, sọc cổ điển, brush strokes, marble, flame, tropical leaf, digital camo, retro sport, paint splatter, watercolor, heritage sash, sunburst, racing check, gradient ribbons, micro-geometric, ink wave, festival color.
- `geometry`: diagonal shards, contour bands, radial arcs, split field, chevrons, offset grid, wave ribbons, topographic lines, vertical stripes, hoops, quartered blocks, sash, raglan burst, center/side fade, broken grid, floral panels, checker accents, painted sweeps, gradient panels, color blocks.
- `colorStrategy`: multi-color gradient, contrast color-blocking, light base/bold accent, dark base/bright accent, warm-cool duotone, triadic pop, retro sport, pastel with dark anchor, tonal with contrast break, white base color splash, split-complementary hoặc festival mix.
- `energy`: calm technical, balanced athletic, explosive matchday.
- `frontLayout`: trọng tâm vai, ngực chéo, thân dưới, sườn hội tụ, trung tâm phân tách.
- `backLayout`: phản hồi front nhưng phải giữ vùng tên/số sạch.
- `accentPlacement`: vai, sườn, gấu, đường chéo ngực, panel lệch tâm.
- `palette`: thường 3–5 màu chính; ít nhất một màu nền, một màu tương phản và một accent có tỷ lệ nhỏ. Chấp nhận gradient, phối hoạ tiết và mảng màu táo bạo nếu vẫn in được và có vùng yên cho logo/số.
- `paletteDiscipline`: lấy từ `user-taste-profile.md`. Với công ty/ngân hàng,
  giảm xuống 2-3 màu chính, một accent nhỏ, tránh neon/festival mix và ưu tiên
  nền yên, mảng lớn sạch, vùng logo/số dễ đọc. Với đại trà/trẻ, vẫn kiểm soát
  accent sáng dưới 15-20% diện tích để không thành lòe loẹt.
- `salesStyle`: một trong 5 kiểu poster để trang catalog không bị lặp thị giác:
  `stadium-tech-showcase`, `clean-sky-studio`, `night-tunnel-pro`,
  `minimal-ecommerce-grid`, `street-futsal-energy`.
- `salesComposition`: một trong 5 biến thể bố cục để cùng một style vẫn đa dạng:
  `model-left-full-body`, `model-right-full-body`, `model-left-portrait`,
  `model-right-portrait`, `product-focus-no-model`.
- `teamPhoto`: số lượng cầu thủ từ 5-11 và formation ảnh đội, lấy ổn định theo
  SKU để mỗi mẫu có thêm một ảnh lifestyle tập thể không bị lặp số người quá máy
  móc.

Không xem sự thay đổi màu đơn thuần là concept mới. Hai concept kề nhau phải khác tối thiểu ba trục. `salesStyle` và `salesComposition` là trục phụ giúp catalog phong phú hơn, nhưng không thay thế khác biệt thật ở motif, geometry, layout, colorStrategy hoặc palette.

## Chống một màu / chống mặc định Tron

Không mặc định tạo áo kiểu phim Tron Legacy, cyber neon, nền đen và line xanh/tím
một màu. Kiểu đó vẫn được phép khi direction chọn đúng vibe, nhưng không phải
ngôn ngữ mặc định của skill.

Không mặc định đi theo hướng lòe loẹt nhiều hue bão hòa. Những SKU bị chê vì quá
lòe loẹt hoặc khó bán trong `user-taste-profile.md` là negative anchors; chỉ dùng
hướng tương tự khi brief nói rõ cần đại trà rất bắt mắt, và vẫn phải có anchor
trung tính/vùng nghỉ.

Prompt thiết kế nên chủ động dùng motif và colorStrategy đã khóa: có mẫu retro,
sọc/hoops cổ điển, tropical, brush, marble, flame, camo, watercolor, color-block,
gradient đa sắc, light-base hoặc warm-cool. Nếu concept tối giản/tonal, vẫn cần
một điểm phá tương phản để áo không thành một khối màu phẳng.

Với brief công ty, ngân hàng, doanh nghiệp hoặc đội nội bộ, luôn ưu tiên
`corporate restrained`: sạch, tin cậy, ít màu, pattern lớn, không rối. Đây là
market-fit gate; một mẫu nhìn thể thao nhưng sai phân khúc phải bị reject.

## Quy tắc thiết kế cho in chuyển nhiệt

- Ưu tiên shape lớn, edge sạch và texture chủ đích; không dùng hạt li ti, line dày dưới mức dễ in hoặc gradient banding nặng.
- Không giả mesh/vải trong master. Texture vật liệu chỉ xuất hiện ở mockup.
- Không gắn name/number/logo/sponsor vào nền. Các lớp biến đổi và tài sản đội bóng được đặt ở bước bình file của xưởng.
- Giữ safe zone trước ngực và giữa lưng theo spec. Đây là vùng thị giác yên, không phải vùng trắng bắt buộc.
- Cấu trúc ở hai mép side nên có màu và nhịp nối được, nhưng không tuyên bố khớp đường may tuyệt đối khi chưa có rập thật.

## Chống sao chép

Không prompt theo tên một kit nổi tiếng hoặc “giống hệt” đội/nhãn. Có thể dùng mô tả trừu tượng như “nhịp chéo tốc độ, tương phản lạnh–nóng, vùng lưng sạch” nhưng không giữ trade dress, huy hiệu, sponsor hoặc pattern nhận diện của nguồn.

Nếu người dùng cung cấp logo/crest/sponsor riêng, ghi asset đó vào `allowedAssets` và vẫn giữ file nền front/back không có asset; mockup có thể composite asset khi người dùng đã xác nhận quyền sử dụng.

Nếu người dùng dẫn trang `https://x24sport.vn/tim-kiem/?q=logo%20b%C3%B3ng%20%C4%91%C3%A1`,
đọc `assets/football-logo-sources.json` và dùng một logo phù hợp từ trang đó như
badge mẫu trên ngực áo trong mockup/sales. Không đưa logo này vào master in
phẳng; master vẫn là nền sản xuất sạch để xưởng bình tài sản khách hàng sau.
