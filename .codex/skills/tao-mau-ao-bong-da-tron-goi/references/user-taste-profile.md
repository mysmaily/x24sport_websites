# User taste profile cho mẫu áo bóng đá

Đọc trước khi tạo `design-spec.json`, mockup và sales image. File này tổng hợp
phản hồi từ batch SKU ngày 30.08.2026 và là gu ưu tiên cho các batch tiếp theo.

## SKU feedback

### Ưu tiên mạnh

- `X24-BD-542129`: rất đẹp, không có gì để chê, background hợp lý.
- `X24-BD-162329`: rất thích.
- `X24-BD-562329`: đẹp.
- `X24-BD-722329`: good good.
- `X24-BD-902329`: good good good.

### Chấp nhận / dùng làm vùng an toàn

- `X24-BD-212329`: ổn.
- `X24-BD-252329`: được.
- `X24-BD-332329`: được.
- `X24-BD-402329`: mẫu được.
- `X24-BD-482329`: cũng được.
- `X24-BD-642329`: mẫu cũng được, nhưng ảnh bán hàng xấu.
- `X24-BD-040030`: cho vào cho đủ danh sách cũng được.

### Có điều kiện

- `X24-BD-292329`: lòe loẹt, nhưng có thể hợp số đông. Chỉ dùng hướng này cho
  mẫu đại trà, trẻ, CLB phong trào hoặc chủ đích bắt mắt; không dùng cho công ty,
  ngân hàng, đội nội bộ cần lịch sự.
- `X24-BD-442329`: mẫu ổn, đẹp, nhưng background quá đỏ. Giữ logic áo, giảm nền
  đỏ/cam và tách hue nền khỏi màu áo.
- `X24-BD-782329`: tạm ok; nếu brief chỉ đích danh ngân hàng thì phải bớt số
  lượng màu và tăng độ trầm, sạch, chuyên nghiệp.

### Tránh / hard negative

- `X24-BD-132329`: không thích vì quá lòe loẹt.
- `X24-BD-382329`: chê mạnh; không phù hợp cho công ty/ngân hàng dù brief đã
  yêu cầu rõ. Đây là lỗi market-fit, không chỉ là lỗi thẩm mỹ.
- `X24-BD-812329`: khó bán.

## Quy tắc gu tổng quát

- Ưu tiên mẫu thương mại dễ bán hơn mẫu biểu diễn quá gắt. Đẹp phải đi cùng khả
  năng đặt hàng thật.
- Với brief công ty, ngân hàng, doanh nghiệp, sự kiện nội bộ hoặc đồng phục đội
  nhân viên: dùng `paletteDiscipline = corporate restrained`.
- Corporate restrained nghĩa là 2-3 màu chính, tối đa 1 accent nhỏ, nền yên,
  mảng lớn sạch, ít gradient gắt, ít pattern nhỏ, không festival mix, không neon
  nhiều màu và không tương phản chói.
- Với brief đại trà/CLB/trẻ, có thể dùng màu mạnh hơn, nhưng vẫn kiểm soát: 3-4
  màu chính, accent sáng dưới 15-20% diện tích, không để toàn áo thành một khối
  lòe loẹt.
- Tránh phối quá nhiều hue bão hòa cùng lúc, đặc biệt đỏ/cam/tím/xanh neon cạnh
  nhau. Nếu dùng màu nóng mạnh, cần có anchor trung tính hoặc vùng nghỉ.
- Background sales phải giúp áo nổi, không tranh vai. Nếu áo đã đỏ/cam mạnh,
  không dùng background đỏ/cam dày phía sau áo; chuyển sang neutral, charcoal,
  trắng/xám, xanh lạnh nhạt hoặc tone tối/sáng lệch hue.
- Các mẫu tốt có cảm giác: rõ form, phối màu có kỷ luật, motif đủ cá tính nhưng
  không rối, ảnh bán hàng sạch và zoom thấy áo.

## Market-fit theo phân khúc

### Công ty / ngân hàng

- Mục tiêu: lịch sự, tin cậy, đồng đội, có thể mặc trong event công ty.
- Palette: navy, royal blue, trắng, xám, đen, teal trầm, đỏ đô, xanh lá trầm;
  tránh neon và cầu vồng.
- Pattern: diagonal clean, sash nhẹ, contour lớn, color block gọn, line kỹ thuật
  lớn; tránh splatter, festival, flame quá mạnh, camo rối, gradient đa sắc.
- Logo/safe zone: vùng ngực trước và lưng phải yên để gắn logo/tên/số dễ đọc.

### Đại trà / CLB phong trào

- Có thể bắt mắt hơn, nhưng cần giữ một nền hoặc anchor ổn định.
- Cho phép gradient, speed shard, flame, street energy khi màu được khóa chặt và
  background sales không lấn áo.

## Người mẫu và crop sales

- Không lặp mặc định một pose đứng nghiêng nhìn từ trái sang phải.
- Trong batch, luân phiên pose: nhìn thẳng camera, ba phần tư nhìn camera, đứng
  thẳng chuyên nghiệp, bước nhẹ/chuyển động thể thao, tay chống hông hoặc cầm
  bóng tự nhiên khi không che áo.
- Ít nhất một phần đáng kể batch phải có model nhìn thẳng camera để tăng cảm giác
  kết nối và đỡ nhàm.
- Ảnh bán hàng ưu tiên crop từ đầu gối lên hoặc ba phần tư để zoom áo rõ trên
  mobile/catalog. Full-body chỉ dùng khi cần khoe quần/tổng set và vẫn phải giữ
  mặt áo lớn, đọc được pattern.
- Tránh để mặt/model chiếm vai chính. Sản phẩm áo trước/sau và quần phải là nhân
  vật chính.

## Trường bắt buộc trong design-spec

Mỗi spec mới phải có:

- `tasteProfileApplied: true`
- `likedSkuAnchors`: danh sách SKU tích cực hoặc chấp nhận được dùng làm gu.
- `avoidSkuAnchors`: danh sách SKU negative liên quan.
- `marketFitTarget`: ví dụ `corporate-bank`, `company-event`, `mass-market`,
  `youth-club`.
- `paletteDiscipline`: `corporate restrained`, `commercial balanced` hoặc
  `youth high-energy controlled`.
- `modelPosePlan`: mô tả pose/crop khác mặc định.
- `salesCrop`: ưu tiên `knee-up`, `three-quarter` hoặc `product-focus`.

## Hard reject bổ sung

- Brief công ty/ngân hàng nhưng áo dùng quá nhiều màu bão hòa, neon hoặc festival
  mix.
- Background sales cùng hue nóng mạnh với áo đến mức áo bị chìm hoặc tổng thể quá
  đỏ/cam.
- Model chỉ lặp pose đứng nghiêng nhìn từ trái sang phải trong nhiều sản phẩm.
- Sales image full-body quá nhỏ làm pattern áo khó xem.
- Mẫu có cảm giác khó bán dù kỹ thuật đúng: quá rối, thiếu vùng nghỉ, phối màu
  không có anchor hoặc không phù hợp phân khúc đã brief.
