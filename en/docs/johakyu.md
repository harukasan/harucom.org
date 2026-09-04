---
layout: doc
title: Johakyu
permalink: /en/docs/johakyu/
lang: en
ref: docs-johakyu
---

> Everything on this page is new in Harucom OS 2.0.
{: .note}

Johakyu is a live coding environment that drives sound and light from patterns.
You perform by writing a DSL, in the manner of [TidalCycles](https://tidalcycles.org/) and
[Strudel](https://strudel.cc/).

Edit the script and press <kbd><kbd>Ctrl</kbd>-<kbd>Enter</kbd></kbd>: the new pattern takes
over at the start of the next cycle, without the sound stopping.

It is not only a drum machine — connect the DMX module and it drives lighting as well.

## Contents

- [Starting Johakyu](#starting-johakyu)
- [Key Bindings](#key-bindings)
- [Writing Patterns](#writing-patterns)
  - [Tracks](#tracks)
  - [Mini Notation](#mini-notation)
  - [Playing Drums](#playing-drums)
  - [Playing Notes](#playing-notes)
  - [Transforming Patterns](#transforming-patterns)
  - [Signals](#signals)
- [Driving Lights](#driving-lights)
  - [Patching Fixtures](#patching-fixtures)
  - [Light Parameters](#light-parameters)
- [Using It from a Program](#using-it-from-a-program)

## Starting Johakyu

```ruby
irb> johakyu
irb> johakyu /data/myshow.rb
```

Without a file name it opens an untitled buffer.
If `/data/johakyu/starter.rb` exists, it is loaded as a starting point.

Plug headphones or speakers into the 3.5mm jack to hear the sound.
For lights, wire up the [DMX module](../reference/dmx/) first.

## Key Bindings

| Key | Action |
|-----|--------|
| <kbd><kbd>Ctrl</kbd>-<kbd>Enter</kbd></kbd> | Evaluate the buffer (it applies at the next cycle boundary) |
| <kbd><kbd>Ctrl</kbd>-<kbd>S</kbd></kbd> | Save and evaluate (you are asked for a path when untitled) |
| <kbd><kbd>Ctrl</kbd>-<kbd>O</kbd></kbd> | Open a file |
| <kbd><kbd>Alt</kbd>-<kbd>1</kbd></kbd> – <kbd><kbd>Alt</kbd>-<kbd>0</kbd></kbd> | Switch scenes (ten buffers to move between) |
| <kbd><kbd>Ctrl</kbd>-<kbd>B</kbd></kbd> | Blackout |
| <kbd><kbd>Ctrl</kbd>-<kbd>Z</kbd></kbd> / <kbd><kbd>Ctrl</kbd>-<kbd>Y</kbd></kbd> | Undo / Redo |
| <kbd><kbd>Ctrl</kbd>-<kbd>Q</kbd></kbd> | Blackout and quit |

The editor behaves like the `edit` command, with syntax highlighting, auto indent,
and [Japanese input](../japanese-input/).

> A mistake in your code does not stop the show.
> When an evaluation raises, it is discarded and the previous patterns keep playing.
{: .tip}

## Writing Patterns

The repeating unit of time is called a cycle. The tempo is set with `tempo`.

```ruby
tempo 120

track(:drums) { sound("bd ~ sd ~") }
```

This plays kick, rest, snare, rest, spread evenly across one cycle.

### Tracks

`track(:name) { ... }` names a pattern. Tracks are replaced independently,
so editing one track leaves the others untouched.

```ruby
track(:drums) { sound("bd*4") }
track(:hats)  { sound("hh*8") }
```

`_track` mutes a track without removing it.

```ruby
_track(:hats) { sound("hh*8") }
```

Each evaluation describes the whole state. A track that is no longer in the buffer is removed,
so evaluating an empty buffer silences everything.

### Mini Notation

Patterns are written as strings, in what is called mini notation.

| Syntax | Meaning |
|--------|---------|
| `bd ~ sd ~` | A sequence (`~` and `-` are rests) |
| `bd*2` | Play twice within the step |
| `bd!3` | Repeat across three steps |
| `bd/2` | Play once every two cycles |
| `[bd hh]` | Group into one step |
| `<a b c>` | One item per cycle |
| `bd, hh*4` | Stack in parallel |
| `[c5,e5,g5]` | Stack inside one step (a chord) |
| `bd:2` | Sample number |
| `_` | Hold the previous event |

```ruby
track(:drums) { sound("bd*2 [~ sd] bd sd, hh*8") }
```

### Playing Drums

`sound` takes the name of a drum.

| Name | Sound |
|------|-------|
| `bd` | Kick |
| `sd` | Snare |
| `hh` | Hihat |
| `oh` | Open hihat |
| `cp` | Clap |
| `lt` | Low tom |
| `ht` | High tom |
| `rim` | Rimshot |

The WAV files in `/data/drums` are used. When a file is missing,
[Synth](../reference/audio/#synth) renders the same sound on the board.

### Playing Notes

`note` plays pitched tones.

```ruby
track(:lead) { note("c5 e5 [c5,e5,g5] ~").sound("saw").gain(0.6) }
```

`c5` is middle C (262 Hz). Sharps are `c#5` or `cs5` and flats are `eb5`.
Without an octave number, octave 5 is assumed.

`.sound` picks the waveform (`sine`, `square`, `tri`, `saw`) and `.gain` sets the level (0 to 1).
Three notes can sound at once.

### Transforming Patterns

Patterns are transformed by chaining methods.

| Method | Effect |
|--------|--------|
| `fast(n)` / `slow(n)` | Speed up / slow down |
| `rev` | Reverse |
| `every(n) { ... }` | Transform once every n cycles |
| `euclid(pulses, steps)` | Euclidean rhythm |
| `degrade_by(amount)` | Drop events at random |
| `segment(n)` | Cut a continuous value into n steps |
| `range(min, max)` | Rescale the values |
| `add` / `sub` / `mul` / `div` | Arithmetic on the values |

```ruby
track(:drums) { sound("bd*4").every(4) { |p| p.fast(2) } }
```

### Signals

`sine`, `cosine`, `saw`, `isaw`, `tri`, and `square_signal` are values that change
continuously over time. They suit levels and light movement.

```ruby
track(:wash) { dmx(:s1).dimmer(sine.slow(4)) }
```

`range` rescales them and `slow` stretches them out.

## Driving Lights

### Patching Fixtures

Register the fixtures you use with `fixture`. The definitions are
[Open Fixture Library](https://open-fixture-library.org/) JSON files in `/data/dmx/fixtures`.

```ruby
fixture :s1, "shehds_80w_led_spot_light", mode: "13ch", address: 1
fixture :s2, "shehds_80w_led_spot_light", mode: "13ch", address: 14
group :all, :s1, :s2
```

`group` collects fixtures so they can be driven together.
Put the fixture lines at the top of the script.
A script without them keeps the rig that is already patched.

### Light Parameters

Chain parameters onto `dmx(:name)`. Values run from 0.0 to 1.0.

```ruby
track(:s1) { dmx(:s1).dimmer("0 1 1 1").color("<red blue green>") }
track(:move) { dmx(:all).pan(sine.range(0.3, 0.7).slow(8)) }
```

| Parameter | Meaning |
|-----------|---------|
| `dimmer` | Brightness |
| `color` | Color |
| `pan` / `tilt` | Direction |
| `strobe` | Strobe |
| `gobo` | Gobo |
| `focus` | Focus |
| `prism` | Prism |
| `speed` | Movement speed |

Which parameters work depends on the fixture. Only those in its definition are available.

Names such as colors come from the definition too, so `color(:red)` works.
To write a raw value, use `raw`.

```ruby
dmx(:s1).raw(:pan, 200)
```

Chaining a light control onto a sound pattern makes the light ride the beat.

```ruby
track(:drums) { sound("bd*4").color("<red blue>") }
```

`spread` offsets the values across the members of a group.

```ruby
track(:chase) { dimmer("1 0").spread(0.5, on: :all) }
```

## Using It from a Program

Patterns can be played from your own program, without the `johakyu` app.

```ruby
require "board/pwm_audio"
require "johakyu/dsl"

session = Johakyu::Session.new(audio: Board::PWMAudio.new, bpm: 120)
session.load_kit
session.bind_statement(:drums, Johakyu.sound("bd*4 , hh*8"))

loop do
  session.update
  sleep_ms 10
end
```

Call `session.update` on every iteration, without fail. That is where sounds are reserved and
light values are written. When lights are involved, call `DMX.keepalive` as well.
