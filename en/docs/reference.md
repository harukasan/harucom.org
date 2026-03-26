---
layout: doc
title: Programming Reference
permalink: /en/docs/reference/
lang: en
ref: docs-reference
---

Reference for the Ruby API available on Harucom.

## Harucom API

Harucom comes with libraries for screen drawing and keyboard input.

### [DVI Module](dvi/)

A low-level API for controlling DVI output and drawing on screen.
It has two display modes: text mode (106 columns x 37 rows) and graphics mode (640x480 / 320x240).

```ruby
DVI.set_mode(DVI::GRAPHICS_MODE)
DVI::Graphics.fill_circle(160, 120, 50, 0xE0)
DVI::Graphics.commit
```

For complex screen drawing, the [P5 Drawing Library](p5/) provides a convenient wrapper.


### [P5 Drawing Library](p5/)

A drawing library that provides a Processing-like interface.
It wraps DVI::Graphics and offers an easy-to-use API for fill and stroke colors, coordinate transforms, blend modes, and more.

```ruby
require "p5"
p5 = P5.new
p5.fill(p5.color(255, 0, 0))
p5.circle(160, 120, 50)
p5.commit
```


### [Keyboard](keyboard/)

An API for handling input from a USB keyboard.
You can get key input through the global variable `$keyboard`.

```ruby
key = $keyboard.read_char
case key
when Keyboard::CTRL_Q then break
when Keyboard::ENTER  then puts "Enter"
end
```

## PicoRuby Libraries

Harucom runs on [PicoRuby](https://picoruby.org/).

The following PicoRuby libraries are available.
For detailed usage, refer to the PicoRuby reference at each link.

### Filesystem

| Class | Description |
|-------|-------------|
| [File](https://picoruby.org/File.html) | File reading and writing |
| [Dir](https://picoruby.org/Dir.html) | Directory operations |

```ruby
File.open("/data.txt", "r") { |f| f.read(256) }
File.open("/data.txt", "w") { |f| f.write("hello") }
Dir.mkdir("/mydir")
```

### Data Formats

| Class | Description |
|-------|-------------|
| [JSON](https://picoruby.org/JSON.html) | JSON reading and writing |
| [YAML](https://picoruby.org/YAML.html) | YAML reading and writing |
| [Marshal](https://picoruby.org/Marshal.html) | Ruby object serialization |
| [Base64](https://picoruby.org/Base64.html) | Base64 encoding and decoding |
| [Base16](https://picoruby.org/Base16.html) | Hex string conversion |

### Hardware & System

| Class | Description |
|-------|-------------|
| [GPIO](https://picoruby.org/GPIO.html) | GPIO pin control |
| [Time](https://picoruby.org/Time.html) | Time retrieval and manipulation |
| [Watchdog](https://picoruby.org/Watchdog.html) | Watchdog timer |
| [Math](https://picoruby.org/Math.html) | Math functions |

### Built-in Classes

| Class | Description |
|-------|-------------|
| [String](https://picoruby.org/String.html) | Strings |
| [Array](https://picoruby.org/Array.html) | Arrays |
| [Hash](https://picoruby.org/Hash.html) | Hashes |
| [Integer](https://picoruby.org/Integer.html) | Integers |
| [Float](https://picoruby.org/Float.html) | Floating-point numbers |
| [Kernel](https://picoruby.org/Kernel.html) | Basic methods like `puts`, `sleep` |

### require

```ruby
require "p5"   # Searches $LOAD_PATH (default: ["/lib"])
```
