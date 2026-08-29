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

Tỷ lệ thân áo trung bình: `0.6694` rộng/cao. Khi chưa có file rập vector hoặc
kích thước mm chính xác từ xưởng, dùng `0.67` làm tỷ lệ safe-area của thân áo.

## Ý nghĩa với master print

Canvas generic cũ `700:850` có aspect ratio `0.8235`, rộng hơn tỷ lệ thân rập
thực tế khoảng 23%. Vì vậy:

- không được coi toàn bộ canvas `700:850` là hình thân áo thật;
- nếu vẫn giao canvas `700 x 850 mm` để có bleed, motif quan trọng phải nằm trong
  safe-area thân áo tỷ lệ khoảng `0.67`, đặt giữa canvas;
- hai bên ngoài safe-area chỉ dùng làm bleed/pattern nối mép, không đặt logo,
  số, chữ, crest hoặc motif nhận diện quan trọng;
- nếu người dùng/xưởng cung cấp kích thước mm hoặc rập vector, thông số đó thắng
  hoàn toàn tỷ lệ ước lượng từ ảnh này.

## Gate khi tạo mẫu mới

Với sản phẩm bóng đá dùng rập này:

1. `design-spec.json` phải ghi `factoryPatternReference` và
   `factoryPatternSafeAspectRatio: 0.67`.
2. Source master nên dựng theo tỷ lệ gần `0.67` nếu mục tiêu là khớp thân rập
   trực tiếp.
3. Nếu vẫn chuẩn hóa ra canvas oversize `700:850`, phải ghi rõ đây là
   `deliveryCanvas`, còn vùng nội dung chính là `factoryPatternSafeArea`.
4. Hard reject source/master vuông hoặc nguồn quá rộng nếu motif chính chỉ đẹp
   nhờ phần ngoài safe-area.
5. Không stretch artwork để khớp rập; chỉ crop, pad bằng bleed hoặc dựng lại
   đúng tỷ lệ.
