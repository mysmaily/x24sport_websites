# Output contract bốn ảnh

## Cấu trúc

    generated/tao-mau-ao-bong-da-tron-goi/<batch-id>/<product-slug>/
      design-spec.json
      source-analysis.json                # chỉ khi reference-conversion
      print/
        <SKU>-front-print.png
        <SKU>-back-print.png
      marketing/
        <SKU>-sales.png
        <SKU>-team-photo.png
      delivery-manifest.json

Chỉ bốn file PNG là ảnh bàn giao. Không có mockup base, work source, preview,
WebP duplicate hoặc bản print được tạo lại ở kích thước khác.

## Manifest

build_delivery_manifest.py ghi đúng bốn role:

1. front print master
2. back print master
3. sales image
4. team photo

Manifest ghi pixel/hash thực tế, masterPolicy=builtin-imagegen-original, một lần
generate thành công cho mỗi side, không post-processing/resampling, absolute
logo reference và ba reference bắt buộc của sales/team theo thứ tự
front–back–logo.

validate_delivery.py không áp pixel floor. Nó kiểm format PNG, bốn path khác
nhau, front/back cùng kích thước và tỷ lệ portrait 0.60-0.75, checksum, logo
asset, player count và mười một cờ visual approval, gồm contact chính xác trên
cả ảnh sales và ảnh team.

## Delivery

Sau khi validator pass, deliver_print_masters.py chỉ copy hai file:

    /Volumes/Data/x24_project/mayaobongda.vn/<SKU>_truoc.png
    /Volumes/Data/x24_project/mayaobongda.vn/<SKU>_sau.png

SHA-256 tại volume phải giống canonical print master. Script từ chối ghi đè file
khác nội dung nếu không có yêu cầu --overwrite.
