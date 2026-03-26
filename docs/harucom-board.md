---
layout: doc
title: Harucom Board
permalink: /docs/harucom-board/
lang: ja
ref: harucom
---

# Harucom Board

Harucom Board は RP2350A マイコンを中心に、DVI 映像出力、USB ホスト、
ステレオ PWM オーディオ、拡張コネクタを備えた基板です。

## 目次

- [仕様](#仕様)
- [DVI 映像出力](#dvi-映像出力)
- [USB](#usb)
- [オーディオ](#オーディオ)
- [ボタン](#ボタン)
- [Grove コネクタ](#grove-コネクタ)
- [SPI](#spi)
- [I2C](#i2c)
- [UART](#uart)
- [LED](#led)
- [デュアルコアアーキテクチャ](#デュアルコアアーキテクチャ)
- [ソフトウェアスタック](#ソフトウェアスタック)
- [リポジトリ](#リポジトリ)

## 仕様

| 項目 | 仕様 |
|------|------|
| MCU | Raspberry Pi RP2350A（ARM Cortex-M33、デュアルコア） |
| Flash | 16 MB QSPI（前半 8 MB: ファームウェア、後半 8 MB: FAT ファイルシステム） |
| PSRAM | 8 MB QSPI（APS6404L、QMI CS1 接続） |
| 映像出力 | DVI（HSTX 経由、Type-A 19ピンコネクタ） |
| オーディオ | ステレオ PWM（3.5mm ジャック） |
| USB-C | 電源供給 & データ（デバイスポート） |
| USB-A | ホストポート（PIO-USB） |
| ボタン | タクタイルボタン x 8（ADC 抵抗ラダー方式） |
| 拡張 | Grove x 2、SPI、SWD |
| LED | 赤 (GPIO 1)、緑 (GPIO 23) |

---

## DVI 映像出力

HSTX（High-Speed Serial Transmit）を使って DVI 信号を出力します。
Type-A 19ピンコネクタを搭載しており、HDMI ケーブルでモニターに接続できます。

640x480 @ 60Hz の映像を出力し、テキストモードとグラフィックスモードに対応しています。

## USB

### USB-A（ホストポート）

USB-Aポートにはキーボードを直接接続できます。

### USB-C（デバイスポート）

電源供給とデータ通信に使います。RP2350 のネイティブ USB PHY に接続されているのでファームウェアの書換えにも使います。

## オーディオ

ステレオ PWM オーディオ出力です。3.5mm ジャックを搭載しています。

## ボタン

8つのタクタイルボタンを搭載しています。
抵抗ラダー（分圧回路）方式で、2つの ADC チャンネルに4ボタンずつ接続されています。

## Grove コネクタ

5V電源を供給できる Grove コネクタを搭載しています。
I2C、UART、ADC、GPIO など、用途に応じてさまざまなセンサーやモジュールを接続できます。

## SPI ピンヘッダー

SPI バスのピンヘッダーを搭載しています。SD カードモジュールなどの SPI デバイスを接続できます。

## I2C ピンヘッダー

3.3V 電源を供給する I2C ピンヘッダーを搭載しています。
I2C ディスプレイなどのモジュールを接続するのに便利です。

## オープンソースハードウェア

Harucom Board はオープンソースハードウェアです。
基板設計は [CERN-OHL-P v2](https://ohwr.org/cern_ohl_p_v2.txt)（Permissive）ライセンスで公開されており、
誰でも自由に利用・改変・再配布できます。

- [harucom-board](https://github.com/harukasan/harucom-board) — 基板設計（KiCad）
