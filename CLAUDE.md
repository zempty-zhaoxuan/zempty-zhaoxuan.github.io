# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a Jekyll-based blog site hosted on GitHub Pages at `blog.zempty.sg`. Production uses GitHub Pages' Jekyll 3.10 with a custom theme focused on technical writing, LeetCode problem solutions, and personal insights.

## Key Commands

### Blog Development
- **Create new blog post**: `./create_blog_post.sh "Your Blog Post Title"` or `./create_blog_post.sh -d YYYY-MM-DD "Title"`
- **Compile SASS**: `./compile_sass.sh` (compiles `style.scss` to `style.css`; uses `sass` on PATH, falls back to `npx sass`)
- **Local development**: `bundle exec jekyll serve` / `bundle exec jekyll build`

### Build & Deploy Notes
- There is no GitHub Actions workflow: GitHub Pages builds the site itself with **Jekyll 3.10** (the `github-pages` gem). The local `Gemfile` pins Jekyll 4.3, so local 4.x builds can pass while Pages fails. Keep templates Jekyll 3.10-compatible and use only Pages-whitelisted plugins (`jekyll-paginate`, `jekyll-sitemap`, `jekyll-feed`).
- `style.scss` has no front matter, so Jekyll does not compile it. The committed `style.css` is what ships: always run `./compile_sass.sh` after editing anything in `_sass/` and commit the regenerated `style.css`.
- The CSP in `_includes/head.html` includes `upgrade-insecure-requests`, so a plain `http://127.0.0.1` preview of `_site` loads no CSS/JS in some browsers; `jekyll serve` on localhost is unaffected in most browsers, otherwise strip that directive in a throwaway copy.
- `sw.js` is a kill switch that clears caches and unregisters the old service worker. Do not reintroduce a caching worker.

### Other Utilities
- **Security check**: `./security-check.sh`

## Architecture & Structure

### Content Organization
- **Posts**: All blog posts are in `_posts/` with naming convention `YYYY-MM-DD-title-in-lowercase.md`
- **Tags**: Posts are organized by tags only (no categories); `/tags/` and the sidebar sort tags by post count

### Theme Structure
- **Layouts**: `_layouts/` contains `default.html`, `post.html`, `page.html`
- **Includes**: `_includes/` has modular components (nav, footer, analytics, etc.)
- **Styling**: `style.scss` imports one partial per area: `_tokens` (light/dark CSS variables, the only place colors are defined), `_base`, `_prose` (article typography), `_layout`, `_sidebar`, `_home`, `_post`, `_search`, `_tags-archive`, `_highlights`, `_giscus`, `_share`. Breakpoint mixins live in `_variables.scss`. Avoid `!important`.
- **JavaScript**: small, independent, `defer`-loaded scripts in `js/`: `theme-switcher`, `layout` (drawer, focus mode, back-to-top), `search` (⌘K / `/` palette), and post-only `toc`, `reading-progress`, `code-enhancements`, `image-zoom`, `giscus`, `article-sharing`.

### Key Features
- Search palette backed by `search.json` and `js/search.js`
- TOC (sticky on wide screens, collapsible otherwise) for posts with `toc: true`; related posts by shared tags; prev/next cards
- Responsive layout: 280px sidebar ≥1024px (collapsible "focus mode"), top bar + drawer below
- Theme follows the system unless the reader picks one; an inline script in `head.html` sets `light-theme`/`dark-theme` on `<html>` before paint, stores the choice in `localStorage.theme`, and fires a `themechange` event
- Giscus commenting system
- Google Analytics integration

### Front Matter Requirements
All posts must include:
```yaml
---
layout: post
title: "Article Title"
date: "YYYY-MM-DD"
toc: true
excerpt: "Brief article summary"
tags: [tag1, tag2]
comments: true
author: zempty
---
```

## Content Guidelines

### Blog Post Creation
- Use the `create_blog_post.sh` script to ensure proper naming and front matter
- Filename format: `YYYY-MM-DD-lowercase-title-with-hyphens.md`
- Always include an excerpt and relevant tags
- Technical posts should have detailed code examples with syntax highlighting

### LeetCode Posts
- Follow the pattern established in `.cursor/rules/leetcode.mdc`
- Provide multiple solution approaches (minimum 3)
- Include complexity analysis and execution examples
- Use Java as the primary language for implementations

### Styling
- Code blocks should specify language for syntax highlighting
- Use tables for step-by-step algorithm execution
- Structure: introduction → main content → conclusion
- Start main sections with level 2 headings (##)

## Development Notes

- Site uses Jekyll pagination (13 posts per page)
- JetBrains Mono for code; system sans-serif fonts for prose
- Responsive breakpoints and layout rules are in `_sass/_variables.scss` and `_sass/_layout.scss`
- Search functionality indexes all posts via `search.json`
- Analytics and commenting systems are configured in `_config.yml`
