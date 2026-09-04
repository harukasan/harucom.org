---
layout: doc
title: Text Editor
permalink: /en/docs/app/edit/
lang: en
ref: docs-app-edit
---

`edit` is the full-screen text editor built into Harucom.
Use it to write Ruby scripts and to change settings files.

## Contents

- [Starting the Editor](#starting-the-editor)
- [Reading the Screen](#reading-the-screen)
- [Key Bindings](#key-bindings)
- [Saving](#saving)
- [Quitting](#quitting)
- [Syntax Highlighting and Auto Indent](#syntax-highlighting-and-auto-indent)

## Starting the Editor

At the IRB prompt, type `edit` followed by the name of the file to edit.

```ruby
irb> edit hello.rb
```

A file that does not exist yet is created.
An existing one is opened as it is.

The editor also starts without a file name.
In that case you name the file when you save it.

```ruby
irb> edit
```

After moving with `cd`, a plain file name opens a file in that directory.
A path from `/` works too.

```ruby
irb> edit /app/hello.rb
```

## Reading the Screen

The status bar at the top shows the file name and the cursor position.

```
 hello.rb [+]  12:5
```

`[+]` means there are changes you have not saved yet.
Without a file name, the status bar shows `[untitled]`.

## Key Bindings

| Key | Action |
|-----|--------|
| <kbd>→</kbd> / <kbd>↑</kbd> / <kbd>←</kbd> / <kbd>↓</kbd> | Move the cursor |
| <kbd>Home</kbd> / <kbd>End</kbd> | Jump to beginning / end of line |
| <kbd>PageUp</kbd> / <kbd>PageDown</kbd> | Page scroll |
| <kbd>Backspace</kbd> | Delete the character before the cursor |
| <kbd>Delete</kbd> | Delete the character at the cursor |
| <kbd>Enter</kbd> | Insert a new line |
| <kbd><kbd>Ctrl</kbd>-<kbd>S</kbd></kbd> | Save |
| <kbd><kbd>Ctrl</kbd>-<kbd>Q</kbd></kbd> | Quit |
| <kbd><kbd>Ctrl</kbd>-<kbd>Z</kbd></kbd> | Undo |
| <kbd><kbd>Ctrl</kbd>-<kbd>Y</kbd></kbd> | Redo |

## Saving

<kbd><kbd>Ctrl</kbd>-<kbd>S</kbd></kbd> saves the file.

When the file has no name yet, the editor asks for one.
<kbd>Esc</kbd> cancels the save.

## Quitting

<kbd><kbd>Ctrl</kbd>-<kbd>Q</kbd></kbd> quits and returns you to IRB.

With unsaved changes, the editor asks first.

```
 Unsaved changes. Quit? (y/n):
```

<kbd>y</kbd> quits without saving and <kbd>n</kbd> returns to editing.

## Syntax Highlighting and Auto Indent

When the file name ends in `.rb`, the editor helps with writing Ruby.

### Syntax Highlighting

Strings, keywords, comments, and numbers are colored,
which makes a missing `end` or an unclosed string easy to spot.

### Auto Indent

A newline after `def`, `if`, or `do` is indented for you.
Typing `end` or `else` moves that line back to where it belongs on its own.

```ruby
def greet(name)
  puts "Hello, #{name}!"
end
```

## Related Pages

- [Japanese Input](../../japanese-input/) — Japanese can be typed in the editor too
- [Commands](../../commands/) — file handling with `cat`, `cp`, and the rest
- [File I/O](../../files/) — where files live and how to run scripts
- [Getting Started](../../getting-started/) — writing your first program
