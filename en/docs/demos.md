---
layout: doc
title: Demo Apps
permalink: /en/docs/demos/
lang: en
ref: docs-demos
---

Harucom ships with a few demo apps for trying out its features.
Type the name of an app at the IRB prompt to run it.

```ruby
irb> p5_demo
```

Every demo is a Ruby script in `/app`. You can read the source with `cat`,
which makes them a good starting point for your own programs.

```ruby
irb> cat /app/p5_demo.rb
```

## Contents

- [Graphics](#graphics)
- [Sound](#sound)
- [Buttons](#buttons)
- [Lighting](#lighting)

## Graphics

### p5_demo

Walks through the [P5 drawing library](../reference/p5/) step by step:
background, fill, stroke, shapes, text, and coordinate transforms.

Press any key to move to the next step. <kbd>Esc</kbd> or <kbd><kbd>Ctrl</kbd>-<kbd>C</kbd></kbd> quits.

### p5_game_demo

A small game built from P5 graphics and keyboard input.
Move with the arrow keys and collect stars to score points.

| Key | Action |
|-----|--------|
| <kbd>→</kbd> / <kbd>↑</kbd> / <kbd>←</kbd> / <kbd>↓</kbd> | Move |
| <kbd>Esc</kbd> or <kbd><kbd>Ctrl</kbd>-<kbd>C</kbd></kbd> | Quit |

### text_demo

Displays Japanese text in text mode: hiragana, katakana, kanji, colored text, bold text,
and scrolling, one step at a time.

Press any key to move to the next step.

## Sound

### audio_demo

Turns the USB keyboard into an instrument. The screen mirrors the keyboard layout and
lights up the keys you hold. The upper rows are the piano keys and the bottom row is the drum pads.

| Keys | Sound |
|------|-------|
| <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> <kbd>F</kbd> <kbd>G</kbd> <kbd>H</kbd> <kbd>J</kbd> <kbd>K</kbd> <kbd>L</kbd> <kbd>;</kbd> | White keys |
| <kbd>W</kbd> <kbd>E</kbd> <kbd>T</kbd> <kbd>Y</kbd> <kbd>U</kbd> <kbd>O</kbd> <kbd>P</kbd> | Black keys |
| <kbd>Z</kbd> <kbd>X</kbd> <kbd>C</kbd> <kbd>V</kbd> <kbd>B</kbd> <kbd>N</kbd> <kbd>M</kbd> <kbd>,</kbd> | Drums (kick, snare, hihat, and so on) |

Up to three note keys sound at once, so you can play chords.

| Key | Action |
|-----|--------|
| <kbd>1</kbd> – <kbd>4</kbd> | Change the waveform (sine, square, triangle, sawtooth) |
| <kbd>↑</kbd> / <kbd>↓</kbd> | Octave up / down |
| <kbd>←</kbd> / <kbd>→</kbd> | Transpose |
| <kbd>Esc</kbd> | Quit |

See [Audio](../reference/audio/) for how to make sound from your own programs.

## Buttons

### pad_demo

Shows the state of the eight buttons on the Harucom Board.
A pressed button lights up in red, and the raw ADC value is displayed alongside.

<kbd>Esc</kbd> or <kbd><kbd>Ctrl</kbd>-<kbd>C</kbd></kbd> quits.

See [Board::Pad](../reference/pad/) for reading the buttons from a program.

## Lighting

These demos need a DMX fixture connected. See the [DMX module](../reference/dmx/) for wiring.

### dmx_demo
{: .since-v2}

A lighting desk that drives DMX channels through a bank of faders.
Fixture definitions placed in `/data/dmx/fixtures` give the faders names.

| Key | Action |
|-----|--------|
| <kbd>←</kbd> / <kbd>→</kbd> | Select a fader |
| <kbd>↑</kbd> / <kbd>↓</kbd> | Raise / lower the value (hold Shift for steps of 1) |
| <kbd>PageUp</kbd> / <kbd>PageDown</kbd> | Change the value by 16 |
| <kbd>Home</kbd> / <kbd>End</kbd> | Maximum / minimum |
| <kbd>a</kbd> | Change the base address |
| <kbd>c</kbd> | Change the channel of the selected fader |
| <kbd>r</kbd> | Change the value range |
| <kbd><kbd>Ctrl</kbd>-<kbd>O</kbd></kbd> | Load a fixture definition |
| <kbd>b</kbd> | Blackout |
| <kbd>q</kbd> / <kbd>Esc</kbd> / <kbd><kbd>Ctrl</kbd>-<kbd>C</kbd></kbd> | Blackout and quit |

### johakyu_demo
{: .since-v2}

A demo of [Johakyu](../johakyu/), which drives sound and light from one pattern.
Five presets are provided, and switching between them lands at the start of the next cycle.

| Key | Action |
|-----|--------|
| <kbd>1</kbd> – <kbd>5</kbd> | Switch presets |
| <kbd>-</kbd> / <kbd>=</kbd> | Tempo down / up |
| <kbd>[</kbd> / <kbd>]</kbd> | Trim the timing between sound and light |
| <kbd>q</kbd> / <kbd>Esc</kbd> | Quit |
