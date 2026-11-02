#!/usr/bin/env python3
"""
Obsidian-to-Static Blog Generator for Vishwash Tank (@Vola12do)
Minimalist Chromatic Editorial Architecture (Inspired by https://huyml.co/)
"""
from __future__ import annotations

import argparse
import datetime as dt
import html
import json
import re
import sys
from pathlib import Path
from typing import Any, Dict, List, Tuple

import markdown
import yaml

ROOT_DIR = Path(__file__).resolve().parent.parent
CONTENT_DIR = ROOT_DIR / "content" / "posts"
BLOG_OUT_DIR = ROOT_DIR / "blog"
SITE_URL = "https://vola12do.github.io"

DEFAULT_PALETTES = [
    ("#1E242B", "#E3E8EC", "#2B6CB0"),
    ("#171717", "#F5D0C5", "#E53E3E"),
    ("#1A2E26", "#DCE5DF", "#2F855A"),
    ("#212125", "#E5E3DB", "#BA3737"),
]


def parse_frontmatter(raw: str) -> Tuple[Dict[str, Any], str]:
    if raw.startswith("---"):
        parts = raw.split("---", 2)
        if len(parts) >= 3:
            meta = yaml.safe_load(parts[1]) or {}
            return meta, parts[2].strip()
    return {}, raw.strip()


def transform_obsidian_syntax(md_text: str) -> str:
    # Convert [[slug|Label]] or [[slug]] to blog links
    def repl_wikilink(match: re.Match) -> str:
        inner = match.group(1).strip()
        if "|" in inner:
            target, label = [x.strip() for x in inner.split("|", 1)]
        else:
            target, label = inner, inner
        slug = re.sub(r"[^a-z0-9-]+", "-", target.lower()).strip("-")
        return f"[{label}]({SITE_URL}/blog/{slug}/)"

    text = re.sub(r"\[\[([^\]]+)\]\]", repl_wikilink, md_text)

    # Convert Obsidian callouts > [!NOTE] Title
    lines = text.splitlines()
    out_lines: List[str] = []
    i = 0
    while i < len(lines):
        m = re.match(r"^>\s*\[!([A-Za-z]+)\]\s*(.*)$", lines[i])
        if m:
            kind = m.group(1).upper()
            title = m.group(2).strip() or kind
            body_lines: List[str] = []
            i += 1
            while i < len(lines) and lines[i].startswith(">"):
                body_lines.append(re.sub(r"^>\s?", "", lines[i]))
                i += 1
            body_html = markdown.markdown("\n".join(body_lines), extensions=["fenced_code", "tables"])
            out_lines.append(
                f'<div class="obsidian-callout" data-callout="{html.escape(kind.lower())}">'
                f'<div class="obsidian-callout-title">{html.escape(kind)} · {html.escape(title)}</div>'
                f"{body_html}</div>"
            )
            continue
        out_lines.append(lines[i])
        i += 1
    return "\n".join(out_lines)


def estimate_reading_time(text: str) -> int:
    words = len(re.findall(r"\w+", text))
    return max(1, round(words / 210))


def build_header(rel_root: str) -> str:
    return f"""  <div class="chromatic-wash" aria-hidden="true"></div>
  <header class="site-header" role="banner">
    <div class="grid-16 header-grid">
      <div class="hdr-brand">
        <a href="{rel_root}index.html" class="hdr-brand-name">Vishwash Tank</a>
        <span class="hdr-brand-handle">@Vola12do</span>
      </div>
      <div class="hdr-role">
        <span class="hdr-label">Cybersecurity Researcher</span>
        <span class="hdr-value">VAPT · Mobile Forensics · RF</span>
      </div>
      <nav class="hdr-nav" aria-label="Primary Navigation">
        <a href="{rel_root}index.html#work">Work</a>
        <a href="{rel_root}index.html#advisories">Advisories</a>
        <a href="{rel_root}index.html#about">About</a>
        <a href="{rel_root}blog/" class="is-active">Blog</a>
        <a href="#contact">Contact</a>
      </nav>
      <div class="hdr-controls">
        <div class="hdr-control-group">
          <span class="hdr-label">Audio</span>
          <div class="hdr-toggle-row">
            <button type="button" id="audio-on-btn" class="hdr-toggle-opt" aria-label="Enable subtle UI audio">On</button>
            <button type="button" id="audio-off-btn" class="hdr-toggle-opt is-on" aria-label="Disable UI audio">Off</button>
          </div>
        </div>
        <div class="hdr-control-group">
          <span class="hdr-label">Surface</span>
          <div class="hdr-toggle-row">
            <button type="button" id="theme-light-btn" class="hdr-toggle-opt is-on" aria-label="Light stone surface">Light</button>
            <button type="button" id="theme-dark-btn" class="hdr-toggle-opt" aria-label="Dark ink surface">Dark</button>
          </div>
        </div>
      </div>
      <div class="hdr-location">
        <span class="hdr-label">Working globally</span>
        <span class="hdr-value" id="live-location-time">JAIPUR, --:--</span>
      </div>
      <div class="hdr-inquiry">
        <button type="button" class="copy-email-btn" data-copy-email="vishwashtank@gmail.com">
          <span class="copy-hint" data-copy-label>For inquiries · Click to copy</span>
          <span class="copy-address">vishwashtank@gmail.com</span>
        </button>
      </div>
    </div>
  </header>"""


def build_footer(rel_root: str) -> str:
    return f"""    <section id="contact" class="contact-sheet-section" aria-labelledby="contact-heading">
      <div class="grid-16">
        <div class="huyml-contact-card">
          <div class="contact-heading-col">
            <div>
              <h2 id="contact-heading" class="contact-serif-heading">Come say hi</h2>
            </div>
            <p class="contact-subnote">
              Open to Offensive Security, VAPT, Mobile Malware Forensics, and Embedded Security R&amp;D opportunities worldwide.
            </p>
          </div>
          <div class="contact-options-grid">
            <div class="contact-info-item">
              <span class="contact-info-label">Drop me a line</span>
              <div class="contact-info-links">
                <button type="button" data-copy-email="vishwashtank@gmail.com">
                  <span data-copy-label>vishwashtank@gmail.com (Click to copy)</span>
                </button>
                <a href="mailto:vishwashtank@gmail.com">Open mail client ↗</a>
              </div>
            </div>
            <div class="contact-info-item">
              <span class="contact-info-label">Direct line</span>
              <div class="contact-info-links">
                <a href="tel:+919664970450">+91 96649 70450</a>
                <span>Jaipur / Ahmedabad, India</span>
              </div>
            </div>
            <div class="contact-info-item">
              <span class="contact-info-label">Portfolio &amp; CV</span>
              <div class="contact-info-links">
                <a href="{rel_root}index.html">Main Portfolio ↗</a>
                <a href="{rel_root}assets/Vishwash_Tank_CV.pdf" target="_blank" rel="noopener noreferrer">Download CV (PDF) ↗</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
  <footer class="site-footer" role="contentinfo">
    <div class="grid-16">
      <div class="footer-left">© 2026 Vishwash Tank (@Vola12do). All rights reserved.</div>
      <div class="footer-mid">Typography: Instrument Serif &amp; Inter · Chromatic Editorial System</div>
      <div class="footer-right"><a href="#top">Back to top ↑</a></div>
    </div>
  </footer>
  <script src="{rel_root}assets/js/site.js" defer></script>"""


def render_post_page(post: Dict[str, Any]) -> str:
    title = html.escape(post["title"])
    summary = html.escape(post["summary"])
    date_str = html.escape(post["date_str"])
    category = html.escape(post["category"])
    slug = html.escape(post["slug"])
    c1, c2, c3 = post["colors"]
    tags_html = "".join(f'<span class="tag-pill">{html.escape(str(t))}</span>' for t in post["tags"])

    schema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post["title"],
        "description": post["summary"],
        "datePublished": post["date_str"],
        "author": {
            "@type": "Person",
            "name": "Vishwash Tank",
            "url": f"{SITE_URL}/",
        },
        "mainEntityOfPage": f"{SITE_URL}/blog/{post['slug']}/",
    }

    return f"""<!doctype html>
<html lang="en" data-theme="light" style="--chroma-1:{c1};--chroma-2:{c2};--chroma-3:{c3};">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://raw.githubusercontent.com; script-src 'self' 'unsafe-inline'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none';">
  <title>{title} — Vishwash Tank (@Vola12do)</title>
  <meta name="description" content="{summary}">
  <link rel="canonical" href="{SITE_URL}/blog/{slug}/">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../../assets/css/style.css">
  <link rel="stylesheet" href="../../assets/css/blog.css">
  <script type="application/ld+json">{json.dumps(schema)}</script>
</head>
<body>
{build_header("../../")}
  <main id="top">
    <section class="blog-hero">
      <div class="grid-16">
        <div class="blog-hero-kicker">
          <a href="../" class="text-link-underline">← Research Archive</a>
          <span>{category}</span>
        </div>
        <div class="blog-hero-main">
          <h1 class="blog-hero-title">{title}</h1>
          <p class="blog-hero-sub">{summary}</p>
        </div>
        <div class="blog-hero-meta">
          <div class="work-col-colors" aria-label="Chromatic palette">
            <span class="swatch-23" style="background-color:{c1}"></span>
            <span class="swatch-23" style="background-color:{c2}"></span>
            <span class="swatch-23" style="background-color:{c3}"></span>
          </div>
          <span>{date_str} · {post['reading_min']} min read</span>
        </div>
      </div>
    </section>

    <section class="article-shell">
      <div class="grid-16">
        <aside class="article-sidebar">
          <div class="article-meta-block">
            <span class="hdr-label">Author</span>
            <span>Vishwash Tank (@Vola12do)</span>
          </div>
          <div class="article-meta-block">
            <span class="hdr-label">Published</span>
            <span>{date_str}</span>
          </div>
          <div class="article-meta-block">
            <span class="hdr-label">Tags</span>
            <div class="tag-pill-list">{tags_html}</div>
          </div>
        </aside>
        <article class="article-prose">
          {post['html']}
        </article>
      </div>
    </section>
{build_footer("../../")}
</body>
</html>
"""


def render_blog_index(posts: List[Dict[str, Any]]) -> str:
    rows_html: List[str] = []
    for idx, p in enumerate(posts, start=1):
        c1, c2, c3 = p["colors"]
        nr = f"{idx:02d}"
        slug = html.escape(p["slug"])
        title = html.escape(p["title"])
        cat = html.escape(p["category"])
        summary = html.escape(p["summary"])
        date_str = html.escape(p["date_str"])
        rows_html.append(f"""        <article class="grid-16 work-row" onclick="window.location.href='{slug}/'">
          <div class="work-col-nr">{nr}</div>
          <div class="work-col-title">
            <div><mark class="work-mark">{cat.upper()}</mark></div>
            <h2 class="work-display-sub">{title}</h2>
          </div>
          <div class="work-col-date">
            <span class="hdr-label">Published</span>
            <span>{date_str} · {p['reading_min']} min</span>
          </div>
          <div class="work-col-colors" aria-hidden="true">
            <span class="swatch-23" style="background-color:{c1}"></span>
            <span class="swatch-23" style="background-color:{c2}"></span>
            <span class="swatch-23" style="background-color:{c3}"></span>
          </div>
          <div class="work-col-category">
            <span class="hdr-label">Domain</span>
            <span>{cat}</span>
          </div>
          <div class="work-col-recognition">
            <span class="hdr-label">Author</span>
            <span>Vishwash Tank</span>
          </div>
          <div class="work-col-desc">
            <p>{summary}</p>
            <div class="work-links">
              <a href="{slug}/">Read dispatch ↗</a>
            </div>
          </div>
        </article>""")

    joined_rows = "\n".join(rows_html)
    count_str = f"{len(posts):02d}"

    return f"""<!doctype html>
<html lang="en" data-theme="light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://raw.githubusercontent.com; script-src 'self' 'unsafe-inline'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none';">
  <title>Research Writing &amp; Dispatches — Vishwash Tank (@Vola12do)</title>
  <meta name="description" content="Technical research dispatches by Vishwash Tank on Android APK forensics, CVSS 10.0 REST API advisories, and embedded NFC/RFID security.">
  <link rel="canonical" href="{SITE_URL}/blog/">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../assets/css/style.css">
  <link rel="stylesheet" href="../assets/css/blog.css">
</head>
<body>
{build_header("../")}
  <main id="top">
    <section class="blog-hero">
      <div class="grid-16">
        <div class="blog-hero-kicker">
          <a href="../index.html" class="text-link-underline">← Main Portfolio</a>
          <span>Research Index ({count_str})</span>
        </div>
        <div class="blog-hero-main">
          <h1 class="blog-hero-title">Research writing &amp; <em>forensic notes</em>.</h1>
          <p class="blog-hero-sub">
            Field dispatches on Android APK static/dynamic analysis, REST API authorization flaws (CVSS 10.0), and embedded NFC/RFID hardware engineering.
          </p>
        </div>
        <div class="blog-hero-meta">
          <span>Obsidian → GitHub Pages</span>
          <span class="hdr-label">Automated Markdown Pipeline</span>
        </div>
      </div>
    </section>

    <section class="editorial-section">
      <div class="work-list">
{joined_rows}
      </div>
    </section>
{build_footer("../")}
</body>
</html>
"""


def load_posts() -> List[Dict[str, Any]]:
    posts: List[Dict[str, Any]] = []
    if not CONTENT_DIR.exists():
        return posts

    md_files = sorted(CONTENT_DIR.glob("*.md"))
    for idx, md_path in enumerate(md_files):
        raw = md_path.read_text(encoding="utf-8")
        meta, body = parse_frontmatter(raw)
        if meta.get("draft") is True:
            continue

        slug = str(meta.get("slug") or md_path.stem).strip()
        title = str(meta.get("title") or slug.replace("-", " ").title()).strip()
        date_val = meta.get("date") or dt.date.today().isoformat()
        date_str = str(date_val)
        category = str(meta.get("category") or "Security Research").strip()
        summary = str(meta.get("summary") or meta.get("description") or "").strip()
        tags = meta.get("tags") or ["security", "research"]
        palette = DEFAULT_PALETTES[idx % len(DEFAULT_PALETTES)]

        transformed = transform_obsidian_syntax(body)
        html_body = markdown.markdown(
            transformed,
            extensions=["fenced_code", "tables", "toc"],
        )

        posts.append(
            {
                "slug": slug,
                "title": title,
                "date_str": date_str,
                "category": category,
                "summary": summary,
                "tags": tags,
                "colors": palette,
                "reading_min": estimate_reading_time(body),
                "html": html_body,
            }
        )

    posts.sort(key=lambda x: x["date_str"], reverse=True)
    return posts


def main() -> int:
    parser = argparse.ArgumentParser(description="Build minimalist chromatic blog from Obsidian markdown")
    parser.add_argument("--check", action="store_true", help="Validate markdown compilation without writing")
    args = parser.parse_args()

    posts = load_posts()
    if args.check:
        print(f"[OK] Validated {len(posts)} markdown posts.")
        return 0

    BLOG_OUT_DIR.mkdir(parents=True, exist_ok=True)
    (BLOG_OUT_DIR / "index.html").write_text(render_blog_index(posts), encoding="utf-8")

    for p in posts:
        post_dir = BLOG_OUT_DIR / p["slug"]
        post_dir.mkdir(parents=True, exist_ok=True)
        (post_dir / "index.html").write_text(render_post_page(p), encoding="utf-8")

    print(f"[BUILT] {len(posts)} posts -> {BLOG_OUT_DIR}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
