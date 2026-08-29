# Creative System Cho Áo Thất Tình

Đọc file này khi tạo batch lớn, khi người dùng chưa đưa slogan, hoặc khi cần chống trùng concept.

## Trục concept

Mỗi sản phẩm chọn một giá trị chính ở mỗi trục:

| Trục | Lựa chọn |
|---|---|
| Mood | `tu-trao`, `chua-lanh`, `vui-nhon`, `toi-gian`, `meme-sach`, `ban-than-truoc-tinh-yeu` |
| Chủ thể | trái tim băng bó, điện thoại im lặng, lịch move-on, ly trà sữa, playlist, bó hoa héo hài hước, nhân vật hoạt hình generic, đồ ăn/đồ vật có cảm xúc |
| Layout | badge trung tâm, typographic stack, mascot + ribbon, sticker sheet gọn, crest giả tưởng không huy hiệu thật, poster mini clean |
| Style | screen-print retro, flat vector, comic cute, editorial minimal, doodle học trò, pixel soft |
| Palette | pastel tương phản, đỏ/rêu, hồng/xanh navy, vàng/đen sạch, xanh mint/tím nhạt, trắng/đen/đỏ điểm nhấn |
| Shirt color | trắng, đen, kem nhạt, xanh navy, hồng pastel, xanh mint, xám nhạt |

Hai sản phẩm liên tiếp phải khác ít nhất ba trục. Trong 20 sản phẩm, không để cùng một mood vượt 35% batch và không để cùng một câu motif xuất hiện quá 2 lần.

## Slogan an toàn

Ưu tiên câu ngắn, dễ đọc trên áo, có dấu tiếng Việt đúng. Không dùng tên người thật.

- `Hết duyên vẫn đẹp`
- `Độc thân nhưng có gu`
- `Tim vỡ, áo vẫn xinh`
- `Move on nhưng phải đồng phục`
- `Tạm biệt drama`
- `Yêu bản thân trước`
- `Không còn người ấy, còn tụi mình`
- `Trái tim bảo trì`
- `Tình yêu nghỉ phép`
- `Buồn vừa thôi, đẹp tiếp`
- `Ế có tổ chức`
- `Chia tay nhưng không chia đội`
- `Không rep tin nhắn, rep đơn áo`
- `Một mình vẫn rực rỡ`
- `Hôm nay tim offline`

Identity generic có thể là `Team Move On`, `CLB Tim Khỏe`, `Hội Độc Thân Vui Tính`, `Lớp Vui Trở Lại`, `Biệt Đội Hết Sầu`. Không bịa lớp/trường thật nếu người dùng chưa cung cấp.

## Hard Reject Nội Dung

Không dùng hoặc phải viết lại:

- câu đe dọa, trả thù, theo dõi, kiểm soát hoặc làm nhục người cũ;
- câu tuyệt vọng cực đoan, nhắc tự hại, chết chóc, rượu bia/chất kích thích như giải pháp;
- body shaming, miệt thị giới tính, định kiến tình dục, xúc phạm cá nhân;
- cảnh học sinh hẹn hò nhạy cảm, pose người mẫu quá trưởng thành, nightlife hoặc phòng ngủ;
- nhân vật có bản quyền, logo app/brand, ảnh người thật hoặc tên người thật.

## Batch Plan

Với batch lớn, tạo `batch-plan.json` trước khi gọi imagegen:

```json
{
  "skill": "tao-anh-ao-that-tinh",
  "batchId": "that-tinh-YYYYMMDD-HHMM",
  "targetCount": 12,
  "audience": "ao lop/nhom ban",
  "products": [
    {
      "sku": "reserved later by allocate_sku.py",
      "productSlug": "ao-nhom-het-duyen-van-dep",
      "productTitle": "Áo nhóm Hết Duyên Vẫn Đẹp",
      "slogan": "Hết duyên vẫn đẹp",
      "identity": "Team Move On",
      "heartbreakMood": "chua-lanh",
      "subject": "trái tim băng bó cầm hoa nhỏ",
      "style": "screen-print retro",
      "layout": "mascot + ribbon",
      "palette": ["đỏ san hô", "xanh rêu", "kem"],
      "shirtColor": "kem nhạt",
      "categorySlugs": ["dong-phuc-ngo-nghinh"],
      "safetyNotes": "không nhắm tới cá nhân, không bi lụy độc hại"
    }
  ]
}
```

Sau mỗi đợt, kiểm tra uniqueness signature, lỗi chữ tiếng Việt, tỉ lệ mood, màu áo, và mức độ an toàn của mọi câu slogan trước khi tiếp tục.
