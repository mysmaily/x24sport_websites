import { access, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const ROOT = new URL('.', import.meta.url).pathname
const START = Number(process.argv.find((arg) => arg.startsWith('--start='))?.split('=')[1] || 0)
const LIMIT = Number(process.argv.find((arg) => arg.startsWith('--limit='))?.split('=')[1] || 10)

const exists = async (file) => {
  try {
    await access(join(ROOT, 'generated', file))
    return true
  } catch {
    return false
  }
}

const promptFor = (item) => {
  const audience = item.variant === 'adult'
    ? {
      label: 'adult',
      subject: 'Vietnamese adult male football players',
      main: 'One handsome adult main model faces the camera upright from upper thigh/knee upward',
      avoid: 'children, ',
      scene: 'adult football team catalog product photo',
      suffix: 'adult football team',
    }
    : {
      label: 'kids',
      subject: 'Vietnamese youth football players',
      main: 'One youth main model faces the camera upright from knee upward',
      avoid: '',
      scene: 'kids football team catalog product photo',
      suffix: 'kids football team',
    }
  const color = item.colorText || 'the reference colors'
  return `Use case: product-mockup
Asset type: square WebP-ready catalog product image for mayaobongda.vn football jersey product.
Input image: reference jersey/design/color source for product ${item.targetSlug}. Use the garment color (${color}), trim, side motifs, and pattern layout as inspiration only.
Primary request: Convert the referenced basketball uniform sample into a realistic ${audience.scene}.
Scene/backdrop: real outdoor football pitch with goal net and training cones, softly blurred background.
Subject: ${audience.subject} wearing matching football kits inspired by the reference colors and pattern. ${audience.main}, front shirt design clear and unobstructed. One teammate turns backward showing number 10 and the name "Your Team" on the back. 2 supporting teammates train in the background.
Style/medium: realistic commercial sports catalog photography, high quality fabric texture, seams, collar, sleeve cuffs, shorts, natural shadows.
Composition/framing: 1:1 square, full kit visible, central front jersey large and readable, background activity behind or to the side.
Text (verbatim): only "Your Team" on the back shirt and number "10"; no other readable text.
Constraints: Keep the garment colors and useful decorative pattern from the reference, but remove every basketball-specific detail. Make it clearly football/soccer: football pitch, football/soccer ball, football kit sleeves, no basketball jersey silhouette.
Critical removal: remove or replace all source-image basketball information including the words basketball, basket ball, NBA, Raptors, player on front, X24-BR, size marks, website URL, phone number, basketball badge, basketball icon, basketball ball, basketball court, hoop, and any poster/product-label text.
Avoid: ${audience.avoid}basketballs, basketball court, basketball hoop, basketball badges, big X24 logo, club crest, QR code, price, watermark, phone number, website URL, large poster text, readable branding besides "Your Team" on the back, distorted hands, ball covering chest.`
}

const main = async () => {
  const ledger = JSON.parse(await readFile(join(ROOT, 'variant-ledger.json'), 'utf8'))
  const missing = []
  for (let i = START; i < ledger.length; i += 1) {
    const item = ledger[i]
    if (!(await exists(item.targetImageFile))) {
      missing.push({
        index: i,
        sourceProductId: item.sourceProductId,
        variant: item.variant,
        targetSlug: item.targetSlug,
        targetName: item.targetName,
        targetImageFile: item.targetImageFile,
        sourceImagePath: join(ROOT, 'originals', `${item.sourceProductId}-${new URL(item.sourceImageUrl).pathname.split('/').pop()}`),
        prompt: promptFor(item),
      })
      if (missing.length >= LIMIT) break
    }
  }
  console.log(JSON.stringify({ total: ledger.length, count: missing.length, missing }, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
