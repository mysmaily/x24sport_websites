---
name: tao-anh-da-ngoai-v1
description: Create branded Mayaodongphuc outdoor picnic/team-building group images from one supplied shirt or uniform design image. Use when the user wants 3-8 people wearing the exact input shirt in an outdoor outing scene, with the garment design as the focus, deterministic Mayaodongphuc vertical logo placement, and per-image feature callouts such as "Vải thoáng mát" or "Co giãn tốt"; this v1 workflow is for individual info/lifestyle images, not catalog boards.
---

# Tao Anh Da Ngoai V1

Turn one garment design reference into polished square or portrait lifestyle images of a small outdoor group wearing that exact design. Prioritize shirt fidelity, believable Vietnamese/Southeast Asian people, natural picnic/team-building scenes, and clean deterministic branding/features.

This skill is **not** the catalog-board workflow. Produce individual branded/info images only. If the user later asks for a catalog/poster board, use or extend the outdoor catalog skill separately.

## Workflow

1. Inspect every supplied image reference before generation.
2. Create a design lock: shirt colors, collar, sleeve length, panels, trims, logo/artwork/text placement, fabric type, fit, and any detail that must not drift.
3. Choose a group plan: 3-8 people, default 4-5 adults, Vietnamese/Southeast Asian, mixed gender unless specified.
4. Choose one outdoor scene: park picnic, resort lawn, company outing, campsite picnic, garden team-building, or light walking/activity scene.
5. Generate a clean photo first. Do not ask the image model to draw the Mayaodongphuc logo, feature labels, hotline, badges, borders, or UI.
6. Inspect against `references/quality-gates.md`. Reject and correct hard failures before overlay.
7. Add the bundled logo and feature overlay deterministically with `scripts/apply_designer_info_overlay.py`.
8. Reinspect final output: logo/features must support the shirt, not cover the main design.
9. Validate output dimensions/files with `scripts/validate_output_files.py` when producing saved image files.

## Prompt Rules

State that supplied garment references define the exact product, not inspiration.

Prompt order:

1. commercial objective and crop;
2. group count, cast, poses, activity, and outdoor setting;
3. exact garment design lock for every wearer;
4. fabric realism and print behavior;
5. lighting, lens, depth, and composition;
6. exclusions.

Use 3-5 people when the shirt has complex artwork or text. Use 6-8 only when the design is simple enough to remain readable, and keep the camera close enough that the torso design stays dominant.

Hard exclusions: wrong shirt colors, changed collar/sleeves, random text, AI-redrawn Mayaodongphuc logo, unrelated brands, watermarks, malformed hands, cloned faces, plastic skin, pasted-on print, feature labels printed onto clothing, and text/UI covering the main shirt design.

## Feature Overlay

Use exactly one bundled logo:

`assets/mayaodongphuc-vertical.png`

Feature callouts are per-image info overlays, not catalog copy blocks. Use 3-4 concise Vietnamese features. Default set:

- `Vải thoáng mát` / `Mềm nhẹ, dễ vận động`
- `Co giãn tốt` / `Thoải mái khi hoạt động`
- `Form đồng bộ` / `Gọn gàng cho đội nhóm`
- `Hình in sắc nét` / `Màu in rõ, nổi bật`

Do not invent unsupported claims such as exact GSM, UV rating, waterproofing, certification, wash-count durability, or named print technology unless the user provides evidence.

Run the preferred designer-style overlay after the clean image is accepted:

```bash
python scripts/apply_designer_info_overlay.py input.png output.png \
  --logo-asset assets/mayaodongphuc-vertical.png \
  --skip-hotline
```

This renderer creates a single frosted information panel with grouped icon/text rows, a subtle garment-palette accent, and the real Mayaodongphuc logo in a top corner. Use it by default for v1.

Use the legacy flexible overlay only when the composition needs a different rail/grid/row placement:

```bash
python scripts/apply_info_overlay.py input.png output.png \
  --logo-asset assets/mayaodongphuc-vertical.png \
  --layout rail \
  --overlay-corner bottom-right \
  --auto-position \
  --backdrop gradient \
  --surface none \
  --fabric-title 'Vải thoáng mát' \
  --fabric-detail 'Mềm nhẹ, dễ vận động' \
  --design-title 'Co giãn tốt' \
  --design-detail 'Thoải mái khi hoạt động' \
  --durability-title 'Form đồng bộ' \
  --durability-detail 'Gọn gàng cho đội nhóm' \
  --printing-title 'Hình in sắc nét' \
  --printing-detail 'Màu in rõ, nổi bật'
```

For the legacy overlay, prefer `rail`, `grid`, or `row` for v1 individual images. Use `bottom-band` only when the generated image reserved a safe footer area. Keep the logo in a top corner and features near a quiet edge. Never place overlays on faces, hands, collars, customer artwork, or the main chest/back design.

`apply_info_overlay.py` enforces the Mayaodongphuc hotline default `0989 353 247`. If the user wants no hotline, pass `--skip-hotline`. Do not add another number.

## Designer Support

Use `references/designer-checklist.md` before overlay or when the image needs stronger design direction. It condenses the installed `owl-listener/designer-skills` UI design and visual critique guidance into this image workflow: hierarchy, composition, typography, color, spacing, responsive thumbnail legibility, and critique pass.

Use `references/shot-direction.md` for group compositions and scene variants.

Use `references/quality-gates.md` for acceptance.

## Final Output Standard

Accept only images where:

- the shirt design is clearly the first read;
- every visible shirt follows the design lock;
- people and fabric look photographic and natural;
- logo is the real bundled asset, crisp, top-corner pinned, and secondary;
- feature text is readable at thumbnail size;
- overlay placement feels designed, aligned, and light;
- output is individual image artwork, not a catalog board.
