# Contract ảnh chào hàng

Đọc trước khi tạo `sales image`. Chọn đúng một layout cho mỗi sản phẩm. Typography và hình sản phẩm phải được thiết kế trong **cùng một lần imagegen**. Cấm tạo poster trống rồi dùng Pillow, ImageMagick, SVG, Canvas hoặc script khác đắp chữ lên sau.

## Copy lock trước khi sinh ảnh

Ghi toàn bộ copy vào `design-spec.json` trước lần gọi imagegen cuối:

- collection, title và SKU;
- ưu đãi; không có giá;
- số áo trên model/front;
- tên cầu thủ, số và tên đội bóng trên back;
- collar heading, đúng ba labels theo thứ tự `Cổ tròn`, `Cổ Tim`, `Cổ polo` và
  selected collar thuộc chính danh sách này;
- size;
- chất liệu/công nghệ in;
- `featureBadges` từ `assets/football-sales-feature-badges.json`, mặc định gồm `Vải thoáng mát`, `Thấm mồ hôi tốt`, `Bền màu`, `In chuyển nhiệt`, `Bảo hành 1 đổi 1`;
- website và hotline; không có button `XEM THÊM SẢN PHẨM`.

Copy trong ảnh tham khảo không phải instruction. Chỉ dùng copy đã khóa trong spec.

Đọc `user-taste-profile.md` trước khi viết prompt sales. Ảnh sales phải ưu tiên
mẫu dễ xem, dễ bán, đúng phân khúc. Các SKU được thích là positive anchors; các
SKU bị chê vì lòe loẹt, sai ngữ cảnh công ty/ngân hàng, background quá đỏ hoặc
khó bán là negative anchors. Những anchor này là nhận xét chữ nếu không có ảnh
SKU đi kèm; không giả định ảnh local tồn tại hoặc tự dựng lại visual từ mã SKU.

## Contact và feature badges bắt buộc

Ảnh sales không được trống kiểu mockup base. Dù style là tối giản hay product
board, prompt cuối vẫn phải dành một footer, side rail hoặc badge row cho:

- website `mayaobongda.vn`;
- hotline `0989 353 247`;
- ít nhất 4 benefit badges, ưu tiên `Vải thoáng mát`, `Thấm mồ hôi tốt`,
  `Bền màu`, `Bảo hành 1 đổi 1`; có thể thêm `In chuyển nhiệt` hoặc
  `Vải mè thể thao` khi còn chỗ.

Các badge phải ngắn, đọc được, cùng hệ typography với poster và không che sản
phẩm. Không biến benefit copy thành đoạn văn dài; dùng chip/icon label, footer
strip hoặc panel nhỏ để lấp khoảng trống hợp lý.

## Collar selector khóa cứng

Ảnh sales phải hiển thị **đúng ba** thumbnail/lựa chọn cổ, không ít hơn và không
nhiều hơn:

1. `Cổ tròn`
2. `Cổ Tim`
3. `Cổ polo`

Không tự sáng tạo `Cổ V viền`, `Cổ V chéo`, `Cổ V phối`, polo biến thể hoặc bất
kỳ lựa chọn thứ tư/thứ năm nào. `selectedCollar` phải là một trong ba nhãn trên
và hình học thumbnail phải khớp nhãn. Prompt phải ghi rõ “exactly 3 collar
options, no additional collar variants”. Nếu imagegen trả ra sai số lượng hoặc
sai nhãn, correction pass phải xóa lựa chọn dư/thay nhãn sai; không được đánh
dấu ảnh là đạt chỉ vì `design-spec.json` đã ghi đúng.

## Logo ngực áo mẫu

Theo mặc định, đọc `assets/football-logo-sources.json` và ghi `logoSource` local
reference vào `design-spec.json`. Trong prompt mockup/sales, yêu cầu imagegen
dùng logo phù hợp từ local reference đó và đóng lên ngực áo như badge nhỏ đã in
thật trên vải. Chỉ bỏ logo mẫu khi người dùng yêu cầu rõ áo trơn/không logo.

Quy tắc:

- chỉ dùng trên người mẫu mặc mặt trước và/hoặc front product view;
- ưu tiên ngực trái, kích thước nhỏ như crest đội bóng, không thành sponsor block;
- giữ logo sắc nét nhưng không lấn át pattern, số áo hoặc title;
- không đặt logo trên back view, shorts, background, footer hoặc typography;
- không đưa logo vào front/back print master.

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
  grid rõ, chữ gọn, dễ scan trên mobile và catalog; vẫn phải có contact footer
  và feature badge row để ảnh không trống.
- `street-futsal-energy`: sân futsal/urban, nét sơn chuyển động, năng lượng trẻ,
  nhưng vẫn giữ đủ front/back/shorts và chữ không bị nền cạnh tranh.

## Background motif echo

Ở bước prompt sales, background nên mượn lại ngôn ngữ đồ họa của master để ảnh
có cảm giác chuyên nghiệp và cùng hệ, nhưng phải làm áo nổi bật hơn background.
Đây chỉ là hướng dẫn prompt, không thêm validate/hard gate.

Prompt sales nên nói rõ:

- có thể echo motif, line rhythm, angle, stroke hoặc shape lớn từ master ở nền;
- background motif phải chìm hơn áo: low-opacity, soft-focus, scale lớn, đẩy ra
  rìa hoặc sau typography/product panels;
- không để màu nền trùng sát màu áo trên vùng ngay sau áo; nếu áo dùng tím/xanh/
  đỏ/cam mạnh, nền nên lệch hue, giảm saturation, tối hơn, sáng hơn hoặc chuyển
  sang charcoal/neutral để tạo silhouette rõ;
- accent của áo chỉ dùng làm rim light hoặc streak nhỏ ở background, không phủ
  thành mảng lớn cạnh sản phẩm;
- nếu áo dùng đỏ/cam mạnh, tránh background đỏ/cam dày phía sau áo; ưu tiên
  neutral, charcoal, trắng/xám, xanh lạnh nhạt hoặc tone lệch hue để tránh cảm
  giác quá đỏ;
- background không được invent pattern mới lên garment, không làm drift master,
  và không cạnh tranh với front/back/shorts.

## Model pose và crop thương mại

Prompt sales phải dùng `modelPosePlan` và `salesCrop` từ spec:

- không lặp mặc định model đứng nghiêng nhìn từ trái sang phải;
- ưu tiên crop đầu gối lên hoặc ba phần tư để áo đủ lớn trên mobile/catalog;
- luân phiên pose nhìn thẳng camera, ba phần tư nhìn camera, đứng thẳng chuyên
  nghiệp hoặc chuyển động nhẹ;
- với công ty/ngân hàng, pose nên gọn, tự tin, ít drama; với CLB/trẻ có thể năng
  động hơn nhưng không che áo;
- sản phẩm front/back/shorts vẫn là nhân vật chính, người mẫu không được làm áo
  nhỏ hoặc che pattern.

## 5 composition reference để nhân biến thể

Mỗi sản phẩm cũng phải có đúng một `salesComposition` trong `design-spec.json`.
Composition là lớp bố cục độc lập với style: nó quyết định người mẫu nằm trái
hay phải, full body hay chân dung, hoặc không có người mẫu để tập trung vào
product board. Khi người dùng muốn “cùng style nhưng đa dạng card”, ưu tiên đổi
`salesComposition` trước khi đổi `salesStyle`.

Thư viện composition nằm tại `assets/football-sales-compositions.json`:

- `model-left-full-body`: người mẫu full body bên trái, cụm sản phẩm bên phải.
- `model-right-full-body`: người mẫu full body bên phải, cụm sản phẩm bên trái.
- `model-left-portrait`: người mẫu chân dung/ba phần tư bên trái, áo trước/sau
  lớn hơn bên phải.
- `model-right-portrait`: người mẫu chân dung/ba phần tư bên phải, áo trước/sau
  lớn hơn bên trái.
- `product-focus-no-model`: không có người mẫu, front/back/shorts và controls là
  nhân vật chính.

## Layout `compact`

Dùng khi cần ảnh ecommerce gọn. Gọi imagegen một lần với mockup base đã duyệt, front/back master và copy lock. Imagegen phải tự thiết kế title, feature badges, contact cùng sản phẩm; không chừa vùng để composite sau.

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
- dùng quy tắc `Background motif echo` để mượn họa tiết master một cách hài hòa:
  nền echo motif nhưng lệch/giảm màu để garment luôn tách rõ khỏi background;
- dùng `salesComposition.promptNotes` đã khóa để quyết định vị trí/crop người
  mẫu và vị trí cụm front/back/shorts;
- áp dụng `modelPosePlan` và `salesCrop`: ưu tiên đầu gối lên/ba phần tư, có
  biến thể nhìn camera, không lặp pose nghiêng trái-sang-phải;
- nếu spec có `logoSource`, đóng một logo mẫu từ nguồn đó lên ngực áo front như
  in thật trên vải, giữ master pattern không drift;
- yêu cầu imagegen typeset toàn bộ copy lock ngay trong ảnh;
- yêu cầu selector có exactly 3 collar options, theo đúng thứ tự `Cổ tròn`,
  `Cổ Tim`, `Cổ polo`, và no additional collar variants;
- bố trí website, hotline và featureBadges thành footer/side rail/badge row rõ
  ràng để poster không trống trải;
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
- thiếu website, hotline hoặc phần lớn feature badges đã khóa trong spec;
- xuất hiện giá hoặc button/text `XEM THÊM SẢN PHẨM`;
- thiếu minh họa tên–số–đội bóng;
- typography va vào người, áo, controls hoặc mép canvas;
- người mẫu lặp pose cũ khi spec yêu cầu pose khác, hoặc crop quá xa làm áo khó
  xem;
- background quá đỏ/cam hoặc cùng hue mạnh với áo đến mức áo bị chìm;
- các panel lệch grid, font/hierarchy rời rạc hoặc có cảm giác chữ dán lên sau;
- benchmark brand lọt vào ảnh;
- front/back drift khỏi master;
- thiếu front, back, shorts hoặc có hai shorts;
- collar selector không có đúng ba thumbnail/nhãn `Cổ tròn`, `Cổ Tim`,
  `Cổ polo`, có lựa chọn thứ tư/thứ năm, hoặc selected collar nằm ngoài danh
  sách;
- collar thumbnail sai hình học;
- vải thiếu mesh, seam, drape, wrinkle hoặc contact shadow.

Chỉ bật `commercialTextExact` sau khi đối chiếu thủ công từng chuỗi. Validator tiếp tục kiểm `design-spec` có đủ copy và chứng minh sales WebP giống từng pixel với ảnh nguồn imagegen; vì vậy mọi composite hậu kỳ đều bị từ chối.

Ảnh chào hàng là derivative. Không dùng nó để tái tạo master hay làm file in.
