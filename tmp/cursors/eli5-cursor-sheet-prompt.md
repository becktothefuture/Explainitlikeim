# Cursor Sheet Prompt

Recommended external-generator size: `3072x2048` PNG with transparent background.

Repo-native OpenAI image workflow size: `1536x1024` PNG with transparent background.

Why this size:
- It preserves an exact `3 x 2` sheet.
- Each cursor gets a precise `1024 x 1024` cell.
- That gives you clean cut lines and more predictable hotspot alignment after slicing.

This prompt now follows the exact illustration prompt pattern already used in the repo for:
- `tmp/imagegen/eli5-illustrations.jsonl`
- `public/assets/how/how-benefit-start.png`
- `public/assets/how/how-benefit-detail.png`
- `public/assets/install/install-step-1.png`

Use this prompt:

```text
Use case: stylized-concept
Asset type: transparent website cursor asset sheet
Primary request: a precise 3x2 sheet of six cursor assets for a website, with one cursor illustration centered in each cell: standard arrow cursor, hand pointer cursor, clicking hand pointer cursor, text I-beam cursor, open-hand grab cursor, and closed-hand grabbing cursor; the sheet must be production-ready for clean cutout and hotspot alignment
Style/medium: polished bitmap illustration, rounded toy-like forms, subtle 3D depth, soft bevels, premium app-store illustration vibe, gentle realism rather than flat iconography; match the same illustration family as the existing site art; clean, crisp, controlled, and precise rather than cartoony
Composition/framing: exact 3072x2048 canvas; strict 3 columns by 2 rows; each cell exactly 1024x1024; one cursor per cell; each cursor centered inside its cell with generous transparent padding; keep every cursor fully inside an approximately 768x768 safe area; no crop; no overlap between cells; scale all six assets consistently; straight-on presentation with stable alignment so the silhouettes can be cut out accurately later
Lighting/mood: soft studio lighting from upper left, crisp restrained highlights, subtle internal shading, premium product-illustration feel; no dramatic spotlight background; no scene lighting
Color palette: warm cream, milk-paper, and soft oatmeal base tones; dark charcoal details; restrained cobalt blue and blue-violet accents used sparingly; optional tiny touches of warm amber only if needed; keep the palette in the same family as the existing website illustrations
Materials/textures: smooth plastic or enamel-like cursor bodies, soft bevels, rounded edges, subtle material transitions, gentle specular highlights, faint texture variation only if it helps realism; no gritty texture, no painterly strokes
Background: fully transparent alpha background
Constraints: fully transparent background; no text; no watermark; no border; no frame; no mockup; no grid lines; no external cast shadows; no floating drop shadows; no contact shadow under the objects because shadows will be added separately later; depth must come only from the object rendering itself; keep tips, edges, and finger endpoints very clear for precise hotspot placement; prioritise exact placement and consistent sizing over visual drama
Avoid: flat SVG icon look, outline-only shapes, clutter, cropped edges, horizon line, scene backdrop, reflection surface, spotlight backdrop, glow halos, exaggerated cartoon proportions, noisy realism, blur haze, inconsistent sizing, inconsistent camera angle
```

Fallback size if the generator refuses `3072x2048`: `1536x1024`, while keeping the exact same `3 x 2` structure and proportions.

Important:
- Use `3072x2048` when you are generating this in a tool that supports exact custom canvas sizes.
- Use `1536x1024` when running through the repo's OpenAI image workflow, because that model only accepts the supported preset sizes.
