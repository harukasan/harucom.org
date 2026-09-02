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
- [Board::PWMAudio](#boardpwmaudio)
  - [Playing Sound](#playing-sound)
  - [Channel Settings](#channel-settings)
  - [Scheduling Sound](#scheduling-sound)
- [Channels and Sources](#channels-and-sources)
  - [PWMAudio::Tone](#pwmaudiotone)
  - [PWMAudio::Sample](#pwmaudiosample)
  - [PWMAudio::Stream](#pwmaudiostream)
  - [The Sample Bank](#the-sample-bank)
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

Drum sounds are stored as files in `/data/drums`.

```ruby
audio = Board::PWMAudio.new

kick = PWMAudio::Sample.new(File.open("/data/drums/bd.wav", "r") { |f| f.read })
ch = audio.channel(3)
ch.source = kick
ch.play
```

## Board::PWMAudio

Load it with `require "board/pwm_audio"`.
`Board::PWMAudio.new` initializes the audio output on the board's audio pins (GPIO 24 and 25).

### Playing Sound

#### Board::PWMAudio#tone(channel, frequency, waveform:, volume:)

```ruby
audio.tone(0, 440)
audio.tone(1, 880, waveform: Board::PWMAudio::SINE, volume: 10)
```

Plays a continuous tone at the given frequency in Hz on a channel (0 to 7).
`waveform` picks the oscillator and `volume` is 0 to 15 (15 by default).

#### Board::PWMAudio#beep(channel, frequency, duration_ms, waveform:, volume:)

```ruby
audio.beep(0, 440, 200)
```

Plays a tone for the given number of milliseconds and stops it. This blocks until it finishes.

#### Board::PWMAudio#stop(channel) / #stop_all

```ruby
audio.stop(0)
audio.stop_all
```

Stops a channel. The level fades over a few milliseconds, so a stop never clicks.

#### Board::PWMAudio#channel(index)

```ruby
ch = audio.channel(3)
```

Returns the `PWMAudio::Channel` object for a channel. Samples are played through it.

#### Board::PWMAudio#deinit

Stops the output and releases the hardware.

### Channel Settings

#### Board::PWMAudio#pan(channel, value)

```ruby
audio.pan(0, 0)    # left only
audio.pan(0, 8)    # center
audio.pan(0, 15)   # right only
```

Sets the stereo balance from 0 to 15.

#### Board::PWMAudio#mute(channel, flag)

```ruby
audio.mute(0, true)
```

Mutes a channel without changing its other settings.

### Scheduling Sound

For accurate timing, schedule events against the playback position.

#### Board::PWMAudio#sample_clock

```ruby
now = audio.sample_clock
```

Returns the current playback position in samples. It advances by 50,000 per second
and is the time base for the scheduling methods.

#### Board::PWMAudio#tone_at(sample, channel, frequency, waveform:, volume:) / #stop_at(sample, channel)

```ruby
now = audio.sample_clock
audio.tone_at(now + 25_000, 0, 440)          # start in 0.5 s
audio.stop_at(now + 50_000, 0)               # stop in 1 s
```

Schedules a start or a stop at an exact playback position.
The queue holds 32 events, and a full queue returns `false`.

> An event lands sample accurate when it is scheduled at least 2048 samples
> (about 41 ms) ahead. Anything closer is applied as soon as possible, which means slightly late.
{: .tip}

#### Board::PWMAudio#cancel_scheduled(channel)

Drops the events pending on a channel.
Call it before retriggering a note so that a stale scheduled stop cannot cut it.

## Channels and Sources

A channel plays one source at a time. There are three kinds.

```ruby
ch = audio.channel(0)
ch.source = PWMAudio::Tone.new(440)
ch.volume = 12
ch.play
```

`PWMAudio::Channel` has these methods.

| Method | Description |
|--------|-------------|
| `source=` | Assign the source |
| `play` / `play_at(at)` | Play now / schedule at a playback position |
| `tone(frequency, waveform:, volume:)` | Assign a waveform and play it |
| `stop` / `stop_at(at)` | Stop now / schedule a stop |
| `volume=` | Volume (0 to 15) |
| `pan=` | Stereo balance (0 to 15) |
| `mute=` | Mute the channel |
| `cancel_scheduled` | Drop pending events |

A waveform plays until it is stopped. A sample plays once and stops at its end.

### PWMAudio::Tone

```ruby
tone = PWMAudio::Tone.new(440, waveform: PWMAudio::SINE)
```

Describes an oscillator. Assign it to a channel and play it.

### PWMAudio::Sample

```ruby
data = File.open("/data/drums/sd.wav", "r") { |f| f.read }
sample = PWMAudio::Sample.new(data)
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
