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

Script cũng chọn `salesStyle` ổn định theo SKU từ
`assets/football-sales-styles.json`. Style này chỉ điều khiển poster chào hàng:
mood, ánh sáng, nền, typography và hierarchy. Nó không được đổi master
front/back, palette sản phẩm, copy lock hoặc số lượng view bắt buộc.

## Trục sáng tạo

- `motifFamily`: tốc độ, địa hình, quỹ đạo, âm thanh, kiến trúc, lưới chiến thuật, năng lượng, khối mô-đun.
- `geometry`: diagonal shards, contour bands, radial arcs, split field, chevrons, offset grid, wave ribbons, topographic lines.
- `energy`: calm technical, balanced athletic, explosive matchday.
- `frontLayout`: trọng tâm vai, ngực chéo, thân dưới, sườn hội tụ, trung tâm phân tách.
- `backLayout`: phản hồi front nhưng phải giữ vùng tên/số sạch.
- `accentPlacement`: vai, sườn, gấu, đường chéo ngực, panel lệch tâm.
- `palette`: 2–4 màu chính; ít nhất một màu nền, một tương phản và một accent có tỷ lệ nhỏ.
- `salesStyle`: một trong 5 kiểu poster để trang catalog không bị lặp thị giác:
  `stadium-tech-showcase`, `clean-sky-studio`, `night-tunnel-pro`,
  `minimal-ecommerce-grid`, `street-futsal-energy`.

Không xem sự thay đổi màu đơn thuần là concept mới. Hai concept kề nhau phải khác tối thiểu ba trục. `salesStyle` có thể là một trục phụ giúp catalog phong phú hơn, nhưng không thay thế khác biệt thật ở motif, geometry, layout hoặc palette.

## Quy tắc thiết kế cho in chuyển nhiệt

- Ưu tiên shape lớn, edge sạch và texture chủ đích; không dùng hạt li ti, line dày dưới mức dễ in hoặc gradient banding nặng.
- Không giả mesh/vải trong master. Texture vật liệu chỉ xuất hiện ở mockup.
- Không gắn name/number/logo/sponsor vào nền. Các lớp biến đổi và tài sản đội bóng được đặt ở bước bình file của xưởng.
- Giữ safe zone trước ngực và giữa lưng theo spec. Đây là vùng thị giác yên, không phải vùng trắng bắt buộc.
- Cấu trúc ở hai mép side nên có màu và nhịp nối được, nhưng không tuyên bố khớp đường may tuyệt đối khi chưa có rập thật.

## Chống sao chép

Không prompt theo tên một kit nổi tiếng hoặc “giống hệt” đội/nhãn. Có thể dùng mô tả trừu tượng như “nhịp chéo tốc độ, tương phản lạnh–nóng, vùng lưng sạch” nhưng không giữ trade dress, huy hiệu, sponsor hoặc pattern nhận diện của nguồn.

Nếu người dùng cung cấp logo/crest/sponsor riêng, ghi asset đó vào `allowedAssets` và vẫn giữ file nền front/back không có asset; mockup có thể composite asset khi người dùng đã xác nhận quyền sử dụng.
