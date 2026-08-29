# Contract ảnh chào hàng

Đọc trước khi tạo `sales image`. Chọn đúng một layout cho mỗi sản phẩm.

## Layout `compact`

Dùng khi cần ảnh ecommerce gọn:

- mockup base vuông có model hoặc front/back garments;
- chừa một vùng title và một corner contact;
- đóng title, SKU, website và hotline bằng `scripts/apply_sales_signature.py`;
- không thêm collar/size controls nếu người dùng không cần.

## Layout `catalog-reference`

Dùng khi người dùng muốn ảnh chào hàng đầy đủ như benchmark:

`assets/catalog-sales-layout-reference.png` chỉ là **layout reference**. Chỉ học hierarchy:

- model Việt Nam toàn thân ở bên trái;
- vùng sản phẩm sáng bên phải;
- một áo front, một áo back và một quần;
- ba thumbnail cổ áo;
- một hàng size, CTA và footer contact.

Không sao chép kit xanh-trắng, logo, tiêu đề, hotline, website, UI chi tiết hoặc trade dress của benchmark.

### Tạo catalog base

Gọi `imagegen` với:

- Image 1 = approved front master;
- Image 2 = approved back master;
- Image 3 = benchmark layout;
- khi có mockup base đã duyệt, dùng nó làm edit target/source hình thể.

Output base phải:

- vuông tối thiểu 1200 px;
- model trái khoảng 38%, vùng sản phẩm phải khoảng 62%;
- dark stadium bên model, bright palette-tinted catalog stage bên sản phẩm;
- front/back shirts và đúng một shorts view;
- vùng header trống ở phần trên bên phải, cao khoảng 9% canvas; sản phẩm bắt đầu dưới 10% canvas;
- ba collar cards không chữ, không selected marker do AI tạo;
- vùng size row trống, không chữ/nút giả;
- vùng CTA và footer trống;
- không seller text, pseudo-lettering hoặc watermark.

Pattern front/back vẫn do hai master điều khiển tuyệt đối. Benchmark không được điều khiển thiết kế áo.

### Composite copy

Sau khi catalog base đạt, dùng:

```bash
python3 scripts/apply_catalog_sales_copy.py \
  --input marketing/<SKU>-catalog-base.webp \
  --output marketing/<SKU>-sales.webp \
  --title "<tên mẫu>" --sku <SKU> \
  --selected-collar v-neck \
  --price "GIÁ TỪ 125.000Đ" \
  --offer "IN TÊN + SỐ MIỄN PHÍ" \
  --material-line "VẢI MÈ THỂ THAO • THOÁNG MÁT • IN CHUYỂN NHIỆT" \
  --cta "XEM THÊM SẢN PHẨM" \
  --website mayaobongda.vn --hotline "0989 353 247"
```

Script đóng deterministic:

- collection label, title và `MÃ MẪU`;
- giá từ và ưu đãi in tên–số;
- nhãn `Cổ tròn`, `Cổ V`, `Cổ polo` và selected marker;
- dải size;
- chất liệu/công nghệ in và CTA;
- website và hotline.

Một poster `catalog-reference` chỉ đạt khi đủ cả sáu nhóm thông tin trên. `commercialTextExact` trong manifest đồng nghĩa vừa **đủ text bán hàng**, vừa đúng chính tả, dấu, SKU, giá và contact; không được duyệt cờ này cho poster chỉ có title/contact.

Nếu base không chừa đúng vùng normalized của contract, regenerate base. Không kéo text panel đè lên người hoặc sản phẩm.

## Visual gate

Hard reject nếu:

- benchmark text/brand lọt vào ảnh;
- áo front/back drift khỏi master;
- thiếu một trong front, back, shorts hoặc có hai shorts;
- collar thumbnail sai hình học; polo phải có folded collar và placket hai nút;
- text composite sai dấu/SKU/contact;
- thiếu giá, ưu đãi, chất liệu/công nghệ in hoặc CTA;
- controls hoặc footer che sản phẩm;
- ảnh thành poster phẳng, áo thiếu texture/đường may/nếp/bóng.

Ảnh chào hàng là derivative. Không dùng nó để tái tạo master hay làm file in.
