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
| <kbd>PageUp</kbd> / <kbd>PageDown</kbd> | Page scroll |

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

* [File I/O](../files/)
* [Programming Reference](../reference/)
