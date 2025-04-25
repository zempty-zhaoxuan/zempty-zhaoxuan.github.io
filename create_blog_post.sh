#!/bin/bash

# Function to check if a date is valid and in YYYY-MM-DD format
validate_date() {
  # Check format using regex
  if ! [[ $1 =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
    return 1
  fi
  
  # For macOS compatibility
  if [[ "$(uname)" == "Darwin" ]]; then
    # Try to use the date with macOS syntax
    date -j -f "%Y-%m-%d" "$1" >/dev/null 2>&1
  else
    # Linux style
    date -d "$1" >/dev/null 2>&1
  fi
  
  return $?
}

# Get current date in YYYY-MM-DD format
CURRENT_DATE=$(date "+%Y-%m-%d")
CUSTOM_DATE=""

# Parse options
while getopts ":d:" opt; do
  case $opt in
    d)
      CUSTOM_DATE="$OPTARG"
      if validate_date "$CUSTOM_DATE"; then
        CURRENT_DATE="$CUSTOM_DATE"
      else
        echo "Error: Invalid date format. Please use YYYY-MM-DD format."
        exit 1
      fi
      ;;
    \?)
      echo "Invalid option: -$OPTARG" >&2
      exit 1
      ;;
    :)
      echo "Option -$OPTARG requires an argument." >&2
      exit 1
      ;;
  esac
done

# Adjust OPTIND to get non-option arguments
shift $((OPTIND-1))

# Check if a title was provided as an argument
if [ $# -eq 0 ]; then
  echo "Error: Please provide a title for your blog post."
  echo "Usage: ./create_blog_post.sh [-d YYYY-MM-DD] \"Your Blog Post Title\""
  exit 1
fi

# Get the title
TITLE="$1"

# Convert title to filename format (lowercase, spaces to hyphens)
FILENAME=$(echo "$TITLE" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd 'a-z0-9-')

# Create the full filename with date
FULL_FILENAME="_posts/${CURRENT_DATE}-${FILENAME}.md"

# Check if _posts directory exists, create it if not
if [ ! -d "_posts" ]; then
  mkdir -p "_posts"
fi

# Create front matter
cat > "$FULL_FILENAME" << EOF
---
layout: post
title: "$TITLE"
date: "$CURRENT_DATE"
toc: true
excerpt: ""
tags: []
comments: true
author: zempty
---

<!-- Write your content here -->

EOF

echo "Blog post created at: $FULL_FILENAME"
echo "Created with date: $CURRENT_DATE"
echo "Don't forget to add an excerpt and tags to the front matter!" 