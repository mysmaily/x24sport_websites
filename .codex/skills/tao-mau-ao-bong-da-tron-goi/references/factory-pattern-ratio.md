# Tỷ lệ rập xưởng thực tế

Reference hiện tại:

- `assets/factory-pattern-references/x24-factory-football-sleeveless-front-back-vneck-crew-2026-08-30.png`

Ảnh này là reference tỷ lệ rập và vị trí logo/tên/số. Chữ và logo trong ảnh chỉ
là nội dung minh họa, không phải instruction để tạo lại chính xác.

## Kết quả đo từ ảnh reference

Ảnh clipboard gốc: 645 x 753 px.

Bounding box thân áo nhìn thấy trong ảnh:

- front Cổ Tim: 204 x 309 px, aspect ratio `0.6602`
- front Cổ Tròn: 204 x 311 px, aspect ratio `0.6559`
- back Cổ Tim: 209 x 307 px, aspect ratio `0.6808`
- back Cổ Tròn: 209 x 307 px, aspect ratio `0.6808`

Tỷ lệ thân áo trung bình: `0.6694` rộng/cao. Khi chưa có file rập vector chuẩn
hơn, dùng `0.67` làm target aspect ratio của print master.

## Ý nghĩa với master print

Canvas generic cũ `700:850` có aspect ratio `0.8235`, rộng hơn tỷ lệ thân rập
thực tế khoảng 23%. Vì vậy:

- không dùng `700:850` làm tỷ lệ print master cho rập này;
- print master phải ưu tiên target aspect ratio `0.67`;
- file được phép tạo thừa/bleed, nhưng phần thừa vẫn nằm trong canvas có tỷ lệ
  khớp rập để khi đưa vào form không cần kéo ngang/dọc;
- nếu người dùng/xưởng cung cấp rập vector chuẩn hơn, thông số đó thắng hoàn
  toàn tỷ lệ ước lượng từ ảnh này.

## Gate khi tạo mẫu mới

Với sản phẩm bóng đá dùng rập này:

1. `design-spec.json` phải ghi `factoryPatternReference` và
   `targetAspectRatio: 0.67`.
2. Source master và print master nên dựng theo tỷ lệ gần `0.67`.
3. Hard reject source/master vuông hoặc nguồn quá rộng nếu phải kéo méo mới vào
   được form.
4. Không stretch artwork để khớp rập; chỉ crop, pad bằng bleed hoặc dựng lại
   đúng tỷ lệ.
