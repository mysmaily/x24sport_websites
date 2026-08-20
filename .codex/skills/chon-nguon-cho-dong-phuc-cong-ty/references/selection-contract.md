# Hợp đồng tuyển chọn nguồn đồng phục công ty

Đọc đầy đủ tài liệu này khi dùng skill.

## Thang điểm 100

### 1. Phù hợp môi trường doanh nghiệp — 25 điểm

Ưu tiên hình ảnh gọn, chuyên nghiệp, dễ mặc cho đội ngũ đa dạng. Mẫu cần phù hợp văn phòng, bán hàng, sự kiện, vận hành hoặc team building; không mang cảm giác trang phục thi đấu chuyên nghiệp quá mạnh.

### 2. Khả năng đặt nhận diện thương hiệu — 20 điểm

Ưu tiên vùng ngực trái/phải rõ cho logo, vùng lưng cho tên công ty hoặc thông điệp, và cấu trúc không làm nhãn hiệu khó đọc.

### 3. Phối màu dễ áp dụng — 15 điểm

Ưu tiên nền màu rõ, có độ tương phản tốt cho logo và dễ mở rộng thành màu thương hiệu. Hạn chế chuyển sắc phức tạp, màu bẩn hoặc phối khó tái tạo hàng loạt.

### 4. Khả năng loại nhận diện nguồn — 15 điểm

Chấm khả năng thay logo, tên đội, nhà tài trợ, quốc kỳ, huy hiệu, số áo hoặc chữ nguồn mà vẫn giữ được cấu trúc áo. Không coi việc giữ biểu tượng thật rồi đổi nghĩa là hợp lệ.

### 5. Khác biệt so với bộ đã chọn — 15 điểm

Đánh giá giá trị bổ sung cho toàn bộ danh sách. Mẫu chỉ khác màu nhỏ hoặc cùng cấu trúc panel phải bị trừ điểm rõ rệt.

### 6. Chất lượng ảnh tham chiếu — 10 điểm

Ảnh phải rõ màu, form, cổ/tay, panel và họa tiết. Ảnh hỏng, thumbnail mờ, placeholder hoặc bị che không đạt.

Ngưỡng chọn: `70/100`.

## Điều kiện loại trực tiếp

- Ảnh không tải được hoặc không xác minh được màu, form, họa tiết.
- Mẫu dựa vào logo, huy hiệu, nhà tài trợ hoặc biểu tượng thật mà bỏ đi sẽ mất cấu trúc chính.
- Họa tiết quá dày, thiếu vùng đặt logo/tên công ty dễ đọc.
- Quá đặc thù thi đấu, quá trẻ con, hoặc không phù hợp môi trường doanh nghiệp.
- Gần trùng một mẫu có điểm cao hơn.

## Cổng đa dạng

- Không để một kiểu gradient/panel hoặc một tông màu chiếm đa số.
- Có độ phủ nền sáng, trung tính và màu nhấn nếu nguồn cho phép.
- Phân bổ các hướng: tối giản, panel, sọc, đường cong, hình học, họa tiết cục bộ.
- Mỗi lô 5 nên có ít nhất ba hướng màu/cấu trúc.

## JSON bàn giao

Khi cần JSON, lưu UTF-8 theo cấu trúc sau:

```json
{
  "schemaVersion": "1.0",
  "producerSkill": "chon-nguon-cho-dong-phuc-cong-ty",
  "source": { "baseUrl": "https://example.com/san-pham/", "scope": "pages 1-18", "scannedCount": 0 },
  "selectionPolicy": { "minimumScore": 70, "batchSize": 5 },
  "batches": [{
    "batch": 1,
    "items": [{
      "sourceId": "stable-source-id",
      "name": "Tên sản phẩm nguồn",
      "productUrl": "https://example.com/san-pham/mau/",
      "imageUrl": "https://example.com/image.webp",
      "localImagePath": "/absolute/path/selected-source-images/source.webp",
      "page": 1,
      "score": 85,
      "colors": ["Xanh navy", "Trắng"],
      "pattern": "panel chéo tối giản",
      "selectionReason": "Vùng logo ngực và lưng rõ, màu dễ quy đổi sang nhận diện thương hiệu.",
      "requiredRemovals": ["logo nguồn", "tên đội"]
    }]
  }],
  "rejectedDuplicateGroups": [],
  "sourceFailures": []
}
```

`localImagePath` phải tuyệt đối, trỏ đến ảnh đã xác minh và nằm trong `selected-source-images/`. Không đưa ảnh lỗi hoặc mẫu dưới ngưỡng vào lô.
