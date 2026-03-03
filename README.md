# ZAG Archive – Homebrew Games System

![Workflow Status](https://img.shields.io/github/actions/workflow/status/ZAGv2/Homebrew-Games/auto.yml?branch=main?label=Automation%20Workflow)  
![Releases](https://img.shields.io/github/v/release/ZAGv2/Homebrew-Games?label=Latest%20Release&sort=semver)

![Homebrew Workflow](./assets/homebrew_workflow.png)  
*Figure 1: Homebrew Games automation workflow*

![Game Submission Structure](./assets/game_structure.png)  
*Figure 2: How to submit a game (zip files and folders)*
---

## Overview

The **ZAG Archive Homebrew Games system** is a fully automated platform for hosting and managing community-made games.

**Key Features:**
- Automatic generation of HTML pages from GitHub releases
- Homebrew Games index page with:
  - Trending grid (3 most downloaded games of the month)
  - Complete table of all games (newest releases first)
  - Search functionality by title or console
- Fully mobile and desktop friendly
- Repository stays under 1GB by storing **only metadata and HTML**, not game files

---

## Repository Structure

- **assets/**  
  - `homebrew_workflow.png` → Workflow diagram  
  - `game_structure.png` → Game submission structure diagram  

- **games-pages/** → Auto-generated HTML pages for each game  

- `index.html` → Homebrew Games main page  

- `auto.js` → Automation script to generate HTML pages  

- `.github/workflows/auto.yml` → GitHub Action workflow that runs `auto.js`

---

## Game Submission System

Each game must have **two zip files**:

| File | Purpose |
|------|---------|
| `GAME_NAME.zip` | The actual game file (downloadable) |
| `GAME_NAME.details.zip` | Metadata + cover + screenshots (`metadata.txt`, `cover/`, `screenshots/`) |

> Both files must exist before the automation runs.

**Rules for submitting games:**
1. Prepare the two zip files with matching names.  
2. Upload them as a **new release** on GitHub.  
3. GitHub Action triggers `auto.js`.  
4. Wait for the workflow to complete:
   - HTML pages generated  
   - Index page updated

---

## GitHub Action Workflow

- `.github/workflows/auto.yml` automatically triggers `auto.js` when a new release is published.  
- Ensures both zip files exist before generating pages.  
- Updates `index.html` and creates HTML pages in `games-pages/`.

---

## Workflow Diagram

![Homebrew Workflow](./assets/homebrew_workflow.png)

**Explanation:**
1. Upload `GAME_NAME.zip` + `GAME_NAME.details.zip`  
2. GitHub Action triggers `auto.js`  
3. Script validates files, extracts metadata/images, generates HTML pages, updates index.html  

---

## Game Submission Structure

![Game Submission Structure](./assets/game_structure.png)

**Explanation:**
- Submit two files for each game:  
  1. `GAME_NAME.zip` → actual game  
  2. `GAME_NAME.details.zip` → metadata + cover + screenshots  
- Both must have the same name prefix to link correctly.

---

## Benefits

- Fully automated  
- Repo stays under 1GB  
- Mobile & PC friendly  
- Supports large libraries (pagination-ready)  
- Easy maintenance: upload release zips only

---

## Useful Links

- Homebrew Games index: [https://zagv2.github.io/Homebrew-Games/](https://zagv2.github.io/Homebrew-Games/)  
- ROM Hacks & Patches: [https://zagv2.github.io/romhacks-patches/](https://zagv2.github.io/romhacks-patches/)  
- ZAG Archive home: [https://zagv2.github.io/ZAGArchive-/index.html](https://zagv2.github.io/ZAGArchive-/index.html)  
- About: [https://zagv2.github.io/ZAGArchive-/about.html](https://zagv2.github.io/ZAGArchive-/about.html)  
- Contact: [https://zagv2.github.io/ZAGArchive-/contact.html](https://zagv2.github.io/ZAGArchive-/contact.html)