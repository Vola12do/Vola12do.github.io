# Vishwash Tank (`@Vola12do`) — Industrial Field Console & Technical Portfolio

**Live Site:** [https://vola12do.github.io/](https://vola12do.github.io/)  
**Field Writeups:** [https://vola12do.github.io/blog/](https://vola12do.github.io/blog/)

## Design & Architecture
- **Aesthetic System:** Inspired by **Teenage Engineering** (`OP-1 Field` / exposed 1px structural grids / WebAudio mechanical relay synthesis), **Nothing (`in.nothing.tech`)** (interactive 28×7 LED dot-matrix telemetry display), **`dontlookup.app`** (stark kinetic typography & interactive vulnerability HUD), and **`huyml.co`** (precision coordinate HUD & editorial micro-interactions).
- **Security Hardening:** Strict Content-Security-Policy (`CSP`), `strict-origin-when-cross-origin` referrer policy, `noopener noreferrer` external link isolation, zero external trackers, and DOM-safe interactive CLI terminal.
- **Obsidian-Compatible Blog Generator (`scripts/build.py`):**
  Drop any Markdown note into `content/posts/*.md` and push to `main` (or run `python3 scripts/build.py`) to automatically render static article pages under `blog/<slug>/index.html`, rebuild `blog/index.html`, and update `sitemap.xml`.
