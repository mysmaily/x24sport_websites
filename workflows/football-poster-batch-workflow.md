# Football Poster Batch Imagegen Workflow

Use this workflow when the user pastes one or more apparel reference image URLs
directly into the ChatGPT/Codex chat and asks for football-kit sales posters.
The user does not run commands. The agent runs the local job builder, calls
image generation, saves the output, and returns the rendered image/file path.
The script also persists pasted source-image history to
`workflows/football-poster-source-history.json` so the same source URLs can be
recovered after switching machines or reopening the task.

## Inputs

- Primary chat input: one or more image URLs pasted directly by the user.
- Source images can come from any sport category, not only pickleball. Treat
  them as apparel-design references.
- Also supported by the script, but not required from the user:
  - local image paths;
  - a text file with one image path or URL per line.
- Background mode:
  - `auto`: random style from the full poster-background pool.
  - `alternate`: alternates dark/light while rotating through style families.
  - `dark`: random style from the dark poster-background pool.
  - `light`: random style from the light poster-background pool.
  - The script records both `background` and `background_style` in `jobs.json`.
- Top title: use text only, exactly `Football 2026 Collection`. Do not place an
  X24 badge or logo at the top.
- Chest logo source: random image from `https://x24sport.vn/danh-muc/dich-vu/`.
- Default number: `24`.
- Persistent source history:
  - default path: `workflows/football-poster-source-history.json`;
  - every script run upserts each source URL into that JSON by `source_input`;
  - the JSON records first/last seen time, run count, last output directory,
    background style, random chest-logo URL, and jersey number;
  - pass `--no-history` only for throwaway tests.

## Chat-First Agent Flow

When the user pastes URL(s) in chat:

1. Treat every pasted image URL as a source apparel reference.
2. Check `workflows/football-poster-source-history.json` first. If a pasted URL
   already exists, use the stored entry to understand the previous run and avoid
   asking the user to paste older URLs again.
3. Run `scripts/football_poster_jobs.py` with the URL(s) as positional
   arguments. Do not ask the user to create an input file.
4. Inspect the generated `jobs.json` for `background`, `background_style`,
   `chest_logo_source_url`, `referenced_image_paths`, and `prompt`.
5. Confirm the run also updated
   `workflows/football-poster-source-history.json`.
6. Call the built-in image generation tool once per job, using that job's
   `referenced_image_paths` and `prompt`.
7. Copy the generated image from `$CODEX_HOME/generated_images/...` into
   `tmp/imagegen/outputs/` with a descriptive filename.
8. Render the saved image back to the user and include the absolute file link.

Single pasted URL command template:

```bash
python3 scripts/football_poster_jobs.py \
  'https://static.x24sport.vn/mayaopickleball/pb281-round-neck.png' \
  --background auto \
  --seed 24 \
  --number 24 \
  --output-dir tmp/imagegen/football-poster-<slug>
```

Multiple pasted URLs command template:

```bash
python3 scripts/football_poster_jobs.py \
  'https://static.x24sport.vn/mayaopickleball/image-1.webp' \
  'https://static.x24sport.vn/mayaopickleball/image-2.webp' \
  --background auto \
  --seed 24 \
  --number 24 \
  --output-dir tmp/imagegen/football-poster-batch-<date-or-slug>
```

The script writes:

- `<output-dir>/jobs.json`
- `<output-dir>/jobs.jsonl`
- downloaded source images under `<output-dir>/sources/`
- downloaded random chest-logo references under
  `<output-dir>/chest-logos/`

Each job contains `referenced_image_paths` and a complete prompt. Use those
values with the built-in `image_gen` edit/generate flow.

## Optional File-Based Flow

Use this only if the user explicitly provides or requests a list file:

```bash
python3 scripts/football_poster_jobs.py \
  --input-file /tmp/x24-football-inputs.txt \
  --background auto \
  --seed 24 \
  --number 24
```

## Required Poster Rules

- Poster is square `1:1`.
- Background should feel like one cohesive poster, not two unrelated vertical
  halves. Left and right can have different contrast, but they should share
  lighting, gradient language, accent color, and atmosphere.
- Background style rotates across a varied set of poster-ready looks:
  `light-stadium-glow`, `light-speed-streaks`, `light-editorial-sweep`,
  `light-technical-grid`, `light-color-burst`, `light-studio-floor`,
  `dark-stadium-night`, `dark-neon-diagonal`, `dark-premium-studio`,
  `dark-tactical-grid`, `dark-smoke-spotlight`, and `dark-color-energy`.
- Left side shows one Vietnamese adult male football model wearing the converted
  kit.
- Right side shows front jersey, back jersey, shorts, collar options, size row,
  and footer.
- Top title is exactly `Football 2026 Collection`.
- Title should be a designer-level sports poster lockup, not plain/default typed
  text. Use premium display lettering, intentional spacing, and subtle depth
  while keeping the exact words readable.
- No X24 badge or logo appears at the top.
- Product mockups should be balanced, clean, and naturally proportioned.
- On the worn model, the jersey should look photorealistic: natural wrinkles,
  fabric tension, sleeve folds, hem shadows, underarm/contact shadows, and real
  drape. Avoid flat AI-painted clothing.
- Preserve the source shirt design accurately, but convert the poster context
  to football. Remove or convert other-sport details: basketballs become
  football/soccer balls; hoops, paddles, rackets, pickleball/tennis/badminton
  nets, and sport-specific courts become football pitch/stadium or neutral
  studio elements.
- Right-chest number is always present.
- Shorts number is always present.
- Shorts are one solid color only: no pattern, no gradient, no decorative print,
  no stripes, no contrast panels, no contrast waistband, no contrast hem trim,
  no piping. Only the shorts number and natural fabric shadows/wrinkles are
  allowed.
- Left-chest badge uses the random logo reference from the service category.
- Back jersey uses `TÊN CẦU THỦ`, large number, and `TÊN ĐỘI BÓNG`.
- Collar strip title is `TÙY CHỌN CỔ ÁO`.
- Collar options are `Cổ tròn`, `Cổ V viền`, `Cổ V chéo`, `Cổ V phối`, and
  `Cổ polo`.
- Size row is `S`, `M`, `L`, `XL`, `2XL`, `3XL`, `4XL`.
- Collar options and size row are centered horizontally in the right panel and
  aligned to the same center axis.
- Footer is `X24SPORT.VN | HOTLINE: 0989 353 247`.

## Quality Check

Before accepting an output, visually verify:

- the top title reads `Football 2026 Collection`;
- no top X24 logo or badge is present;
- the background is poster-like and cohesive across left/right areas;
- repeated batch outputs do not all use the same background family;
- all poster text is readable;
- no `mayaopickleball.vn` logo, URL, paddle, or court UI remains;
- no non-football sport props remain unless intentionally converted to football;
- the model is male Vietnamese;
- the chest and shorts numbers are both visible;
- the shorts are a single solid color;
- the random chest logo is present as a small left-chest badge;
- the generated layout does not crowd the collar options or footer.
- the collar options and size row are centered inside the right-side frame.
- shirt mockups are not warped, lopsided, stretched, or visually unbalanced.
- title typography does not look like a default office/document font.
- worn jersey has believable wrinkles, fabric tension, and shadows.
- shorts have no trim/piping/side panels/waistband contrast.
