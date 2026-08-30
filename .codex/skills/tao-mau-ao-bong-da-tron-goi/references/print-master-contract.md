# Print master trực tiếp từ built-in imagegen

Mỗi side là một PNG artwork phẳng, full-bleed để xưởng dùng làm nền in:

    print/<SKU>-front-print.png
    print/<SKU>-back-print.png

Hai file này phải là output gốc được lưu trực tiếp từ lần tạo thành công đầu tiên
của built-in imagegen. Không tồn tại bước source nhỏ, upscale, resize, crop,
enhance, resample, đổi format, thêm PPI hoặc tái tạo bản lớn.

## Canvas và nội dung

- Portrait gần tỷ lệ thân áo xưởng, chấp nhận aspect ratio 0.60-0.75; 2:3 là
  lựa chọn mặc định phù hợp với output built-in imagegen.
- Không áp pixel floor. Validator ghi đúng kích thước thật của file.
- Front và back phải cùng kích thước output gốc.
- Chỉ có màu/pattern full-bleed; không có silhouette áo, cổ, tay, đường may, rập,
  model, hanger, nếp vải, ánh sáng, text, số, logo, crest, sponsor, watermark,
  website hoặc hotline.
- Front/back cùng palette và motif family nhưng back không mirror/copy front.
  Back giữ vùng giữa yên để đặt tên/số; hai mép chỉ cần edge-coherent khi chưa có
  rập chính xác.

## Single-generation rule

Front và back mỗi side có đúng một output sau lần gọi imagegen thành công. Không
correction pass và không regenerate. Nếu tool lỗi mà chưa trả ảnh thì có thể gọi
lại; khi ảnh đã tồn tại, dùng nguyên file đó xuyên suốt sales, team, validation
và delivery.

Mặc định sRGB. Không tự gắn CMYK/ICC hoặc tuyên bố PPI/khổ vật lý không có trong
file. Proof màu theo vải, mực và máy ép là việc riêng của xưởng, không được dùng
làm lý do chặn workflow bốn ảnh.
