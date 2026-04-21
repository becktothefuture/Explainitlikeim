# Explain It Like I'm Five

[![Deploy GitHub Pages](https://github.com/becktothefuture/Explainitlikeim/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/becktothefuture/Explainitlikeim/actions/workflows/deploy-pages.yml)
![Site Status](https://img.shields.io/badge/site-currently%20broken-lightgrey)
[![License](https://img.shields.io/github/license/becktothefuture/Explainitlikeim)](./LICENSE)

Explain It Like I'm Five is a skill for AI agents. It rewrites one answer into five levels, from simple to precise, so you get the plain version first and the fuller version after that.

Add it to Codex, Claude Code, Cursor, and similar agents when one answer is correct but still harder to follow than it should be.

This repo gives you the landing page and the Markdown skill file you install.

<img src="./public/assets/hero/hero-reference-desktop-full.png" alt="Explain It Like I'm Five landing page hero" width="900" />

## Start Here

- Live site: currently broken
- Download the skill file: [public/downloads/explain-it-like-im-5.md](public/downloads/explain-it-like-im-5.md)
- Raw download: [raw.githubusercontent.com/.../explain-it-like-im-5.md](https://raw.githubusercontent.com/becktothefuture/Explainitlikeim/main/public/downloads/explain-it-like-im-5.md)
- Read the research notes behind the format: [public/downloads/references/learning-principles.md](public/downloads/references/learning-principles.md)
- Local development notes: [docs/development.md](docs/development.md)

If you are here for the skill, start with `public/downloads/explain-it-like-im-5.md`.

## What It Does

- Gives you five versions of one answer: `🧸`, `✏️`, `🎒`, `📚`, and `🎓`
- Starts simple, then adds detail without changing the core truth
- Works well for code, docs, papers, bugs, plans, APIs, and the usual weird questions
- Saves you from asking for a simpler rewrite right after the first answer

## How It Works

1. Download [the Markdown skill file](public/downloads/explain-it-like-im-5.md).
2. Add it to Codex, Claude Code, Cursor, or a similar AI agent setup.
3. Ask your question. You get five clearer versions back, starting with the simplest one.

## Example Output

Try it with:

```text
why do we have a surplus?
```

You get:

```text
🧸: A surplus means you have money left after paying for the things you needed.

---

✏️: In a budget, a surplus means you planned some money for spending, but part of it did not get used.

---

🎒: A budget surplus happens when income is higher than spending, or when spending ends up lower than expected. The leftover amount is the surplus.

---

📚: A budget surplus is the amount left when revenue or available funds are greater than spending over the same period. In a company or office budget, that usually means some planned money was not spent.

---

🎓: A budget surplus is the positive balance that remains when revenue or allocated funds exceed expenditures for a defined period. It can come from higher-than-expected income, lower costs, delayed purchases, or deliberate underspending. The next question is usually whether to save it, reallocate it, or return it.
```

## Why This Format Works

The tone is cheeky. The method is not.

People understand more when explanations arrive in smaller, clearer steps. This format uses plain language, segmentation, scaffolding, and a small amount of relevant personality instead of one dense wall of text. If you want the longer version, read [public/downloads/references/learning-principles.md](public/downloads/references/learning-principles.md).

## Where The Skill File Lives

The skill file lives here:

```text
public/downloads/explain-it-like-im-5.md
```

If you only need the install file, stop there. The rest of the repo is the landing page and the supporting material around it.

## Repo Structure

Short version:

```text
.
├── public/
│   └── downloads/
│       ├── explain-it-like-im-5.md
│       └── references/
│           └── learning-principles.md
├── src/
│   └── App.jsx
├── docs/
│   └── development.md
└── README.md
```

- `public/downloads/explain-it-like-im-5.md` is the skill file you install
- `public/downloads/references/learning-principles.md` explains the learning principles behind the format
- `src/App.jsx` contains the main landing-page structure and copy
- `docs/development.md` covers local debug notes

## Development

This repo uses Node 22.

Install dependencies and run the site locally:

```bash
nvm use
npm install
npm run dev
```

Build the production version:

```bash
npm run build
```

Preview the built site locally:

```bash
npm run preview
```

Live site deploys from `main` only.

Licensed under the [MIT License](./LICENSE).
