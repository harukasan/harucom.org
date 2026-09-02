---
layout: doc
title: Getting Started
permalink: /en/docs/getting-started/
lang: en
ref: docs-getting-started
---

Harucom boots directly into IRB (Interactive Ruby Shell) as soon as you power it on. Just connect a USB keyboard and a monitor to start programming in Ruby.

## Prerequisites

To use Harucom, you need the following:

* Harucom Board
* A TV or monitor with HDMI input
* An HDMI cable
* A USB-C cable
* A power adapter with USB-C

> Harucom outputs video at 640x480px resolution. Most PC monitors support this, but some TVs may not. If the display does not work, check your TV's manual.
{: .tip}


## Setup

1. Connect a monitor to the digital video connector on the Harucom Board
2. Connect a keyboard to the USB-A port
3. Connect power to the USB-C port
4. (If present) Turn on the power switch

When powered on, a console screen appears and IRB starts.
If you see the following screen, startup is complete!

```
Harucom OS 0.0.0 (888888)
(c) 2026 Shunsuke Michii

Powered by PicoRuby 3.4.1 on RP2350

For detailed usage, visit https://harucom.org/

irb> ▊
```

## Using IRB (Interactive Ruby)

Harucom starts the Interactive Ruby Shell (IRB) on boot.
When you see the `irb> ` prompt, you can type Ruby code and it will be executed immediately.

```ruby
irb> puts "Hello Harucom"
Hello Harucom
=> nil
irb> 5 + 3
=> 8
irb> _ * 2
=> 16
```

Use `_` to reference the last result.

### Multi-line Input

Block syntax like `def` or `if` automatically enters multi-line input mode when you press Enter.

```ruby
irb> def greet(name)
..     "Hello, #{name}!"
..   end
=> :greet

irb> greet("Harucom")
=> "Hello, Harucom!"
```

## Blinking an LED

Let's try lighting up the LED on the Harucom Board.
Enter the following program to make the LED blink.

```ruby
irb> led = GPIO.new(1, GPIO::OUT)
irb> loop do
..     led.write 1
..     sleep 1
..     led.write 0
..     sleep 1
..   end
```

> To stop execution, press <kbd title="Press Ctrl and C at the same time"><kbd>Ctrl</kbd>-<kbd>C</kbd></kbd>.
{: .tip}

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| <kbd>Enter</kbd> | Execute the entered code |
| <kbd><kbd>Ctrl</kbd>-<kbd>C</kbd></kbd> | Interrupt running code |
| <kbd>Backspace</kbd> | Delete a character |
| <kbd>→</kbd> / <kbd>↑</kbd> / <kbd>←</kbd> / <kbd>↓</kbd> | Move the cursor |
| <kbd>Home</kbd> / <kbd>End</kbd> | Jump to beginning / end of line |
| <kbd><kbd>Ctrl</kbd>-<kbd>A</kbd></kbd> / <kbd><kbd>Ctrl</kbd>-<kbd>E</kbd></kbd> | Jump to beginning / end of line |
| <kbd>PageUp</kbd> / <kbd>PageDown</kbd> | Page scroll |
| <kbd><kbd>Ctrl</kbd>-<kbd>L</kbd></kbd> | Clear the screen |
| <kbd><kbd>Ctrl</kbd>-<kbd>O</kbd></kbd> | Load a file into the input |
| <kbd><kbd>Ctrl</kbd>-<kbd>Shift</kbd>-<kbd>=</kbd></kbd> | Switch the text size on screen |
| <kbd><kbd>Ctrl</kbd>-<kbd>D</kbd></kbd> | Quit IRB (it starts again right away) |

A line longer than the screen scrolls sideways as the cursor moves.

Typing the name of a command in `/app` colors that part of the line,
so you can tell it will run as a command before pressing Enter.

### Loading a File into the Input

Pressing <kbd><kbd>Ctrl</kbd>-<kbd>O</kbd></kbd> asks for a file name and loads its contents
into the input area. Edit it there and run it with <kbd>Enter</kbd>.

### Suspending a Running App

While an app that supports it is running, such as `picorabbit`,
<kbd><kbd>Ctrl</kbd>-<kbd>Z</kbd></kbd> suspends it and returns you to IRB.
Type `fg` to pick up where you left off.

```ruby
irb> jobs
[stopped] picorabbit

irb> fg
```

### Typing Japanese

Japanese can be typed at the IRB prompt.
Press <kbd><kbd>Ctrl</kbd>-<kbd>J</kbd></kbd> to switch the input method on.
See [Japanese Input](../japanese-input/) for details.

## Editing Files with the Text Editor

Use the `edit` command to launch the text editor, where you can save and edit Ruby scripts as files.

```ruby
irb> edit hello.rb
```

### Editor Shortcuts

| Key | Action |
|-----|--------|
| <kbd><kbd>Ctrl</kbd>-<kbd>S</kbd></kbd> | Save |
| <kbd><kbd>Ctrl</kbd>-<kbd>Q</kbd></kbd> | Quit |
| <kbd><kbd>Ctrl</kbd>-<kbd>Z</kbd></kbd> | Undo |
| <kbd><kbd>Ctrl</kbd>-<kbd>Y</kbd></kbd> | Redo |
| <kbd>→</kbd> / <kbd>↑</kbd> / <kbd>←</kbd> / <kbd>↓</kbd> | Move the cursor |
| <kbd>Home</kbd> / <kbd>End</kbd> | Jump to beginning / end of line |
| <kbd>PageUp</kbd> / <kbd>PageDown</kbd> | Page scroll |

The editor displays the filename and position in the status bar. `[+]` is shown when there are unsaved changes.

### Editor Features

The editor helps with writing Ruby.

- **Syntax highlighting** — strings, keywords, and comments are colored.
- **Auto indent** — a newline after `def` or `if` is indented for you, and typing `end` pulls the indent back.
- **Japanese input** — <kbd><kbd>Ctrl</kbd>-<kbd>J</kbd></kbd> switches to [Japanese input](../japanese-input/) for comments and strings.

## Your First Program

Let's create `hello.rb` using the editor.

```ruby
irb> edit hello.rb
```

Enter the following code, save with Ctrl-S, and quit with Ctrl-Q.

Harucom has not only a text-based console screen mode but also a graphics mode that can display graphical content.
`P5` is a [Processing](https://processing.org)-like drawing library built into Harucom.

```ruby
require "p5"

p5 = P5.new

colors = [
  p5.color(255, 0, 0),
  p5.color(0, 255, 0),
  p5.color(0, 0, 255),
]

p5.background(0)

loop do
  p5.fill(colors[rand(3)])
  p5.circle(rand(p5.width), rand(p5.height), 10)
  p5.commit
  sleep_ms 100
end
```

Return to IRB and run it.

```ruby
irb> run hello.rb
```

If lots of circles appear on the screen, it worked! Press Ctrl-C to stop execution.

If there is a problem with the program, an error will be displayed at runtime.
Open the editor again to check if the content is correct.

## Next Steps

* [Restart](../restart/)
* [File I/O](../files/)
* [Commands](../commands/)
* [Japanese Input](../japanese-input/)
* [Settings and Screen Zoom](../settings/)
* [Demo Apps](../demos/)
* [Programming Reference](../reference/)
