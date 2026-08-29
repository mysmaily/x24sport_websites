# Marketing Brand Signature

Áp dụng riêng cho ảnh `<SKU>-marketing.webp`. Mục tiêu là một dấu thương mại kín đáo như credit line của catalog cao cấp, không phải tem giá hoặc banner quảng cáo.

## Hierarchy khóa ở canvas 1254 px

- Logo thật cao khoảng 44-54 px, không bóp méo hoặc đổi màu.
- `MÃ MẪU: <SKU>`: 12-14 px, regular/semibold, màu slate/navy dịu.
- `0982 254 458`: 16-18 px, semibold; đây là dòng chính trong signature nhưng không được cạnh tranh với artwork.
- `mayaodongphuc.com.vn`: 11-13 px, regular, màu trung tính đậm vừa.
- Ba dòng phải khác cỡ hoặc weight rõ ràng. Không dùng display face, condensed poster font, outline chữ, all-caps 800/900 hoặc letter spacing âm.

Tỷ lệ scale tuyến tính theo cạnh ngắn khi canvas khác 1254 px. Không tăng signature vượt tỷ lệ chỉ để đọc được trong contact sheet.

## Composition

- Chọn một corner có negative space sau khi xem ảnh áo chưa branding.
- Cách mép 24-32 px ở canvas 1254 px; không sát viền, không chạm áo, tay áo, bóng áo, artwork hoặc đạo cụ chính.
- Nền signature là neutral scrim trắng 86-92% opacity với shadow rất nhẹ; không stroke, không blue/orange outline, không capsule/pill và không border đôi.
- Có thể dùng một divider neutral 1 px giữa logo và text. Logo tự cung cấp brand color; không thêm thanh cam/xanh bão hòa quanh card.
- Rộng tối đa 32%, cao tối đa 8% cạnh ảnh, diện tích tối đa 2.5% canvas.
- Không dùng footer full-width. Trong một batch, giữ nguyên layout/type system; chỉ đổi corner để phù hợp negative space.

## Hard reject

- Cụm trông như sticker, tem bảo hành, thẻ giá, nút CTA hoặc banner khuyến mại.
- Viền xanh/cam dày, rounded rectangle nổi bật, glow, bevel, shadow nặng hoặc nhiều lớp khung.
- Logo lớn ngang hàng với sản phẩm; hotline hoặc SKU dùng font poster quá đậm.
- Cả ba dòng cùng cỡ/cùng weight, text dồn sít hoặc thiếu khoảng thở.
- Signature che áo hoặc làm mắt nhìn vào contact trước artwork.
- Logo/contact do imagegen vẽ hoặc gõ; composite chồng lên một signature cũ.

## Cách tạo

Dùng script deterministic sau khi ảnh áo chưa branding đã vượt visual gate:

```bash
python3 scripts/apply_marketing_brand_signature.py \
  --input /absolute/path/to/approved-unbranded.webp \
  --output /absolute/path/to/X24-DP-NNNNNN-marketing.webp \
  --sku X24-DP-NNNNNN \
  --position bottom-right
```

Các position hợp lệ: `top-left`, `top-right`, `bottom-left`, `bottom-right`. Sau khi chạy, xem full-size bằng `view_image`; script bảo đảm copy và tỷ lệ, nhưng không biết vùng áo nằm ở đâu nên người thực hiện vẫn phải xác nhận negative space và hierarchy thị giác.
