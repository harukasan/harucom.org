---
layout: doc
title: Connecting Peripherals
permalink: /en/docs/peripherals/
lang: en
ref: docs-peripherals
---

The Harucom Board has Grove connectors and SPI/SWD headers for connecting external devices.

## Connectors

| Connector | Interface | Voltage |
|-----------|-----------|---------|
| Grove socket 1 | I2C (SDA: GPIO 20, SCL: GPIO 21) | 5V |
| Grove socket 2 | UART / I2C / ADC / GPIO | 3.3V |
| 1x06 socket | SPI | 3.3V |
| 1x05 + 1x02 sockets | UART + SWD | 5V |

## Pin assignments

### I2C

| Signal | GPIO |
|--------|------|
| SDA | GPIO 20 |
| SCL | GPIO 21 |

Connect I2C-compatible Grove sensors and display modules.

### SPI

| Signal | GPIO |
|--------|------|
| SCK (clock) | GPIO 6 |
| TX (MOSI) | GPIO 7 |
| RX (MISO) | GPIO 4 |
| CSN (chip select) | GPIO 5 |

Connect SPI displays, SD cards, and sensors.

### UART

| Signal | GPIO |
|--------|------|
| TX | GPIO 2 |
| RX | GPIO 3 |

Use for debug output or serial communication with external devices.

### Buttons (ADC resistor ladder)

| Buttons | ADC | GPIO |
|---------|-----|------|
| Button group 0 (x4) | ADC2 | GPIO 28 |
| Button group 1 (x4) | ADC3 | GPIO 29 |

8 tactile buttons are connected to 2 ADC channels via resistor ladders, reading 4 buttons per GPIO pin.

### Audio (PWM)

| Channel | GPIO |
|---------|------|
| Left | GPIO 24 |
| Right | GPIO 25 |

Stereo audio output via the 3.5mm jack.

## GPIO map

```
GPIO 0      : PSRAM CS
GPIO 1      : (unused)
GPIO 2-3    : UART (TX/RX)
GPIO 4-7    : SPI (RX/CSN/SCK/TX)
GPIO 8-9    : USB Host (D+/D-)
GPIO 10     : USB VBUS power enable
GPIO 11     : DVI hot plug detect
GPIO 12-19  : DVI output (HSTX)
GPIO 20-21  : I2C (SDA/SCL)
GPIO 22     : USB VBUS detect
GPIO 23     : LED
GPIO 24-25  : Audio PWM (L/R)
GPIO 26-27  : (unused)
GPIO 28-29  : ADC buttons
```

## Grove modules

### I2C devices

Connect I2C modules to the Grove I2C socket (5V).

Examples:
- Temperature / humidity sensors
- Accelerometers
- OLED displays
- Distance sensors

### Analog sensors

Connect analog sensors to the Grove socket 2 (3.3V) ADC pins.

Examples:
- Light sensors
- Rotary potentiometers
- Joysticks

## SWD debugging

Connect a debug probe (e.g. Raspberry Pi Debug Probe) via the SWD connector for firmware flashing and debugging.

## Notes

- Ruby bindings for I2C, SPI, and ADC are planned for the future. Currently, peripheral access requires firmware-level (C) implementation
- When connecting devices to the 5V connectors, note that the RP2350 GPIO operates at 3.3V. Level shifting is handled on the board
- DVI (GPIO 12-19) and USB Host (GPIO 8-9) pins are dedicated and cannot be used for other purposes
