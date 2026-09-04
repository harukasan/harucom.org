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
  - [USB-A（ホストポート）](#usb-aホストポート)
  - [USB-C（デバイスポート）](#usb-cデバイスポート)
- [オーディオ](#オーディオ)
- [ボタン](#ボタン)
- [Grove コネクタ](#grove-コネクタ)
- [SPI ピンヘッダー](#spi-ピンヘッダー)
- [I2C ピンヘッダー](#i2c-ピンヘッダー)
- [UART と SWD](#uart-と-swd)
- [GPIO の割り当て](#gpio-の割り当て)
- [Ruby から使える周辺機能](#ruby-から使える周辺機能)
- [オープンソースハードウェア](#オープンソースハードウェア)

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

USB-Aポートにはキーボードを直接接続できます。USBハブやBluetoothは現在サポートしていません。
キーボード、または2.4GHzのキーボードの無線ドングルなどを直接接続してください。

### USB-C（デバイスポート）

電源供給とデータ通信に使います。RP2350 のネイティブ USB PHY に接続されているので[ファームウェアの書換え](/flash/)にも使います。

## オーディオ

ステレオ PWM オーディオ出力です。3.5mm ジャックを搭載しています。

| 出力 | GPIO |
|------|------|
| 左 | GPIO 24 |
| 右 | GPIO 25 |

鳴らし方は[オーディオ](/docs/reference/audio/)をご覧ください。

## ボタン

8つのタクタイルボタンを搭載しています。
抵抗ラダー（分圧回路）方式で、2つの ADC チャンネルに4ボタンずつ接続されています。

| ボタン | ADC | GPIO |
|--------|-----|------|
| グループ0（4個） | ADC2 | GPIO 28 |
| グループ1（4個） | ADC3 | GPIO 29 |

読み取り方は [Board::Pad](/docs/reference/pad/) をご覧ください。

## Grove コネクタ

Grove コネクタを2つ搭載しています。

| コネクタ | インターフェース | 電源 |
|----------|------------------|------|
| Grove 1 | I2C（SDA: GPIO 20、SCL: GPIO 21） | 5V |
| Grove 2 | UART / ADC / GPIO | 3.3V |

温湿度センサー、加速度センサー、OLED ディスプレイ、光センサー、可変抵抗など、
用途に応じてさまざまなモジュールを接続できます。

## SPI ピンヘッダー

SPI バスのピンヘッダーを搭載しています。SD カードモジュールなどの SPI デバイスを接続できます。

| 信号 | GPIO |
|------|------|
| SCK（クロック） | GPIO 6 |
| TX（MOSI） | GPIO 7 |
| RX（MISO） | GPIO 4 |
| CSN（チップセレクト） | GPIO 5 |

## I2C ピンヘッダー

3.3V 電源を供給する I2C ピンヘッダーを搭載しています。
I2C ディスプレイなどのモジュールを接続するのに便利です。

| 信号 | GPIO |
|------|------|
| SDA | GPIO 20 |
| SCL | GPIO 21 |

Grove 1 と同じバスにつながっています。

## UART と SWD

デバッグ出力や外部機器とのシリアル通信に使う UART と、
ファームウェアの書き込みやデバッグに使う SWD のピンヘッダーを搭載しています。

| 信号 | GPIO |
|------|------|
| TX | GPIO 2 |
| RX | GPIO 3 |

SWD には Raspberry Pi Debug Probe などのデバッグプローブを接続できます。

## GPIO の割り当て

```
GPIO 0      : PSRAM チップセレクト
GPIO 1      : LED（赤）
GPIO 2-3    : UART（TX / RX）
GPIO 4-7    : SPI（RX / CSN / SCK / TX）
GPIO 8-9    : USB ホスト（D+ / D-）
GPIO 10     : USB VBUS 電源制御
GPIO 11     : DVI ホットプラグ検出
GPIO 12-19  : DVI 出力（HSTX）
GPIO 20-21  : I2C（SDA / SCL）
GPIO 22     : USB VBUS 検出
GPIO 23     : LED（緑）
GPIO 24-25  : オーディオ PWM（左 / 右）
GPIO 26-27  : 未使用
GPIO 28-29  : ADC ボタン
```

DVI（GPIO 12-19）と USB ホスト（GPIO 8-9）のピンは専用で、ほかの用途には使えません。

## Ruby から使える周辺機能

Ruby のプログラムから直接使えるのは次のものです。

| 機能 | クラス |
|------|--------|
| GPIO | [GPIO](https://picoruby.org/GPIO.html) |
| ADC | ADC |
| UART | UART <span class="badge-v2">2.0 から</span> |
| PWM | PWM <span class="badge-v2">2.0 から</span> |

I2C と SPI は、いまのところ Ruby からは使えません。
ファームウェア側（C）での実装が必要です。

5V の Grove コネクタに機器をつなぐときは、RP2350 の GPIO が 3.3V で動作することに注意してください。
レベル変換は基板側で行っています。

## オープンソースハードウェア

Harucom Board はオープンソースハードウェアです。
基板設計は [CERN-OHL-P v2](https://ohwr.org/cern_ohl_p_v2.txt)（Permissive）ライセンスで公開されており、
誰でも自由に利用・改変・再配布できます。

- [harucom-board](https://github.com/harukasan/harucom-board) — 基板設計（KiCad）
