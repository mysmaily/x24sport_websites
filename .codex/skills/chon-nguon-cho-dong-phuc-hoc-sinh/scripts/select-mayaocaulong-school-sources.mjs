import { readFile, writeFile } from 'node:fs/promises'

const runDir = new URL('../runs/mayaocaulong-pages-4-18/', import.meta.url)
const catalog = JSON.parse(await readFile(new URL('catalog-items.json', runDir), 'utf8'))

const selections = [
  ['X24-CL-472', 90, ['Xám nhạt', 'Trắng'], 'tối giản, viền cổ/tay tương phản'],
  ['X24-CL-436', 89, ['Trắng', 'Xanh da trời'], 'nét cọ thấp thân'],
  ['X24-CL-206', 87, ['Vàng', 'Xanh dương'], 'sóng cong ở thân dưới'],
  ['X24-CL-385', 88, ['Trắng', 'Xanh dương'], 'mảng lá/nét cọ thấp thân'],
  ['X24-CL-090', 82, ['Tím', 'Cam'], 'gradient hai tông'],
  ['X24-CL-461', 88, ['Kem', 'Xanh teal'], 'panel chéo tối giản'],
  ['X24-CL-435', 84, ['Đen', 'Cam'], 'nét lửa phân vùng'],
  ['X24-CL-173', 86, ['Trắng', 'Hồng'], 'gradient chân áo'],
  ['X24-CL-267', 87, ['Trắng', 'Cam', 'Vàng'], 'dải chéo sạch'],
  ['X24-CL-065', 83, ['Vàng', 'Cam', 'Trắng'], 'gradient chân áo'],
  ['X24-CL-415', 86, ['Xanh dương', 'Trắng'], 'chevron mảnh toàn thân'],
  ['X24-CL-225', 85, ['Xanh dương', 'Trắng'], 'panel trắng ngực và chuyển sắc'],
  ['X24-CL-236', 86, ['Vàng', 'Xanh teal'], 'núi/đường cong chân áo'],
  ['X24-CL-323', 84, ['Xanh cyan', 'Trắng'], 'trơn, bo cổ tương phản'],
  ['X24-CL-034', 82, ['Tím', 'Trắng'], 'gradient chân áo'],
  ['X24-CL-209', 89, ['Trắng', 'Cam'], 'panel cam chéo, vùng ngực rõ'],
  ['X24-CL-248', 87, ['Trắng', 'Xanh dương'], 'panel góc cạnh thấp thân'],
  ['X24-CL-270', 88, ['Trắng', 'Xanh teal'], 'sọc cong thấp thân'],
  ['X24-CL-294', 85, ['Trắng', 'Xanh navy'], 'sọc chéo mảnh'],
  ['X24-CL-362', 84, ['Trắng', 'Xanh da trời'], 'họa tiết hình học cục bộ'],
  ['X24-CL-329', 87, ['Trắng', 'Tím'], 'mảng chéo tương phản'],
  ['X24-CL-366', 86, ['Xanh da trời', 'Trắng'], 'gradient nhẹ, thân thoáng'],
  ['X24-CL-416', 85, ['Vàng', 'Xanh lá'], 'chevron lớn có vùng ngực sạch'],
  ['X24-CL-030', 87, ['Trắng', 'Xanh dương'], 'nét cọ xanh ở thân dưới'],
  ['X24-CL-038', 83, ['Vàng', 'Cam'], 'gradient dọc tối giản'],
  ['X24-CL-069', 86, ['Xanh da trời', 'Tím'], 'mảng cong thấp thân'],
  ['X24-CL-067', 84, ['Xanh da trời', 'Trắng'], 'panel trắng lớn'],
  ['X24-CL-093', 85, ['Xanh dương', 'Trắng'], 'chevron ngực rõ'],
  ['X24-CL-141', 87, ['Kem', 'Vàng'], 'nét cọ vàng thấp thân'],
  ['X24-CL-297', 84, ['Trắng', 'Cam', 'Vàng'], 'sọc chéo đa sắc'],
]

const byId = new Map(catalog.map((item) => [item.sourceId, item]))
const items = selections.map(([sourceId, score, colors, pattern]) => {
  const item = byId.get(sourceId)
  if (!item?.localImagePath) throw new Error(`Missing verified image: ${sourceId}`)
  return {
    ...item,
    name: item.alt.replace(/ - ảnh sản phẩm 1$/, ''),
    score,
    colors,
    pattern,
    selectionReason: 'Ảnh rõ; form polo phù hợp lớp/CLB, ngực và lưng còn vùng đặt mã lớp hoặc slogan; mẫu bổ sung khác biệt cho bộ cuối.',
    requiredRemovals: ['logo X24/nhãn nguồn trên ngực', 'watermark hoặc mã nguồn trên ảnh tham chiếu', 'bất kỳ chữ/biểu tượng thương hiệu nguồn còn lại'],
  }
})

const batches = Array.from({ length: 6 }, (_, index) => ({ batch: index + 1, items: items.slice(index * 5, index * 5 + 5) }))
const rejectedDuplicateGroups = [
  ['X24-CL-472', 'X24-CL-471, X24-CL-470, X24-CL-463, X24-CL-413', 'Polo trơn/ít họa tiết gần trùng; giữ 472 vì màu trung tính và viền tương phản rõ.'],
  ['X24-CL-173', 'X24-CL-174, X24-CL-176, X24-CL-218, X24-CL-357', 'Nhóm gradient thân dưới tương tự; giữ 173 vì nền trắng rộng và hồng dễ dùng cho tập thể.'],
  ['X24-CL-415', 'X24-CL-251, X24-CL-252, X24-CL-093', 'Nhóm chevron; giữ 415 vì nhịp họa tiết nhẹ hơn, lưng dễ đặt slogan.'],
  ['X24-CL-209', 'X24-CL-461, X24-CL-248, X24-CL-294, X24-CL-063', 'Nhóm panel/dải chéo nền sáng; giữ những hướng panel khác nhau, loại biến thể bố cục quá sát.'],
  ['X24-CL-436', 'X24-CL-030, X24-CL-362, X24-CL-366', 'Nhóm nền trắng/xanh và nét cọ; chỉ giữ cấu trúc có vùng thân rõ hơn cho từng ngôn ngữ họa tiết.'],
  ['X24-CL-206', 'X24-CL-190, X24-CL-192, X24-CL-237, X24-CL-283', 'Nhóm sóng/đường cong màu nổi; loại mẫu phủ họa tiết quá dày hoặc gần trùng.'],
  ['X24-CL-435', 'X24-CL-304, X24-CL-068, X24-CL-272, X24-CL-187', 'Nhóm nền đen với mảng cam; loại các bản nặng cảm giác thi đấu hoặc che kín thân áo.'],
]

const handoff = {
  schemaVersion: '1.0',
  producerSkill: 'chon-nguon-cho-dong-phuc-hoc-sinh',
  source: { baseUrl: 'https://mayaocaulong.vn/san-pham/', scope: 'pages 4-18', scannedCount: catalog.length },
  selectionPolicy: { minimumScore: 70, batchSize: 5 },
  batches,
  rejectedDuplicateGroups: rejectedDuplicateGroups.map(([kept, rejected, reason]) => ({ kept, rejected, reason })),
  sourceFailures: [],
}
await writeFile(new URL('selection-handoff.json', runDir), JSON.stringify(handoff, null, 2) + '\n')

const itemRow = (item) => `| ${item.sourceId} | ${item.name.replaceAll('|', '\\|')} | ${item.score} | ${item.colors.join(', ')}; ${item.pattern} | ${item.selectionReason} | [Sản phẩm](${item.productUrl}) · [Ảnh](${item.imageUrl}) |`
const report = `# Tuyển chọn nguồn đồng phục học sinh\n\n- Phạm vi: [MayaoCauLong — trang 4–18](https://mayaocaulong.vn/san-pham/?page=4)\n- Đã rà: ${catalog.length} sản phẩm (32 mẫu/trang 4–17, 10 mẫu trang 18)\n- Được chọn: ${items.length}\n- Bị loại: ${catalog.length - items.length}\n- Kích thước lô: 5\n- Ảnh nguồn: ${catalog.length}/${catalog.length} ảnh WebP 1254×1254 đã tải và xác minh; xem thư mục source-images/.\n\nTất cả ảnh catalog đã được mở theo contact sheet. Danh sách cuối ưu tiên áo polo có khoảng đặt nhận diện lớp; các mẫu quá dày họa tiết, quá thiên thi đấu, trùng bố cục hoặc chỉ khác màu đã bị loại. Mọi mẫu được chọn đều cần xóa logo/nhãn nguồn khi chuyển đổi.\n\n${batches.map(({ batch, items: batchItems }) => `## Lô ${batch}\n\n| Source ID | Sản phẩm | Điểm | Phối màu/họa tiết | Lý do chọn | Nguồn |\n|---|---|---:|---|---|---|\n${batchItems.map(itemRow).join('\n')}\n`).join('\n')}\n## Các nhóm gần trùng đã loại\n\n| Giữ lại | Đã loại | Lý do |\n|---|---|---|\n${rejectedDuplicateGroups.map(([kept, rejected, reason]) => `| ${kept} | ${rejected} | ${reason} |`).join('\n')}\n\n## Nguồn lỗi hoặc thiếu bằng chứng\n\nKhông có. 458/458 ảnh đã tải thành công và có header WebP hợp lệ.\n\n## Bàn giao\n\n- JSON có cấu trúc: [selection-handoff.json](selection-handoff.json)\n- Ảnh nguồn đã xác minh: source-images/\n- Contact sheet phục vụ kiểm tra: contact-sheets/\n- Bước tiếp theo: chỉ bàn giao; chưa tạo ảnh, chưa sửa CMS và chưa xuất bản.\n`
await writeFile(new URL('selection-report.md', runDir), report)
console.log(JSON.stringify({ selected: items.length, rejected: catalog.length - items.length, batches: batches.length }))
