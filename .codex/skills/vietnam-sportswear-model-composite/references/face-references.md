# Female Face References

Use these only for fictional Vietnamese female model generation in this skill. All paths are relative to the skill folder.

| File | Use When | Notes |
|---|---|---|
| `assets/face-references/female-cute-soft-smile.png` | User wants a cute, soft, commercial-friendly female model. | Bright smile, tied-back hair, polished but still natural. |
| `assets/face-references/female-sporty-bright-smile.png` | User wants a fresh, sporty, brighter-face female model. | Slightly brighter skin version; use for badminton, running, football, pickleball, and upbeat catalog images. |
| `assets/face-references/female-natural-black-polo.png` | User wants the most natural, least AI-looking female model. | More everyday Vietnamese face, black polo source, good default when realism matters most. |

Selection rules:

- Default to `female-natural-black-polo.png` when the user says the output must look least AI.
- Default to `female-sporty-bright-smile.png` when the user asks for cute, white/fair, bright, or sporty.
- Default to `female-cute-soft-smile.png` when the user asks for soft, pretty, gentle, or commercial.
- For multiple female outputs, rotate through all three unless the user asks to lock one face.
- Always inspect the selected face image with `view_image` before using it as a reference.
- Preserve facial identity, but allow natural changes from lighting, expression intensity, and camera angle.
