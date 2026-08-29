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

## 5 style reference để chống lặp

Mỗi sản phẩm phải có đúng một `salesStyle` trong `design-spec.json`. Với
`original-design`, lấy style từ output của `scripts/choose_creative_direction.py`;
đừng tự chọn lại ở bước sales. Cùng SKU phải giữ cùng style qua retry. Style chỉ
điều khiển mood, ánh sáng, hierarchy và xử lý typography; không được đổi master,
palette sản phẩm, copy lock hoặc số lượng view bắt buộc.

Thư viện style nằm tại `assets/football-sales-styles.json`:

- `stadium-tech-showcase`: kiểu cũ đã dùng cho Orbit Rush, nền stadium tối,
  neon rail, model trái, product matrix phải, title thể thao lớn và control
  panels phía dưới.
- `clean-sky-studio`: nền sáng trắng/xanh trời, daylight, sản phẩm rất rõ,
  typography sạch, hợp áo xanh/trắng và collection trẻ trung.
- `night-tunnel-pro`: studio/tunnel đen cao cấp, vertical light bars, ít hiệu
  ứng nền hơn, sản phẩm cô lập sắc nét, hợp áo đỏ/đen hoặc mẫu tối giản.
- `minimal-ecommerce-grid`: bảng sản phẩm thương mại nền trung tính, ít drama,
  grid rõ, chữ gọn, dễ scan trên mobile và catalog.
- `street-futsal-energy`: sân futsal/urban, nét sơn chuyển động, năng lượng trẻ,
  nhưng vẫn giữ đủ front/back/shorts và chữ không bị nền cạnh tranh.

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

- dùng `salesStyle.promptNotes` đã khóa để quyết định mood, ánh sáng, nền, nhịp
  typography và cách trình bày controls;
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
