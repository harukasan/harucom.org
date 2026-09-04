---
layout: doc
title: Programming Reference
permalink: /en/docs/reference/
lang: en
ref: docs-reference
---

Reference for the Ruby API available on Harucom.

## Contents

- [Harucom API](#harucom-api)
  - [DVI Module](#dvi-module)
  - [P5 Drawing Library](#p5-drawing-library)
  - [Keyboard](#keyboard)
  - [InputMethod (Japanese Input)](#inputmethod-japanese-input)
  - [Board (Board Peripherals)](#board-board-peripherals)
    - [Board::PWMAudio (Audio)](#boardpwmaudio-audio)
    - [Board::Pad (Button Input)](#boardpad-button-input)
    - [Board::DMX (DMX Module Control)](#boarddmx-dmx-module-control)
- [PicoRuby Libraries](#picoruby-libraries)
  - [Filesystem](#filesystem)
  - [Data Formats](#data-formats)
  - [Hardware](#hardware)
  - [System](#system)
  - [Built-in Classes](#built-in-classes)
  - [Kernel](#kernel)
    - [puts](#putsargs)
    - [print](#printargs)
    - [p](#pargs)
    - [gets](#gets)
    - [getc](#getc)
    - [sleep](#sleepsec)
    - [sleep_ms](#sleep_msms)
    - [usleep](#usleepusec)
    - [require](#requirename)
    - [load](#loadpath)
    - [exit](#exitstatus--0)

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


#### [Board::Pad (Button Input)](pad/)

Reading the eight buttons on the board.

```ruby
require "board/pad"
pad = Board::Pad.new(Board::PAD0_PIN)
puts "up" if pad.read.up?
```


#### [Board::DMX (DMX Module Control)](dmx/)

Sending DMX512 to control stage lighting.

```ruby
require "board/dmx"
dmx = Board::DMX.new
dmx.start
dmx[6] = 255
```


## PicoRuby Libraries

Harucom runs on [PicoRuby](https://picoruby.org/).

These libraries are built in.
Where there is a link, the PicoRuby or [mruby](https://mruby.org/) reference behind it has
the details.

### Filesystem

| Class | Description |
|-------|-------------|
| [File](https://mruby.org/docs/api/File.html) ([PicoRuby](https://picoruby.org/File.html)) | File reading and writing |
| [File::Stat](https://picoruby.org/File_Stat.html) | File size and timestamps |
| [Dir](https://mruby.org/docs/api/Dir.html) ([PicoRuby](https://picoruby.org/Dir.html)) | Directory operations |
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
| [String](https://mruby.org/docs/api/String.html) | Strings |
| [Array](https://mruby.org/docs/api/Array.html) | Arrays |
| [Hash](https://mruby.org/docs/api/Hash.html) | Hashes |
| [Integer](https://mruby.org/docs/api/Integer.html) | Integers |
| [Float](https://mruby.org/docs/api/Float.html) | Floating-point numbers |
| [Rational](https://mruby.org/docs/api/Rational.html) | Exact fractions <span class="badge-v2">New in 2.0</span> |
| [Math](https://github.com/mruby/mruby/blob/master/mrbgems/mruby-math/README.md) | Trigonometry, square roots, logarithms |
| [Range](https://mruby.org/docs/api/Range.html) | Ranges |
| [Symbol](https://mruby.org/docs/api/Symbol.html) | Symbols |
| [Enumerable](https://mruby.org/docs/api/Enumerable.html) | `map`, `select`, and the rest of the iteration methods |
| [Comparable](https://mruby.org/docs/api/Comparable.html) | Ordering |
| [Proc](https://mruby.org/docs/api/Proc.html) | Blocks and lambdas |
| [ObjectSpace](https://mruby.org/docs/api/ObjectSpace.html) | Walking the live objects |
| [Regexp](https://picoruby.org/Regexp.html) | Regular expressions |
| [Data](https://picoruby.org/Data.html) | Building classes that hold values |

### Kernel

The Kernel module holds the common methods, and they can be called without naming a class.
The ones inherited from mruby — `tap`, `then` and the like — are in the
[mruby reference](https://mruby.org/docs/api/Kernel.html).

#### puts(*args)

```ruby
puts "hello"
```

Writes to `$stdout` and ends with a newline. On Harucom that is the screen.

#### print(*args)

Writes to `$stdout`. It does not add a newline.

#### p(*args)

Writes `inspect` of each argument, one per line. It returns the argument when given one
and the array when given several, so it can sit in the middle of an expression.

#### gets

Reads a line from `$stdin`, or returns `nil` when there is nothing to read.

#### getc

Reads a character from `$stdin`, or returns `nil` when there is nothing to read.

#### sleep(sec)

```ruby
sleep 1      # one second
sleep 0.5    # half a second
```

Waits the given number of seconds, fractions included.
Other tasks keep running while it waits, so playback does not stop.

Called with no argument, the task stays stopped until something wakes it.
A negative number raises `ArgumentError`.

#### sleep_ms(ms)

```ruby
sleep_ms 100
```

Waits the given number of milliseconds. Like `sleep`, other tasks keep running.

#### usleep(usec)

Waits the given number of microseconds.

#### require(name)

```ruby
require "p5"
```

Loads a library, searching `$LOAD_PATH` (`["/lib"]` by default), so a script in `/lib` can
be loaded by name alone. It returns `false` and does nothing when the library is already
loaded.

#### load(path)

Unlike `require`, loads the file again even if it is already loaded. Useful when trying out
edits to a library.

#### exit(status = 0)

Ends the program. It raises `SystemExit`, so calling it inside an app returns to IRB.
