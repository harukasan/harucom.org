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
- [Board::DMX](#boarddmx)
- [The Dead-Man Switch](#the-dead-man-switch)
- [The DMX Module](#the-dmx-module)
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

```ruby
require "board/dmx"

dmx = Board::DMX.new
dmx.start            # clear every slot and begin transmitting

dmx[6] = 255         # set channel 6 to full

loop do
  dmx.keepalive      # tell the engine we are still alive
  # update values here
  sleep_ms 10
end

dmx.stop             # black out, then stop transmitting
```

Channels are numbered 1 to 512 and values run from 0 to 255.
What each channel means depends on the fixture you connected.

## Board::DMX

Load it with `require "board/dmx"`.

| Method | Description |
|--------|-------------|
| `Board::DMX.new` | Initialize DMX (transmission has not started yet) |
| `#start` | Clear every slot, then begin transmitting |
| `#stop` | Black out, then stop transmitting |
| `#set(channel, value)` / `#[]=` | Write one channel |
| `#set_range(channel, values)` | Write consecutive channels at once |
| `#get(channel)` / `#[]` | Read a channel back |
| `#blackout` | Set every channel to zero |
| `#keepalive` | Feed the dead-man switch |
| `#deadman_ms=` | Grace period of the dead-man switch, in milliseconds |
| `#active_slots=` | Shorten the frame to this many channels |
| `#frame_count` | Frames sent since `start` |

`set_range` suits fixtures such as moving heads, which occupy a block of channels.

```ruby
dmx.set_range(1, [pan, tilt, 0, 0, 0, dimmer])
```

> `start` clears every channel, so set your values after calling it.
{: .tip}

## The Dead-Man Switch

A fixture holds its last values when the signal stops.
If your program dies, the rig stays lit.

To prevent that, the engine has a dead-man switch.
When `keepalive` stops being called, the engine forces every channel to zero and the rig goes dark.

```ruby
loop do
  dmx.keepalive
  # ...
end
```

The grace period is set with `deadman_ms=`. It defaults to 500 ms, and `0` disables it.

```ruby
dmx.deadman_ms = 1000
dmx.deadman_ms = 0      # disable
```

Once `keepalive` resumes, the values set from Ruby take effect again.

## The DMX Module

`Board::DMX` wraps the `DMX` module. Use `DMX` directly to change the wiring.

### DMX.init(unit:, txd_pin:)

```ruby
DMX.init                                       # use the board default wiring
DMX.init(unit: :RP2040_UART1, txd_pin: 20)
```

Initializes a UART for DMX512. Omitting the arguments selects the board default.
It returns the DMA channel it claimed.

### Other Methods

| Method | Description |
|--------|-------------|
| `DMX.start` | Begin transmitting |
| `DMX.stop` | Stop transmitting (the rig stays lit) |
| `DMX.shutdown` | Black out, then stop transmitting |
| `DMX.set(channel, value)` | Write one channel |
| `DMX.set_range(channel, values)` | Write consecutive channels |
| `DMX.get(channel)` | Read a channel back |
| `DMX.blackout` | Set every channel to zero |
| `DMX.active_slots = count` | Shorten the frame |
| `DMX.frame_count` | Frames sent |
| `DMX.keepalive` | Feed the dead-man switch |
| `DMX.deadman_ms = ms` | Grace period of the dead-man switch |

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
