# Nghiệp vụ xưởng may đồng phục

Ngày khởi tạo: 2026-08-20  
Phạm vi: từ lead website đến tái đặt hàng  
Nguyên tắc: tenant-scoped, quote-only cho đến khi điều khoản thương mại được xác minh

Mayaodongphuc.com.vn là mặt tiền của xưởng: nội dung công khai phải giúp khách
hàng hiểu và đi đúng các điểm bàn giao sản xuất — brief, spec, duyệt mẫu, size,
lệnh may, QC và nghiệm thu. Không dùng website này như một kênh tổng hợp mẫu,
ngành hàng hoặc từ khóa rộng; phần khám phá và tư vấn theo thị trường thuộc
Dongphucx24.vn.

## 1. Pipeline chuẩn

```text
Lead mới
  → Sàng lọc
  → Đủ brief
  → Đề xuất cấu hình
  → Báo giá
  → Duyệt thiết kế/vật liệu/mẫu
  → Chốt size + số lượng
  → Xác nhận thương mại
  → Lệnh sản xuất
  → QC
  → Giao + nghiệm thu
  → Hậu mãi / tái đặt hàng
```

Không chuyển sang sản xuất chỉ vì khách đã gửi logo hoặc đồng ý miệng. Cần một
phiên bản spec đã xác nhận và các điều kiện thương mại theo chính sách thực tế.

## 2. Trạng thái và gate

| Trạng thái | Điều kiện vào | Đầu ra bắt buộc | Gate để đi tiếp |
|---|---|---|---|
| Lead mới | có kênh liên hệ hợp lệ | mã lead, nguồn, thời điểm | đồng ý được liên hệ và xác định người phụ trách |
| Sàng lọc | đã liên hệ | use case, số lượng dự kiến, deadline, địa điểm | phù hợp phạm vi sản phẩm/năng lực |
| Đủ brief | có dữ liệu cốt lõi | brief có phiên bản | không còn trường bắt buộc “chưa rõ” |
| Đề xuất | brief đủ | 1–3 cấu hình và trade-off | khách chọn hướng để tính giá |
| Báo giá | cấu hình đủ để tính | báo giá có scope, hiệu lực, loại trừ | khách xác nhận phương án thương mại |
| Duyệt mẫu | thiết kế/spec đã tạo | bản duyệt logo, màu, vật liệu, form/mẫu | người có thẩm quyền duyệt phiên bản |
| Chốt size | có form/bảng size được duyệt | ma trận size theo bộ phận/giới tính nếu có | tổng size khớp tổng số lượng |
| Xác nhận thương mại | đủ thiết kế + size | hợp đồng/PO/xác nhận, điều khoản thanh toán | điều kiện khởi động sản xuất đã hoàn tất |
| Sản xuất | có lệnh sản xuất | tiến độ và lot/batch | thay đổi phải qua change request |
| QC | hàng hoàn thiện | biên bản kiểm theo spec | lỗi được phân loại và xử lý |
| Giao/ nghiệm thu | QC đạt | chứng từ giao, đối chiếu số lượng | khách xác nhận nhận/ngoại lệ |
| Hậu mãi/reorder | đơn hoàn tất | hồ sơ spec và issue history | dùng đúng phiên bản khi tái đặt |

## 3. Brief tối thiểu cho báo giá

### Bắt buộc

- Tên tổ chức và người liên hệ có thẩm quyền phối hợp.
- Mục đích: mặc hàng ngày, sự kiện, ngoài trời, phân vai, cấp phát định kỳ…
- Loại sản phẩm hoặc mẫu tham khảo.
- Số lượng dự kiến; nếu nhiều loại, tách từng dòng.
- Deadline **cần nhận hàng**, không chỉ ngày tổ chức.
- Tỉnh/thành và điểm giao dự kiến.
- Logo/file nhận diện hoặc xác nhận chưa có file chuẩn.
- Kỹ thuật mong muốn nếu đã biết: in/thêu; số vị trí; kích thước gần đúng.
- Yêu cầu vật liệu/form/màu đã biết.

### Nên có

- Tần suất mặc và điều kiện sử dụng: nóng, ngoài trời, di chuyển, giặt nhiều.
- Cơ cấu người mặc: nam/nữ/unisex, trẻ em, ngoại cỡ, bộ phận/vai trò.
- Cách gom size: bảng size, áo mẫu hay đo trực tiếp.
- Ngân sách mục tiêu hoặc khoảng ngân sách.
- Yêu cầu chứng từ, đóng gói, phân loại và giao nhiều điểm.
- Đơn cũ/spec cũ nếu là tái đặt.

## 4. Mô hình báo giá

Báo giá cần thể hiện tối thiểu:

```text
Giá cấu hình = thân áo/sản phẩm
             + may/phối/chi tiết đặc biệt
             + in/thêu theo vị trí và độ phức tạp
             + mẫu/phát triển mẫu nếu áp dụng
             + đóng gói/phân loại
             + vận chuyển/giao nhiều điểm
             + thuế/phí theo chính sách
             + phụ phí tiến độ hoặc ngoại lệ đã thống nhất
```

Biến ảnh hưởng giá:

- số lượng mỗi SKU/màu, không chỉ tổng số áo;
- vật liệu, định lượng, màu có sẵn hay nhuộm/đặt riêng;
- kiểu dáng, bo/phối, phụ liệu và độ phức tạp may;
- số vị trí, kích thước, số màu và kỹ thuật logo;
- dải size, size ngoại cỡ và tỷ lệ nam/nữ nếu form khác nhau;
- mockup, mẫu vật liệu, áo mẫu và số vòng sửa;
- deadline, lịch duyệt và năng lực xưởng tại thời điểm chốt;
- đóng gói theo người/bộ phận, giao nhiều địa chỉ, chứng từ.

Không đưa giá đối thủ vào bảng giá nội bộ. Mọi bảng giá website phải có ngày
hiệu lực, điều kiện áp dụng, phần bao gồm/không bao gồm và chủ sở hữu duyệt.

## 5. Spec và quản lý phiên bản

Mỗi cấu hình được duyệt nên có `spec_id` và version:

- mã sản phẩm/SKU nội bộ;
- hình mặt trước, sau và chi tiết;
- vật liệu/nhà cung cấp/mã màu/lot nếu có;
- form, bảng thông số và dung sai được duyệt;
- bo, cúc, khóa, chỉ và phụ liệu;
- file logo nguồn, kích thước, màu, vị trí, kỹ thuật;
- ma trận size/số lượng;
- yêu cầu đóng gói, nhãn, phân loại và giao;
- người duyệt, thời điểm, lịch sử thay đổi.

Quy tắc tên file gợi ý:

`{customer}-{project}-{item}-{version}-{yyyymmdd}`

Sau gate duyệt, mọi thay đổi về màu, logo, vật liệu, số lượng, size hoặc deadline
phải tạo change request, đánh giá lại giá/tiến độ và lưu dấu người duyệt.

## 6. Duyệt mẫu

Ba mức duyệt không được đánh đồng:

1. **Mockup số:** duyệt bố cục, phối màu, vị trí và tỷ lệ logo tương đối.
2. **Mẫu vật liệu/màu/logo:** duyệt cảm quan vật liệu, màu và kỹ thuật trang trí.
3. **Áo mẫu/size set:** duyệt form, thông số và cấu tạo khi đơn hàng/rủi ro yêu
   cầu.

Ảnh màn hình không phải chuẩn tuyệt đối cho màu vải. Biên bản duyệt cần ghi rõ
đối tượng được duyệt, giới hạn và phiên bản.

## 7. Size và cấp phát

- Chọn một bảng size đúng với form/vật liệu đã duyệt; không trộn bảng size giữa
  các model.
- Với đội ngũ đông hoặc form mới, ưu tiên áo mẫu/size set hơn tự ước lượng.
- Tổng từng dòng size phải khớp số lượng PO/lệnh sản xuất.
- Lưu ngoại lệ size riêng, không ghi đè form chuẩn.
- Nếu cần áo dự phòng/tuyển mới, thể hiện như dòng số lượng riêng và có người
  phê duyệt.
- Đóng gói theo size, bộ phận hoặc tên người chỉ khi báo giá/spec đã bao gồm.

## 8. QC và nghiệm thu

Checklist tối thiểu theo lấy mẫu hoặc 100% tùy mức rủi ro đã quy định:

- đúng SKU, màu, vật liệu, form và phiên bản spec;
- tổng số lượng và số lượng theo size;
- thông số chính/dung sai;
- lỗi vải, bẩn, thủng, lệch màu bất thường;
- đường may, diễu, bo/cổ/tay, phụ liệu;
- logo đúng file, vị trí, chiều, kích thước, màu và kỹ thuật;
- lỗi in/thêu nhìn thấy: bong, lem, nhăn, đứt chỉ, sai mật độ;
- nhãn/bao bì/phân loại;
- carton/kiện, mã giao và chứng từ.

Phân loại issue:

- Critical: sai sản phẩm/nhận diện hoặc rủi ro an toàn/tuân thủ.
- Major: ảnh hưởng sử dụng, form, độ bền hoặc ngoại quan đáng kể.
- Minor: sai khác nhỏ không ảnh hưởng chức năng nhưng cần ghi nhận.

Mức chấp nhận, phương pháp lấy mẫu và hướng xử lý phải do business/QA xác nhận;
không tự công bố chuẩn AQL nếu chưa vận hành thật.

## 9. Giao hàng, nghiệm thu và hậu mãi

- Giao kèm packing list theo SKU/size/kiện.
- Ghi nhận thiếu, thừa, lỗi nhìn thấy và tình trạng kiện tại thời điểm nhận.
- Issue sau giao cần mã case, ảnh, số lượng ảnh hưởng, lot/size và cách xử lý.
- Bảo hành/đổi sửa chỉ theo điều khoản đã xác nhận; không dùng lời hứa chung trên
  website.
- Khi đóng đơn, lưu “reorder pack”: spec cuối, file logo, màu/vải, bảng size,
  issue history và điều kiện về sai khác giữa các lot.

## 10. Ngoại lệ cần route riêng

- Số lượng rất ít: kiểm tra model may sẵn + in/thêu hoặc từ chối có hướng dẫn.
- Deadline gấp: xác nhận năng lực trước khi hứa; khóa thời điểm nhận file/logo/
  size và giới hạn vòng sửa.
- Nhiều điểm giao: tách packing list và phí/vận chuyển.
- Chuỗi nhiều vai trò: tạo SKU/spec riêng cho từng vai trò, dùng hệ màu chung.
- Reorder sau thời gian dài: cảnh báo khả năng lệch màu/lot và thay vật liệu.
- Trẻ em, y tế, bảo hộ/PPE: kích hoạt review an toàn/tuân thủ phù hợp.
- Logo có quyền sở hữu không rõ: yêu cầu khách xác nhận quyền sử dụng.

## 11. Dữ liệu và KPI

### KPI funnel

- thời gian phản hồi lead;
- tỷ lệ lead đủ brief;
- tỷ lệ đủ brief → báo giá;
- tỷ lệ báo giá → đơn hàng và lý do thua;
- số vòng sửa trước duyệt;
- tỷ lệ giao đúng điều kiện đã xác nhận;
- tỷ lệ issue theo đơn/SKU và nguyên nhân;
- tỷ lệ reorder, thời gian tái đặt và độ chính xác spec.

### Quyền riêng tư

Chỉ thu dữ liệu cần cho tư vấn/đơn hàng. File logo, danh sách tên/size và thông
tin liên hệ là dữ liệu nghiệp vụ; cần phân quyền, thời hạn lưu và cơ chế xóa phù
hợp. Không đưa danh sách nhân sự hoặc số điện thoại vào asset công khai/CMS.

## 12. Claim register bắt buộc

Mỗi claim công khai cần các trường:

| Trường | Ví dụ loại dữ liệu |
|---|---|
| Claim | “nhận từ X áo”, “giao trong Y ngày”, “vải chống UV” |
| Owner | Sales Ops, Production, QA, Legal |
| Evidence | policy, test report, supplier spec, capacity rule |
| Conditions | loại áo, số lượng, thời điểm, địa bàn |
| Approved at / expires at | ngày kiểm tra và ngày rà soát lại |
| Public surfaces | homepage, category, form, ads, sales script |

Không có register/bằng chứng thì dùng copy trung tính: “được xác nhận sau khi
duyệt cấu hình và tiến độ”.
