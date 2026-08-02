import 'dotenv/config'

import { createHash } from 'crypto'
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

const CMS_API_URL = process.env.CMS_API_URL || 'https://cms.x24sport.vn'
const TENANT_SLUG = 'mayaobongda'
const SOURCE_SYSTEM = 'manual-selected-football-posters-20260801'
const CATEGORY_SLUG = 'ao-bong-da-thiet-ke-2026'
const CATEGORY_PATH = '/ao-bong-da-thiet-ke-2026/'
const apply = process.argv.includes('--apply')

type Doc = Record<string, any>
type Paginated<T extends Doc> = { docs: T[]; totalDocs: number }
type Poster = {
  no: number
  file: string
  palette: string
  mainColors: string[]
  accentColors: string[]
  style: string
  detail: string
  tags: string[]
}

const rows = (values: string[]) => [...new Set(values.filter(Boolean))].map((value) => ({ value }))

const lexical = (paragraphs: string[]) => ({
  root: {
    type: 'root',
    format: '',
    direction: null,
    indent: 0,
    version: 1,
    children: paragraphs.map((text) => ({
      type: 'paragraph',
      format: '' as const,
      direction: null,
      indent: 0,
      version: 1,
      children: [{ type: 'text', text, version: 1 }],
    })),
  },
})

const selectedDirs = {
  d1: '/Users/hoang/.codex/generated_images/019fbb4c-5846-7693-9f40-89b24a80ca3f',
  d2: '/Users/hoang/.codex/generated_images/019fbb9c-2f6c-7981-b4d9-81c90c7345e6',
  d3: '/Users/hoang/.codex/generated_images/019fbba7-a535-70b3-886a-b9be87f3b07d',
  d4: '/Users/hoang/.codex/generated_images/019fbaa6-1583-7df2-a1e3-9d23727dded3',
  d5: '/Users/hoang/.codex/generated_images/019fbbe4-1593-7a13-903e-07d74739d63c',
  d6: '/Users/hoang/.codex/generated_images/019fbbb8-1485-7b40-b381-0d0c9222da66',
}

const source = (dir: keyof typeof selectedDirs, filename: string) => path.join(selectedDirs[dir], filename)

const posters: Poster[] = [
  { no: 1, file: source('d1', 'call_7o4MIgnTCzw4JHcwLboQKSIF.png'), palette: 'tím than phối xanh vàng', mainColors: ['Tím than'], accentColors: ['Xanh dương nhấn', 'Vàng nhấn'], style: 'tối mạnh, nền sân đêm, họa tiết sọc chìm', detail: 'áo tím đậm với hiệu ứng sọc chìm, logo tròn xanh vàng và quần tím đồng bộ', tags: ['tím than', 'sọc chìm', 'xanh vàng nhấn', 'sân đêm'] },
  { no: 2, file: source('d2', 'call_OtW1FPZq2KVuobV2JF4Upe9L.png'), palette: 'xanh navy chuyển trắng', mainColors: ['Xanh navy', 'Trắng'], accentColors: ['Xanh điện nhấn'], style: 'gradient hiện đại, năng động', detail: 'thân áo chuyển từ xanh navy xuống trắng, có vân tia xanh ở ngực', tags: ['xanh navy', 'trắng', 'gradient', 'vân tia'] },
  { no: 3, file: source('d2', 'call_WefFz1eZZRHc9Ol9xLMpphVm.png'), palette: 'trắng chuyển đỏ', mainColors: ['Trắng', 'Đỏ'], accentColors: ['Đỏ đậm nhấn'], style: 'sáng, sạch, dễ nổi bật', detail: 'áo nền trắng chuyển đỏ ở nửa dưới, quần đỏ đồng bộ', tags: ['trắng', 'đỏ', 'gradient', 'phong cách sạch'] },
  { no: 4, file: source('d2', 'call_5nFcQgHCCRdarVUocMgmkDYx.png'), palette: 'đen tối giản', mainColors: ['Đen'], accentColors: ['Trắng nhấn'], style: 'minimal, mạnh và gọn', detail: 'áo đen trơn với huy hiệu tròn trắng, phù hợp đội thích phong cách kín đáo', tags: ['đen', 'tối giản', 'huy hiệu trắng'] },
  { no: 5, file: source('d2', 'call_8f0QsNRBfTHkmde5whKMJLIA.png'), palette: 'xanh navy phối cam', mainColors: ['Xanh navy'], accentColors: ['Cam nhấn'], style: 'tốc độ, tương phản mạnh', detail: 'áo xanh navy với nét cam sắc ở vai và thân áo, quần xanh navy', tags: ['xanh navy', 'cam nhấn', 'họa tiết tốc độ'] },
  { no: 6, file: source('d3', 'call_xMawbRJytsBKPv3tlRryKiSj.png'), palette: 'xanh cobalt phối vàng lime', mainColors: ['Xanh cobalt'], accentColors: ['Vàng lime nhấn'], style: 'thể thao, sắc nét', detail: 'áo xanh cobalt có mảng vàng lime dạng zigzag trên ngực và tay áo', tags: ['xanh cobalt', 'vàng lime nhấn', 'zigzag'] },
  { no: 7, file: source('d3', 'call_uhSy2ID0JoXcUaceBVIQo8Yn.png'), palette: 'vàng phối xanh dương', mainColors: ['Vàng'], accentColors: ['Xanh dương nhấn'], style: 'rực rỡ, sáng sân', detail: 'áo vàng chủ đạo, tay và quần xanh dương, họa tiết tia nhẹ', tags: ['vàng', 'xanh dương nhấn', 'sáng sân'] },
  { no: 8, file: source('d3', 'call_t84LahG5lAmepaCy1B5akrvT.png'), palette: 'xanh royal phối vàng', mainColors: ['Xanh royal'], accentColors: ['Vàng nhấn'], style: 'cổ điển, khỏe khoắn', detail: 'áo xanh royal có mảng vàng dọc thân và viền tay', tags: ['xanh royal', 'vàng nhấn', 'mảng dọc'] },
  { no: 9, file: source('d3', 'call_DOorThZ9aGvCUpEIJDb5ZDVT.png'), palette: 'đỏ phối xanh teal', mainColors: ['Đỏ'], accentColors: ['Xanh teal nhấn', 'Trắng nhấn'], style: 'nổi bật, tương phản hiện đại', detail: 'áo đỏ chủ đạo với mảng xanh teal ở hông và cổ tay', tags: ['đỏ', 'xanh teal nhấn', 'tương phản'] },
  { no: 10, file: source('d3', 'call_tKLlrCNHip1iojFNM56jILJu.png'), palette: 'trắng viền đỏ đen', mainColors: ['Trắng'], accentColors: ['Đỏ nhấn', 'Đen nhấn'], style: 'sạch, thể thao', detail: 'áo trắng có viền đỏ đen ở vai, cổ và tay áo, quần đen', tags: ['trắng', 'đỏ nhấn', 'đen nhấn', 'viền vai'] },
  { no: 11, file: source('d3', 'call_OyneUcuex1fqtCDkzjnAxCAN.png'), palette: 'xanh da trời phối navy', mainColors: ['Xanh da trời'], accentColors: ['Xanh navy nhấn'], style: 'mát mắt, nhẹ và trẻ', detail: 'áo xanh da trời nhạt, vai xanh navy, quần xanh navy', tags: ['xanh da trời', 'xanh navy nhấn', 'màu sáng'] },
  { no: 12, file: source('d3', 'call_rxl6TRjoyGrf1zpMeRsDvVqV.png'), palette: 'trắng kem phối đen đỏ', mainColors: ['Trắng kem'], accentColors: ['Đen nhấn', 'Đỏ nhấn'], style: 'tối giản, mạnh mẽ', detail: 'áo trắng kem với vai và cổ phối đen đỏ, quần đen', tags: ['trắng kem', 'đen nhấn', 'đỏ nhấn', 'vai phối'] },
  { no: 13, file: source('d3', 'call_MIem9GtZdwTrNhQMohoX0Pqd.png'), palette: 'trắng phối xanh royal đỏ', mainColors: ['Trắng'], accentColors: ['Xanh royal nhấn', 'Đỏ nhấn'], style: 'sáng, gọn và năng động', detail: 'áo trắng với đường viền xanh royal và đỏ ở sườn, quần xanh royal', tags: ['trắng', 'xanh royal nhấn', 'đỏ nhấn'] },
  { no: 14, file: source('d3', 'call_0PM3q3yF5vTeouFP9xl2tFgA.png'), palette: 'trắng phối xanh navy cyan', mainColors: ['Trắng'], accentColors: ['Xanh navy nhấn', 'Cyan nhấn'], style: 'sạch, công nghệ', detail: 'áo trắng có đường cổ tay xanh navy và cyan, quần navy', tags: ['trắng', 'xanh navy nhấn', 'cyan nhấn'] },
  { no: 15, file: source('d3', 'call_Y5BbNDHH8Ilzed5jtWTmr3LZ.png'), palette: 'xanh navy phối cam', mainColors: ['Xanh navy'], accentColors: ['Cam nhấn'], style: 'sắc cạnh, thi đấu', detail: 'áo xanh navy với viền cam ở vai và thân, quần đen', tags: ['xanh navy', 'cam nhấn', 'viền cam'] },
  { no: 16, file: source('d4', 'call_C9NH4Zq2USCCJVTYPKlMAAiC.png'), palette: 'đỏ phối đen', mainColors: ['Đỏ'], accentColors: ['Đen nhấn'], style: 'mạnh, tốc độ', detail: 'áo đỏ chủ đạo với họa tiết đen và quần đen', tags: ['đỏ', 'đen nhấn', 'họa tiết tốc độ'] },
  { no: 17, file: source('d4', 'call_93m0fETwxn1AbbJy0IJC0xyo.png'), palette: 'xanh lá chuyển trắng', mainColors: ['Xanh lá', 'Trắng'], accentColors: ['Xanh đậm nhấn'], style: 'tươi, năng lượng', detail: 'áo xanh lá chuyển trắng, họa tiết lá và quần trắng', tags: ['xanh lá', 'trắng', 'gradient', 'họa tiết lá'] },
  { no: 18, file: source('d4', 'call_xlWtTuXWFw6crSxheMcHNbus.png'), palette: 'đỏ cam chuyển vàng', mainColors: ['Đỏ cam'], accentColors: ['Vàng nhấn'], style: 'rực rỡ, lửa thi đấu', detail: 'áo đỏ chuyển vàng ở thân dưới, quần đen', tags: ['đỏ cam', 'vàng nhấn', 'gradient lửa'] },
  { no: 19, file: source('d4', 'call_HCweQG0RCmH2HaZgc9bwVtsd.png'), palette: 'trắng phối xanh royal', mainColors: ['Trắng'], accentColors: ['Xanh royal nhấn'], style: 'sáng, nhẹ', detail: 'áo trắng với họa tiết xanh royal dạng lưới ở thân dưới, quần xanh', tags: ['trắng', 'xanh royal nhấn', 'họa tiết lưới'] },
  { no: 20, file: source('d4', 'call_AhYzGdXQAJgRGoYcV8D0C7J5.png'), palette: 'trắng phối cam', mainColors: ['Trắng'], accentColors: ['Cam nhấn'], style: 'năng động, sạch', detail: 'áo trắng có mảng cam lớn ở hông và thân dưới, quần đen', tags: ['trắng', 'cam nhấn', 'mảng hông'] },
  { no: 21, file: source('d4', 'call_ZS3Te6eHCDNQ9iiRG3gwRyyj.png'), palette: 'trắng phối xanh royal', mainColors: ['Trắng'], accentColors: ['Xanh royal nhấn'], style: 'sáng, kỹ thuật', detail: 'áo trắng với họa tiết xanh royal nhạt ở thân dưới, quần xanh', tags: ['trắng', 'xanh royal nhấn', 'họa tiết kỹ thuật'] },
  { no: 22, file: source('d4', 'call_Tg2BMnh0K51nVy99zdzFPRuk.png'), palette: 'xanh lá chuyển trắng', mainColors: ['Xanh lá', 'Trắng'], accentColors: ['Xanh đậm nhấn'], style: 'tươi, tự nhiên', detail: 'áo xanh lá có gradient trắng và họa tiết lá lệch thân', tags: ['xanh lá', 'trắng', 'họa tiết lá'] },
  { no: 23, file: source('d5', 'call_zZAmd4QD6zM9wj6zhuVOoxKD.png'), palette: 'trắng phối đen đỏ', mainColors: ['Trắng'], accentColors: ['Đen nhấn', 'Đỏ nhấn'], style: 'sắc nét, thi đấu', detail: 'áo trắng với mảng đen hai bên và vai đỏ', tags: ['trắng', 'đen nhấn', 'đỏ nhấn'] },
  { no: 24, file: source('d5', 'call_XyVeGAsABimRTuszGLmNSLnh.png'), palette: 'trắng phối đen đỏ', mainColors: ['Trắng'], accentColors: ['Đen nhấn', 'Đỏ nhấn'], style: 'mạnh, ánh đỏ sân đêm', detail: 'áo trắng phối đen ở thân và đỏ ở vai, nền poster đỏ đậm', tags: ['trắng', 'đen nhấn', 'đỏ nhấn'] },
  { no: 25, file: source('d5', 'call_9mbgyvOA7P3WiQ2jd4oMQFc1.png'), palette: 'đen phối hồng tím', mainColors: ['Đen'], accentColors: ['Hồng nhấn', 'Tím nhấn'], style: 'neon, cá tính', detail: 'áo đen có nét hồng tím và pattern tam giác sắc cạnh', tags: ['đen', 'hồng nhấn', 'tím nhấn', 'neon'] },
  { no: 26, file: source('d5', 'call_pqM1FhVuxpw2Q9MvXUGtvrSq.png'), palette: 'trắng chuyển xanh ngọc', mainColors: ['Trắng', 'Xanh ngọc'], accentColors: ['Xanh navy nhấn'], style: 'mát, sạch, hiện đại', detail: 'áo trắng chuyển xanh ngọc ở ngực và vai, quần xanh navy', tags: ['trắng', 'xanh ngọc', 'gradient'] },
  { no: 27, file: source('d5', 'call_mhnGPcoMZZF8znxnnGuOt13A.png'), palette: 'đen phối đỏ', mainColors: ['Đen'], accentColors: ['Đỏ nhấn'], style: 'mạnh, tối, tốc độ', detail: 'áo đen có đường đỏ ở vai, tay và thân, quần đen', tags: ['đen', 'đỏ nhấn', 'tốc độ'] },
  { no: 28, file: source('d5', 'call_dYRqAGPu8AbCk7zaFQGD69qW.png'), palette: 'trắng phối đỏ đô đen', mainColors: ['Trắng'], accentColors: ['Đỏ đô nhấn', 'Đen nhấn'], style: 'lịch sự, mạnh', detail: 'áo trắng với vai đỏ đô, chi tiết đen và quần đỏ đô', tags: ['trắng', 'đỏ đô nhấn', 'đen nhấn'] },
  { no: 29, file: source('d6', 'call_QJsQD03YxWTQb9Cj59dnRHTx.png'), palette: 'xanh dương chuyển trắng', mainColors: ['Xanh dương', 'Trắng'], accentColors: ['Navy nhấn'], style: 'sạch, hiện đại', detail: 'áo xanh dương chuyển trắng, quần navy', tags: ['xanh dương', 'trắng', 'gradient'] },
  { no: 30, file: source('d6', 'call_gDQF2hdZJfaxjZeKhIDbKgFp.png'), palette: 'tím chuyển hồng', mainColors: ['Tím'], accentColors: ['Hồng nhấn'], style: 'gradient nổi bật', detail: 'áo tím chuyển hồng ở thân dưới, quần tím', tags: ['tím', 'hồng nhấn', 'gradient'] },
  { no: 31, file: source('d6', 'call_qhLtHqWIunJQXiajCFPLj8pU.png'), palette: 'tím đậm phối hồng', mainColors: ['Tím đậm'], accentColors: ['Hồng nhấn'], style: 'sân đêm, trẻ trung', detail: 'áo tím đậm có mảng hồng và vân chuyển màu ở thân', tags: ['tím đậm', 'hồng nhấn', 'gradient'] },
  { no: 32, file: source('d6', 'call_bzYvq2Qi7lVsjlhzarbRnUQi.png'), palette: 'đen phối đỏ trắng', mainColors: ['Đen'], accentColors: ['Đỏ nhấn', 'Trắng nhấn'], style: 'mạnh, sắc cạnh', detail: 'áo đen với dải đỏ trắng ở vai và hông, quần đen', tags: ['đen', 'đỏ nhấn', 'trắng nhấn'] },
  { no: 33, file: source('d6', 'call_Jj3lfx3CrZK5XWKEeBMgy2hU.png'), palette: 'tím xanh chuyển hồng', mainColors: ['Tím', 'Xanh dương'], accentColors: ['Hồng nhấn'], style: 'gradient sân đêm', detail: 'áo tím xanh chuyển hồng ở thân dưới, quần tím', tags: ['tím', 'xanh dương', 'hồng nhấn', 'gradient'] },
  { no: 34, file: source('d6', 'call_22XXxFj3IY4kpNy4ue8Qniqo.png'), palette: 'đỏ phối trắng', mainColors: ['Đỏ'], accentColors: ['Trắng nhấn'], style: 'classic, nổi bật', detail: 'áo đỏ có họa tiết xương cá chìm, quần trắng', tags: ['đỏ', 'trắng nhấn', 'họa tiết chìm'] },
  { no: 35, file: source('d6', 'call_Nx5bEubaTpqb6Tm2M0ycf1ZQ.png'), palette: 'xanh dương chuyển trắng', mainColors: ['Xanh dương', 'Trắng'], accentColors: ['Navy nhấn'], style: 'sáng, gọn', detail: 'áo xanh dương chuyển trắng với thân dưới sáng, quần xanh navy', tags: ['xanh dương', 'trắng', 'gradient'] },
  { no: 36, file: source('d6', 'call_VO25trhsxEoXC08IHlJCgZRv.png'), palette: 'tím phối đỏ cam', mainColors: ['Tím'], accentColors: ['Đỏ cam nhấn'], style: 'đồ họa mạnh, năng lượng', detail: 'áo tím với họa tiết đỏ cam kiểu brush ở thân dưới', tags: ['tím', 'đỏ cam nhấn', 'họa tiết brush'] },
  { no: 37, file: source('d6', 'call_dmZ8ARhpIjWJwAjIJ3Qrz1xR.png'), palette: 'tím lavender phối tím đậm', mainColors: ['Tím lavender', 'Tím đậm'], accentColors: ['Trắng nhấn'], style: 'mũi tên, kỹ thuật', detail: 'áo tím lavender với họa tiết mũi tên dọc thân và quần tím đậm', tags: ['tím lavender', 'tím đậm', 'mũi tên'] },
  { no: 38, file: source('d6', 'call_p8hUvcuXiep1j53N4NKd1lRh.png'), palette: 'xanh royal phối navy', mainColors: ['Xanh royal'], accentColors: ['Navy nhấn'], style: 'sạch, thi đấu', detail: 'áo xanh royal trơn gọn với quần navy', tags: ['xanh royal', 'navy nhấn', 'tối giản'] },
  { no: 39, file: source('d6', 'call_G8rnFcb6wPmaAkPuYUN27WFb.png'), palette: 'xanh navy phối xám đỏ', mainColors: ['Xanh navy'], accentColors: ['Xám nhấn', 'Đỏ nhấn'], style: 'kẻ sọc kỹ thuật', detail: 'áo xanh navy có các mảng xám và đường đỏ mảnh ở thân', tags: ['xanh navy', 'xám nhấn', 'đỏ nhấn', 'kẻ sọc'] },
  { no: 40, file: source('d6', 'call_LoPQKP4MpZd1mYXKpi0fbYzl.png'), palette: 'trắng phối hồng xanh', mainColors: ['Trắng'], accentColors: ['Hồng nhấn', 'Xanh dương nhấn'], style: 'geometric trẻ trung', detail: 'áo trắng có họa tiết tam giác hồng xanh, quần navy', tags: ['trắng', 'hồng nhấn', 'xanh dương nhấn', 'geometric'] },
  { no: 41, file: source('d6', 'call_fiEh8ARKxJJCQa5G48RzYEUB.png'), palette: 'trắng phối xanh teal', mainColors: ['Trắng'], accentColors: ['Xanh teal nhấn'], style: 'sạch, viền thể thao', detail: 'áo trắng có viền xanh teal ở thân và tay, quần teal', tags: ['trắng', 'xanh teal nhấn', 'viền thể thao'] },
  { no: 42, file: source('d6', 'call_fAzEaAh5AF3ey7NGCkWJkAf6.png'), palette: 'trắng phối đỏ đen', mainColors: ['Trắng'], accentColors: ['Đỏ nhấn', 'Đen nhấn'], style: 'sáng, tốc độ', detail: 'áo trắng có đường đỏ và navy mảnh ở thân, quần đen', tags: ['trắng', 'đỏ nhấn', 'đen nhấn'] },
  { no: 43, file: source('d6', 'call_GDCPA9nzci7lGECW2Y3R2JWo.png'), palette: 'tím phối xanh hồng', mainColors: ['Tím', 'Xanh dương'], accentColors: ['Hồng nhấn'], style: 'gradient điện ảnh', detail: 'áo tím xanh chuyển hồng ở thân, quần tím', tags: ['tím', 'xanh dương', 'hồng nhấn', 'gradient'] },
  { no: 44, file: source('d6', 'call_UyPxSWTBphS0MPx0w8yoMU2V.png'), palette: 'xanh trắng họa tiết cam', mainColors: ['Xanh dương', 'Trắng'], accentColors: ['Cam nhấn'], style: 'pattern mạnh, sân đêm', detail: 'áo xanh trắng có họa tiết loang và điểm cam nhỏ', tags: ['xanh dương', 'trắng', 'cam nhấn', 'pattern loang'] },
  { no: 45, file: source('d6', 'call_W1Lj4QZK9jCXpGe6Syp19KTn.png'), palette: 'trắng phối hồng xanh', mainColors: ['Trắng'], accentColors: ['Hồng nhấn', 'Xanh dương nhấn'], style: 'geometric, sáng', detail: 'áo trắng với họa tiết hình khối hồng xanh, quần navy', tags: ['trắng', 'hồng nhấn', 'xanh dương nhấn', 'geometric'] },
  { no: 46, file: source('d6', 'call_jLgIAqFVVX3H85DqD85QUEsJ.png'), palette: 'tím phối đỏ cam', mainColors: ['Tím'], accentColors: ['Đỏ cam nhấn'], style: 'năng lượng, gradient', detail: 'áo tím có mảng đỏ cam ở thân dưới và quần tím', tags: ['tím', 'đỏ cam nhấn', 'gradient'] },
  { no: 47, file: source('d6', 'call_3CexQWyFXnSIheC4uWnbBjnI.png'), palette: 'xanh navy chuyển trắng', mainColors: ['Xanh navy', 'Trắng'], accentColors: ['Xanh nhạt nhấn'], style: 'sạch, họa tiết chìm', detail: 'áo xanh navy chuyển trắng với vân chìm ở ngực, quần navy', tags: ['xanh navy', 'trắng', 'họa tiết chìm'] },
  { no: 48, file: source('d6', 'call_12c5I1UEsgy2l46c6nA5mhJu.png'), palette: 'hồng nhạt phối xanh dương', mainColors: ['Hồng nhạt'], accentColors: ['Xanh dương nhấn'], style: 'pastel, khác biệt', detail: 'áo hồng nhạt có tay và quần xanh dương, phong cách nhẹ nhưng nổi', tags: ['hồng nhạt', 'xanh dương nhấn', 'pastel'] },
  { no: 49, file: source('d6', 'call_HnFeF56cSn5RlzMV3JsqwxkQ.png'), palette: 'xanh royal họa tiết chìm', mainColors: ['Xanh royal'], accentColors: ['Xanh đậm nhấn'], style: 'mạnh, đồng bộ', detail: 'áo xanh royal với vân hình học chìm và quần xanh', tags: ['xanh royal', 'xanh đậm nhấn', 'họa tiết chìm'] },
]

function slug(no: number) {
  return `ao-bong-da-thiet-ke-2026-${String(no).padStart(3, '0')}`
}

function nameFor(poster: Poster) {
  return `Áo bóng đá thiết kế 2026 mẫu ${String(poster.no).padStart(3, '0')} - ${poster.palette}`
}

function skuFor(poster: Poster) {
  return `X24-MABD-2026-${String(poster.no).padStart(3, '0')}`
}

async function authHeaders() {
  if (process.env.PAYLOAD_API_KEY) return { authorization: `users API-Key ${process.env.PAYLOAD_API_KEY}` }
  if (!process.env.CMS_ADMIN_EMAIL || !process.env.CMS_ADMIN_PASSWORD) {
    throw new Error('PAYLOAD_API_KEY or CMS_ADMIN_EMAIL/CMS_ADMIN_PASSWORD is required')
  }
  const response = await fetch(`${CMS_API_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: process.env.CMS_ADMIN_EMAIL, password: process.env.CMS_ADMIN_PASSWORD }),
  })
  if (!response.ok) throw new Error(`CMS login failed: ${response.status}`)
  const data = (await response.json()) as { token?: string }
  if (!data.token) throw new Error('CMS login response did not include a token')
  return { authorization: `JWT ${data.token}` }
}

async function api<T>(auth: Record<string, string>, route: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers)
  for (const [key, value] of Object.entries(auth)) headers.set(key, value)
  if (init.body && !(init.body instanceof FormData) && !headers.has('content-type')) headers.set('content-type', 'application/json')
  const response = await fetch(`${CMS_API_URL}${route}`, { ...init, headers })
  const text = await response.text()
  if (!response.ok) throw new Error(`${init.method || 'GET'} ${route} ${response.status}: ${text.slice(0, 500)}`)
  return (text ? JSON.parse(text) : {}) as T
}

async function first<T extends Doc>(auth: Record<string, string>, collection: string, params: URLSearchParams) {
  params.set('limit', params.get('limit') || '1')
  const result = await api<Paginated<T>>(auth, `/api/${collection}?${params}`)
  return result.docs[0] ?? null
}

const unwrap = <T extends Doc>(value: T | { doc?: T }) => ('doc' in value && value.doc ? value.doc : (value as T))

async function imageBuffer(imagePath: string) {
  const sourceBuffer = fs.readFileSync(imagePath)
  return sharp(sourceBuffer).resize({ width: 1400, height: 1400, fit: 'inside', withoutEnlargement: true }).webp({ quality: 92 }).toBuffer()
}

function contentFor(poster: Poster) {
  const name = nameFor(poster)
  const colorText = poster.mainColors.join(', ').toLowerCase()
  const accentText = poster.accentColors.join(', ').toLowerCase()
  const shortDescription = `${name} dành cho đội bóng phong trào, câu lạc bộ và doanh nghiệp cần mẫu áo ${colorText}; ${poster.detail}.`
  const paragraphs = [
    `${name} là mẫu poster áo bóng đá 2026 dành cho đội bóng phong trào, câu lạc bộ, lớp, công ty hoặc giải đấu nội bộ muốn đặt may đồng phục thi đấu theo thiết kế riêng.`,
    `Mẫu có màu chủ đạo ${colorText}${accentText ? `, phối điểm nhấn ${accentText}` : ''}. ${poster.detail.charAt(0).toUpperCase()}${poster.detail.slice(1)}.`,
    `Phong cách tổng thể ${poster.style}. Khi đặt may, đội có thể tùy chỉnh logo, tên đội, tên cầu thủ, số áo, kiểu cổ và size theo danh sách thành viên.`,
  ]
  const html = `
<h2>${name}</h2>
<p>${paragraphs[0]}</p>
<h3>Màu sắc và phong cách</h3>
<p>${paragraphs[1]} Các màu nhấn được dùng để tạo đường viền, logo hoặc họa tiết phụ, không thay thế màu áo chủ đạo.</p>
<h3>Tùy chỉnh khi đặt may</h3>
<ul>
  <li>Thêm logo đội bóng, nhà tài trợ hoặc biểu tượng câu lạc bộ.</li>
  <li>In tên cầu thủ, số áo, tên đội và danh sách size theo yêu cầu.</li>
  <li>Chọn kiểu cổ áo phù hợp: cổ tròn, cổ V hoặc cổ polo tùy mẫu.</li>
  <li>Phù hợp thi đấu sân 5, sân 7, sân 11, giải nội bộ và team building thể thao.</li>
</ul>
<h3>Giá tham khảo</h3>
<p>Giá ưu đãi 119.000đ, giá gốc 159.000đ. Giá thực tế có thể thay đổi theo số lượng, chất liệu vải và yêu cầu in ấn.</p>`.trim()
  return { shortDescription, paragraphs, html }
}

async function main() {
  for (const poster of posters) {
    if (!fs.existsSync(poster.file)) throw new Error(`Missing image: ${poster.file}`)
  }

  const auth = await authHeaders()
  const me = await api<Doc>(auth, '/api/users/me')
  const tenant = await first<Doc>(auth, 'tenants', new URLSearchParams({ 'where[slug][equals]': TENANT_SLUG, depth: '0' }))
  if (!tenant) throw new Error(`Tenant ${TENANT_SLUG} not found`)
  const tenantID = Number(tenant.id)

  const categoryData = {
    tenant: tenantID,
    name: 'Áo bóng đá thiết kế 2026',
    slug: CATEGORY_SLUG,
    group: 'type',
    description: 'Bộ sưu tập áo bóng đá thiết kế 2026 với nhiều phối màu, họa tiết và phong cách poster để đội bóng chọn mẫu trước khi đặt may theo logo, tên số và size riêng.',
    legacyPath: CATEGORY_PATH,
    sourceSystem: SOURCE_SYSTEM,
    sourceId: 'selected-football-posters-category',
    order: 16,
  }
  const existingCategory = await first<Doc>(auth, 'product-categories', new URLSearchParams({
    'where[and][0][tenant][equals]': String(tenantID),
    'where[and][1][slug][equals]': CATEGORY_SLUG,
    depth: '0',
  }))

  const plans = []
  for (const poster of posters) {
    const buffer = await imageBuffer(poster.file)
    const checksum = createHash('sha256').update(buffer).digest('hex')
    const sourceId = `${slug(poster.no)}-poster`
    const existingProduct = await first<Doc>(auth, 'products', new URLSearchParams({
      'where[and][0][tenant][equals]': String(tenantID),
      'where[and][1][or][0][and][0][sourceSystem][equals]': SOURCE_SYSTEM,
      'where[and][1][or][0][and][1][sourceId][equals]': sourceId,
      'where[and][1][or][1][sku][equals]': skuFor(poster),
      'where[and][1][or][2][slug][equals]': slug(poster.no),
      depth: '0',
    }))
    const existingMedia = await first<Doc>(auth, 'media', new URLSearchParams({
      'where[and][0][tenant][equals]': String(tenantID),
      'where[and][1][or][0][and][0][sourceSystem][equals]': SOURCE_SYSTEM,
      'where[and][1][or][0][and][1][sourceId][equals]': `${sourceId}-hero`,
      'where[and][1][or][1][sourceChecksum][equals]': checksum,
      depth: '0',
    }))
    plans.push({
      no: poster.no,
      slug: slug(poster.no),
      product: existingProduct ? { action: 'update', id: existingProduct.id } : { action: 'create' },
      media: existingMedia ? { action: 'reuse', id: existingMedia.id } : { action: 'create' },
      url: `https://mayaobongda.vn/${slug(poster.no)}/`,
      checksum,
    })
  }

  if (!apply) {
    console.log(JSON.stringify({
      mode: 'dry-run',
      user: me?.user?.email || me?.email || 'authenticated',
      tenant: { id: tenantID, slug: TENANT_SLUG },
      category: existingCategory ? { action: 'update', id: existingCategory.id } : { action: 'create' },
      products: plans,
    }, null, 2))
    return
  }

  const category = existingCategory
    ? unwrap<Doc>(await api(auth, `/api/product-categories/${existingCategory.id}`, { method: 'PATCH', body: JSON.stringify(categoryData) }))
    : unwrap<Doc>(await api(auth, '/api/product-categories', { method: 'POST', body: JSON.stringify(categoryData) }))

  const results = []
  for (const poster of posters) {
    const buffer = await imageBuffer(poster.file)
    const checksum = createHash('sha256').update(buffer).digest('hex')
    const productSlug = slug(poster.no)
    const sourceId = `${productSlug}-poster`
    const content = contentFor(poster)
    const sharedTags = rows([
      'áo bóng đá',
      'áo bóng đá thiết kế',
      'football 2026 collection',
      'đồng phục bóng đá',
      'đặt may áo bóng đá',
      'in tên số',
      ...poster.mainColors,
      ...poster.accentColors,
      ...poster.tags,
    ])

    let media = await first<Doc>(auth, 'media', new URLSearchParams({
      'where[and][0][tenant][equals]': String(tenantID),
      'where[and][1][or][0][and][0][sourceSystem][equals]': SOURCE_SYSTEM,
      'where[and][1][or][0][and][1][sourceId][equals]': `${sourceId}-hero`,
      'where[and][1][or][1][sourceChecksum][equals]': checksum,
      depth: '0',
    }))
    if (!media) {
      const form = new FormData()
      form.set('_payload', JSON.stringify({
        tenant: tenantID,
        alt: `${nameFor(poster)} - ${poster.detail}`,
        searchTags: sharedTags,
        sourceSystem: SOURCE_SYSTEM,
        sourceId: `${sourceId}-hero`,
        sourceChecksum: checksum,
        sourceUrl: poster.file,
      }))
      form.set('file', new File([new Uint8Array(buffer)], `${productSlug}.webp`, { type: 'image/webp' }))
      media = unwrap<Doc>(await api(auth, '/api/media', { method: 'POST', body: form }))
    }

    const existingProduct = await first<Doc>(auth, 'products', new URLSearchParams({
      'where[and][0][tenant][equals]': String(tenantID),
      'where[and][1][or][0][and][0][sourceSystem][equals]': SOURCE_SYSTEM,
      'where[and][1][or][0][and][1][sourceId][equals]': sourceId,
      'where[and][1][or][1][sku][equals]': skuFor(poster),
      'where[and][1][or][2][slug][equals]': productSlug,
      depth: '0',
    }))

    const productData = {
      tenant: tenantID,
      name: nameFor(poster),
      slug: productSlug,
      sku: skuFor(poster),
      sport: 'football',
      productType: 'simple',
      publicationStatus: 'publish',
      featured: poster.no <= 12,
      categories: [Number(category.id)],
      price: 119000,
      regularPrice: 159000,
      salePrice: 119000,
      compareAtPrice: 159000,
      currency: 'VND',
      stockStatus: 'instock',
      isPurchasable: false,
      isOnBackorder: false,
      shortDescription: content.shortDescription,
      description: lexical(content.paragraphs),
      contentHtml: content.html,
      attributes: [
        { name: 'Màu chủ đạo', values: rows(poster.mainColors) },
        { name: 'Màu nhấn', values: rows(poster.accentColors) },
        { name: 'Phong cách', values: rows([poster.style]) },
        { name: 'Tùy chỉnh', values: rows(['Logo đội bóng', 'Tên cầu thủ', 'Số áo', 'Kiểu cổ áo', 'Size theo danh sách']) },
      ],
      badges: [{ label: 'Football 2026' }, { label: 'Thiết kế riêng' }],
      searchTags: sharedTags,
      gallery: [Number(media.id)],
      seoTitle: `${nameFor(poster)} | May áo bóng đá 119k`,
      metaDescription: `${nameFor(poster)} với màu chủ đạo ${poster.mainColors.join(', ').toLowerCase()}, giá tham khảo 119k. Nhận in logo, tên số và size đội bóng.`,
      legacyPath: `/${productSlug}/`,
      sourceSystem: SOURCE_SYSTEM,
      sourceId,
      sourceChecksum: checksum,
      sourceCreatedAt: new Date().toISOString(),
      sourceModifiedAt: new Date().toISOString(),
    }

    const product = existingProduct
      ? unwrap<Doc>(await api(auth, `/api/products/${existingProduct.id}`, { method: 'PATCH', body: JSON.stringify(productData) }))
      : unwrap<Doc>(await api(auth, '/api/products', { method: 'POST', body: JSON.stringify(productData) }))

    results.push({
      no: poster.no,
      product: { action: existingProduct ? 'updated' : 'created', id: product.id, sku: skuFor(poster), url: `https://mayaobongda.vn/${productSlug}/` },
      media: { id: media.id, url: media.url },
    })
  }

  const count = await api<Paginated<Doc>>(auth, `/api/products?${new URLSearchParams({
    'where[and][0][tenant][equals]': String(tenantID),
    'where[and][1][publicationStatus][equals]': 'publish',
    'where[and][2][categories][equals]': String(category.id),
    depth: '0',
    limit: '1',
  })}`)
  await api(auth, `/api/product-categories/${category.id}`, { method: 'PATCH', body: JSON.stringify({ productCount: count.totalDocs }) })

  console.log(JSON.stringify({ mode: 'apply', tenant: { id: tenantID, slug: TENANT_SLUG }, category: { id: category.id, productCount: count.totalDocs }, products: results }, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
