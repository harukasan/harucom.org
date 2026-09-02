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
- [Help with Writing Ruby](#help-with-writing-ruby)

## Starting the Editor

At the IRB prompt, type `edit` followed by a file name.

```ruby
irb> edit hello.rb
```

A file that does not exist yet is created. An existing one is opened as it is.

Give a path to open a file elsewhere.

```ruby
irb> edit /app/hello.rb
```

After moving with `cd`, a plain file name refers to a file in that directory.

The editor also starts without a file name. In that case you are asked for one when you save.

```ruby
irb> edit
```

## Reading the Screen

The top line is the status bar. It shows the file name and the line and column of the cursor.

```
 hello.rb [+]  12:5
```

`[+]` means there are changes you have not saved yet.
Without a file name, the status bar shows `[untitled]`.

The bottom line is the command bar, which lists the keys you use most.
While [Japanese input](../../japanese-input/) is on, the mode appears at the right, such as `[あ]`.

```
 Ctrl-S:Save  Ctrl-Q:Quit  Ctrl-Z:Undo  Ctrl-Y:Redo                    [あ]
```

## Key Bindings

| Key | Action |
|-----|--------|
| <kbd><kbd>Ctrl</kbd>-<kbd>S</kbd></kbd> | Save |
| <kbd><kbd>Ctrl</kbd>-<kbd>Q</kbd></kbd> | Quit |
| <kbd><kbd>Ctrl</kbd>-<kbd>Z</kbd></kbd> | Undo |
| <kbd><kbd>Ctrl</kbd>-<kbd>Y</kbd></kbd> | Redo |
| <kbd>→</kbd> / <kbd>↑</kbd> / <kbd>←</kbd> / <kbd>↓</kbd> | Move the cursor |
| <kbd>Home</kbd> / <kbd>End</kbd> | Jump to beginning / end of line |
| <kbd>PageUp</kbd> / <kbd>PageDown</kbd> | Page scroll |
| <kbd>Backspace</kbd> | Delete the character before the cursor |
| <kbd>Delete</kbd> | Delete the character at the cursor |
| <kbd>Enter</kbd> | Insert a new line |

## Saving

<kbd><kbd>Ctrl</kbd>-<kbd>S</kbd></kbd> saves the file.
The status bar shows `Saved hello.rb` and the `[+]` disappears.

When the editor was started without a file name, it asks for one.

```
 Save as: memo.txt
```

Press <kbd>Esc</kbd> to cancel the save.

## Quitting

<kbd><kbd>Ctrl</kbd>-<kbd>Q</kbd></kbd> quits and returns you to IRB.

With unsaved changes, the editor asks first.

```
 Unsaved changes. Quit? (y/n):
```

<kbd>y</kbd> quits without saving and <kbd>n</kbd> returns to editing.

## Help with Writing Ruby

When the file name ends in `.rb`, the editor helps with writing Ruby.

### Syntax Highlighting

Strings, keywords, comments, and numbers are colored, which makes a missing `end`
or an unclosed string easier to spot.

### Auto Indent

A newline after `def`, `if`, or `do` is indented for you.
Typing `end` or `else` pulls that line back to where it belongs.

```ruby
def greet(name)
  puts "Hello, #{name}!"
end
```

### Japanese Input

<kbd><kbd>Ctrl</kbd>-<kbd>J</kbd></kbd> switches to [Japanese input](../../japanese-input/)
for comments and strings.

## Related Pages

- [Commands](../../commands/) — file handling with `cat`, `cp`, and the rest
- [File I/O](../../files/) — where files live and how to run scripts
- [Getting Started](../../getting-started/) — writing your first program
