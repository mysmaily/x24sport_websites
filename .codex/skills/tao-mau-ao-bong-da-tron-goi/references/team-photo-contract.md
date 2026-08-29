# Contract ảnh tập thể đội bóng

Đọc trước khi tạo `team photo`. Đây là ảnh lifestyle/catalog phụ để khách hình
dung mẫu áo khi cả đội mặc thật trên sân. Ảnh này không phải master, không thay
thế mockup base và không dùng làm nguồn để tái tạo file in.

## Random số lượng người

Với `original-design`, lấy `teamPhoto` từ output của
`scripts/choose_creative_direction.py`. Script chọn ổn định theo SKU:

- `playerCount`: một số nguyên từ `5` đến `11`;
- `formation.id`/`promptNotes`: gợi ý formation phù hợp với số người.

Cùng SKU phải giữ nguyên số người qua retry. Không tự random lại bằng cảm tính
ở bước prompt. Nếu user yêu cầu rõ số người khác, ưu tiên brief của user và ghi
override vào `design-spec.json`.

## Input image roles

Khi gọi imagegen, dùng tối thiểu mockup base hoặc sales/mockup reference đã duyệt:

```text
Image 1 = approved kit mockup or sales image, chỉ dùng để giữ thiết kế áo/quần.
Image 2 = approved front master, dùng để giữ pattern mặt trước khi áo nhìn trực diện.
Image 3 = approved back master, dùng để giữ pattern mặt sau khi có người quay lưng.
```

Không redesign, simplify, recolor, mirror, swap hoặc invent pattern. Ảnh đội có
thể có variation tự nhiên do nếp vải, pose và ánh sáng, nhưng áo vẫn phải nhận
ra cùng một mẫu.

## Composition

- Ảnh photorealistic trên sân bóng Việt Nam hoặc sân tập ngoài trời.
- Số cầu thủ đúng `teamPhoto.playerCount`, thường là đội nam Việt Nam trưởng
  thành trừ khi brief nói khác.
- Formation theo `teamPhoto.promptNotes`: 5-6 người có thể một hàng, 7-11 người
  nên hai hàng đứng/crouch để mặt áo lớn và đọc được.
- Ưu tiên ảnh ngang hoặc 4:3/3:2; không ép vuông nếu đội bị chật.
- Camera ngang tầm mắt, ánh sáng tự nhiên, sân cỏ, khung thành/touchline hoặc
  lưới sân tập làm bối cảnh thật.
- Áo trước phải là bề mặt chính; chỉ có vài góc side/back nếu giúp ảnh tự nhiên.

## Text và branding

- Không thêm poster text, website, hotline, giá, SKU, watermark hoặc UI.
- Có thể giữ logo mẫu nhỏ trên ngực áo nếu đã có trong mockup/sales.
- Không thêm sponsor block, quốc kỳ, huy hiệu đội tuyển, logo CLB nổi tiếng
  hoặc nhận diện thương hiệu chưa được cấp quyền.
- Không thêm số áo lớn trừ khi brief hoặc sales spec yêu cầu; nếu có số, giữ
  nhỏ/tự nhiên và không làm lệch thiết kế.

## Visual gate

Hard reject nếu:

- số người không nằm trong `5-11` hoặc không đúng `teamPhoto.playerCount`;
- áo bị đổi palette, đổi motif, thành áo đội tuyển/CLB nổi tiếng hoặc sponsor lạ;
- mẫu áo giữa các cầu thủ không nhất quán;
- mặt áo quá nhỏ, bị che phần lớn, hoặc crop mất người;
- ảnh có text quảng cáo, watermark, pseudo-text hoặc UI;
- người bị biến dạng rõ, thiếu chi, mặt trùng lặp kỳ dị, phối cảnh sân sai nặng;
- background tranh vai với áo hoặc nhìn như poster CGI thay vì ảnh chụp thật.

Sau khi duyệt, lưu native output vào `work/<SKU>-team-photo-native-source.png`
và WebP lossless vào `marketing/<SKU>-team-photo.webp`. Không dùng script/Pillow
để sửa hình hoặc đắp thêm chi tiết sau imagegen; chỉ chuyển định dạng lossless.
