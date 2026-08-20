import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { basename, join } from 'node:path'

const runDir = new URL('../runs/mayaocaulong-pages-1-18/', import.meta.url)
const reviewDir = new URL('review-images/', runDir)
const selectedDir = new URL('selected-source-images/', runDir)
await mkdir(selectedDir, { recursive: true })
const catalog = JSON.parse(await readFile(new URL('catalog-items.json', runDir), 'utf8'))
const byId = new Map(catalog.map((item) => [item.sourceId, item]))

const selections = [
  ['X24-CL-451', 90, ['Kem', 'Xanh lime'], 'gradient chân áo nhẹ'],
  ['X24-CL-536', 88, ['Xanh dương'], 'polo tối giản'],
  ['X24-CL-501', 87, ['Xanh navy', 'Trắng'], 'panel chéo gọn'],
  ['X24-CL-472', 91, ['Xám nhạt', 'Trắng'], 'tối giản, viền tương phản'],
  ['X24-CL-214', 89, ['Đen'], 'polo trơn chuyên nghiệp'],
  ['X24-CL-182', 84, ['Vàng', 'Cam'], 'gradient chân áo'],
  ['X24-CL-150', 87, ['Xanh dương'], 'polo trơn, bo cổ tương phản'],
  ['X24-CL-241', 82, ['Xanh navy'], 'họa tiết cục bộ nhẹ'],
  ['X24-CL-450', 89, ['Trắng', 'Xanh dương'], 'panel xanh thấp thân'],
  ['X24-CL-535', 88, ['Trắng', 'Đỏ'], 'dải chéo rõ'],
  ['X24-CL-499', 86, ['Xanh dương', 'Cam'], 'panel chéo nhỏ'],
  ['X24-CL-463', 87, ['Xám', 'Trắng'], 'gradient sọc dọc nhẹ'],
  ['X24-CL-210', 86, ['Xanh navy', 'Xanh teal'], 'gradient chân áo'],
  ['X24-CL-181', 88, ['Xanh navy', 'Trắng'], 'mảng màu thấp thân'],
  ['X24-CL-146', 85, ['Tím', 'Cam'], 'panel cong tối giản'],
  ['X24-CL-281', 86, ['Xanh da trời'], 'polo trơn sáng'],
  ['X24-CL-445', 88, ['Xanh navy', 'Trắng'], 'gradient chân áo'],
  ['X24-CL-533', 89, ['Xanh navy'], 'polo trơn, cổ tương phản'],
  ['X24-CL-496', 86, ['Trắng', 'Xanh navy', 'Cam'], 'panel góc cạnh'],
  ['X24-CL-461', 89, ['Kem', 'Xanh navy'], 'panel chéo nền sáng'],
  ['X24-CL-203', 88, ['Xanh cyan'], 'polo trơn sáng'],
  ['X24-CL-180', 87, ['Trắng', 'Đỏ'], 'gradient thấp thân'],
  ['X24-CL-145', 84, ['Hồng', 'Trắng'], 'mảng chuyển sắc nhẹ'],
  ['X24-CL-305', 85, ['Xanh mint'], 'polo trơn mát'],
  ['X24-CL-442', 88, ['Trắng', 'Xanh dương'], 'panel xanh thấp thân'],
  ['X24-CL-526', 86, ['Xanh navy', 'Trắng'], 'dải chéo tối giản'],
  ['X24-CL-493', 85, ['Xanh dương', 'Trắng'], 'panel chéo gọn'],
  ['X24-CL-414', 87, ['Kem', 'Xanh teal'], 'mảng teal thấp thân'],
  ['X24-CL-178', 87, ['Trắng'], 'polo sáng tối giản'],
  ['X24-CL-143', 84, ['Vàng', 'Trắng'], 'gradient nhẹ'],
  ['X24-CL-330', 85, ['Xanh navy'], 'polo cổ bẻ, tối giản'],
  ['X24-CL-358', 82, ['Hồng', 'Trắng'], 'gradient chân áo nhẹ'],
  ['X24-CL-548', 86, ['Trắng', 'Xanh dương'], 'panel gọn, nền sáng'],
  ['X24-CL-523', 84, ['Xám', 'Xanh navy'], 'panel trầm chuyên nghiệp'],
  ['X24-CL-484', 84, ['Trắng', 'Xanh dương'], 'mảng màu thấp thân'],
  ['X24-CL-413', 88, ['Xanh da trời'], 'polo trơn sáng'],
  ['X24-CL-393', 83, ['Kem', 'Vàng'], 'gradient chân áo nhẹ'],
  ['X24-CL-039', 86, ['Xanh lá'], 'polo trơn doanh nghiệp'],
  ['X24-CL-071', 85, ['Xanh lá non', 'Xanh dương'], 'gradient cục bộ'],
  ['X24-CL-103', 85, ['Xanh da trời', 'Trắng'], 'polo sáng, panel tối giản'],
]

const selected = selections.map(([sourceId, score, colors, pattern]) => {
  const source = byId.get(sourceId)
  if (!source?.reviewImagePath) throw new Error(`Missing source image: ${sourceId}`)
  return {
    ...source,
    score,
    colors,
    pattern,
    selectionReason: 'Form polo có cổ, ảnh rõ, có vùng ngực/lưng phù hợp logo và tên công ty; phối màu có thể quy đổi sang nhận diện doanh nghiệp.',
    requiredRemovals: ['logo hoặc nhãn X24/nguồn trên ngực', 'watermark/mã nguồn trên ảnh tham chiếu', 'bất kỳ chữ hoặc biểu tượng thương hiệu nguồn còn lại'],
  }
})

for (const item of selected) {
  const filename = basename(item.reviewImagePath)
  const localImagePath = join(selectedDir.pathname, filename)
  await rename(item.reviewImagePath, localImagePath)
  item.localImagePath = localImagePath
  delete item.reviewImagePath
}
await rm(reviewDir, { recursive: true, force: true })

const batches = Array.from({ length: 8 }, (_, index) => ({ batch: index + 1, items: selected.slice(index * 5, index * 5 + 5) }))
const rejectedDuplicateGroups = [
  { kept: 'X24-CL-472, X24-CL-214, X24-CL-536', rejected: 'Các polo trơn hoặc cùng form chỉ đổi màu', reason: 'Giữ đại diện xám trung tính, đen và xanh dương; loại các biến thể không bổ sung hướng nhận diện.' },
  { kept: 'X24-CL-450, X24-CL-442, X24-CL-496', rejected: 'Các panel xanh/trắng bố cục gần trùng', reason: 'Giữ ba cấu trúc có vùng logo rõ nhất; loại biến thể có dải quá lớn hoặc màu trùng.' },
  { kept: 'X24-CL-181, X24-CL-445, X24-CL-358', rejected: 'Nhóm gradient chân áo tương tự', reason: 'Giữ đại diện navy, trắng và hồng; loại gradient dày hoặc khó tái tạo.' },
  { kept: 'X24-CL-461, X24-CL-526, X24-CL-535', rejected: 'Nhóm panel/dải chéo', reason: 'Giữ các hướng nền sáng, nền navy và nhấn đỏ; loại mẫu quá thiên thi đấu.' },
  { kept: 'X24-CL-203, X24-CL-281, X24-CL-413', rejected: 'Nhóm xanh dương/cyan tối giản', reason: 'Giữ ba độ sáng khác nhau; loại các bản không tạo khác biệt ở thumbnail.' },
]
const handoff = {
  schemaVersion: '1.0',
  producerSkill: 'chon-nguon-cho-dong-phuc-cong-ty',
  source: { baseUrl: 'https://mayaocaulong.vn/san-pham/', scope: 'pages 1-18', scannedCount: catalog.length },
  selectionPolicy: { minimumScore: 70, batchSize: 5 },
  batches,
  rejectedDuplicateGroups,
  sourceFailures: [],
}
await writeFile(new URL('selection-handoff.json', runDir), JSON.stringify(handoff, null, 2) + '\n')
const row = (item) => `| ${item.sourceId} | ${item.name.replaceAll('|', '\\|')} | ${item.score} | ${item.colors.join(', ')}; ${item.pattern} | [Sản phẩm](${item.productUrl}) · [Ảnh](${item.imageUrl}) |`
const report = `# Tuyển chọn nguồn đồng phục công ty/doanh nghiệp\n\n- Phạm vi: [MayaoCauLong — trang 1–18](https://mayaocaulong.vn/san-pham/)\n- Đã rà: ${catalog.length} sản phẩm\n- Được chọn: ${selected.length}\n- Bị loại: ${catalog.length - selected.length}\n- Kích thước lô: 5\n- Ảnh nguồn giữ lại: ${selected.length}/${selected.length} WebP đã xác minh, nằm trong selected-source-images/.\n\nBộ cuối ưu tiên polo có cổ, khả năng đặt logo doanh nghiệp rõ ở ngực/lưng và phối màu dễ chuyển thành nhận diện thương hiệu. Các mẫu quá thể thao, họa tiết dày, biến thể chỉ đổi màu và mẫu trùng bố cục đã bị loại.\n\n${batches.map(({ batch, items }) => `## Lô ${batch}\n\n| Source ID | Sản phẩm | Điểm | Phối màu/họa tiết | Nguồn |\n|---|---|---:|---|---|\n${items.map(row).join('\n')}\n`).join('\n')}\n## Nhóm gần trùng đã loại\n\n| Giữ lại | Loại | Lý do |\n|---|---|---|\n${rejectedDuplicateGroups.map((group) => `| ${group.kept} | ${group.rejected} | ${group.reason} |`).join('\n')}\n\n## Nguồn lỗi hoặc thiếu bằng chứng\n\nKhông có. 554/554 ảnh đã tải thành công và có header WebP hợp lệ.\n\n## Bàn giao\n\n- JSON: selection-handoff.json\n- Ảnh nguồn được chọn: selected-source-images/\n- Contact sheet đối chiếu: contact-sheets/\n- Chỉ bàn giao; chưa tạo ảnh, sửa CMS hoặc xuất bản.\n`
await writeFile(new URL('selection-report.md', runDir), report)
console.log(JSON.stringify({ scanned: catalog.length, selected: selected.length, removed: catalog.length - selected.length, batches: batches.length }))
