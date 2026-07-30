import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const ROOT = new URL('.', import.meta.url).pathname

const stripKidFromName = (name) => name
  .replace(/Áo bóng đá trẻ em\s*/i, 'Áo bóng đá ')
  .replace(/\s+/g, ' ')
  .trim()

const adultSlug = (slug) => slug.replace('ao-bong-da-tre-em-', 'ao-bong-da-nguoi-lon-')

const adultName = (name) => stripKidFromName(name).replace(/^Áo bóng đá\s*/i, 'Áo bóng đá người lớn ')

const adultSku = (sku) => sku?.replace('-KID-', '-ADULT-') || null

const main = async () => {
  const ledger = JSON.parse(await readFile(join(ROOT, 'ledger.json'), 'utf8'))
  const variants = ledger.flatMap((item) => [
    {
      ...item,
      variant: 'kids',
      ageLabel: 'Trẻ em',
      ageSlug: 'tre-em',
      targetName: item.targetName,
      targetSlug: item.targetSlug,
      targetSku: item.targetSku,
      targetImageFile: item.targetImageFile,
      imageAltSuffix: 'trên sân bóng đá trẻ em',
    },
    {
      ...item,
      variant: 'adult',
      ageLabel: 'Người lớn',
      ageSlug: 'nguoi-lon',
      targetName: adultName(item.targetName),
      targetSlug: adultSlug(item.targetSlug),
      targetSku: adultSku(item.targetSku),
      targetImageFile: `${adultSlug(item.targetSlug)}.webp`,
      imageAltSuffix: 'trên sân bóng đá người lớn',
    },
  ])
  await writeFile(join(ROOT, 'variant-ledger.json'), JSON.stringify(variants, null, 2))
  await writeFile(
    join(ROOT, 'variant-products.tsv'),
    [
      'sourceProductId\tvariant\ttargetSlug\ttargetName\ttargetSku\tsourceImageUrl\ttargetImageFile',
      ...variants.map((item) => [
        item.sourceProductId,
        item.variant,
        item.targetSlug,
        item.targetName,
        item.targetSku || '',
        item.sourceImageUrl || '',
        item.targetImageFile,
      ].join('\t')),
    ].join('\n'),
  )
  console.log(JSON.stringify({
    sourceCount: ledger.length,
    variantCount: variants.length,
    kids: variants.filter((item) => item.variant === 'kids').length,
    adult: variants.filter((item) => item.variant === 'adult').length,
  }, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
