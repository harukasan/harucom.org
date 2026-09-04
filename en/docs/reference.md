---
layout: doc
title: Programming Reference
permalink: /en/docs/reference/
lang: en
ref: docs-reference
---

Reference for the Ruby API available on Harucom.

## Harucom API

Harucom comes with libraries for screen drawing, keyboard input, Japanese input, and the
peripherals on the board.

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

### [InputMethod (Japanese Input)](input-method/)

An API for using Japanese input from your own program.
Pass keys through the global variable `$ime` and take the committed text back out.

```ruby
text += $ime.take_committed if $ime.process(key) == :commit
```


### Board (Board Peripherals)

The peripherals on the Harucom Board live under the `Board` module.
Load the one you need with `require`.

#### [Board::PWMAudio (Audio)](audio/)

Playing sound through PWM audio, and building sounds with Synth.
An 8-channel mixer plays waveforms and WAV or QOA samples.

```ruby
require "board/pwm_audio"
audio = Board::PWMAudio.new
audio.beep(0, Board::PWMAudio::A4, 200)
```


#### [Board::DMX (DMX Module Control)](dmx/)

Sending DMX512 to control stage lighting.

```ruby
require "board/dmx"
dmx = Board::DMX.new
dmx.start
dmx[6] = 255
```


#### [Board::Pad (Button Input)](pad/)

Reading the eight buttons on the board.

```ruby
require "board/pad"
pad = Board::Pad.new(Board::PAD0_PIN)
puts "up" if pad.read.up?
```


## PicoRuby Libraries

Harucom runs on [PicoRuby](https://picoruby.org/).

These libraries are built in.
Where there is a link, the PicoRuby or [mruby](https://mruby.org/) reference behind it has
the details.

### Filesystem

| Class | Description |
|-------|-------------|
| [File](https://picoruby.org/File.html) | File reading and writing |
| [File::Stat](https://picoruby.org/File_Stat.html) | File size and timestamps |
| [Dir](https://picoruby.org/Dir.html) | Directory operations |
| [VFS](https://picoruby.org/VFS.html) | Mounting filesystems |
| [Littlefs](https://picoruby.org/Littlefs.html) | The flash filesystem |

```ruby
File.open("/data.txt", "r") { |f| f.read(256) }
File.open("/data.txt", "w") { |f| f.write("hello") }
Dir.mkdir("/mydir")
```

For where files belong, see [File I/O](../files/).

### Data Formats

| Class | Description |
|-------|-------------|
| [JSON](https://picoruby.org/JSON.html) | JSON reading and writing |
| [YAML](https://picoruby.org/YAML.html) | YAML reading and writing |
| [Marshal](https://picoruby.org/Marshal.html) | Ruby object serialization |
| [Base64](https://picoruby.org/Base64.html) | Base64 encoding and decoding |
| [Base16](https://picoruby.org/Base16.html) | Hex string conversion |

### Hardware

| Class | Description |
|-------|-------------|
| [GPIO](https://picoruby.org/GPIO.html) | GPIO pin control |
| [ADC](https://picoruby.org/ADC.html) | Reading analog input |
| [UART](https://picoruby.org/UART.html) | Serial communication <span class="badge-v2">New in 2.0</span> |
| [PWM](https://picoruby.org/PWM.html) | PWM output <span class="badge-v2">New in 2.0</span> |
| [Watchdog](https://picoruby.org/Watchdog.html) | Watchdog timer |

For what each pin is wired to, see [Harucom Board](../harucom-board/#gpio-map).

### System

| Class | Description |
|-------|-------------|
| [Machine](https://picoruby.org/Machine.html) | Uptime, sleep, reboot, and the board's unique ID |
| [Time](https://picoruby.org/Time.html) | Time retrieval and manipulation |
| [Task](https://picoruby.org/Task.html) | Creating and controlling tasks |
| [Sandbox](https://picoruby.org/Sandbox.html) | Running Ruby code in a task of its own |
| [PicoRubyVM](https://picoruby.org/PicoRubyVM.html) | Inspecting memory use |
| [RNG](https://picoruby.org/RNG.html) | Random numbers |
| [ENV](https://picoruby.org/ENVClass.html) | Environment variables (holding the [settings](../settings/)) |
| [Logger](https://picoruby.org/Logger.html) | Logging |
| [Editor](https://picoruby.org/Editor.html) | Text buffers, and display widths that count full-width characters |

### Built-in Classes

| Class | Description |
|-------|-------------|
| [String](https://picoruby.org/String.html) | Strings |
| [Regexp](https://picoruby.org/Regexp.html) | Regular expressions |
| [Kernel](https://picoruby.org/Kernel.html) | Basic methods like `puts`, `sleep` |
| [Proc](https://picoruby.org/Proc.html) | Blocks and lambdas |
| [Data](https://picoruby.org/Data.html) | Building classes that hold values |
| [Array](https://mruby.org/docs/api/Array.html) | Arrays |
| [Hash](https://mruby.org/docs/api/Hash.html) | Hashes |
| [Integer](https://mruby.org/docs/api/Integer.html) | Integers |
| [Float](https://mruby.org/docs/api/Float.html) | Floating-point numbers |
| [Range](https://mruby.org/docs/api/Range.html) | Ranges |
| [Symbol](https://mruby.org/docs/api/Symbol.html) | Symbols |
| [Enumerable](https://mruby.org/docs/api/Enumerable.html) | `map`, `select`, and the rest of the iteration methods |
| [Comparable](https://mruby.org/docs/api/Comparable.html) | Ordering |
| [ObjectSpace](https://mruby.org/docs/api/ObjectSpace.html) | Walking the live objects |
| [Rational](https://mruby.org/docs/api/Rational.html) | Exact fractions <span class="badge-v2">New in 2.0</span> |
| [Math](https://github.com/mruby/mruby/blob/master/mrbgems/mruby-math/README.md) | Trigonometry, square roots, logarithms |

### require

```ruby
require "p5"   # Searches $LOAD_PATH (default: ["/lib"])
```
