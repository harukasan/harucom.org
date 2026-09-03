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
  - [USB-A](#usb-a-host-port)
  - [USB-C](#usb-c-device-port)
- [Audio](#audio)
- [Buttons](#buttons)
- [Grove Connectors](#grove-connectors)
- [SPI Pin Header](#spi-pin-header)
- [I2C Pin Header](#i2c-pin-header)
- [UART and SWD](#uart-and-swd)
- [GPIO Map](#gpio-map)
- [Peripherals Available from Ruby](#peripherals-available-from-ruby)
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

| Output | GPIO |
|--------|------|
| Left | GPIO 24 |
| Right | GPIO 25 |

See [Audio](/en/docs/reference/audio/) for playing sound.

## Buttons

Equipped with 8 tactile buttons.
Uses a resistor ladder (voltage divider) scheme, with 4 buttons connected to each of 2 ADC channels.

| Buttons | ADC | GPIO |
|---------|-----|------|
| Group 0 (x4) | ADC2 | GPIO 28 |
| Group 1 (x4) | ADC3 | GPIO 29 |

See [Board::Pad](/en/docs/reference/pad/) for reading them.

## Grove Connectors

The board has two Grove connectors.

| Connector | Interface | Power |
|-----------|-----------|-------|
| Grove 1 | I2C (SDA: GPIO 20, SCL: GPIO 21) | 5V |
| Grove 2 | UART / ADC / GPIO | 3.3V |

Temperature and humidity sensors, accelerometers, OLED displays, light sensors,
and potentiometers all connect here.

## SPI Pin Header

Equipped with an SPI bus pin header. You can connect SPI devices such as SD card modules.

| Signal | GPIO |
|--------|------|
| SCK (clock) | GPIO 6 |
| TX (MOSI) | GPIO 7 |
| RX (MISO) | GPIO 4 |
| CSN (chip select) | GPIO 5 |

## I2C Pin Header

Equipped with an I2C pin header that supplies 3.3V power.
Convenient for connecting modules such as I2C displays.

| Signal | GPIO |
|--------|------|
| SDA | GPIO 20 |
| SCL | GPIO 21 |

It shares the bus with Grove 1.

## UART and SWD

Pin headers for UART, used for debug output and serial communication with external devices,
and for SWD, used to flash and debug the firmware.

| Signal | GPIO |
|--------|------|
| TX | GPIO 2 |
| RX | GPIO 3 |

A debug probe such as the Raspberry Pi Debug Probe connects to SWD.

## GPIO Map

```
GPIO 0      : PSRAM chip select
GPIO 1      : LED (red)
GPIO 2-3    : UART (TX / RX)
GPIO 4-7    : SPI (RX / CSN / SCK / TX)
GPIO 8-9    : USB host (D+ / D-)
GPIO 10     : USB VBUS power enable
GPIO 11     : DVI hot plug detect
GPIO 12-19  : DVI output (HSTX)
GPIO 20-21  : I2C (SDA / SCL)
GPIO 22     : USB VBUS detect
GPIO 23     : LED (green)
GPIO 24-25  : Audio PWM (L / R)
GPIO 26-27  : unused
GPIO 28-29  : ADC buttons
```

The DVI pins (GPIO 12-19) and the USB host pins (GPIO 8-9) are dedicated and cannot serve
another purpose.

## Peripherals Available from Ruby

These are usable directly from a Ruby program.

| Feature | Class |
|---------|-------|
| GPIO | [GPIO](https://picoruby.org/GPIO.html) |
| ADC | ADC |
| UART | UART |
| PWM | PWM |

I2C and SPI are not available from Ruby yet. They need an implementation in the firmware, in C.

When connecting devices to the 5V Grove connector, note that the RP2350 GPIO runs at 3.3V.
Level shifting is handled on the board.

## Open-Source Hardware

Harucom Board is open-source hardware.
The board design is published under the [CERN-OHL-P v2](https://ohwr.org/cern_ohl_p_v2.txt) (Permissive) license,
and anyone is free to use, modify, and redistribute it.

- [harucom-board](https://github.com/harukasan/harucom-board) — Board design (KiCad)
