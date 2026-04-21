# Explain It Like I'm Five

[![Deploy GitHub Pages](https://github.com/becktothefuture/Explainitlikeim/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/becktothefuture/Explainitlikeim/actions/workflows/deploy-pages.yml)
![Site Status](https://img.shields.io/badge/site-currently%20broken-lightgrey)
[![License](https://img.shields.io/github/license/becktothefuture/Explainitlikeim)](./LICENSE)

Explain It Like I'm Five is a skill for AI agents. It rewrites one answer into five levels, from simple to precise, so people can get the plain version first and the fuller version right underneath.

Use it in Codex, Claude Code, Cursor, and similar agents when an answer is technically correct but not exactly easy to follow.

This repo contains the landing site for the skill and the downloadable Markdown file people actually install.

<img src="./public/assets/hero/hero-reference-desktop-full.png" alt="Explain It Like I'm Five landing page hero" width="900" />

## Start Here

- Live site: currently broken
- Download the actual skill file: [public/downloads/explain-it-like-im-5.md](public/downloads/explain-it-like-im-5.md)
- Direct raw download: [raw.githubusercontent.com/.../explain-it-like-im-5.md](https://raw.githubusercontent.com/becktothefuture/Explainitlikeim/main/public/downloads/explain-it-like-im-5.md)
- Read the research notes behind the format: [public/downloads/references/learning-principles.md](public/downloads/references/learning-principles.md)
- Local development notes: [docs/development.md](docs/development.md)

If you only need one thing from this repo, it is the skill file at `public/downloads/explain-it-like-im-5.md`. That is the file you install.

## What It Does

- Rewrites one answer in five levels: `🧸`, `✏️`, `🎒`, `📚`, and `🎓`
- Gives the simple version first, then adds detail without changing the core truth
- Works well for code, docs, papers, bugs, plans, APIs, and the usual weird questions
- Saves you from asking "can you say that simpler?" again and again like a patient hostage negotiator

## How It Works

1. Download [the Markdown skill file](public/downloads/explain-it-like-im-5.md).
2. Add it to Codex, Claude Code, Cursor, or a similar AI agent setup.
3. Ask your question as usual. The skill returns five clearer versions, starting with the simplest one.

## Example Output

Prompt:

```text
why do we have a surplus?
```

Output:

```text
🧸: A surplus means you have money left after paying for the things you needed.

---

✏️: In a budget, a surplus means you planned some money for spending, but part of it did not get used.

---

🎒: A budget surplus happens when income is higher than spending, or when spending ends up lower than expected. The leftover amount is the surplus.

---

📚: A budget surplus is the amount left when actual revenue or available funds are greater than actual spending over the same period. In a company or office budget, that usually means some planned money was not spent.

---

🎓: A budget surplus is the positive balance that remains when revenue or allocated funds exceed expenditures for a defined period. It can result from higher-than-expected income, lower-than-expected costs, delayed purchases, or deliberate underspending, and the next question is usually whether to save it, reallocate it, or return it.
```

## Why This Format Works

The tone is cheeky. The method is not.

People understand more when explanations arrive in smaller, clearer steps. This format leans on plain language, segmentation, scaffolding, and a small amount of relevant personality instead of one dense wall of text. The longer reference is here: [public/downloads/references/learning-principles.md](public/downloads/references/learning-principles.md).

## Where The Skill File Lives

The actual install file is here:

```text
public/downloads/explain-it-like-im-5.md
```

That path is the whole point of the repo for most visitors. The rest is the landing site and supporting material around it.

## Repo Structure

The important path is near the top of the tree:

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

- `public/downloads/explain-it-like-im-5.md` is the actual skill file to install
- `public/downloads/references/learning-principles.md` explains the learning principles behind the format
- `src/App.jsx` contains the main landing-page structure and copy
- `docs/development.md` covers local debug notes

## Development

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
