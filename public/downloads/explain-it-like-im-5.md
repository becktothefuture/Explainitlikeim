---
name: explain-it-like-im-5
description: "Explain almost anything in five explanation levels: 5, 7, 9, 12, and 16. Use when the user wants a word, concept, code snippet, file, repo, doc, article, bug, plan, or summary made easier to understand fast without follow-up questions."
---

# Explain It Like I'm 5

## Overview

Turn one topic into one explanation that gets smarter in five explanation levels:
`5`, `7`, `9`, `12`, `16`.

This skill is for fast understanding.
It should work for concepts, words, code, repos, docs, papers, summaries, bugs, workflows, and plans.

Treat the labels as shorthand for simplest to most precise.
They are explanation levels, not instructions to imitate a child's voice.

Do not ask follow-up questions by default.
Use the context you already have.
If something is ambiguous, pick the most likely meaning and use the `16:` section to note the alternative if it matters.

## Input Router

Before writing, decide what kind of thing you are explaining:

- `word or term`: say what it means, where people usually see it, and why it matters
- `concept`: say what it is, what it does, and how it works
- `code snippet, file, function, class`: say what it is for, what goes in, what comes out, and the main transformation
- `repo, system, feature`: say what it does, what the main pieces are, and how they fit together
- `doc, article, spec, user-provided text`: explain the material itself; preserve its claims, structure, and caveats
- `bug, log, error, failure`: say what broke, what the message means, and the most likely cause
- `summary request`: explain the important idea in layers rather than rewriting everything flat
- `comparison`: keep the same comparison axis all the way down

Then decide:

- the simplest truthful core idea
- one concrete anchor for the `5:` version
- what new layer each later band adds
- what fact, identifier, caveat, or uncertainty must survive simplification
- whether a tiny related playful touch would help the `5:` band or just slow it down

## Output Contract

Default to this exact sequence unless the user explicitly asks for different bands:

1. `5:`
2. `7:`
3. `9:`
4. `12:`
5. `16:`

Default format:

`5: ...`

`---`

`7: ...`

`---`

`9: ...`

`---`

`12: ...`

`---`

`16: ...`

Each band should start with that exact label.
Use one line containing exactly `---` between bands.
Keep the label and the first sentence on the same line when possible.
Default to plain prose, not bullets, tables, or code fences.

Length guidance:

- `5:` one tiny, concrete, truthful orientation
- `7:` one or two short sentences
- `9:` one to three short sentences
- `12:` two or three sentences with clearer mechanism
- `16:` two to four sentences with proper terms, nuance, limits, or tradeoffs

If the user asks for only one band, still think through the full ladder internally first, then output only the requested band.

If the user asks for custom ages, a different format, another language, or a source-bound summary, that request overrides the default labels.
Keep the same cumulative progression whenever possible.

## Band Guidance

Use one through-line from top to bottom.
The later bands should feel like the earlier ones getting sharper, not like five separate rewrites.

Default job by level:

- `5:` what it is
- `7:` what happens or why it matters
- `9:` practical shape or how it works in use
- `12:` mechanism and useful terms
- `16:` precise terms, caveats, limits, or tradeoffs

At `5:`:

- make it instantly graspable
- define the thing first
- use concrete nouns and direct verbs
- sound plain, calm, and adult
- do not use baby talk
- allow one tiny related playful image only if it helps the idea stick
- move from the playful hook to the literal meaning immediately
- avoid jargon completely

At `7:`:

- keep the same core picture
- add one clear cause-and-effect step
- say what changes or why it matters
- introduce the most important moving part in plain language

At `9:`:

- start replacing metaphor with reality
- make the practical shape of the thing clearer
- add one useful distinction if it helps

At `12:`:

- explain the mechanism directly
- introduce useful vocabulary and define it immediately
- make structure, flow, or process legible

At `16:`:

- give the cleanest precise version
- keep names, identifiers, APIs, claims, and caveats intact
- add nuance, limits, edge cases, or tradeoffs when relevant

## Source Fidelity

When the user gives you code, docs, text, or a repo:

- explain the material you were given, not what you wish had been there
- preserve important names, filenames, APIs, types, errors, and claims
- do not invent missing facts to make the ladder feel smoother
- if the source is incomplete, say what is clear and what is inferred

When the user asks for a summary:

- explain the main idea in layers
- keep the key point and caveats from the source
- do not drift into generic background unless the user asks for it

## Guardrails

Do not make the `5:` version false just to make it cute.
Do not write `5:` like a children's book if the topic does not need it.
Do not switch metaphors every band.
Do not merely restate the same point with harder words.
Do not let `16:` quietly correct a misleading `5:`.
Do not drown the `16:` version in jargon.
Do not talk down to the user.
Do not use unrelated jokes, sarcasm, or long comedy bits.
Humor is optional, not required.
If humor helps, keep it short, warm, and directly tied to the concept.

If the topic is sensitive, high-stakes, or uncertain:

- stay calm and precise
- mark uncertainty clearly
- separate explanation from advice
- refuse oversimplifications that would change the meaning

For a compact reference on why the ladder works, read [references/learning-principles.md](references/learning-principles.md).

## Final Check

Before finishing, verify:

- all required bands are present
- separator lines appear between bands in the default format
- the same core idea survives across all bands
- each band adds one real layer
- the result works for the actual input type
- the explanation becomes more precise as it goes
- the user could read straight down and genuinely learn
