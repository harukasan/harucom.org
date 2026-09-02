---
layout: doc
title: Board::Pad (Button Input)
permalink: /en/docs/reference/pad/
lang: en
ref: docs-reference-pad
---

The Harucom Board carries eight tactile buttons.
`Board::Pad` reads them from Ruby, which is handy for games or for running
the board without a keyboard attached.

The buttons are split into two groups of four, each wired to one ADC pin.
The buttons in a group sit behind different resistors, so the combination of
buttons pressed changes the voltage that the ADC reads.

| Group | GPIO | Constant |
|-------|------|----------|
| Left four | GPIO 28 | `Board::PAD0_PIN` |
| Right four | GPIO 29 | `Board::PAD1_PIN` |

## Contents

- [Getting Started](#getting-started)
- [Methods](#methods)
- [Button Constants](#button-constants)
- [Multiple Presses and Calibration](#multiple-presses-and-calibration)

## Getting Started

```ruby
require "board/pad"

pad = Board::Pad.new(Board::PAD0_PIN)

loop do
  pad.read

  puts "right" if pad.right?
  puts "up"    if pad.up?
  puts "down"  if pad.down?
  puts "left"  if pad.left?

  sleep_ms 50
end
```

`read` samples the current state. After that, `right?` and friends tell you which
buttons are held.

Use one `Board::Pad` per group when you need both.

```ruby
left_pad  = Board::Pad.new(Board::PAD0_PIN)
right_pad = Board::Pad.new(Board::PAD1_PIN)
```

## Methods

### Board::Pad.new(pin, calibration:, max_buttons:)

```ruby
pad = Board::Pad.new(Board::PAD0_PIN)
```

Takes the ADC pin. `calibration` and `max_buttons` are optional
(see [Multiple Presses and Calibration](#multiple-presses-and-calibration)).

### Board::Pad#read

```ruby
pad.read
```

Samples the buttons and updates the internal state. It returns self, so calls can be chained.

```ruby
puts "up" if pad.read.up?
```

### Board::Pad#pressed?(button)

```ruby
pad.pressed?(Board::Pad::UP)   #=> true / false
```

Reports whether a button is held.

### Board::Pad#right? / #up? / #down? / #left?

```ruby
pad.up?
```

Shorthand for `pressed?`.

### Board::Pad#raw

```ruby
pad.raw   #=> 2000
```

Returns the raw ADC reading (0 to 4095). With no button held it sits near 4095.

### Board::Pad#state

```ruby
pad.state   #=> 5
```

Returns the pressed buttons as a bitmask. For example `5` means right (bit 0)
and down (bit 2) are held.

## Button Constants

| Constant | Value | Direction |
|----------|-------|-----------|
| `Board::Pad::RIGHT` | 0 | Right |
| `Board::Pad::UP` | 1 | Up |
| `Board::Pad::DOWN` | 2 | Down |
| `Board::Pad::LEFT` | 3 | Left |

## Multiple Presses and Calibration

Because four buttons share one ADC pin, the readings crowd together as more buttons
are held at once. By default two simultaneous presses are distinguished.

```ruby
pad = Board::Pad.new(Board::PAD0_PIN, max_buttons: 3)
```

`calibration` takes the raw value of each button pressed on its own,
in the order right, up, down, left. The default is `[2000, 2760, 3300, 3646]`.
If board-to-board variation throws the detection off, read the actual values with `raw`
and pass your own.

```ruby
pad = Board::Pad.new(Board::PAD0_PIN, calibration: [1980, 2740, 3290, 3640])
```

[pad_demo](../../demos/#pad_demo) shows the button state on screen.
