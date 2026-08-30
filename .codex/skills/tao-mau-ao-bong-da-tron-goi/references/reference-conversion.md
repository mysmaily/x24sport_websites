# Chuyển ảnh nguồn thành bộ bốn ảnh

Đọc khi người dùng cung cấp poster, ảnh áo, sketch hoặc trang sản phẩm.

Ảnh nguồn chỉ là visual reference. Chuỗi đầu ra vẫn đúng bốn ảnh:

    source analysis -> front print -> back print -> sales -> team

Tạo source-analysis.json ghi mặt quan sát được, palette, motif, vùng bị che và
chi tiết phải loại. Không sao chép watermark, hotline, website, logo shop, nhãn
nhà sản xuất, tên/số, crest hoặc sponsor khi người dùng chưa cho phép.

## Front

Truyền ảnh nguồn vào referenced_image_paths và yêu cầu built-in imagegen bóc đồ
họa thành canvas phẳng full-bleed. Loại áo/model/cổ/tay/nếp vải/ánh sáng/text và
logo. Lưu output thành front print canonical ngay trong lần tạo đầu tiên.

## Back

Truyền front canonical cùng ảnh nguồn nếu nguồn có back. Nếu back không quan sát
được, suy luận tối thiểu cùng hệ với front và giữ vùng tên/số sạch; không mirror
front. Lưu output thành back print canonical ngay trong lần tạo đầu tiên.

Không correction hoặc regenerate hai print master sau khi đã có output. Tiếp tục
sales và team theo skill chính, dùng đúng hai master cùng logo local làm
reference.
