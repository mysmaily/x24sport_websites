# Hợp đồng tuyển chọn nguồn

Đọc toàn bộ tài liệu này khi dùng skill.

## Thang điểm 100

### 1. Phù hợp môi trường học sinh — 25 điểm

Đánh giá khả năng dùng cho áo lớp, CLB trường, kỷ yếu, ngày hội và hoạt động ngoại khóa. Mẫu trẻ trung nhưng không trẻ con, không mang cảm giác đồng phục thi đấu chuyên nghiệp quá mạnh.

### 2. Khả năng đặt nhận diện lớp — 20 điểm

Ưu tiên mẫu có vùng ngực đủ rõ cho mã lớp và vùng lưng đủ thoáng cho slogan hoặc logo. Họa tiết có thể đi qua thân áo nhưng không được làm artwork lớp mất khả năng đọc.

### 3. Phối màu dễ sử dụng — 15 điểm

Màu cần dễ mặc trong tập thể và vẫn nhận diện tốt trên ảnh nhóm. Mẫu sáng, trung tính và nổi bật đều hợp lệ; chấm thấp khi màu bẩn, quá tối hoặc chuyển sắc khó tái tạo.

### 4. Khả năng loại nhận diện nguồn — 15 điểm

Đánh giá việc xóa logo, tên đội, nhà tài trợ, quốc kỳ, huy hiệu, ngôi sao, số áo hoặc chữ nguồn mà không phá cấu trúc thiết kế. Không giả định có thể giữ biểu tượng thật rồi đổi nghĩa.

### 5. Khác biệt so với bộ đã chọn — 15 điểm

Chấm theo giá trị bổ sung cho toàn bộ bộ sản phẩm, không chỉ theo vẻ đẹp độc lập. Một phối màu hoặc cấu trúc gần trùng mẫu đã chọn phải bị trừ điểm rõ rệt.

### 6. Chất lượng ảnh tham chiếu — 10 điểm

Ảnh phải đủ lớn và rõ để xác minh màu, form, cổ/tay áo, panel và họa tiết chính. Ảnh HTML lỗi, placeholder, thumbnail mờ hoặc ảnh bị che nhiều không đạt.

Ngưỡng chọn: `70/100`.

## Điều kiện loại trực tiếp

- Ảnh nguồn không tải được hoặc không phải ảnh hợp lệ.
- Không xác định đáng tin cậy màu, form hoặc họa tiết chính.
- Họa tiết phủ dày khiến mã lớp và slogan không còn vùng đọc tốt.
- Thiết kế phụ thuộc vào logo, huy hiệu hoặc biểu tượng đội thật đến mức xóa đi sẽ mất cấu trúc chính.
- Quá đặc thù thi đấu và không thể chuyển thành áo lớp hợp lý.
- Gần trùng một mẫu có điểm cao hơn.
- Không phù hợp lứa tuổi hoặc môi trường học sinh.

## Cổng đa dạng cho cả bộ

Sau khi chấm điểm cá nhân, kiểm tra toàn bộ danh sách:

- không để một tông màu hoặc một kiểu gradient chiếm phần lớn bộ;
- có sự cân bằng giữa mẫu sáng, trung tính và nổi bật khi nguồn cho phép;
- phân bổ các ngôn ngữ thiết kế như panel, gradient, nét cọ, hình học, sọc, đường cong hoặc tối giản;
- mỗi lô 5 nên có ít nhất ba nhóm màu hoặc cấu trúc thị giác khác nhau;
- khi nguồn không đủ đa dạng, báo giới hạn thay vì chọn mẫu yếu để tạo cảm giác cân bằng giả.

## Nhóm gần trùng

Xem hai mẫu là gần trùng khi có cùng cấu trúc panel/họa tiết và chỉ thay màu nhỏ, hoặc cùng bảng màu và bố cục khiến sản phẩm đích khó phân biệt ở kích thước thumbnail.

Giữ mẫu theo thứ tự ưu tiên:

1. vùng đặt mã lớp/slogan tốt hơn;
2. ảnh nguồn rõ hơn;
3. ít nhận diện thật cần xóa hơn;
4. phối màu dễ dùng hơn;
5. đóng góp đa dạng tốt hơn cho bộ cuối.

## Báo cáo Markdown

Tối thiểu gồm:

```markdown
# Tuyển chọn nguồn đồng phục học sinh

- Phạm vi: ...
- Đã rà: ... sản phẩm
- Được chọn: ...
- Bị loại: ...
- Kích thước lô: ...

## Lô 1

| Source ID | Sản phẩm | Điểm | Phối màu/họa tiết | Lý do chọn | URL |
|---|---|---:|---|---|---|

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
  "producerSkill": "chon-nguon-cho-dong-phuc-hoc-sinh",
  "source": {
    "baseUrl": "https://example.com/san-pham/",
    "scope": "pages 1-3",
    "scannedCount": 0
  },
  "selectionPolicy": {
    "minimumScore": 70,
    "batchSize": 5
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
          "localImagePath": "/absolute/path/source.webp",
          "page": 1,
          "score": 85,
          "colors": ["Xanh", "Trắng"],
          "pattern": "panel cong",
          "selectionReason": "Vùng ngực và lưng rõ, màu phù hợp học sinh.",
          "requiredRemovals": ["logo nguồn", "tên đội"]
        }
      ]
    }
  ],
  "rejectedDuplicateGroups": [],
  "sourceFailures": []
}
```

Yêu cầu JSON:

- `sourceId` ổn định trong hệ thống nguồn;
- URL đầy đủ, không dùng URL tương đối;
- `localImagePath` là đường dẫn tuyệt đối và trỏ tới ảnh đã xác minh hợp lệ;
- mỗi item có điểm, lý do chọn và danh sách thành phần cần loại bỏ;
- không đưa sản phẩm chưa đạt ngưỡng vào `batches`;
- không đưa ảnh lỗi vào danh sách bàn giao như một ảnh hợp lệ.
