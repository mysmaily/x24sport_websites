---
name: tao-mau-ao-bong-da-tron-goi
description: "Sáng tạo mẫu áo bóng đá nguyên bản theo quy trình master-first: tạo nền in phẳng mặt trước và mặt sau chất lượng cao trước, rồi tạo mockup và ảnh chào hàng trung thành với đúng hai master đó. Dùng cho mẫu catalog mới hoặc thiết kế đội bóng đặt riêng; không dùng để sao chép áo CLB có bản quyền hay chỉ chuyển ảnh áo nguồn thành mockup."
---

# Tạo mẫu áo bóng đá trọn gói

Mỗi sản phẩm phải đi theo chuỗi bất biến:

```text
design-spec -> front print master -> back print master -> mockup base -> sales image
```

Master in là nguồn sự thật. Không được tạo mockup trước rồi tái tạo họa tiết từ mockup. Mọi correction pass của mockup phải dùng lại đúng hai master đã duyệt.

Đây là workflow `images-only`: tạo file sản xuất và ảnh chào hàng, nhưng không đăng CMS, không tạo sản phẩm và không triển khai website nếu người dùng chưa yêu cầu riêng.

## Trước khi tạo

- Xác định số mẫu, nhóm người mặc, màu bắt buộc/cấm, kiểu cổ, tay áo, có quần hay không và brand dùng trên ảnh chào hàng. Nếu thiếu, dùng mặc định trong skill này thay vì dừng hỏi.
- Nếu người dùng đưa ảnh tham khảo, dùng nó để hiểu mức độ năng động, bố cục hoặc loại sản phẩm; không coi poster/mockup là file in và không sao chép logo, huy hiệu, sponsor, watermark hoặc bộ nhận diện của đội/nhãn khác.
- Cấp SKU `X24-BD-NNNNNN` bằng `scripts/allocate_sku.py`; một SKU theo sản phẩm từ master đến ảnh chào hàng.
- Chạy `scripts/choose_creative_direction.py` để khóa hướng sáng tạo. Đọc [creative-system.md](references/creative-system.md) khi tạo batch hoặc khi cần tránh lặp mẫu.
- Đọc [print-master-contract.md](references/print-master-contract.md) trước khi tạo/xuất master và [mockup-contract.md](references/mockup-contract.md) trước khi tạo derivative bán hàng.
- Đọc [output-contract.md](references/output-contract.md) trước khi đóng gói hoặc validate.

Mặc định khi người dùng chưa cung cấp thông số xưởng:

- in chuyển nhiệt trên polyester;
- mỗi nền phẳng 700 × 850 mm, 300 PPI, PNG lossless, sRGB;
- nền full-bleed không trong suốt;
- ảnh chào hàng dùng `mayaobongda.vn`, hotline `0989 353 247`;
- master không chứa tên cầu thủ, số áo, logo đội, sponsor hoặc size/cutline.

Phải báo rõ: master raster này là nền đồ họa để xưởng đặt lên rập. Nó không phải rập may, file vector, file tách màu hay file CMYK/ICC của máy in nếu xưởng chưa cung cấp các tài nguyên đó.

## Khóa concept trước khi sinh ảnh

Tạo `design-spec.json` trước bất kỳ ảnh nào, gồm tối thiểu:

- SKU, tên concept, đối tượng, sport, kiểu cổ/tay và bộ sản phẩm;
- palette bằng mã HEX và vai trò từng màu;
- `motifFamily`, `geometry`, `energy`, `frontLayout`, `backLayout`, `edgeContinuity`;
- vùng trống dành cho logo/sponsor ở ngực trước và tên/số ở lưng;
- exact assets được phép giữ; mặc định danh sách rỗng;
- `uniquenessSignature` từ creative-direction script;
- kích thước vật lý, PPI, màu nền và quy trình in giả định.

Không đổi spec trong lúc correction. Nếu người dùng đổi concept, tạo revision mới trong cùng SKU và ghi lý do; nếu là mẫu hoàn toàn khác, cấp SKU mới.

## Tạo master mặt trước

Dùng `imagegen` tạo mới một canvas artwork phẳng, ưu tiên tỷ lệ 4:5 hoặc gần tỷ lệ panel áo:

- chỉ có nền đồ họa full-bleed theo `design-spec.json`;
- không có hình chiếc áo, cổ áo, tay áo, đường may, model, mannequin, hanger, nếp vải, ánh sáng studio, bóng đổ, mockup hoặc poster;
- không chữ, số, logo, huy hiệu, sponsor, watermark, UI, giá, hotline;
- cạnh sạch, mảng màu có chủ đích, chi tiết đủ lớn để in trên vải; tránh nhiễu li ti, moiré và texture giả vải;
- giữ vùng ngực đã khóa đủ yên để đặt logo/sponsor riêng về sau;
- hai mép trái/phải có cấu trúc có thể nối hợp lý sang panel sau.

Kiểm tra full-size. Hard reject nếu canvas đọc thành áo/mockup, có text/logo, có ánh sáng/nếp vải, có chi tiết rác hoặc motif bị cắt ngoài vùng bleed một cách vô ý.

## Tạo master mặt sau

Chỉ bắt đầu sau khi mặt trước đạt. Dùng master mặt trước và `design-spec.json` làm reference:

- cùng palette, ngôn ngữ hình học, tỷ lệ motif và cường độ thị giác;
- đủ liên quan để thành một bộ nhưng không lật/gương hoặc chép nguyên mặt trước;
- hai dải biên trái/phải tiếp nối hợp lý với mặt trước theo `edgeContinuity`;
- vùng lưng trên và giữa lưng yên hơn để đặt tên và số áo;
- vẫn là artwork phẳng full-bleed, không phải mặt sau của một chiếc áo.

Hard reject nếu back trôi palette, đổi motif family, xuất hiện tên/số/logo, hoặc chỉ là bản mirror của front. Cho phép tối đa hai correction pass có mục tiêu cho mỗi side; không tiếp tục nếu correction làm thiết kế trôi xa spec.

## Chuẩn hóa master in

Dùng script cho từng side sau khi ảnh nguồn đã vượt visual gate:

```bash
python3 scripts/prepare_print_master.py work/<SKU>-front-source.png print/<SKU>-front-print.png \
  --width-mm 700 --height-mm 850 --ppi 300 --fit cover

python3 scripts/prepare_print_master.py work/<SKU>-back-source.png print/<SKU>-back-print.png \
  --width-mm 700 --height-mm 850 --ppi 300 --fit cover
```

Không kéo giãn, không chuyển JPEG, không thêm rập/cutline. Script chỉ resample và gắn metadata PPI; nó không biến ảnh nguồn nhỏ thành chi tiết thật hoặc thành vector. Nếu mức upscale lớn, ghi caveat vào manifest và yêu cầu xưởng in test swatch trước sản xuất hàng loạt.

## Tạo mockup và ảnh chào hàng

Sau khi cả hai master được duyệt:

1. Dùng `view_image` kiểm tra hai master cuối.
2. Gọi `imagegen` với cả hai master, gắn vai trò rõ ràng: Image 1 = front print master, Image 2 = back print master.
3. Tạo `mockup-base` không có text thương mại: ảnh vuông, photorealistic, gồm áo trước, áo sau, quần nếu spec có và một cầu thủ Việt Nam nếu phù hợp. Họa tiết phải bám vật liệu, phối cảnh, đường may và nếp vải nhưng không đổi thiết kế.
4. Hard reject và regenerate nếu motif/palette/độ dày dải/điểm giao khác master; không sửa drift bằng cách tái tạo master từ mockup.
5. Dùng `scripts/apply_sales_signature.py` để đóng exact title, SKU, website và hotline vào vùng trống. Không giao cho imagegen viết thông tin thương mại.

Ảnh chào hàng được phép sáng tạo về bối cảnh, model, góc máy và bố cục; không được sáng tạo lại họa tiết áo. Visual gate chi tiết nằm trong [mockup-contract.md](references/mockup-contract.md).

## Kiểm định và bàn giao

Dùng `view_image` kiểm tra full-size và xác nhận:

- front/back đều là nền đồ họa phẳng, không lẫn áo/model/text/logo;
- palette và motif cùng hệ; back không mirror front; vùng tên/số đủ yên;
- master không méo, đúng pixel/PPI đã khai báo;
- mockup là áo thật có cấu trúc vải/cổ/đường may;
- mặt trước và sau trên mockup khớp đúng master tương ứng;
- SKU/website/hotline đúng tuyệt đối và không che sản phẩm.

Chỉ sau khi cả sáu câu đều là `có`, tạo manifest/checksum bằng:

```bash
python3 scripts/build_delivery_manifest.py /absolute/path/to/product-folder \
  --sku <SKU> --product-slug <product-slug> \
  --width-mm 700 --height-mm 850 --ppi 300 --approve-visual
```

Sau đó chạy:

```bash
python3 scripts/validate_delivery.py /absolute/path/to/product-folder
```

Validator chỉ kiểm tra cấu trúc, định dạng, kích thước và checksum; nó không thay visual gate. Chỉ báo hoàn tất khi validator pass. Báo SKU, concept, đường dẫn hai master, mockup base, sales image, manifest, kích thước vật lý/pixel/PPI, mức upscale, giả định màu/in và rủi ro còn lại.

## Batch và tính sáng tạo

- Mỗi sản phẩm có một SKU và một creative direction mới; retry/correction của cùng SKU giữ nguyên direction.
- Hai mẫu liền nhau phải khác ít nhất ba trục trong `motifFamily`, `geometry`, `energy`, `frontLayout`, `palette`, `accentPlacement` hoặc kiểu cổ.
- Không dùng tên CLB thật, huy hiệu, sponsor hoặc kit nổi tiếng làm shortcut sáng tạo nếu người dùng không cung cấp quyền sử dụng.
- Với hơn 10 sản phẩm, tạo theo đợt 10–20, giữ `batch-registry.jsonl`, làm contact sheet kiểm tra trùng và dừng checkpoint sau mỗi đợt.
- Mỗi master và mỗi mockup là một lần gọi imagegen riêng; không dùng một ảnh lưới thay cho nhiều deliverable.
