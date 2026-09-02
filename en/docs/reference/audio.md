---
layout: doc
title: Audio
permalink: /en/docs/reference/audio/
lang: en
ref: docs-reference-audio
---

The Harucom Board has stereo PWM audio output. Plug headphones or speakers into the 3.5mm jack
and the board makes sound.

Sound is played through an 8-channel mixer. Each channel plays one source: a waveform
(sine, square, triangle, sawtooth) or a WAV or QOA sample.
The rendering runs on its own in C, so Ruby only changes parameters.

## Contents

- [Getting Started](#getting-started)
- [Working with Channels](#working-with-channels)
- [Sources](#sources)
  - [PWMAudio::Tone](#pwmaudiotone)
  - [PWMAudio::Sample](#pwmaudiosample)
  - [PWMAudio::Stream](#pwmaudiostream)
  - [The Sample Bank](#the-sample-bank)
- [Scheduling Sound](#scheduling-sound)
- [Constants](#constants)
- [Synth](#synth)

## Getting Started

Creating a `Board::PWMAudio` sets up the audio output.

```ruby
require "board/pwm_audio"

audio = Board::PWMAudio.new

# Play 440 Hz (A4) on channel 0
audio.tone(0, 440)
sleep 1
audio.stop(0)

audio.deinit
```

Note frequencies are available as constants.

```ruby
A = Board::PWMAudio

audio.beep(0, A::C4, 200)   # play C for 200 ms
audio.beep(0, A::E4, 200)
audio.beep(0, A::G4, 200)
```

Playing a WAV file takes a channel and a source, which the next two sections cover in turn.

## Working with Channels

`Board::PWMAudio.new` initializes the audio output on the board's audio pins (GPIO 24 and 25).
There are eight channels, numbered 0 to 7.

There are two ways to drive a channel: pass its number, or work with the channel object
returned by `audio.channel(0)`.

```ruby
audio.tone(0, 440)           # by number
audio.channel(0).tone(440)   # channel object
```

| Operation | By number | Channel object |
|-----------|-----------|----------------|
| Play a waveform | `audio.tone(0, 440, waveform:, volume:)` | `ch.tone(440, waveform:, volume:)` |
| Stop | `audio.stop(0)` | `ch.stop` |
| Stereo balance (0 left, 8 center, 15 right) | `audio.pan(0, 8)` | `ch.pan = 8` |
| Mute | `audio.mute(0, true)` | `ch.mute = true` |
| Volume (0 to 15, 15 by default) | — | `ch.volume = 12` |
| Assign a source | — | `ch.source = kick` |
| Play the source | — | `ch.play` |

The sources you assign to `source` are covered in [Sources](#sources).
Samples are played through the channel object.

Some methods belong to `audio` rather than to one channel.

| Method | Description |
|--------|-------------|
| `audio.beep(0, 440, 200)` | Play for the given number of milliseconds and stop. This blocks until it finishes |
| `audio.stop_all` | Stop every channel |
| `audio.deinit` | Stop the output and release the hardware |

The level fades over a few milliseconds, so a stop never clicks.
Muting leaves the channel's other settings alone.

## Sources

A channel plays one source at a time. There are three kinds.
A waveform plays until it is stopped, and a sample plays once and stops at its end.

### PWMAudio::Tone

```ruby
ch = audio.channel(0)
ch.source = PWMAudio::Tone.new(440, waveform: PWMAudio::SINE)
ch.volume = 12
ch.play
```

Describes an oscillator.

### PWMAudio::Sample

The drum sounds live as files in `/data/drums`. Read one, wrap it in a
`PWMAudio::Sample`, and a channel plays it.

```ruby
kick = PWMAudio::Sample.new(File.open("/data/drums/bd.wav", "r") { |f| f.read })

ch = audio.channel(3)
ch.source = kick
ch.play
```

Wraps 16-bit PCM WAV or QOA data, mono or stereo.
The format is detected from the header.

`samplerate`, `frames`, and `channels` read back the details.

> QOA is about one fifth the size of WAV, which helps when flash space is tight.
{: .tip}

### PWMAudio::Stream

```ruby
song = audio.channel(7)
song.source = PWMAudio::Stream.new("/data/song.qoa")
song.play
```

Plays a file straight from flash, so a track too large for RAM plays fine.

Do not rewrite the file while it is playing. Writing moves its blocks and the sound breaks.

### The Sample Bank

Preloading short sounds lets one channel play several of them.

```ruby
audio.load_sample(0, File.open("/data/drums/hh.wav", "r") { |f| f.read })
audio.load_sample(1, File.open("/data/drums/oh.wav", "r") { |f| f.read })

now = audio.sample_clock
audio.play_at(now + 5000, 5, 14, 0)   # play slot 0 on channel 5
```

Sounds sharing a channel cut each other off, which is what you want for
an open and a closed hihat.

## Scheduling Sound

For accurate timing, schedule events against the playback position.
`audio.sample_clock` returns the current position in samples.
It advances by 50,000 per second, which makes it the time base for future events.

```ruby
now = audio.sample_clock
audio.tone_at(now + 25_000, 0, 440)   # start in 0.5 s
audio.stop_at(now + 50_000, 0)        # stop in 1 s
```

| Operation | By number | Channel object |
|-----------|-----------|----------------|
| Play a waveform | `audio.tone_at(at, 0, 440)` | `ch.tone_at(at, 440)` |
| Play the source | `audio.play_at(at, 0, volume, slot)` | `ch.play_at(at)` |
| Stop | `audio.stop_at(at, 0)` | `ch.stop_at(at)` |
| Drop pending events | `audio.cancel_scheduled(0)` | `ch.cancel_scheduled` |

The queue holds 32 events, and a full queue returns `false`.
Before retriggering a note, drop the pending events so a stale scheduled stop cannot cut it.

> An event lands sample accurate when it is scheduled at least 2048 samples
> (about 41 ms) ahead. Anything closer is applied as soon as possible, which means slightly late.
{: .tip}

## Constants

| Constant | Value |
|----------|-------|
| `Board::PWMAudio::SAMPLE_RATE` | 50000 (samples per second) |
| `Board::PWMAudio::CHANNELS` | 8 (mixer channels) |
| `Board::PWMAudio::SINE` | Sine wave |
| `Board::PWMAudio::SQUARE` | Square wave (default) |
| `Board::PWMAudio::TRIANGLE` | Triangle wave |
| `Board::PWMAudio::SAWTOOTH` | Sawtooth wave |

Note frequencies from `C4` to `C6` are defined as constants (`C4`, `CS4`, `D4`, … `B5`, `C6`).
`S` stands for sharp, so `CS4` is C#4.

## Synth

`Synth` builds sound itself from Ruby code. What it returns is WAV data,
which goes straight into a `PWMAudio::Sample`.

```ruby
require "synth"

kick = PWMAudio::Sample.new(Synth.render(rate: 44100) {
  sweep(0.28, from: 160, to: 44, curve: 28, decay: 12) +
    noise(0.02, decay: 300).highpass(900) * 0.5
})

ch = audio.channel(0)
ch.source = kick
ch.play
```

These sources are available inside the block.

| Method | Sound |
|--------|-------|
| `sweep(seconds, from:, to:, curve:, decay:)` | A sine whose pitch sweeps. Kicks and toms |
| `noise(seconds, decay:)` | A white noise burst. Snares and hihats |
| `metallic(seconds, decay:, partials:)` | A metallic stack of partials. Hihats |
| `silence(seconds)` | Silence |

Each one is a `Synth::Buffer`, and these operations combine them.

| Operation | Description |
|-----------|-------------|
| `+` | Mix two buffers |
| `*` | Scale the level |
| `highpass(cutoff)` / `lowpass(cutoff)` | Keep the high / low end |
| `bandpass(center, q:)` | Keep a band |
| `env(decay, at:, cut:, level:)` | Apply an envelope |
| `normalize(peak:)` | Even out the level |
| `fade_tail(ms:)` | Fade the tail out |

### The Drum Kit

The board's drum sounds are defined this way.

```ruby
require "synth"
require "synth/drum_kit"

snare = PWMAudio::Sample.new(Synth::DrumKit.render("sd"))
```

The names are `bd` (kick), `sd` (snare), `hh` (hihat), `oh` (open hihat),
`cp` (clap), `lt` (low tom), `ht` (high tom), and `rim` (rimshot).

The same sounds are stored as WAV files in `/data/drums`, which load faster than rendering them.
