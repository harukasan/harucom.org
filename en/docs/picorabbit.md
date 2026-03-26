---
layout: doc
title: PicoRabbit
permalink: /en/docs/picorabbit/
lang: en
ref: docs-picorabbit
---

# PicoRabbit

PicoRabbit is a presentation tool inspired by [Rabbit](https://rabbit-shocker.org), a presentation tool for Rubyists.
It displays slides written in Markdown on screen and lets you navigate them with the keyboard.

## Table of Contents

- [Basic Usage](#basic-usage)
- [Writing Slides](#writing-slides)
  - [Frontmatter](#frontmatter)
  - [Slide Separators](#slide-separators)
  - [Text](#text)
  - [Lists](#lists)
  - [Blockquotes](#blockquotes)
  - [Code Blocks](#code-blocks)
  - [Images](#images)
  - [Text Alignment](#text-alignment)
  - [Animations](#animations)
- [Keyboard Controls](#keyboard-controls)
- [Themes](#themes)
- [Timer](#timer)

## Basic Usage

Prepare a Markdown file and launch it with the `picorabbit` command.

```
picorabbit slides.md
```

### Example Slide File

```markdown
---
title: My First Presentation
author: Harucom
---

# About Me

- Name: Harucom
- Hobby: Programming

# What I Want to Do

I want to give a presentation on **Harucom**!

> Do big things with a tiny computer

{::wait/}

Can I do it?
```

## Writing Slides

### Frontmatter

You can write presentation metadata in YAML format at the beginning of the file.

```yaml
---
title: Presentation Title
subtitle: Subtitle
author: Your Name
theme: dark
allotted_time: 15
---
```

| Field | Description |
|-------|-------------|
| `title` | Presentation title (displayed on the title slide) |
| `subtitle` | Subtitle |
| `author` | Presenter's name |
| `theme` | Theme name (`default` or `dark`) |
| `allotted_time` | Allotted time (in minutes). When specified, a timer is displayed |

If `title` is specified, a title slide is automatically created at the beginning.

### Slide Separators

A `#` heading marks the beginning of a new slide. The heading text is displayed as the slide title.

```markdown
# The first slide

This is the first slide.

## The second slide

This is the second slide.

### The third slide

This is the third slide.
```

### Text

Plain text is displayed as-is. Bold and inline code are supported as inline formatting.

```markdown
This is a plain text.

You can **bold** text for emphasis.

You can write `inline code` like this.
```

### Lists

Both unordered and ordered lists are supported. Unordered lists can be nested with indentation.

```markdown
- Item 1
- Item 2
  - Nested item

1. Do this first
2. Then do this
```

### Blockquotes

Use `>` for blockquotes. A line is displayed on the left side.

```markdown
> This is a quote
```

### Code Blocks

Surround code with triple backticks for a code block. It is displayed with a background color.

````markdown
```
def hello
  puts "Hello!"
end
```
````

### Images

BMP images can be displayed (8-bit RGB332 format).

```markdown
![alt text](/data/image.bmp)
```

### Text Alignment

Add `{:.center}` or `{:.right}` after an element to change text alignment.

```markdown
Centering the text
{:.center}

Right-aligning the text
{:.right}
```

### Animations

Writing `{::wait/}` pauses the slide display at that point.
Press the right arrow key or Enter to reveal the rest.

```markdown
# Progressive Reveal

First, this is visible.

{::wait/}

Then, this appears.

{::wait/}

Finally, this shows up.
```

You can place multiple `{::wait/}` markers in a single slide to reveal content step by step with each key press.

---

## Keyboard Controls

| Key | Action |
|-----|--------|
| Right arrow, PageDown, Enter, Space | Next slide (or next animation step) |
| Left arrow, PageUp, Backspace | Previous slide (or previous animation step) |
| Home | Jump to the first slide |
| End | Jump to the last slide |
| Up arrow | Jump (when timer is active, the rabbit jumps) |
| Escape, Ctrl+Q | Exit the presentation |

---

## Themes

Select a theme with the `theme` field in the frontmatter.

| Theme | Description |
|-------|-------------|
| `default` | Light background theme (default) |
| `dark` | Dark background theme |

---

## Timer

When `allotted_time` is specified in the frontmatter, a timer is displayed at the bottom of the screen.
The value specifies the allotted time in minutes.

```yaml
---
allotted_time: 15
---
```

When the timer is active, a rabbit and tortoise race is displayed at the bottom of the screen.
The rabbit represents the presenter's pace, and the tortoise represents the ideal pace.
Press the up arrow key to make the rabbit jump.
