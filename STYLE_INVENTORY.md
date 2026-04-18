# Style Inventory

This is the reset design direction for the site.

The mix is:
- Playground-like typography scale and SaaS clarity
- childlike warmth and humor
- fridge-magnet tactility
- light irony, not chaos

The page should feel like a very competent software company made a website for a toy that secretly teaches you things.

## 1. Brand posture

Friendly, warm, slightly ridiculous, still competent.

Not:
- startup-minimal
- classroom-cute
- generic B2B

## 2. Typography family

Printed UI:
- rounded premium grotesk
- similar spirit to Playground's CircularXX-led feel
- use a warm rounded sans for the real site UI

Magnet letters:
- thick, round, toy-like uppercase
- distinct from the printed UI

## 3. Type scale

- Hero printed heading: very large, around `64-72px` desktop
- Section headings: `34-48px`
- Card titles: `22-28px`
- Body copy: `16-18px`
- Labels/meta: `12-14px`

## 4. Type attitude

Printed copy should be clean and composed.
Magnet copy should be loud and tactile.
Do not let the whole page become childish just because the magnets are playful.

## 5. Color system

Base:
- warm off-white
- milk paper
- soft oatmeal

Text:
- dark charcoal
- muted slate

UI accent:
- confident cobalt blue

Magnet colors:
- cherry red
- butter yellow
- leaf green
- sky blue
- orange peel

## 6. Contrast strategy

Keep strong contrast in text and buttons.
Keep softer contrast in surfaces.
Magnets provide the loudest color on the page.

## 7. Background treatment

Main page should feel like warm paper or a clean kitchen wall.
No heavy gradients.
Use faint paper noise or soft temperature shifts only.

## 8. Layout

Printed layout should be centered, ordered, and reliable.
Magnet layer should feel separate from the layout, as if sitting on top of it.

## 9. Navigation

- simple pill bar
- very few items
- one obvious primary CTA
- lots of breathing room

## 10. Section rhythm

Hero:
- printed frame
- magnet statement

First section below fold:
- Michael Scott GIF
- explain the skill clearly

Next sections:
- examples
- proof
- download

Each section gets one idea only.

## 11. Borders

Use thin borders for printed UI.
Use soft bevels and rounded edges for magnets.
Do not use thick cartoon outlines for the actual website chrome.

## 12. Radius

Printed UI:
- pills and soft rectangles

Magnets:
- chunky rounded corners
- almost toy-molded

## 13. Shadows

Printed UI:
- broad soft shadows

Magnets:
- stronger contact shadow
- slight lift
- subtle inner highlight

## 14. Texture

Printed UI:
- mostly flat

Magnets:
- soft plastic sheen
- tiny texture variation
- faint wear is okay

## 15. Motion

Printed UI:
- calm
- precise
- short

Magnets:
- slightly heavier
- slight settle when released
- no cartoon bounce spam

## 16. Interaction

Buttons and nav should feel crisp.
Magnets should feel hand-moved.
The interaction contrast is the point.

## 17. Illustration language

Use hand-drawn marks very lightly:
- squiggles
- underlines
- tiny arrows

These should support the joke, not become decoration everywhere.

## 18. Imagery

Keep the Michael Scott GIF.
Use it below the fold as the “why this exists” reaction moment.
Do not put too many other image types on the page.

## 19. Example presentation

Examples should look like the output of the tool.
Keep them clean and readable.
Do not hide them inside abstract marketing language.

## 20. Tone

Short.
Plain.
Wry.
Helpful.

The site should sound like:
- a smart product designer
- a decent teacher
- one coworker who is trying not to laugh in the meeting

## Canvas Mental Model

Printed HTML is the page.
Magnets are a separate movable layer.

That means:
- buttons
- headings
- copy
- layout blocks

are normal DOM elements.

The magnets are drawn in a fixed viewport canvas and stored in document coordinates.
They are authored into place on load, but they are not part of the printed layout.

## Canvas Size Strategy

Use one viewport-sized transparent canvas overlay.

Why:
- avoids one massive page-height bitmap
- keeps redraw cost bounded
- lets magnets exist anywhere in the document

Store magnet positions in document space:
- `x` in document pixels
- `y` in document pixels

Draw them in viewport space:
- `screenX = x - scrollX`
- `screenY = y - scrollY`

This makes the hero magnets movable across the full hero sheet and allows later magnets lower on the page to use the same system.

## Practical Rule

The page should look composed even if the user never touches a letter.
It should look more fun, not broken, after they do.
