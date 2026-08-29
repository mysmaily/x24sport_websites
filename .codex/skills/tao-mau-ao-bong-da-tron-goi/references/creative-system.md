# Hệ sáng tạo mẫu bóng đá

Đọc khi tạo từ hai mẫu trở lên, hoặc khi cần chứng minh mẫu mới không lặp batch trước.

## Creative lock

Chạy sau khi cấp SKU:

```bash
python3 scripts/choose_creative_direction.py \
  --sku X24-BD-000001 \
  --registry /absolute/path/to/batch-registry.jsonl
```

Script chọn hướng pseudo-random ổn định theo SKU và ghi registry. Cùng SKU luôn trả cùng hướng để retry không đổi concept; SKU mới có hướng mới. Output là nền cho `design-spec.json`, không phải prompt hoàn chỉnh và không thay quyết định thẩm mỹ.

## Trục sáng tạo

- `motifFamily`: tốc độ, địa hình, quỹ đạo, âm thanh, kiến trúc, lưới chiến thuật, năng lượng, khối mô-đun.
- `geometry`: diagonal shards, contour bands, radial arcs, split field, chevrons, offset grid, wave ribbons, topographic lines.
- `energy`: calm technical, balanced athletic, explosive matchday.
- `frontLayout`: trọng tâm vai, ngực chéo, thân dưới, sườn hội tụ, trung tâm phân tách.
- `backLayout`: phản hồi front nhưng phải giữ vùng tên/số sạch.
- `accentPlacement`: vai, sườn, gấu, đường chéo ngực, panel lệch tâm.
- `palette`: 2–4 màu chính; ít nhất một màu nền, một tương phản và một accent có tỷ lệ nhỏ.

Không xem sự thay đổi màu đơn thuần là concept mới. Hai concept kề nhau phải khác tối thiểu ba trục.

## Quy tắc thiết kế cho in chuyển nhiệt

- Ưu tiên shape lớn, edge sạch và texture chủ đích; không dùng hạt li ti, line dày dưới mức dễ in hoặc gradient banding nặng.
- Không giả mesh/vải trong master. Texture vật liệu chỉ xuất hiện ở mockup.
- Không gắn name/number/logo/sponsor vào nền. Các lớp biến đổi và tài sản đội bóng được đặt ở bước bình file của xưởng.
- Giữ safe zone trước ngực và giữa lưng theo spec. Đây là vùng thị giác yên, không phải vùng trắng bắt buộc.
- Cấu trúc ở hai mép side nên có màu và nhịp nối được, nhưng không tuyên bố khớp đường may tuyệt đối khi chưa có rập thật.

## Chống sao chép

Không prompt theo tên một kit nổi tiếng hoặc “giống hệt” đội/nhãn. Có thể dùng mô tả trừu tượng như “nhịp chéo tốc độ, tương phản lạnh–nóng, vùng lưng sạch” nhưng không giữ trade dress, huy hiệu, sponsor hoặc pattern nhận diện của nguồn.

Nếu người dùng cung cấp logo/crest/sponsor riêng, ghi asset đó vào `allowedAssets` và vẫn giữ file nền front/back không có asset; mockup có thể composite asset khi người dùng đã xác nhận quyền sử dụng.
