# Creative System For Large Batches

## Mục tiêu

Tạo số lượng lớn mà catalog vẫn đọc thành nhiều ý tưởng thật, không phải cùng một mascot đổi màu.

## Ma trận sáng tạo

Khóa mỗi sản phẩm bằng ít nhất bảy trục:

1. **Subject family:** emoji; nhóm người; nhân vật đơn; đồ vật có tính cách; đồ ăn; môn học; thể thao; thiên nhiên; fantasy/sci-fi; động vật.
2. **Visual style:** comic; chibi; retro badge; sticker; graffiti; manga; flat vector; hand-drawn; collegiate; pop-art.
3. **Layout:** stacked type; circular badge; character above type; type around character; diagonal burst; emblem; framed scene; mascot-and-ribbon.
4. **Message tone:** vui nhộn; đoàn kết; thanh xuân; tự tin; khám phá; sáng tạo; học tập; thi đấu; kỷ niệm.
5. **Identity:** lớp; khóa; CLB; nhóm bạn; đội; khoa; chuyến đi. Chỉ dùng identity generic khi người dùng chưa cung cấp.
6. **Palette:** 3-6 màu mực có tương phản; không chỉ hue-shift một thiết kế cũ.
7. **Shirt color + marketing scene:** màu áo và scene phải hỗ trợ artwork nhưng không được dùng để che một concept trùng.

`uniquenessSignature` nối giá trị của bảy trục. Không lặp signature trong registry.

## Quy tắc phân bổ mặc định

Trong mỗi 100 sản phẩm:

- động vật tối đa 25;
- emoji tối thiểu 10;
- hoạt hình người tối thiểu 20;
- đồ vật/đồ ăn/môn học/thể thao tối thiểu 20;
- fantasy, sci-fi, thiên nhiên và các hướng còn lại dùng để cân bằng.

Không cần ép đúng tỷ lệ nếu brief của người dùng đã khóa một họ chủ thể.

## Lập batch-plan

Với batch lớn, tạo `batch-plan.json` trước khi generate:

```json
{
  "batchId": "ao-lop-001",
  "products": [
    {
      "productSlug": "he-gen-z-10a3",
      "slogan": "HỆ GEN Z",
      "identity": "LỚP 10A3",
      "subject": "emoji đeo tai nghe",
      "style": "pop-art comic",
      "layout": "stacked type",
      "palette": ["yellow", "blue", "coral", "black"],
      "shirtColor": "black",
      "marketingScene": "student flat-lay",
      "uniquenessSignature": "emoji|pop-art-comic|stacked-type|HỆ-GEN-Z|LỚP-10A3|yellow-blue-coral-black|black"
    }
  ]
}
```

Trước mỗi đợt 10-25 sản phẩm:

- so signature với `batch-registry.jsonl`;
- rà hai sản phẩm kề nhau khác ít nhất ba trục;
- rà slogan, identity và màu áo không lặp liên tiếp;
- ghi trạng thái `planned`, `master-approved`, `marketing-approved`, hoặc `rejected`.

Chỉ thêm signature vào registry sau khi cả hai ảnh đã qua acceptance gate.

## Slogan

Slogan ngắn 2-7 từ thường cho chất lượng chữ tốt hơn. Có thể dùng các nhóm nghĩa:

- `VUI LÀ CHÍNH`, `VUI HẾT NẤC`, `HỆ GEN Z`;
- `CÙNG LỚP CÙNG CHẤT`, `CHUNG MỘT THANH XUÂN`, `MỘT ĐỘI MỘT NHỊP`;
- `DÁM MƠ DÁM LÀM`, `CÙNG NHAU TỎA SÁNG`, `KHÁC BIỆT ĐỂ NỔI BẬT`;
- `ĐI ĐÂU CŨNG CÓ NHAU`, `CHƠI LÀ CHẤT`, `NĂNG LƯỢNG VÔ BIÊN`.

Đây là seed, không phải danh sách đóng. Không dùng cùng slogan cho nhiều sản phẩm trong một batch trừ khi người dùng đang yêu cầu biến thể có chủ đích.
