# Runtime contract — V2 fast path

## Brand constants
- Campaign logo: `../assets/mayaodongphuc-logo.png`
- Garment wordmark: `Đồng Phục X24`
- Hotline: `0982 254 458`
- Website: `mayaodongphuc.com.vn`
- Cast: believable Vietnamese adults with distinct faces and natural anatomy
- Brand impression: energetic, trustworthy, production-capable, commercial

The supplied garment controls the palette. Mayaodongphuc navy/orange are secondary accents only. The shirt is the product; bottoms are neutral styling.

## Main overlay — exact copy
- `THOÁNG MÁT`
- `CO GIÃN`
- `MAY NHANH - SỐ LƯỢNG LỚN`
- `BỀN MÀU`
- `0982 254 458`

Use compact outline icons where useful. No website on main.

## Catalog overlay — exact copy
Title: `ĐỒNG PHỤC` / `DÃ NGOẠI`

Slogan: `Bứt phá cùng đội nhóm`

Features:
- `THOÁNG MÁT TỐI ƯU` — `Chất vải cao cấp, thoáng khí, thấm hút mồ hôi nhanh`
- `CO GIÃN LINH HOẠT` — `Vận động thoải mái trong mọi hoạt động ngoài trời`
- `MAY NHANH - SỐ LƯỢNG LỚN` — `Đáp ứng đơn gấp, sản xuất số lượng lớn ổn định`
- `BỀN MÀU, DỄ BẢO QUẢN` — `Giữ áo luôn như mới sau nhiều lần giặt`

Detail captions:
- `VẢI MỀM MỊN` / `THOÁNG KHÍ`
- `FORM CHUẨN` / `NĂNG ĐỘNG`
- Ombre product: `THIẾT KẾ OMBRE` / `HIỆN ĐẠI`; otherwise describe actual visible signature design.
- `ĐƯỜNG MAY TỈ MỈ` / `BỀN ĐẸP`

Factory footer:
- `THIẾT KẾ THEO YÊU CẦU` — `Miễn phí thiết kế độc quyền`
- `SẢN XUẤT CHẤT LƯỢNG CAO` — `Công nghệ hiện đại, kiểm soát chất lượng`
- `GIAO HÀNG TOÀN QUỐC` — `Giao hàng nhanh chóng, đúng tiến độ`

Contact:
- `HOTLINE TƯ VẤN & ĐẶT HÀNG`
- `0982 254 458`
- `mayaodongphuc.com.vn`

## Scene rotation
Choose naturally from city park/botanical garden, beach/coastal boardwalk, resort lawn/courtyard, forest/picnic meadow, riverside/sports park, or lake/mountain. Main and catalog should use different families when practical.

## Approved hierarchy tokens
MAIN: full-bleed photo; shirts dominate; small campaign logo in clean top corner; translucent feature rail <=14%; no title/website/body copy.

CATALOG: >=60% photographic weight; distinct second scene; soft transparent information field; title+slogan+4 features+4 detail callouts+compact factory footer+hotline+website; no hard opaque sidebar.

Benchmark PNGs in `assets/` are troubleshooting-only and must not be opened on a normal run.

## Web delivery derivatives
Keep the published handoff images as PNG masters. When a web-optimized copy is requested, convert only from the final PNG master, avoid recompressing an existing WebP, and prefer WebP quality 96-100 or lossless/near-lossless for graphics with logo/text overlays. If file size is too high, reduce dimensions deliberately instead of dropping quality to 92, because text edges and garment details become visibly brittle.
