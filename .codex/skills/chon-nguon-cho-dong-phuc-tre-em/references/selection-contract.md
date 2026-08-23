# Hợp đồng tuyển chọn nguồn đồng phục trẻ em

Đọc đầy đủ tài liệu này khi dùng skill.

## Thang điểm 100

### 1. Phù hợp trẻ em và ngữ cảnh sử dụng — 25 điểm

Ưu tiên mẫu thân thiện, sáng sủa, năng động và dễ mặc cho trẻ mầm non, tiểu học, câu lạc bộ thiếu nhi, dã ngoại, sự kiện gia đình hoặc hoạt động ngoại khóa. Mẫu có thể vui nhưng không nên quá người lớn, quá nghiêm, quá hầm hố hoặc giống trang phục thi đấu chuyên nghiệp.

### 2. Khả năng đặt nhận diện trẻ em — 20 điểm

Ưu tiên vùng ngực và lưng đủ rõ cho tên lớp/nhóm, logo trường, tên bé, slogan ngắn hoặc biểu tượng hoạt động. Họa tiết không được làm chữ nhỏ khó đọc ở kích thước trẻ em.

### 3. Phối màu thân thiện và dễ sản xuất — 15 điểm

Ưu tiên màu tươi, sạch, có độ tương phản tốt, dễ lên ảnh nhóm và dễ phối cho cả bé trai/bé gái nếu brief không tách giới tính. Chấm thấp khi màu quá tối, quá chói gắt, bẩn, dễ gây cảm giác người lớn hoặc chuyển sắc quá khó tái tạo hàng loạt.

### 4. Khả năng loại nhận diện nguồn — 15 điểm

Đánh giá việc xóa logo, tên đội, nhà tài trợ, quốc kỳ, huy hiệu, số áo hoặc chữ nguồn mà vẫn giữ được cấu trúc áo. Không coi việc giữ biểu tượng thật rồi đổi nghĩa là hợp lệ.

### 5. Khác biệt so với bộ đã chọn — 15 điểm

Đánh giá giá trị bổ sung cho toàn bộ danh sách. Mẫu chỉ khác màu nhỏ hoặc cùng cấu trúc panel phải bị trừ điểm rõ rệt, nhất là khi nhìn ở thumbnail hoặc khi chuyển thành size trẻ em.

### 6. Chất lượng ảnh tham chiếu — 10 điểm

Ảnh phải rõ màu, form, cổ/tay, panel và họa tiết. Ảnh hỏng, thumbnail mờ, placeholder hoặc bị che không đạt.

Ngưỡng chọn: `70/100`.

## Điều kiện loại trực tiếp

- Ảnh không tải được hoặc không xác minh được màu, form, họa tiết.
- Mẫu dựa vào logo, huy hiệu, nhà tài trợ hoặc biểu tượng thật mà bỏ đi sẽ mất cấu trúc chính.
- Họa tiết quá dày, thiếu vùng đặt tên bé/tên lớp/logo dễ đọc.
- Quá đặc thù thi đấu, quá người lớn, quá hầm hố, gợi bạo lực, hoặc không phù hợp trẻ em.
- Màu sắc hoặc thông điệp thị giác dễ gây hiểu nhầm trong bối cảnh trẻ em.
- Gần trùng một mẫu có điểm cao hơn.

## Cổng đa dạng

- Không để một kiểu gradient/panel hoặc một tông màu chiếm đa số.
- Có độ phủ nền sáng, trung tính và màu nhấn nếu nguồn cho phép.
- Phân bổ các hướng: tối giản, panel mềm, đường cong, hình học nhẹ, sọc vui, họa tiết cục bộ hoặc mảng màu lớn.
- Mỗi lô 5 nên có ít nhất ba hướng màu/cấu trúc.
- Khi nguồn không đủ đa dạng, báo giới hạn thay vì chọn mẫu yếu để đủ số lượng.

## Nhóm gần trùng

Xem hai mẫu là gần trùng khi có cùng cấu trúc panel/họa tiết và chỉ thay màu nhỏ, hoặc cùng bảng màu và bố cục khiến sản phẩm đích khó phân biệt ở kích thước thumbnail.

Giữ mẫu theo thứ tự ưu tiên:

1. phù hợp trẻ em hơn;
2. vùng đặt tên/logo/slogan tốt hơn;
3. ảnh nguồn rõ hơn;
4. ít nhận diện thật cần xóa hơn;
5. phối màu dễ dùng hơn;
6. đóng góp đa dạng tốt hơn cho bộ cuối.

## Báo cáo Markdown

Tối thiểu gồm:

```markdown
# Tuyển chọn nguồn đồng phục trẻ em

- Phạm vi: ...
- Nhóm tuổi/ngữ cảnh: ...
- Đã rà: ... sản phẩm
- Được chọn: ...
- Bị loại: ...
- Kích thước lô: ...

## Lô 1

| Source ID | Sản phẩm | Điểm | Nhóm tuổi/ngữ cảnh | Phối màu/họa tiết | Lý do chọn | URL |
|---|---|---:|---|---|---|---|

## Các nhóm gần trùng đã loại

| Giữ lại | Đã loại | Lý do |
|---|---|---|

## Nguồn lỗi hoặc thiếu bằng chứng

| Source ID/URL | Lỗi | Trạng thái |
|---|---|---|
```

## JSON bàn giao

Khi có pipeline tạo ảnh tiếp theo, lưu JSON UTF-8 với cấu trúc:

```json
{
  "schemaVersion": "1.0",
  "producerSkill": "chon-nguon-cho-dong-phuc-tre-em",
  "source": {
    "baseUrl": "https://example.com/san-pham/",
    "scope": "pages 1-3",
    "scannedCount": 0
  },
  "selectionPolicy": {
    "minimumScore": 70,
    "batchSize": 5,
    "ageContext": "mầm non/tiểu học/thiếu nhi"
  },
  "batches": [
    {
      "batch": 1,
      "items": [
        {
          "sourceId": "stable-source-id",
          "name": "Tên sản phẩm nguồn",
          "productUrl": "https://example.com/san-pham/mau/",
          "imageUrl": "https://example.com/image.webp",
          "localImagePath": "/absolute/path/selected-source-images/source.webp",
          "page": 1,
          "score": 85,
          "ageContext": "tiểu học/CLB thiếu nhi",
          "colors": ["Xanh mint", "Trắng"],
          "pattern": "panel cong mềm",
          "selectionReason": "Màu sáng, vùng ngực và lưng rõ, họa tiết thân thiện với trẻ em.",
          "requiredRemovals": ["logo nguồn", "tên đội"]
        }
      ]
    }
  ],
  "rejectedDuplicateGroups": [],
  "sourceFailures": []
}
```

`localImagePath` phải tuyệt đối, trỏ đến ảnh đã xác minh và nằm trong `selected-source-images/`. Không đưa ảnh lỗi, ảnh chưa xem trực quan hoặc mẫu dưới ngưỡng vào lô.
