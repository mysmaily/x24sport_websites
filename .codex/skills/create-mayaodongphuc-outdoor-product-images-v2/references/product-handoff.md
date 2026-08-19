# Product handoff — V2

Write `product-handoff.json` beside accepted publishing images. Use absolute final paths and SHA-256 of final bytes. List delivered publishing images only. Populate from the garment lock recorded before generation rather than re-inspecting images.

Use the existing schema expected by `scripts/validate_product_handoff.py`.

Required constants:
- `schemaVersion`: `1.0`
- `producerSkill`: `create-mayaodongphuc-outdoor-product-images-v2`
- `consumerPolicy.visualInspection`: `not-required-after-validation`

Default accepted images in order:
1. main: role `product hero`, aspectRatio `1:1`, gallery true, contentEmbed false.
2. catalog: role `content-inline catalog`, aspectRatio `5:4`, gallery true, contentEmbed true, contentOrder 1.

For sleeveless normalization add a `sourceTransformations` record: field `sleeves`, from `áo ba lỗ hoặc khoét nách sâu`, to `tay ngắn set-in`, reason `chuẩn hóa đồng phục dã ngoại`. Then `garmentFacts.sleeves` must be `tay ngắn`.

Conservative defaults unless user facts justify more:
- audiences: `doanh nghiệp`, `đội nhóm`, `câu lạc bộ`, `lớp học`
- useCases: `dã ngoại`, `picnic`, `team building`, `sự kiện nhóm`
- unsupportedClaims: `fabric composition`, `GSM`, `named printing process`, `wash-cycle count`, `fixed delivery time`, `fixed price`
- suggestedCategory: `Đồng phục dã ngoại - team building` / `dong-phuc-da-ngoai-team-building`

Overlay constants: `mayaodongphuc-logo.png`, `Đồng Phục X24`, `0982 254 458`; catalog also `mayaodongphuc.com.vn`.

`altSeed` = concise factual accessibility text about garment + meaningful scene. `captionSeed` = natural buyer-facing merchandising copy. Do not begin with inventory labels, model counts, nationality, `Ảnh chụp`, `Hình ảnh`, `Catalog`, `Poster`, `ảnh chính`, or `ảnh số 2`.

After writing manifest, calculate checksums and run validator. Do not reopen images solely for hashing.
