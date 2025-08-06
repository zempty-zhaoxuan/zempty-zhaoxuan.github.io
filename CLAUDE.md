# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a Jekyll-based blog site hosted on GitHub Pages at `blog.zempty.sg`. The site is built using Jekyll 4.3.4 with a custom theme focused on technical writing, LeetCode problem solutions, and personal insights.

## Key Commands

### Blog Development
- **Create new blog post**: `./create_blog_post.sh "Your Blog Post Title"` or `./create_blog_post.sh -d YYYY-MM-DD "Title"`
- **Compile SASS**: `./compile_sass.sh` (compiles `style.scss` to `style.css`)
- **Local development**: `bundle exec jekyll serve` (standard Jekyll development server)
- **Build site**: `bundle exec jekyll build`

### Category Management
- **Add categories to posts**: `./add_categories.sh` (comprehensive category assignment)
- **Simple category addition**: `./add_categories_simple.sh`
- **Fix category issues**: `./fix_categories.sh`

### Other Utilities
- **Preview sidebar**: `./preview-sidebar.sh`

## Architecture & Structure

### Content Organization
- **Posts**: All blog posts are in `_posts/` with naming convention `YYYY-MM-DD-title-in-lowercase.md`
- **Categories**: Organized into 6 main categories: `algorithms`, `development`, `tools`, `ai-productivity`, `life-insights`, `others`
- **Tags**: Dynamic tagging system for cross-categorization

### Theme Structure
- **Layouts**: `_layouts/` contains `default.html`, `post.html`, `page.html`
- **Includes**: `_includes/` has modular components (nav, footer, analytics, etc.)
- **Styling**: SASS files in `_sass/` with modern enhancements, mobile responsiveness, and theme switching
- **JavaScript**: `js/` directory contains interactive features (search, animations, sidebar toggle)

### Key Features
- Multi-language support (Chinese/English)
- Advanced search functionality (`simple-jekyll-search`)
- Table of contents generation
- Mobile-responsive design with collapsible sidebar
- Theme switching (light/dark modes)
- Gitalk commenting system
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
- Custom fonts: JetBrains Mono for code, LXGW WenKai for Chinese text
- Responsive breakpoints handled in `_mobile-enhancements.scss`
- Search functionality indexes all posts via `search.json`
- Analytics and commenting systems are configured in `_config.yml`