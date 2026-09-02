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
  - [Driving a Channel](#driving-a-channel)
  - [Assigning a Source to a Channel](#assigning-a-source-to-a-channel)
  - [Playing an Audio Sample](#playing-an-audio-sample)
- [Playing Sound](#playing-sound)
- [Using the Channel Object](#using-the-channel-object)
- [Sources](#sources)
  - [PWMAudio::Tone](#pwmaudiotone)
  - [PWMAudio::Sample](#pwmaudiosample)
  - [PWMAudio::Stream](#pwmaudiostream)
  - [The Sample Bank](#the-sample-bank)
- [Scheduling Sound](#scheduling-sound)
- [Constants](#constants)
- [Synth](#synth)

## Getting Started

### Driving a Channel

Creating a `Board::PWMAudio` sets up the audio output.
It initializes the board's audio pins, GPIO 24 and 25.

```ruby
require "board/pwm_audio"

audio = Board::PWMAudio.new

# Play 440 Hz (A4) on channel 0
audio.tone(0, 440)
sleep 1
audio.stop(0)

audio.deinit
```

There are eight channels, numbered 0 to 7.
Each plays its own sound, and sounds played at once are mixed together.

```ruby
A = Board::PWMAudio

audio.beep(0, A::C4, 200)   # play C for 200 ms
audio.beep(0, A::E4, 200)
audio.beep(0, A::G4, 200)
```

### Assigning a Source to a Channel

`audio.channel(0)` returns the channel object, which takes a source and plays it.

```ruby
ch = audio.channel(0)
ch.source = PWMAudio::Tone.new(440, waveform: PWMAudio::SINE)
ch.volume = 12
ch.play

sleep 1
ch.stop
```

There are three kinds of source: waveforms, samples, and streams.
See [Sources](#sources) for the details.

### Playing an Audio Sample

The drum sounds live as WAV files in `/data/drums`.
Read one, wrap it in a `PWMAudio::Sample`, and a channel plays it.

```ruby
kick = PWMAudio::Sample.new(File.open("/data/drums/bd.wav", "r") { |f| f.read })

ch = audio.channel(3)
ch.source = kick
ch.play
```

A waveform plays until it is stopped, and a sample plays once and stops at its end.
Calling `play` again restarts it from the beginning.

## Playing Sound

The methods on `audio` take a channel number. Reach for these to play a sound quickly.

| Method | Description |
|--------|-------------|
| `audio.tone(channel, frequency, waveform:, volume:)` | Play a continuous tone at the given frequency in Hz |
| `audio.beep(channel, frequency, duration_ms, waveform:, volume:)` | Play for the given number of milliseconds and stop. This blocks until it finishes |
| `audio.stop(channel)` | Stop the channel |
| `audio.stop_all` | Stop every channel |
| `audio.pan(channel, value)` | Stereo balance (0 left, 8 center, 15 right) |
| `audio.mute(channel, flag)` | Mute the channel, leaving its other settings alone |
| `audio.channel(index)` | Get the channel object |
| `audio.load_sample(slot, data)` | Load a sample into the [bank](#the-sample-bank) |
| `audio.sample_clock` | The current [playback position](#scheduling-sound) in samples |
| `audio.deinit` | Stop the output and release the hardware |

`waveform` picks the oscillator and `volume` runs from 0 to 15, 15 by default.
The level fades over a few milliseconds, so a stop never clicks.

The methods that schedule sound (`tone_at`, `play_at`, `stop_at`, `cancel_scheduled`)
are covered in [Scheduling Sound](#scheduling-sound).

## Using the Channel Object

`audio.channel(index)` returns a `PWMAudio::Channel`.
Reach for it when a source is involved.
The same channel number always returns the same object.

| Method | Description |
|--------|-------------|
| `ch.source = source` | Assign a source |
| `ch.play` | Play the assigned source |
| `ch.tone(frequency, waveform:, volume:)` | Assign a waveform and play it |
| `ch.stop` | Stop the sound |
| `ch.volume = 12` | Volume (0 to 15, 15 by default) |
| `ch.pan = 8` | Stereo balance (0 left, 8 center, 15 right) |
| `ch.mute = true` | Mute the channel |
| `ch.index` | The channel number |
| `ch.source` | The source it holds |

`play` also takes `volume:` and `slot:`.
A slot is a sound loaded into the [sample bank](#the-sample-bank).

The methods that schedule sound (`play_at`, `tone_at`, `stop_at`, `cancel_scheduled`)
are covered in [Scheduling Sound](#scheduling-sound).

## Sources

There are three kinds of source. Each one is assigned to a channel and played from there.

### PWMAudio::Tone

```ruby
PWMAudio::Tone.new(440)
PWMAudio::Tone.new(440, waveform: PWMAudio::SINE)
```

Describes an oscillator. `frequency` and `waveform` read it back.

### PWMAudio::Sample

```ruby
PWMAudio::Sample.new(data)
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
It takes the same formats as `PWMAudio::Sample`.

Do not rewrite the file while it is playing. Writing moves its blocks and the sound breaks.

### The Sample Bank

Preloading short sounds lets one channel play several of them.

```ruby
audio.load_sample(0, File.open("/data/drums/hh.wav", "r") { |f| f.read })
audio.load_sample(1, File.open("/data/drums/oh.wav", "r") { |f| f.read })

ch = audio.channel(5)
ch.play(slot: 0)
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

| Operation | By channel number | Channel object |
|-----------|-------------------|----------------|
| Play a waveform | `audio.tone_at(at, channel, frequency)` | `ch.tone_at(at, frequency)` |
| Play the source | `audio.play_at(at, channel, volume, slot)` | `ch.play_at(at, volume:, slot:)` |
| Stop | `audio.stop_at(at, channel)` | `ch.stop_at(at)` |
| Drop pending events | `audio.cancel_scheduled(channel)` | `ch.cancel_scheduled` |

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
