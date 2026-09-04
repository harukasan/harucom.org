---
layout: doc
title: Upgrade Harucom OS
permalink: /en/flash/
lang: en
ref: flash
---

Upgrade your Harucom Board to the latest Harucom OS. If you use Chrome or Edge, you can write it straight from this page.

> Writing the firmware does not erase the files you saved on the filesystem. The system files Harucom OS needs to boot are overwritten.
{: .tip}

## 1. Enter BOOTSEL mode

Hold down the BOOTSEL button on the Harucom board and connect the USB-C cable to your computer. If the board is already connected, you can hold BOOTSEL and press the RESET button instead.

Once your computer shows a USB storage device named `RP2350`, the board is ready.

## 2. Write the firmware

The button below opens a list of connected USB devices. Pick `RP2350 Boot` and writing starts. It takes about a minute.

{% include flash-tool.html %}

## If it does not work

| What you see | What to check |
| --- | --- |
| No button appears | Open the page in Chrome or Edge. Firefox, Safari, iPhone and iPad do not support WebUSB, so they cannot write to the board. See "Writing without a browser" below |
| Harucom is not in the list | The board is probably not in BOOTSEL mode. Hold BOOTSEL down while reconnecting the cable |
| Other boards are listed too | Any other RP2350 board that is connected shows up as well. Pick `RP2350 Boot` |
| "Another program is using Harucom" | Quit picotool, the Arduino IDE, or any other program that talks to the board |
| "Could not be opened" on Linux | You need a udev rule to allow USB access. The error message shows how to add one |

A failure part way through cannot break Harucom. Hold BOOTSEL while reconnecting the board and you can start over as many times as you like.

## Writing without a browser

If your browser is not supported, download the UF2 file and write it yourself. Download the zip file from the [GitHub releases page](https://github.com/harukasan/harucom-os/releases) and unpack it. It holds two UF2 files.

| File | What it contains |
| --- | --- |
| `harucom_os_full-<version>.uf2` | The firmware and the Japanese input dictionary |
| `harucom_os-<version>.uf2` | The firmware only |

If you do not need to replace the dictionary, you can drag and drop `harucom_os`. To rewrite the dictionary along with the firmware, write `harucom_os_full` with picotool.

### Writing by drag and drop

`harucom_os` covers a single region, so copying it onto the USB storage device is enough. The dictionary already on Harucom stays as it is.

Put the Harucom board into BOOTSEL mode, wait for your computer to show a USB storage device named `RP2350`, and copy `harucom_os-<version>.uf2` onto it. Once the file is written, Harucom restarts on its own.

### Writing with picotool

`harucom_os_full` is split into two separate regions, the firmware and the dictionary. Dragging it onto the USB storage device does not write it, so use [picotool](https://github.com/raspberrypi/picotool) from the command line instead.

Put the Harucom board into BOOTSEL mode and point picotool at the file you unpacked.

```
picotool load -x harucom_os_full-2.0.0.uf2
```

`-x` makes Harucom restart on its own once writing has finished.
