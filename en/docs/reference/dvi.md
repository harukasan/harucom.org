---
layout: doc
title: DVI Module
permalink: /en/docs/reference/dvi/
lang: en
ref: docs-reference-dvi
---

The DVI module provides a low-level API for controlling DVI output and drawing on screen.

Harucom has two display modes: text mode and graphics mode.
In graphics mode, you can draw at the pixel level, including shapes and text.

For easier drawing, use the [P5 Drawing Library](../p5/), which wraps DVI::Graphics.

## Table of Contents

- [Basic Usage](#basic-usage)
- [DVI Module Methods](#dvi-module-methods)
  - [DVI.set_mode](#dviset_modemode)
  - [DVI.wait_vsync](#dviwait_vsync)
  - [DVI.frame_count](#dviframe_count)
- [DVI::Text (Text Mode)](#dvitext-text-mode)
  - [Displaying Characters](#displaying-characters)
  - [Clearing the Screen](#clearing-the-screen)
  - [Scrolling](#scrolling)
  - [Attribute Operations](#attribute-operations)
  - [Line Reading and Writing](#line-reading-and-writing)
  - [Flushing to Display](#flushing-to-display)
- [DVI::Graphics (Graphics Mode)](#dvigraphics-graphics-mode)
  - [Screen Control](#screen-control)
  - [Pixel Operations](#pixel-operations)
  - [Drawing Shapes](#drawing-shapes)
  - [Drawing Lines](#drawing-lines)
  - [Drawing Text](#drawing-text)
  - [Drawing Images](#drawing-images)
  - [Blend Modes](#blend-modes)
- [Color Format](#color-format)
- [Font List](#font-list)

## Basic Usage

### Text Mode

```ruby
DVI.set_mode(DVI::TEXT_MODE)

# Clear screen (black background, white text)
attr = (DVI::Text::WHITE << 4) | DVI::Text::BLACK
DVI::Text.clear(attr)

# Display a string
DVI::Text.put_string(0, 0, "Hello, world!", attr)
DVI::Text.commit
```

### Graphics Mode

```ruby
DVI.set_mode(DVI::GRAPHICS_MODE)

G = DVI::Graphics

# Fill the screen with black
G.fill(0x00)

# Draw a red circle
G.fill_circle(160, 120, 50, 0xE0)

# Draw text
G.draw_text(10, 10, "Hello!", 0xFF, G::FONT_MPLUS_12)

G.commit
```

---

## DVI Module Methods

### DVI.set_mode(mode)

```ruby
DVI.set_mode(DVI::TEXT_MODE)
DVI.set_mode(DVI::GRAPHICS_MODE)
```

Switches the display mode. The switch takes effect at the next VBlank.

| Constant | Mode |
|----------|------|
| `DVI::TEXT_MODE` | Text mode (106 columns x 37 rows) |
| `DVI::GRAPHICS_MODE` | Graphics mode (640x480 or 320x240) |

### DVI.wait_vsync

```ruby
DVI.wait_vsync
```

Waits until the next VBlank (vertical blanking interval).

### DVI.frame_count

```ruby
DVI.frame_count  #=> Integer
```

Returns the number of frames since DVI output started. Increases at approximately 60 frames per second.

---

## DVI::Text (Text Mode)

In text mode, you can place characters on a 106-column x 37-row screen.
Each cell has a character code and an attribute (foreground and background color).

### Screen Size

| Constant | Value |
|----------|-------|
| `DVI::Text::COLS` | 106 (columns) |
| `DVI::Text::ROWS` | 37 (rows) |

### Color Constants

The following constants can be used for foreground and background colors in attributes.

| Constant | Color |
|----------|-------|
| `DVI::Text::BLACK` | Black |
| `DVI::Text::BLUE` | Blue |
| `DVI::Text::GREEN` | Green |
| `DVI::Text::CYAN` | Cyan |
| `DVI::Text::RED` | Red |
| `DVI::Text::MAGENTA` | Magenta |
| `DVI::Text::BROWN` | Brown |
| `DVI::Text::LIGHT_GRAY` | Light gray |
| `DVI::Text::DARK_GRAY` | Dark gray |
| `DVI::Text::LIGHT_BLUE` | Light blue |
| `DVI::Text::LIGHT_GREEN` | Light green |
| `DVI::Text::LIGHT_CYAN` | Light cyan |
| `DVI::Text::LIGHT_RED` | Light red |
| `DVI::Text::LIGHT_MAGENTA` | Light magenta |
| `DVI::Text::YELLOW` | Yellow |
| `DVI::Text::WHITE` | White |

### Building Attributes

An attribute is a 1-byte value where the upper 4 bits are the foreground color and the lower 4 bits are the background color.

```ruby
# White text, black background
attr = (DVI::Text::WHITE << 4) | DVI::Text::BLACK

# Yellow text, blue background
attr = (DVI::Text::YELLOW << 4) | DVI::Text::BLUE
```

### Displaying Characters

#### DVI::Text.put_char(col, row, ch, attr)

```ruby
DVI::Text.put_char(0, 0, 65, attr)  # Display 'A'
```

Places the character code ch at position (col, row) with attribute attr.

#### DVI::Text.put_string(col, row, str, attr)

```ruby
DVI::Text.put_string(0, 0, "Hello!", attr)
```

Displays a UTF-8 string starting at position (col, row) with attribute attr.
Full-width characters (such as Japanese) are also supported.

### Clearing the Screen

#### DVI::Text.clear(attr)

```ruby
DVI::Text.clear(attr)
```

Clears the entire screen with the specified attribute.

#### DVI::Text.clear_line(row, attr)

```ruby
DVI::Text.clear_line(5, attr)
```

Clears the specified row with attribute attr.

#### DVI::Text.clear_range(col, row, width, attr)

```ruby
DVI::Text.clear_range(10, 5, 20, attr)
```

Clears width cells starting at position (col, row) with attribute attr.

### Scrolling

#### DVI::Text.scroll_up(lines, attr)

```ruby
DVI::Text.scroll_up(1, attr)
```

Scrolls the screen up by the specified number of lines. Empty lines at the bottom are filled with attribute attr.

#### DVI::Text.scroll_down(lines, attr)

```ruby
DVI::Text.scroll_down(1, attr)
```

Scrolls the screen down by the specified number of lines. Empty lines at the top are filled with attribute attr.

### Attribute Operations

#### DVI::Text.get_attr(col, row)

```ruby
a = DVI::Text.get_attr(0, 0)
```

Returns the attribute of the cell at position (col, row).

#### DVI::Text.set_attr(col, row, attr)

```ruby
DVI::Text.set_attr(0, 0, attr)
```

Changes the attribute of the cell at position (col, row).

### Line Reading and Writing

#### DVI::Text.read_line(row)

```ruby
line = DVI::Text.read_line(0)
```

Reads the contents of the specified row as a `DVI::Text::Line` object.
Can be used for scroll-back buffers, etc.

#### DVI::Text.write_line(row, line)

```ruby
DVI::Text.write_line(5, line)
```

Writes a `DVI::Text::Line` object (read by `read_line`) to the specified row.

### Flushing to Display

#### DVI::Text.commit

```ruby
DVI::Text.commit
```

Copies the back buffer to the front buffer for display. Waits for VBlank before copying,
so no screen flickering occurs.

---

## DVI::Graphics (Graphics Mode)

In graphics mode, you can draw on screen at the pixel level.
Colors are specified in RGB332 format (1 byte).

### Screen Control

#### DVI::Graphics.width

```ruby
DVI::Graphics.width  #=> 640 or 320
```

Returns the framebuffer width in pixels.

#### DVI::Graphics.height

```ruby
DVI::Graphics.height  #=> 480 or 240
```

Returns the framebuffer height in pixels.

#### DVI::Graphics.set_resolution(width, height)

```ruby
DVI::Graphics.set_resolution(320, 240)  # Switch to 320x240
DVI::Graphics.set_resolution(640, 480)  # Switch back to 640x480
```

Switches the screen resolution. The two available options are 640x480 (default) and 320x240.

#### DVI::Graphics.fill(color)

```ruby
DVI::Graphics.fill(0x00)  # Fill the screen with black
```

Fills the entire screen with the specified RGB332 color.

#### DVI::Graphics.commit

```ruby
DVI::Graphics.commit
```

Waits for VBlank, then copies the back buffer to the front buffer for display.
Call this after all drawing for one frame is complete.

### Pixel Operations

#### DVI::Graphics.set_pixel(x, y, color)

```ruby
DVI::Graphics.set_pixel(100, 50, 0xFF)
```

Sets the pixel at (x, y) to the specified RGB332 color.

#### DVI::Graphics.get_pixel(x, y)

```ruby
c = DVI::Graphics.get_pixel(100, 50)
```

Returns the RGB332 color value of the pixel at (x, y).
Returns 0 if the coordinates are out of bounds.

### Drawing Shapes

Shape drawing methods come in two types: filled (prefixed with `fill_`) and outline-only (prefixed with `draw_`).

#### DVI::Graphics.fill_rect(x, y, w, h, color)

```ruby
DVI::Graphics.fill_rect(10, 10, 100, 50, 0xE0)
```

Draws a filled rectangle with (x, y) as the top-left corner, width w, and height h.

#### DVI::Graphics.draw_rect(x, y, w, h, color)

```ruby
DVI::Graphics.draw_rect(10, 10, 100, 50, 0xFF)
```

Draws a rectangle outline with (x, y) as the top-left corner, width w, and height h.

#### DVI::Graphics.fill_circle(cx, cy, r, color)

```ruby
DVI::Graphics.fill_circle(160, 120, 50, 0xE0)
```

Draws a filled circle centered at (cx, cy) with radius r.

#### DVI::Graphics.draw_circle(cx, cy, r, color)

```ruby
DVI::Graphics.draw_circle(160, 120, 50, 0xFF)
```

Draws a circle outline centered at (cx, cy) with radius r.

#### DVI::Graphics.fill_ellipse(cx, cy, rx, ry, color)

```ruby
DVI::Graphics.fill_ellipse(160, 120, 80, 40, 0xE0)
```

Draws a filled ellipse centered at (cx, cy) with horizontal radius rx and vertical radius ry.

#### DVI::Graphics.draw_ellipse(cx, cy, rx, ry, color)

```ruby
DVI::Graphics.draw_ellipse(160, 120, 80, 40, 0xFF)
```

Draws an ellipse outline centered at (cx, cy).

#### DVI::Graphics.fill_triangle(x0, y0, x1, y1, x2, y2, color)

```ruby
DVI::Graphics.fill_triangle(100, 10, 50, 90, 150, 90, 0x1C)
```

Draws a filled triangle connecting three vertices.

#### DVI::Graphics.fill_arc(cx, cy, r, start_angle, stop_angle, color)

```ruby
DVI::Graphics.fill_arc(160, 120, 50, 0, Math::PI / 2, 0xE0)
```

Draws a filled arc sector. Angles are in radians (0 is right, PI/2 is down).

#### DVI::Graphics.draw_arc(cx, cy, r, start_angle, stop_angle, color)

```ruby
DVI::Graphics.draw_arc(160, 120, 50, 0, Math::PI / 2, 0xFF)
```

Draws an arc sector outline.

### Drawing Lines

#### DVI::Graphics.draw_line(x0, y0, x1, y1, color)

```ruby
DVI::Graphics.draw_line(0, 0, 100, 100, 0xFF)
```

Draws a line from (x0, y0) to (x1, y1).

#### DVI::Graphics.draw_thick_line(x0, y0, x1, y1, thickness, color)

```ruby
DVI::Graphics.draw_thick_line(0, 0, 100, 100, 3, 0xFF)
```

Draws a line with the specified thickness in pixels.

### Drawing Text

#### DVI::Graphics.draw_text(x, y, text, color, font = FONT_8X8, wide_font = nil)

```ruby
# Basic usage
DVI::Graphics.draw_text(10, 10, "Hello!", 0xFF)

# Specify a font
DVI::Graphics.draw_text(10, 10, "Hello!", 0xFF, DVI::Graphics::FONT_MPLUS_12)

# Also specify a Japanese font
DVI::Graphics.draw_text(10, 10, "こんにちは", 0xFF,
  DVI::Graphics::FONT_MPLUS_12, DVI::Graphics::FONT_MPLUS_J12)
```

Draws a UTF-8 string at position (x, y).
The 5th argument specifies the font, and the 6th argument specifies a wide font for full-width characters.

#### DVI::Graphics.text_width(text, font = FONT_8X8, wide_font = nil)

```ruby
w = DVI::Graphics.text_width("Hello!", DVI::Graphics::FONT_MPLUS_12)
```

Returns the width in pixels that the string would occupy when drawn (without actually drawing it).

#### DVI::Graphics.font_height(font)

```ruby
h = DVI::Graphics.font_height(DVI::Graphics::FONT_MPLUS_12)
```

Returns the glyph height of the specified font in pixels.

### Drawing Images

#### DVI::Graphics.draw_image(data, x, y, w, h)

```ruby
DVI::Graphics.draw_image(pixel_data, 10, 10, 32, 32)
```

Draws RGB332 image data (byte array) at position (x, y).
The data length must be at least w * h bytes.

#### DVI::Graphics.draw_image_masked(data, mask, x, y, w, h)

```ruby
DVI::Graphics.draw_image_masked(pixel_data, mask_data, 10, 10, 32, 32)
```

Draws an image with a transparency mask.
The mask is 1bpp (1 bit per pixel), where 1 bits are opaque and 0 bits are transparent.
The mask length must be at least (w * h + 7) / 8 bytes.

### Blend Modes

#### DVI::Graphics.set_blend_mode(mode)

```ruby
DVI::Graphics.set_blend_mode(DVI::Graphics::BLEND_ADD)
```

Changes the pixel compositing method.

| Constant | Behavior |
|----------|----------|
| `DVI::Graphics::BLEND_REPLACE` | Overwrite (default) |
| `DVI::Graphics::BLEND_ADD` | Per-channel addition (saturating) |
| `DVI::Graphics::BLEND_SUBTRACT` | Per-channel subtraction (saturating) |
| `DVI::Graphics::BLEND_MULTIPLY` | Per-channel multiply |
| `DVI::Graphics::BLEND_SCREEN` | Per-channel screen compositing |
| `DVI::Graphics::BLEND_ALPHA` | Alpha blending (set opacity with `set_alpha`) |

#### DVI::Graphics.set_alpha(alpha)

```ruby
DVI::Graphics.set_alpha(128)  # Semi-transparent
```

Sets the opacity (0-255) for `BLEND_ALPHA` mode.
0 is fully transparent, 255 is fully opaque.

---

## Color Format

In graphics mode, colors are specified in RGB332 format (1 byte).

```
Bits 7-5: Red (0-7)
Bits 4-2: Green (0-7)
Bits 1-0: Blue (0-3)
```

Common color examples:

| Value | Color |
|-------|-------|
| `0x00` | Black |
| `0xFF` | White |
| `0xE0` | Red |
| `0x1C` | Green |
| `0x03` | Blue |
| `0xFC` | Yellow |

You can use the `color(r, g, b)` method from the [P5 Drawing Library](p5.md) to convert standard RGB values (0-255) to RGB332.

---

## Font List

Font constants available in `DVI::Graphics`.

| Constant | Description |
|----------|-------------|
| `FONT_8X8` | 8x8 monospace font |
| `FONT_MPLUS_12` | M+ 12px proportional font |
| `FONT_FIXED_4X6` | Misc-Fixed 4x6 monospace font |
| `FONT_FIXED_5X7` | Misc-Fixed 5x7 monospace font |
| `FONT_FIXED_6X13` | Misc-Fixed 6x13 monospace font |
| `FONT_SPLEEN_5X8` | Spleen 5x8 monospace font |
| `FONT_SPLEEN_8X16` | Spleen 8x16 monospace font |
| `FONT_SPLEEN_12X24` | Spleen 12x24 monospace font |
| `FONT_DENKICHIP` | DenkiChip 12px font (ASCII) |
| `FONT_MPLUS_J12` | M+ 12px Japanese font (JIS X 0208) |
| `FONT_DENKICHIP_J` | DenkiChip 12px Japanese font (JIS X 0208) |

To display full-width characters such as Japanese, specify `FONT_MPLUS_J12` or `FONT_DENKICHIP_J`
as the wide_font argument of `draw_text`.
