#!/usr/bin/env python3
"""
Obsidian-to-Static Blog Generator for Vishwash Tank (@Vola12do)
Minimalist · Doodly · Chromatic · Retro Zine Portfolio Style
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


def parse_frontmatter(raw: str) -> Tuple[Dict[str, Any], str]:
    if raw.startswith("---"):
        parts = raw.split("---", 2)
        if len(parts) >= 3:
            meta = yaml.safe_load(parts[1]) or {}
            return meta, parts[2].strip()
    return {}, raw.strip()


def transform_obsidian_syntax(md_text: str) -> str:
    def repl_wikilink(match: re.Match) -> str:
        inner = match.group(1).strip()
        if "|" in inner:
            target, label = [x.strip() for x in inner.split("|", 1)]
        else:
            target, label = inner, inner
        slug = re.sub(r"[^a-z0-9-]+", "-", target.lower()).strip("-")
        return f"[{label}]({SITE_URL}/blog/{slug}/)"

    text = re.sub(r"\[\[([^\]]+)\]\]", repl_wikilink, md_text)

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
                f'<div class="obsidian-callout-title">{html.escape(kind)} &middot; {html.escape(title)}</div>'
                f"{body_html}</div>"
            )
            continue
        out_lines.append(lines[i])
        i += 1
    return "\n".join(out_lines)


def estimate_reading_time(text: str) -> int:
    words = len(re.findall(r"\w+", text))
    return max(1, round(words / 210))


def build_nav(rel_root: str) -> str:
    return f"""  <div class="chromatic-ribbon" aria-hidden="true">
    <span></span><span></span><span></span><span></span><span></span>
  </div>
  <nav class="site-nav" aria-label="Main Navigation">
    <div class="wrapper nav-inner">
      <a class="nav-logo" href="{rel_root}index.html">
        <svg width="24" height="24" viewBox="0 0 64 64" aria-hidden="true" style="flex:none">
          <rect x="7" y="7" width="52" height="52" rx="10" fill="#18181b" />
          <rect x="4" y="4" width="52" height="52" rx="10" fill="#f6f1e6" stroke="#18181b" stroke-width="4" />
          <rect x="6" y="6" width="12" height="7" fill="#ff5a36" />
          <rect x="18" y="6" width="12" height="7" fill="#f4b41a" />
          <rect x="30" y="6" width="12" height="7" fill="#1fa372" />
          <rect x="42" y="6" width="12" height="7" fill="#3b6ef6" />
          <path d="M6 14 H54" stroke="#18181b" stroke-width="3" />
          <path d="M15 24 L25 46 L35 24" fill="none" stroke="#18181b" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round" />
          <rect x="38" y="40" width="10" height="5.5" rx="1.5" fill="#ff5a36" stroke="#18181b" stroke-width="1.5" />
        </svg>
        <span>vola12do<span class="prompt-tilde">~$</span></span>
        <span class="nav-chroma-dots" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
      </a>
      <ul class="nav-links">
        <li><a href="{rel_root}index.html#about">about</a></li>
        <li><a href="{rel_root}index.html#vulns">vulns</a></li>
        <li><a href="{rel_root}index.html#experience">exp</a></li>
        <li><a href="{rel_root}index.html#projects">projects</a></li>
        <li><a href="{rel_root}index.html#skills">skills</a></li>
        <li><a href="{rel_root}blog/" class="is-active">blog</a></li>
        <li><a href="https://github.com/Vola12do" target="_blank" rel="noopener noreferrer">github &#8599;</a></li>
        <li>
          <button type="button" id="theme-toggle-btn" class="theme-pill-btn" aria-label="Toggle Paper and CRT Night theme">
            <span id="theme-toggle-icon">&#9728;</span>
            <span id="theme-toggle-text">Paper</span>
          </button>
        </li>
      </ul>
    </div>
  </nav>"""


def build_footer(rel_root: str) -> str:
    return f"""  <footer class="site-footer">
    <div class="wrapper">
      <p>crafted by <a href="https://github.com/Vola12do" target="_blank" rel="noopener noreferrer" style="text-decoration:underline;font-weight:700">@Vola12do</a> (Vishwash Tank) &nbsp;&middot;&nbsp; 2026</p>
    </div>
  </footer>
  <script src="{rel_root}assets/js/site.js" defer></script>"""


def render_post_page(post: Dict[str, Any]) -> str:
    title = html.escape(post["title"])
    summary = html.escape(post["summary"])
    date_str = html.escape(post["date_str"])
    category = html.escape(post["category"])
    slug = html.escape(post["slug"])
    tags_html = " ".join(f'<span class="badge badge-yellow">#{html.escape(str(t))}</span>' for t in post["tags"])

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

    return f"""<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://raw.githubusercontent.com; script-src 'self' 'unsafe-inline'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none';" />
  <title>{title} &mdash; vola12do</title>
  <meta name="description" content="{summary}" />
  <link rel="canonical" href="{SITE_URL}/blog/{slug}/" />
  <link rel="icon" href="../../assets/favicon.svg" type="image/svg+xml" />
  <link rel="icon" href="../../assets/favicon-32.png" sizes="32x32" type="image/png" />
  <link rel="apple-touch-icon" href="../../assets/favicon-180.png" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=JetBrains+Mono:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="../../assets/css/style.css" />
  <link rel="stylesheet" href="../../assets/css/blog.css" />
  <script type="application/ld+json">{json.dumps(schema)}</script>
</head>
<body>
{build_nav("../../")}
  <main class="wrapper">
    <div class="blog-header-box">
      <p><a href="../" style="text-decoration:underline;font-weight:700">&larr; back to all notes</a></p>
      <span class="blog-kicker" style="margin-top:10px">{category} &middot; {date_str} &middot; {post['reading_min']} min read</span>
      <h1 class="blog-main-title">{title}</h1>
      <p class="blog-sub">{summary}</p>
      <div class="hero-badges" style="margin-top:14px;margin-bottom:0">{tags_html}</div>
    </div>

    <article class="article-card article-prose">
      {post['html']}
    </article>
  </main>
{build_footer("../../")}
</body>
</html>
"""


def render_blog_index(posts: List[Dict[str, Any]]) -> str:
    rows_html: List[str] = []
    for idx, p in enumerate(posts, start=1):
        nr = f"{idx:02d}"
        slug = html.escape(p["slug"])
        title = html.escape(p["title"])
        cat = html.escape(p["category"])
        summary = html.escape(p["summary"])
        date_str = html.escape(p["date_str"])
        rows_html.append(f"""        <a class="note-item" href="{slug}/" style="flex-direction:column;align-items:flex-start;gap:6px">
          <div style="display:flex;justify-content:space-between;width:100%;flex-wrap:wrap;gap:8px">
            <span class="note-title">{nr} &middot; {title}</span>
            <span class="badge badge-yellow">{cat} &middot; {p['reading_min']} min</span>
          </div>
          <p style="font-size:0.82rem;color:var(--ink-soft)">{summary}</p>
          <span class="note-meta">Published {date_str} &mdash; Read full note &#8599;</span>
        </a>""")

    if rows_html:
        joined = f"""    <div class="notes-list" style="margin-bottom:48px">\n{chr(10).join(rows_html)}\n    </div>"""
    else:
        joined = """    <div class="blog-empty-card" style="margin:28px 0 56px">
      <div class="blog-empty-tape" aria-hidden="true"></div>
      <svg class="blog-empty-doodle" viewBox="0 0 180 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <circle cx="30" cy="28" r="8" fill="#ff5a36" stroke="#18181b" stroke-width="2" />
        <circle cx="152" cy="34" r="6" fill="#f4b41a" stroke="#18181b" stroke-width="2" />
        <circle cx="144" cy="92" r="5" fill="#1fa372" stroke="#18181b" stroke-width="2" />
        <path d="M48 18 L48 26 M44 22 L52 22" stroke="#18181b" stroke-width="2" stroke-linecap="round" />
        <path d="M132 16 L132 24 M128 20 L136 20" stroke="#18181b" stroke-width="2" stroke-linecap="round" />
        <rect x="44" y="34" width="76" height="64" rx="5" fill="#fffdf8" stroke="#18181b" stroke-width="2.5" />
        <path d="M40 44 H48 M40 56 H48 M40 68 H48 M40 80 H48" stroke="#18181b" stroke-width="2.5" stroke-linecap="round" />
        <path d="M58 50 Q 70 46 82 50 T 104 50" stroke="#3b6ef6" stroke-width="2.2" stroke-linecap="round" fill="none" />
        <path d="M58 62 Q 72 59 88 62" stroke="#18181b" stroke-width="2" stroke-linecap="round" fill="none" />
        <circle cx="74" cy="76" r="1.8" fill="#18181b" />
        <circle cx="88" cy="76" r="1.8" fill="#18181b" />
        <path d="M76 82 Q 81 86 86 82" stroke="#ff5a36" stroke-width="2.2" stroke-linecap="round" fill="none" />
        <g transform="translate(116, 46) rotate(28)">
          <rect x="0" y="0" width="11" height="42" rx="1.5" fill="#f4b41a" stroke="#18181b" stroke-width="2.2" />
          <rect x="0" y="0" width="11" height="8" fill="#ff5a36" stroke="#18181b" stroke-width="2.2" />
          <path d="M0 42 L5.5 52 L11 42 Z" fill="#ede6d6" stroke="#18181b" stroke-width="2.2" stroke-linejoin="round" />
          <circle cx="5.5" cy="50" r="1.8" fill="#18181b" />
        </g>
      </svg>
      <p class="blog-empty-hand">&#10022; fresh ink brewing... &#10022;</p>
      <h2 class="blog-empty-title">will write soon<span class="cursor-blink"></span></h2>
      <p class="blog-empty-sub">hand-written notes &amp; write-ups will drop here when they&rsquo;re ready &mdash; zero AI slop, only real notes.</p>
      <a href="../index.html" class="retro-btn" style="margin-top:8px">&larr; back to portfolio</a>
    </div>"""
    return f"""<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://raw.githubusercontent.com; script-src 'self' 'unsafe-inline'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none';" />
  <title>Blog &amp; Field Notes &mdash; vola12do (Vishwash Tank)</title>
  <meta name="description" content="Security writeups, APK reverse engineering notes, and hardware logs by Vishwash Tank (@Vola12do)." />
  <link rel="canonical" href="{SITE_URL}/blog/" />
  <link rel="icon" href="../assets/favicon.svg" type="image/svg+xml" />
  <link rel="icon" href="../assets/favicon-32.png" sizes="32x32" type="image/png" />
  <link rel="apple-touch-icon" href="../assets/favicon-180.png" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=JetBrains+Mono:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="../assets/css/style.css" />
  <link rel="stylesheet" href="../assets/css/blog.css" />
</head>
<body>
{build_nav("../")}
  <main class="wrapper">
{joined}
  </main>
{build_footer("../")}
</body>
</html>
"""


def load_posts() -> List[Dict[str, Any]]:
    posts: List[Dict[str, Any]] = []
    if not CONTENT_DIR.exists():
        return posts

    for md_path in sorted(CONTENT_DIR.glob("*.md")):
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

        transformed = transform_obsidian_syntax(body)
        html_body = markdown.markdown(transformed, extensions=["fenced_code", "tables", "toc"])

        posts.append(
            {
                "slug": slug,
                "title": title,
                "date_str": date_str,
                "category": category,
                "summary": summary,
                "tags": tags,
                "reading_min": estimate_reading_time(body),
                "html": html_body,
            }
        )

    posts.sort(key=lambda x: x["date_str"], reverse=True)
    return posts


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
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
