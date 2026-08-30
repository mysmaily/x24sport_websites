# Contract mockup và ảnh chào hàng

## Vai trò input

Mọi lần generate mockup phải chỉ rõ:

```text
Image 1 = approved front print master; apply only to the front-facing jersey surfaces.
Image 2 = approved back print master; apply only to the back-facing jersey surfaces.
Do not redesign, simplify, recolor, mirror, swap, or invent either pattern.
```

`design-spec.json` điều khiển cổ, tay, form, quần, model và bố cục. Master điều khiển tuyệt đối pattern/palette.

Nếu `design-spec.json` có `logoSource`, dùng nó như asset tham khảo để đặt một
logo mẫu nhỏ trên ngực trái hoặc vùng ngực trên của áo front. Logo phải trông
như được in/ép/embroider thật vào vải, warp theo nếp áo, không nổi như sticker.
Không thêm logo vào back view, shorts hoặc background trừ khi người dùng yêu cầu
rõ.

Với workflow mặc định, `design-spec.json` phải có `logoSource` do creative script
chọn ổn định theo SKU từ các file ảnh trong `assets/logo-references/`.
`assets/football-logo-sources.json` chỉ bổ sung metadata/prompt notes cho các
file đã biết. Nếu folder có `logo-dark-*` và `logo-white-*`, chỉ dùng nhóm tương
phản đúng với vùng ngực trước: ngực sáng dùng logo tối, ngực tối/bão hòa dùng
logo trắng. Không tự dùng entry đầu tiên hoặc lặp một logo cho toàn batch nếu
spec đã chọn khác. Chỉ bỏ logo mẫu khi người dùng yêu cầu rõ áo trơn/không logo.
Logo mẫu là customer sample badge, không phải seller logo.

## Mockup gallery

- Vuông 1:1, tối thiểu 1200 × 1200 px.
- Photorealistic sportswear catalog; vải polyester thể thao có mesh vừa phải, đường may, bo cổ, lai tay, độ dày gấu, nếp và bóng tiếp xúc tự nhiên.
- Hiển thị áo trước và áo sau đủ lớn để đối chiếu. Có thể thêm quần và một cầu thủ Việt Nam mặc mặt trước nếu spec yêu cầu.
- Khi có người mẫu, tuân thủ `modelPosePlan` từ spec. Không lặp mặc định một
  pose đứng nghiêng nhìn từ trái sang phải. Ưu tiên luân phiên: nhìn thẳng
  camera, ba phần tư nhìn camera, đứng thẳng chuyên nghiệp, bước nhẹ/chuyển động
  thể thao, tay chống hông hoặc cầm bóng tự nhiên không che áo.
- Với ảnh bán hàng/catalog, ưu tiên người mẫu từ đầu gối lên hoặc ba phần tư để
  pattern áo đủ lớn. Full-body chỉ dùng khi cần khoe trọn set và vẫn phải đủ lớn
  để kiểm áo.
- Đây là ảnh marketing public thứ hai trong gallery. Phải có một contact strip
  gọn với đúng hai chuỗi `mayaobongda.vn` và `0989 353 247`, đặt ở mép dưới hoặc
  side rail và không che áo/quần. Không thêm seller logo, SKU, giá, CTA, title
  hoặc copy quảng cáo khác.
- Website/hotline phải được imagegen typeset ngay trong lần tạo/correction ảnh
  native. Không dùng Pillow, ImageMagick, SVG, Canvas hoặc script để đắp contact
  hậu kỳ.
- Logo từ `design-spec.json.logoSource` là badge mẫu của khách hàng trên áo, không phải seller logo; mặc định dùng trên mockup/sales trừ khi người dùng yêu cầu áo trơn/không logo. Nếu logo chìm vào vùng ngực, đổi sang đúng nhóm `logo-dark-*`/`logo-white-*` trước khi correction.
- Bối cảnh được sáng tạo theo palette: studio thể thao, stadium catalog, tunnel, training ground hoặc graphic set có chiều sâu. Không để background cạnh tranh với sản phẩm.

## Hard reject

- front/back bị đổi vị trí, mirror, đổi màu, mất motif, thay độ dày band hoặc thêm graphic;
- áo phẳng như vector/paper cut, glossy plastic, cổ/tay/đường may phi vật lý;
- pattern nổi như sticker, không warp theo form/nếp vải;
- back có tên/số/logo do imagegen tự bịa;
- model mặc pattern khác front master;
- model lặp pose đứng nghiêng nhìn từ trái sang phải khi spec đã yêu cầu biến thể;
- crop quá xa làm áo nhỏ, khó xem pattern trong sales/catalog;
- thiếu/sai website `mayaobongda.vn`, thiếu/sai hotline `0989 353 247`, có
  pseudo-text, seller logo, CTA hoặc watermark nguồn;
- không nhìn đủ cả mặt trước và mặt sau để kiểm tra.

Nếu một surface sai, correction pass phải nói đúng surface và giữ các surface đã đúng. Tối đa hai correction pass; nếu vẫn drift, dừng và báo image model chưa đảm bảo fidelity thay vì sửa master cho giống mockup.

Sau khi duyệt, lưu native output vào `work/<SKU>-mockup-native-source.png` và
WebP lossless vào `marketing/<SKU>-mockup-base.webp`. Hai ảnh phải có pixel RGB
giống nhau; chỉ được chuyển định dạng lossless.

## Sales image

Dùng mockup base đã duyệt làm edit target trong lần gọi imagegen cuối. Imagegen thiết kế toàn bộ typography, controls, feature badges, website và hotline cùng sản phẩm trong một composition thống nhất. Không dùng script đắp chữ hậu kỳ. Nếu sai text hoặc lệch layout, correction pass phải sửa trực tiếp ảnh native bằng imagegen.

Ảnh chào hàng là derivative. Không dùng nó làm nguồn để tái tạo master, rập hoặc màu sản xuất.
