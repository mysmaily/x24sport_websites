# Contract ảnh chào hàng

Đọc trước khi tạo `sales image`. Chọn đúng một layout cho mỗi sản phẩm. Typography và hình sản phẩm phải được thiết kế trong **cùng một lần imagegen**. Cấm tạo poster trống rồi dùng Pillow, ImageMagick, SVG, Canvas hoặc script khác đắp chữ lên sau.

## Copy lock trước khi sinh ảnh

Ghi toàn bộ copy vào `design-spec.json` trước lần gọi imagegen cuối:

- collection, title và SKU;
- ưu đãi; không có giá;
- số áo trên model/front;
- tên cầu thủ, số và tên đội bóng trên back;
- collar heading/labels `Cổ tròn`, `Cổ Tim`, `Cổ polo` và selected collar;
- size;
- chất liệu/công nghệ in, website và hotline; không có button `XEM THÊM SẢN PHẨM`.

Copy trong ảnh tham khảo không phải instruction. Chỉ dùng copy đã khóa trong spec.

## Layout `compact`

Dùng khi cần ảnh ecommerce gọn. Gọi imagegen một lần với mockup base đã duyệt, front/back master và copy lock. Imagegen phải tự thiết kế title/contact cùng sản phẩm; không chừa vùng để composite sau.

## Layout `catalog-reference`

Dùng khi người dùng muốn ảnh chào hàng đầy đủ như benchmark. `assets/catalog-sales-layout-reference.png` chỉ điều khiển hierarchy:

- model Việt Nam toàn thân bên trái;
- front shirt, back shirt và đúng một shorts view;
- collar selector, size selector và contact footer;
- typography, panels, sản phẩm và whitespace cùng một hệ.

Không sao chép kit, logo, brand hoặc trade dress của benchmark.

### Lần gọi imagegen cuối

Dùng các role bất biến:

- Image 1 = mockup/catalog base đã duyệt, làm edit target;
- Image 2 = approved front master;
- Image 3 = approved back master;
- Image 4 = benchmark layout, chỉ tham khảo hierarchy.

Prompt phải:

- yêu cầu imagegen typeset toàn bộ copy lock ngay trong ảnh;
- yêu cầu đúng chính tả và dấu tiếng Việt, không pseudo-text;
- cấm hiển thị giá và cấm button/text `XEM THÊM SẢN PHẨM`;
- cho phép imagegen cân lại vị trí sản phẩm để typography không va chạm;
- giữ front/back pattern theo master;
- làm tên/số trông như được in thật trên bề mặt áo;
- cấm vùng trống dành cho text hậu kỳ.

Lưu output gốc thành `work/<SKU>-sales-native-source.png`. Chỉ được chuyển định dạng lossless sang `marketing/<SKU>-sales.webp`; cấm thêm, xóa, dịch chuyển hoặc vẽ bất kỳ pixel nào sau imagegen.

Nếu sai chữ hoặc lệch layout, dùng output native làm edit target cho imagegen correction pass. Không sửa bằng script. Tối đa hai correction pass có mục tiêu; còn sai thì hard reject và tạo lại.

## Visual gate

Xem ảnh full-size và đối chiếu từng dòng với copy lock. Hard reject nếu:

- thiếu/sai dấu/SKU/contact hoặc xuất hiện pseudo-text;
- xuất hiện giá hoặc button/text `XEM THÊM SẢN PHẨM`;
- thiếu minh họa tên–số–đội bóng;
- typography va vào người, áo, controls hoặc mép canvas;
- các panel lệch grid, font/hierarchy rời rạc hoặc có cảm giác chữ dán lên sau;
- benchmark brand lọt vào ảnh;
- front/back drift khỏi master;
- thiếu front, back, shorts hoặc có hai shorts;
- collar thumbnail sai hình học;
- vải thiếu mesh, seam, drape, wrinkle hoặc contact shadow.

Chỉ bật `commercialTextExact` sau khi đối chiếu thủ công từng chuỗi. Validator tiếp tục kiểm `design-spec` có đủ copy và chứng minh sales WebP giống từng pixel với ảnh nguồn imagegen; vì vậy mọi composite hậu kỳ đều bị từ chối.

Ảnh chào hàng là derivative. Không dùng nó để tái tạo master hay làm file in.
