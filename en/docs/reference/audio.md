---
layout: doc
title: Board::PWMAudio (Audio)
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
  - [Board::PWMAudio#tone](#boardpwmaudiotonechannel-frequency-waveform-volume)
  - [Board::PWMAudio#beep](#boardpwmaudiobeepchannel-frequency-duration_ms-waveform-volume)
  - [Board::PWMAudio#stop](#boardpwmaudiostopchannel)
  - [Board::PWMAudio#stop_all](#boardpwmaudiostop_all)
  - [Board::PWMAudio#pan](#boardpwmaudiopanchannel-value)
  - [Board::PWMAudio#mute](#boardpwmaudiomutechannel-flag)
  - [Board::PWMAudio#channel](#boardpwmaudiochannelindex)
  - [Board::PWMAudio#load_sample](#boardpwmaudioload_sampleslot-data)
  - [Board::PWMAudio#sample_clock](#boardpwmaudiosample_clock)
  - [Board::PWMAudio#tone_at](#boardpwmaudiotone_atat-channel-frequency-waveform-volume)
  - [Board::PWMAudio#play_at](#boardpwmaudioplay_atat-channel-volume-slot)
  - [Board::PWMAudio#stop_at](#boardpwmaudiostop_atat-channel)
  - [Board::PWMAudio#cancel_scheduled](#boardpwmaudiocancel_scheduledchannel)
  - [Board::PWMAudio#deinit](#boardpwmaudiodeinit)
- [Using the Channel Object](#using-the-channel-object)
  - [PWMAudio::Channel#source=](#pwmaudiochannelsourcesource)
  - [PWMAudio::Channel#source](#pwmaudiochannelsource)
  - [PWMAudio::Channel#play](#pwmaudiochannelplayvolume-slot)
  - [PWMAudio::Channel#play_at](#pwmaudiochannelplay_atat-volume-slot)
  - [PWMAudio::Channel#tone](#pwmaudiochanneltonefrequency-waveform-volume)
  - [PWMAudio::Channel#tone_at](#pwmaudiochanneltone_atat-frequency-waveform-volume)
  - [PWMAudio::Channel#stop](#pwmaudiochannelstop)
  - [PWMAudio::Channel#stop_at](#pwmaudiochannelstop_atat)
  - [PWMAudio::Channel#volume=](#pwmaudiochannelvolumevalue)
  - [PWMAudio::Channel#pan=](#pwmaudiochannelpanvalue)
  - [PWMAudio::Channel#mute=](#pwmaudiochannelmuteflag)
  - [PWMAudio::Channel#cancel_scheduled](#pwmaudiochannelcancel_scheduled)
  - [PWMAudio::Channel#index](#pwmaudiochannelindex)
- [Sources](#sources)
  - [PWMAudio::Tone](#pwmaudiotone)
  - [PWMAudio::Sample](#pwmaudiosample)
  - [PWMAudio::Stream](#pwmaudiostream)
  - [The Sample Bank](#the-sample-bank)
- [Scheduling Sound](#scheduling-sound)
- [Constants](#constants)
- [Synth](#synth)
  - [Synth.render](#synthrenderrate-seed)
  - [Making Waveforms](#making-waveforms)
  - [Building the Sound](#building-the-sound)
  - [The Drum Kit](#the-drum-kit)

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
{: .since-v2}

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
{: .since-v2}

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

The methods on `Board::PWMAudio` take a channel number. Reach for these to play a sound quickly.

### Board::PWMAudio#tone(channel, frequency, waveform:, volume:)

```ruby
audio.tone(0, 440)
audio.tone(1, 880, waveform: Board::PWMAudio::SINE, volume: 10)
```

Plays a waveform at the given frequency in Hz on a channel (0 to 7). It keeps
playing until it is stopped.

`waveform` takes one of the waveform [constants](#constants):
`SINE`, `SQUARE`, `TRIANGLE`, or `SAWTOOTH`. It defaults to `SQUARE`.

`volume` is an integer from 0 (silent) to 15 (loudest). It defaults to 15.

### Board::PWMAudio#beep(channel, frequency, duration_ms, waveform:, volume:)

```ruby
audio.beep(0, 440, 200)
```

Plays a tone for `duration_ms` milliseconds and stops it.
Execution waits until the sound has finished.

### Board::PWMAudio#stop(channel)

```ruby
audio.stop(0)
```

Stops the channel, whichever source it plays.
The level fades over a few milliseconds, so a stop never clicks.

### Board::PWMAudio#stop_all

Stops every channel.

### Board::PWMAudio#pan(channel, value)

```ruby
audio.pan(0, 0)    # left only
audio.pan(0, 8)    # center
audio.pan(0, 15)   # right only
```

Sets the stereo balance as an integer from 0 to 15: 0 is left, 8 is center, 15 is right.
For a stereo sample it works by attenuating the opposite side.

### Board::PWMAudio#mute(channel, flag)

```ruby
audio.mute(0, true)    # mute
audio.mute(0, false)   # unmute
```

Mutes the channel. Its frequency, source, and other settings stay as they are,
so unmuting picks up where it was. The change fades over a few milliseconds.

### Board::PWMAudio#channel(index)
{: .since-v2}

```ruby
ch = audio.channel(3)
```

Returns the [PWMAudio::Channel](#using-the-channel-object) for a channel number (0 to 7).
The same number always returns the same object.

> Avoid driving one channel both by number and through its channel object.
> The same engine is behind both, so whichever call comes last wins.
{: .tip}

### Board::PWMAudio#load_sample(slot, data)
{: .since-v2}

```ruby
audio.load_sample(0, File.open("/data/drums/hh.wav", "r") { |f| f.read })
```

Loads a sample into a slot of the [bank](#the-sample-bank).
`slot` runs from 0 to 15 and `data` is WAV or QOA data.
A slot outside that range, or data that is neither format, raises `ArgumentError`.
Do not reload a slot while the sound in it is still playing.

### Board::PWMAudio#sample_clock
{: .since-v2}

```ruby
now = audio.sample_clock
```

Returns the current playback position in samples.
It counts up from the moment the audio started, by 50,000 per second,
and is the time base for [scheduling sound](#scheduling-sound).

### Board::PWMAudio#tone_at(at, channel, frequency, waveform:, volume:)
{: .since-v2}

```ruby
audio.tone_at(audio.sample_clock + 25_000, 0, 440)   # start in 0.5 s
```

Schedules a waveform to start at playback position `at`.
`waveform` and `volume` work as they do in `tone`.
Returns `true` when the event was queued and `false` when the queue is full.

### Board::PWMAudio#play_at(at, channel, volume, slot)
{: .since-v2}

Schedules the source to play at playback position `at`.
Passing `slot` plays a sound from the [bank](#the-sample-bank)
instead of the source assigned to the channel.
Like `tone_at`, it reports whether the event was queued.

### Board::PWMAudio#stop_at(at, channel)
{: .since-v2}

Schedules the channel to stop at playback position `at`.
Like `tone_at`, it reports whether the event was queued.

### Board::PWMAudio#cancel_scheduled(channel)
{: .since-v2}

Drops the events still pending on the channel.
Call it before retriggering a note so a stale scheduled stop cannot cut it.

### Board::PWMAudio#deinit

Stops the audio output and releases the hardware.

## Using the Channel Object
{: .since-v2}

`Board::PWMAudio#channel(index)` returns a `PWMAudio::Channel`.
Reach for it when a source is involved.

Apart from not taking a channel number, methods that share a name behave
exactly as the ones under [Playing Sound](#playing-sound).

### PWMAudio::Channel#source=(source)

```ruby
ch.source = kick
```

Assigns a [source](#sources) to the channel. Nothing plays yet.
A sample or a stream reaches the engine right away, a waveform when it is played.

### PWMAudio::Channel#source

Returns the assigned source, or `nil` when there is none.

### PWMAudio::Channel#play(volume:, slot:)

```ruby
ch.play
ch.play(volume: 10)
ch.play(slot: 0)
```

Plays the assigned source.
A waveform keeps playing until it is stopped, and a sample or a stream plays
from the start and stops at its end.
Calling it again while a sound plays restarts it from the beginning.

Without `volume`, the channel's own `volume` is used.
Passing `slot` plays a sound from the [bank](#the-sample-bank)
instead of the assigned source.

### PWMAudio::Channel#play_at(at, volume:, slot:)

Schedules the source to play at playback position `at`.

### PWMAudio::Channel#tone(frequency, waveform:, volume:)

```ruby
ch.tone(440)
```

Assigns a waveform and plays it right away.

### PWMAudio::Channel#tone_at(at, frequency, waveform:, volume:)

Schedules a waveform to start at playback position `at`.

### PWMAudio::Channel#stop

Stops the sound.

### PWMAudio::Channel#stop_at(at)

Schedules the channel to stop at playback position `at`.

### PWMAudio::Channel#volume=(value)

```ruby
ch.volume = 12
```

Sets the volume as an integer from 0 to 15. It defaults to 15.
This is the level `play` uses when it is not given one.

### PWMAudio::Channel#pan=(value)

```ruby
ch.pan = 8
```

Sets the stereo balance as an integer from 0 to 15: 0 is left, 8 is center, 15 is right.

### PWMAudio::Channel#mute=(flag)

```ruby
ch.mute = true
```

Mutes the channel. Its settings stay as they are.

### PWMAudio::Channel#cancel_scheduled

Drops the events still pending on this channel.

### PWMAudio::Channel#index

Returns the channel number.

## Sources
{: .since-v2}

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
{: .since-v2}

When the timing has to be exact, on the beat for instance, schedule against the
playback position instead of waiting with `sleep`.

```ruby
now = audio.sample_clock
audio.tone_at(now + 25_000, 0, 440)   # start in 0.5 s
audio.stop_at(now + 50_000, 0)        # stop in 1 s
```

`sample_clock` is the time base, a sample count that grows by 50,000 per second.
Add to it to get the position you want the sound at.

Four methods take a position. The channel object has the same four.

- [`tone_at`](#boardpwmaudiotone_atat-channel-frequency-waveform-volume) — play a waveform
- [`play_at`](#boardpwmaudioplay_atat-channel-volume-slot) — play the source
- [`stop_at`](#boardpwmaudiostop_atat-channel) — stop
- [`cancel_scheduled`](#boardpwmaudiocancel_scheduledchannel) — drop pending events

The queue holds 32 events, and a full queue returns `false`.

> An event lands sample accurate when it is scheduled at least 2048 samples
> (about 41 ms) ahead. Anything closer is applied as soon as possible, which means slightly late.
{: .tip}

## Constants

| Constant | Value |
|----------|-------|
| `Board::PWMAudio::SAMPLE_RATE` <span class="badge-v2">New in 2.0</span> | 50000 (samples per second) |
| `Board::PWMAudio::CHANNELS` <span class="badge-v2">New in 2.0</span> | 8 (mixer channels) |
| `Board::PWMAudio::NUM_BANKS` <span class="badge-v2">New in 2.0</span> | 16 (sample bank slots) |
| `Board::PWMAudio::SINE` | Sine wave |
| `Board::PWMAudio::SQUARE` | Square wave (default) |
| `Board::PWMAudio::TRIANGLE` | Triangle wave |
| `Board::PWMAudio::SAWTOOTH` | Sawtooth wave |

Note frequencies from `C4` to `C6` are defined as constants (`C4`, `CS4`, `D4`, … `B5`, `C6`).
`S` stands for sharp, so `CS4` is C#4.

## Synth
{: .since-v2}

`Synth` builds sound itself from Ruby code.
Combine sine waves and noise, carve them with filters, and you get short sounds like drums.
What it returns is WAV data, which goes straight into a `PWMAudio::Sample`.

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

Here a sine falling from 160 Hz to 44 Hz, the body of the kick, is mixed with a short
burst of noise with the low end taken off, which is the attack of the beater.

Making a sound takes two steps. First [make a waveform](#making-waveforms) out of a sine
or some noise, then [build the sound](#building-the-sound) by carving and layering it.
`Synth.render` turns the result into WAV.

### Synth.render(rate:, seed:)

```ruby
data = Synth.render(rate: 44100) { noise(0.1, decay: 30) }
```

Renders the block and returns WAV data (16-bit mono).
The block has to return the [built-up sound](#building-the-sound), a `Synth::Buffer`.
Anything else raises `ArgumentError`.

`rate` is the sample rate (samples per second), 44100 when omitted.
Harucom outputs at 50,000, but the engine resamples on playback, so any rate works.
`rate: 50000` plays back with no conversion at all.

`seed` is the seed for the noise. The same seed always renders the same sound,
so one you like can be reproduced exactly.
Pass `seed: RNG.random_int` for a different noise take every time.

Before returning, [`normalize`](#synthbuffernormalizepeak) evens out the level and
[`fade_tail`](#synthbufferfade_tailms) fades the end out. Both are applied for you.

> The waveform math itself runs in C, but a single drum still takes tens of milliseconds.
> Render your sounds at startup rather than right before playing them.
{: .tip}

### Making Waveforms

These methods are available inside the block.
Each makes a waveform, a `Synth::Buffer`, for you to carve and layer.

#### sweep(seconds, from:, to:, curve:, decay:)

```ruby
sweep(0.28, from: 160, to: 44, curve: 28, decay: 12)   # kick
sweep(0.05, from: 1700, decay: 90)                     # rimshot
```

Makes `seconds` of a sine wave whose pitch falls.
Use it for sounds that drop in pitch the moment they are struck, like kicks and toms.

`from` is the starting frequency in Hz and `to` the ending one.
Omit `to` and the pitch stays at `from`.

`curve` is how fast the pitch falls, the larger the sooner it reaches `to`. It is 0 (no fall) when omitted.
`decay` is how fast the level decays. The larger it is, the shorter the sound.

#### noise(seconds, decay:)

```ruby
noise(0.22, decay: 14)
```

Makes `seconds` of white noise, the raw material for snares, hihats, and claps.
`decay` is how fast the level decays, 0 (no decay) when omitted.

On its own it is a flat hiss, so carve the frequencies you do not want with
[`highpass`](#synthbufferhighpasscutoff) or [`bandpass`](#synthbufferbandpasscenter-q).

#### metallic(seconds, decay:, partials:)

```ruby
metallic(0.09, decay: 46).bandpass(10000, q: 1.2).highpass(8000)   # hihat
```

Stacks square waves at different frequencies into a metallic sound, the source of hihats
and cymbals. Their overtones clash into gritty highs with no pitch to them.

`partials` is the array of square wave frequencies, `Synth::HIHAT_PARTIALS`
(204, 298, 366, 515, 540, and 800 Hz) when omitted.
Keep only the high frequencies, as above, and you have a hihat.

#### silence(seconds)

```ruby
noise(0.02, decay: 300) + silence(0.5)
```

Makes `seconds` of silence.
A mix spans the longer of the two, so add silence to stretch the whole thing out.

### Building the Sound

A [waveform](#making-waveforms) is a `Synth::Buffer`.
These operations layer and carve it into the sound you want.
Each returns a new `Synth::Buffer`, so they chain with `.`.

#### Synth::Buffer#+(other)

```ruby
sweep(0.28, from: 160, to: 44, curve: 28, decay: 12) +
  noise(0.02, decay: 300) * 0.5
```

Mixes two sounds. The result spans the longer of the two.

#### Synth::Buffer#*(value)

```ruby
noise(0.02, decay: 300) * 0.5   # half the level
```

Scales the level. 1.0 leaves it alone, 0.5 halves it.
Use it to balance the sounds you mix.

#### Synth::Buffer#highpass(cutoff)

```ruby
noise(0.02, decay: 300).highpass(900)
```

Keeps what is above `cutoff` Hz and removes the low end.
Taking the low end off noise leaves the sharp attack.

#### Synth::Buffer#lowpass(cutoff)

```ruby
noise(0.1, decay: 20).lowpass(400)
```

The other way around: keeps what is below `cutoff` Hz.

#### Synth::Buffer#bandpass(center, q:)

```ruby
noise(0.28).bandpass(1100, q: 1.6)
```

Keeps the frequencies around `center` Hz.
`q` is the resonance, the larger the narrower the band and the more that frequency
stands out. It is 1.0 when omitted.
The crack of a clap comes out of that resonance.

#### Synth::Buffer#env(decay, at:, cut:, level:)

```ruby
source = noise(0.28).bandpass(1100, q: 1.6)

source.env(220, cut: 0.009, level: 0.75) +
  source.env(220, at: 0.009, cut: 0.009, level: 0.85) +
  source.env(220, at: 0.018)
```

Applies an envelope to shape the level.
It is silent until `at` seconds, then decays at the rate of `decay`.
Pass `cut` and it sounds for `cut` seconds from `at` and stops there.
`level` scales the level. `at` defaults to 0 and `level` to 1.0, and nothing is cut when `cut` is omitted.

Summing several `env` of one source at different offsets builds a sound struck several
times, like a handclap. The example above is that shape.

#### Synth::Buffer#normalize(peak:)

```ruby
buffer.normalize(peak: 0.9)
```

Scales the whole thing so its loudest point lands on `peak`, 0.9 when omitted.

#### Synth::Buffer#fade_tail(ms:)

```ruby
buffer.fade_tail(ms: 4)
```

Fades the last `ms` milliseconds out so the sound ends exactly at zero, 4.0 when omitted.
Cutting off mid-signal would click.

> `Synth.render` applies `normalize` and `fade_tail` for you,
> so you rarely need to call them yourself.
{: .tip}

### The Drum Kit

The board's drum sounds are already defined, and you render them by name.

```ruby
require "synth"
require "synth/drum_kit"

snare = PWMAudio::Sample.new(Synth::DrumKit.render("sd"))
```

The names are `bd` (kick), `sd` (snare), `hh` (hihat), `oh` (open hihat),
`cp` (clap), `lt` (low tom), `ht` (high tom), and `rim` (rimshot).

The same sounds are stored as WAV files in `/data/drums`, which load faster than rendering them.

#### Synth::DrumKit.render(name, rate:, seed:)

Renders `name` and returns WAV data.
`rate` and `seed` work as they do in [`Synth.render`](#synthrenderrate-seed).
A name that is not registered raises `ArgumentError`.

#### Synth::DrumKit.names

```ruby
Synth::DrumKit.names  #=> ["bd", "sd", "hh", "oh", "cp", "lt", "ht", "rim"]
```

Returns the registered names.

#### Synth::DrumKit.define(name)

```ruby
Synth::DrumKit.define("kick2") do
  sweep(0.4, from: 120, to: 38, curve: 20, decay: 8)
end

deep = PWMAudio::Sample.new(Synth::DrumKit.render("kick2"))
```

Registers a sound of your own under a name. The block is the same one `Synth.render` takes.
An existing name is overwritten.
