# Female Face References

Use these only for fictional Vietnamese female model generation in this skill. All paths are relative to the skill folder.

| File | Use When | Notes |
|---|---|---|
| `assets/face-references/female-cute-soft-smile.png` | User wants a cute, soft, commercial-friendly female model. | Bright smile, tied-back hair, polished but still natural. |
| `assets/face-references/female-sporty-bright-smile.png` | User wants a fresh, sporty, brighter-face female model. | Slightly brighter skin version; use for badminton, running, football, pickleball, and upbeat catalog images. |
| `assets/face-references/female-natural-black-polo.png` | User wants the most natural, least AI-looking female model. | More everyday Vietnamese face, black polo source, good default when realism matters most. |
| `assets/face-references/female-locked-01-soft-side-sweep.png` | User wants to lock the first regenerated face reference from the Aug 15 batch. | Soft side-swept long hair, warm natural smile, medium-light skin, small hoop earrings; best for gentle realistic catalog images. |
| `assets/face-references/female-locked-02-downward-soft.png` | User wants to lock the second regenerated face reference from the Aug 15 batch. | Fair skin, long hair partly tied up, downward three-quarter gaze; useful for side/leaning/candid poses. |
| `assets/face-references/female-locked-03-dimple-bright-smile.png` | User wants to lock the third regenerated face reference from the Aug 15 batch. | Bright smile with visible dimples, long hair swept back; useful for upbeat, sporty, smiling catalog shots. |
| `assets/face-references/female-locked-04-clean-front.png` | User wants to lock the fourth regenerated face reference from the Aug 15 batch. | Clean mostly-front face reference, large eyes, straight side-parted hair; easiest lock for consistent model identity. |
| `assets/face-references/female-locked-05-toothy-smile.png` | User wants to lock the fifth regenerated face reference from the Aug 15 batch. | Friendly toothy smile, shoulder-length hair, yellow top; useful for cheerful commercial model shots. |

Selection rules:

- Default to `female-natural-black-polo.png` when the user says the output must look least AI.
- Default to `female-sporty-bright-smile.png` when the user asks for cute, white/fair, bright, or sporty.
- Default to `female-cute-soft-smile.png` when the user asks for soft, pretty, gentle, or commercial.
- Use `female-locked-01..05` when the user asks to use the regenerated/locked face batch, references one of the five supplied girls, or wants one model identity held across multiple outputs.
- For multiple female outputs, rotate through all available female references unless the user asks to lock one face.
- Always inspect the selected face image with `view_image` before using it as a reference.
- Preserve facial identity, but allow natural changes from lighting, expression intensity, and camera angle.
