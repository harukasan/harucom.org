---
layout: doc
title: DMX Module
permalink: /en/docs/reference/dmx/
lang: en
ref: docs-reference-dmx
---

The DMX module sends DMX512, the protocol used for stage lighting.
Moving heads and par cans can be driven from Harucom.

A background engine takes care of transmission. It sends all 512 channels 40 times a second,
so Ruby only updates values.

## Contents

- [Wiring](#wiring)
- [Getting Started](#getting-started)
  - [Starting Transmission](#starting-transmission)
  - [Writing Channel Values](#writing-channel-values)
- [Controlling the Lights](#controlling-the-lights)
  - [Board::DMX.new](#boarddmxnew)
  - [Board::DMX#start](#boarddmxstart)
  - [Board::DMX#stop](#boarddmxstop)
  - [Board::DMX#set](#boarddmxsetchannel-value)
  - [Board::DMX#set_range](#boarddmxset_rangechannel-values)
  - [Board::DMX#get](#boarddmxgetchannel)
  - [Board::DMX#blackout](#boarddmxblackout)
  - [Board::DMX#keepalive](#boarddmxkeepalive)
  - [Board::DMX#deadman_ms=](#boarddmxdeadman_msms)
  - [Board::DMX#active_slots=](#boarddmxactive_slotscount)
  - [Board::DMX#frame_count](#boarddmxframe_count)
- [The Dead-Man Switch](#the-dead-man-switch)
- [The DMX Module](#the-dmx-module)
  - [DMX.init](#dmxinitunit-txd_pin)
  - [DMX.stop and DMX.shutdown](#dmxstop-and-dmxshutdown)
- [Fixture Definitions](#fixture-definitions)

## Wiring

DMX runs over RS-485, so a transceiver is needed.
Connect an isolated transceiver such as the M5Stack DMX Unit to the Grove connector (J5).

| Item | Value |
|------|-------|
| UART | UART1, 250000 baud, 8 data bits, no parity, 2 stop bits |
| TX pin | GPIO 20 (Grove connector J5) |
| Frame rate | About 40 Hz |

Harucom only transmits, so no receive pin is used.

## Getting Started

### Starting Transmission

```ruby
require "board/dmx"

dmx = Board::DMX.new
dmx.start            # clear every channel and begin transmitting

dmx[6] = 255         # set channel 6 to full

loop do
  dmx.keepalive      # say that the program is still running
  sleep_ms 10
end

dmx.stop             # black out, then stop transmitting
```

`Board::DMX.new` initializes DMX and `start` begins transmission.
After that you only change channel values, and the sending continues in the background.

Call `keepalive` from the main loop.
Stopping those calls turns the rig off, which
[the dead-man switch](#the-dead-man-switch) explains.

### Writing Channel Values

Channels are numbered 1 to 512 and values run from 0 to 255.
What each channel means depends on the fixture you connected.

```ruby
dmx[6] = 255                                  # one channel
dmx.set_range(1, [pan, tilt, 0, 0, 0, 128])   # a block of channels at once
```

`set_range` suits fixtures such as moving heads, where one unit occupies
several channels.

A value you write reaches the fixture on the next frame, at most 25 ms later.

## Controlling the Lights

Load it with `require "board/dmx"`.

### Board::DMX.new

```ruby
dmx = Board::DMX.new
```

Initializes DMX on the board's default wiring, the Grove connector.
Nothing is transmitted yet.
To use other wiring, see [The DMX Module](#the-dmx-module).

### Board::DMX#start

Clears every channel to zero, then begins transmitting.

> `start` clears every channel, so set your values after calling it.
{: .tip}

### Board::DMX#stop

Clears every channel, waits for that to reach the fixtures, then stops transmitting.

A fixture holds its last values when the signal stops, so simply cutting transmission
would leave the rig lit. `stop` makes sure the rig is dark first.

### Board::DMX#set(channel, value)

```ruby
dmx.set(6, 255)
dmx[6] = 255      # the same thing
```

Writes one channel. `channel` runs from 1 to 512 and `value` from 0 to 255.
Values outside those ranges do nothing.

### Board::DMX#set_range(channel, values)

```ruby
dmx.set_range(1, [pan, tilt, 0, 0, 0, dimmer])
```

Writes the array into consecutive channels, starting at `channel`.
Handy for a fixture that occupies a block of channels.

### Board::DMX#get(channel)

```ruby
dmx.get(6)   #=> 255
dmx[6]       # the same thing
```

Returns the value currently written to a channel.

### Board::DMX#blackout

Sets every channel to zero, so the rig goes dark on the next frame.
Transmission continues, and writing a value lights it again.

### Board::DMX#keepalive

Tells the dead-man switch that the program is still running.
Call it on every pass of the main loop.
See [The Dead-Man Switch](#the-dead-man-switch) for the details.

### Board::DMX#deadman_ms=(ms)

```ruby
dmx.deadman_ms = 1000
dmx.deadman_ms = 0      # disable
```

Sets how long, in milliseconds, the engine waits after `keepalive` stops
before it darkens the rig. It defaults to 500 ms, and `0` disables it.

### Board::DMX#active_slots=(count)

Sets how many channels are transmitted, from 1 to 512.
Shortening the frame to the channels you actually use leaves more idle time between frames.

### Board::DMX#frame_count

Returns the number of frames sent since `start`.
It grows by about 40 per second, which makes it useful for checking the real frame rate.

## The Dead-Man Switch

A fixture holds its last values when the signal stops.
If your program dies, the rig stays lit.

To prevent that, the engine has a dead-man switch.
When `keepalive` stops being called, the engine forces every channel to zero and the rig goes dark.

```ruby
loop do
  dmx.keepalive
  # update values here
  sleep_ms 10
end
```

The grace period is set with `deadman_ms=` and defaults to 500 ms.
Once `keepalive` resumes, the values set from Ruby take effect again.

The switch runs inside the engine, so it works even when Ruby has stopped.

## The DMX Module

`Board::DMX` wraps the `DMX` module.
Methods such as `set` and `keepalive` exist on `DMX` under the same names and arguments
(`DMX.set(6, 255)`, for instance).
Reach for `DMX` directly when the wiring differs.

### DMX.init(unit:, txd_pin:)

```ruby
DMX.init                                       # use the board default wiring
DMX.init(unit: :RP2040_UART1, txd_pin: 20)
```

Initializes a UART for DMX512. Omitting the arguments selects the board default.
`txd_pin` has to be a pin that can carry TX for the chosen unit.
It returns the DMA channel it claimed.

The line parameters (250000 baud, 8 data bits, no parity, 2 stop bits) are fixed by the
standard and cannot be changed.

`Board::DMX.new` calls this method with no arguments.

### DMX.stop and DMX.shutdown

`DMX.stop` only stops transmission. Fixtures hold their last values, so a lit rig stays lit.

`DMX.shutdown` darkens the rig first, then stops. This is what `Board::DMX#stop` calls.

## Fixture Definitions

Channel order differs from fixture to fixture.
Put [Open Fixture Library](https://open-fixture-library.org/) JSON definitions in
`/data/dmx/fixtures` to work with named channels.

```ruby
require "dmx/fixture"

paths = DMX::Fixture.list("/data/dmx/fixtures")
fixture = DMX::Fixture.read(paths[0])

fixture[:name]                #=> "SHEHDS 80W LED Spot Light"
mode = fixture[:modes][0]
mode[:label]                  #=> "13ch"
mode[:channels][5][:name]     #=> "Dimmer"
```

`mode[:channels]` is ordered as the channels appear on the wire,
so entry i sits at the fixture's base address plus i.

[dmx_demo](../../demos/#dmx_demo) is an app built on these definitions.
To drive sound and light together from patterns, see [Johakyu](../../johakyu/).
