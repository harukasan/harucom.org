---
layout: doc
title: Settings and Screen Zoom
permalink: /en/docs/settings/
lang: en
ref: docs-settings
---

Harucom keeps its settings in a single file, `/etc/env.yml`.
The keyboard layout and the text size at boot are configured there.

## Contents

- [The Settings File](#the-settings-file)
- [Changing the Keyboard Layout](#changing-the-keyboard-layout)
- [Zooming the Screen](#zooming-the-screen)
- [Formatting the Filesystem](#formatting-the-filesystem)

## The Settings File

Edit the file with the editor.

```ruby
irb> edit /etc/env.yml
```

```yaml
KEYBOARD_LAYOUT: us
CONSOLE_ZOOM: 1
```

| Setting | Values | Description |
|---------|--------|-------------|
| `KEYBOARD_LAYOUT` | `us` / `jis` | Keyboard layout |
| `CONSOLE_ZOOM` <span class="badge-v2">New in 2.0</span> | `1` / `2` | Text size at boot |

Save the file and [restart](../restart/) with <kbd><kbd>Ctrl</kbd>-<kbd>Alt</kbd>-<kbd>Delete</kbd></kbd> to apply the settings.

The file is loaded into the environment variables at boot, so programs can read it through `ENV`.

```ruby
irb> ENV["KEYBOARD_LAYOUT"]
=> "us"
```

You can add settings of your own. Whatever you write ends up in `ENV`.

> A firmware update rewrites the system files, `/etc/env.yml` included.
> Set your preferences again after updating.
{: .tip}

## Changing the Keyboard Layout

`KEYBOARD_LAYOUT` selects the keyboard layout.

| Value | Layout |
|-------|--------|
| `us` | US ANSI |
| `jis` | Japanese JIS |

Set it to `jis` if the symbols come out in the wrong place with a Japanese keyboard.
The `jis` layout also enables the <kbd>半角/全角</kbd> and <kbd>カタカナ/ひらがな</kbd> keys,
which makes switching [Japanese input](../japanese-input/) easier.

An unknown value falls back to `us`.

## Zooming the Screen
{: .since-v2}

The text screen has two sizes. The larger one helps when the characters are hard to read,
for example on a TV.

| Zoom | Resolution | Grid |
|------|------------|------|
| 1 | 640x480 | 106 columns x 37 rows |
| 2 | 320x240 (pixels doubled) | 53 columns x 18 rows |

Press <kbd><kbd>Ctrl</kbd>-<kbd>Shift</kbd>-<kbd>=</kbd></kbd> at the IRB prompt to switch on the spot.

The `zoom` command does the same.

```ruby
irb> zoom
zoom 1 (106x37 characters)

irb> zoom 2

irb> zoom 1
```

The size at boot comes from `CONSOLE_ZOOM` in `/etc/env.yml`. Set it to `2` to start with
large characters right after power-on.

> Switching the zoom clears the screen. What was displayed is not carried over.
{: .tip}

## Formatting the Filesystem

You can erase everything you have made and return the board to its factory state.
Create a file named `/FORMAT` and restart.

```ruby
irb> touch /FORMAT
```

On the next boot the flash filesystem is formatted and the system files are written again.

> Every file you made is erased. Copy anything you want to keep before doing this.
{: .tip}
