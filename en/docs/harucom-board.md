---
layout: doc
title: Harucom Board
permalink: /en/docs/harucom-board/
lang: en
ref: harucom
---

# Harucom Board

Harucom Board is a board built around the RP2350A microcontroller, featuring
DVI video output, USB host, stereo PWM audio, and expansion connectors.

## Table of Contents

- [Specifications](#specifications)
- [DVI Video Output](#dvi-video-output)
- [USB](#usb)
- [Audio](#audio)
- [Buttons](#buttons)
- [Grove Connectors](#grove-connectors)
- [SPI](#spi)
- [I2C](#i2c)
- [Open-Source Hardware](#open-source-hardware)

## Specifications

| Item | Specification |
|------|---------------|
| MCU | Raspberry Pi RP2350A (ARM Cortex-M33, dual-core) |
| Flash | 16 MB QSPI (first 8 MB: firmware, last 8 MB: FAT filesystem) |
| PSRAM | 8 MB QSPI (APS6404L, connected via QMI CS1) |
| Video Output | DVI (via HSTX, Type-A 19-pin connector) |
| Audio | Stereo PWM (3.5mm jack) |
| USB-C | Power supply & data (device port) |
| USB-A | Host port (PIO-USB) |
| Buttons | 8 tactile buttons (ADC resistor ladder) |
| Expansion | Grove x 2, SPI, SWD |
| LED | Red (GPIO 1), Green (GPIO 23) |

---

## DVI Video Output

Uses HSTX (High-Speed Serial Transmit) to output DVI signals.
Equipped with a Type-A 19-pin connector, allowing connection to a monitor via an HDMI cable.

Outputs 640x480 @ 60Hz video, supporting both text mode and graphics mode.

## USB

### USB-A (Host Port)

You can connect a keyboard directly to the USB-A port.

### USB-C (Device Port)

Used for power supply and data communication. Connected to the RP2350's native USB PHY, so it is also used for firmware updates.

## Audio

Stereo PWM audio output. Equipped with a 3.5mm jack.

## Buttons

Equipped with 8 tactile buttons.
Uses a resistor ladder (voltage divider) scheme, with 4 buttons connected to each of 2 ADC channels.

## Grove Connectors

Equipped with Grove connectors that can supply 5V power.
You can connect various sensors and modules for I2C, UART, ADC, GPIO, and other purposes.

## SPI Pin Header

Equipped with an SPI bus pin header. You can connect SPI devices such as SD card modules.

## I2C Pin Header

Equipped with an I2C pin header that supplies 3.3V power.
Convenient for connecting modules such as I2C displays.

## Open-Source Hardware

Harucom Board is open-source hardware.
The board design is published under the [CERN-OHL-P v2](https://ohwr.org/cern_ohl_p_v2.txt) (Permissive) license,
and anyone is free to use, modify, and redistribute it.

- [harucom-board](https://github.com/harukasan/harucom-board) — Board design (KiCad)
