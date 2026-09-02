---
layout: doc
title: Harucom OS をアップグレードする
permalink: /flash/
lang: ja
ref: flash
---

Harucom Board のファームウェア Harucom OS を最新版にアップグレードします。Chrome または Edge をお使いなら、このページから直接書き込めます。

> ファームウェアを書き込んでも、ファイルシステムに保存したファイルは消えません。Harucom OS の起動に必要なシステムファイルは上書きされます。
{: .tip}

## 1. BOOTSEL モードにする

Harucom board の BOOTSEL ボタンを押しながら、USB-C ケーブルをパソコンに接続します。すでに接続されている場合は、BOOTSEL ボタンを押しながら RESET ボタンを押してもかまいません。

パソコンから USB ストレージ（`RP2350`）として認識されたら、準備ができています。

## 2. 書き込む

下のボタンを押すと、つながっている USB 機器の一覧が表示されます。`RP2350 Boot` を選んで接続すると、書き込みがはじまります。1 分ほどで終わります。

{% include flash-tool.html %}

## うまくいかないときは

| 症状 | 確認すること |
| --- | --- |
| ボタンが表示されない | Chrome または Edge でひらいてください。Firefox と Safari、iPhone・iPad は WebUSB に対応していないため、このページからは書き込めません。下の「ブラウザを使わずに書き込む」をご覧ください |
| 一覧に Harucom が出てこない | BOOTSEL モードに入っていない可能性があります。BOOTSEL ボタンを押したままケーブルをつなぎ直してください |
| 一覧に他のボードも並ぶ | Harucom 以外の RP2350 ボードもつながっていると、まとめて表示されます。`RP2350 Boot` を選んでください |
| 「ほかのソフトに使われています」と出る | picotool や Arduino IDE など、Harucom を使っているソフトを終了してください |
| Linux で「ひらけませんでした」と出る | USB デバイスへのアクセス許可の設定が必要です。エラーの中に設定方法を表示しています |

途中で失敗しても Harucom が壊れることはありません。BOOTSEL ボタンを押しながらつなぎ直せば、何度でもやり直せます。

## ブラウザを使わずに書き込む

対応していないブラウザをお使いの場合は、UF2 ファイルをダウンロードして書き込みます。[GitHub のリリースページ](https://github.com/harukasan/harucom-os/releases) から zip ファイルをダウンロードして展開してください。中には 2 つの UF2 ファイルが入っています。

| ファイル | 中身 |
| --- | --- |
| `harucom_os_full-<バージョン>.uf2` | ファームウェアと日本語入力の辞書 |
| `harucom_os-<バージョン>.uf2` | ファームウェアだけ |

辞書を入れ替える必要がなければ、`harucom_os` をドラッグ＆ドロップで書き込めます。辞書ごと書きかえるときは、`harucom_os_full` を picotool で書き込みます。

### ドラッグ＆ドロップで書き込む

`harucom_os` は領域が 1 つなので、USB ストレージにコピーするだけで書き込めます。辞書は Harucom に入っているものがそのまま残ります。

Harucom board を BOOTSEL モードにして、パソコンから USB ストレージ（`RP2350`）として認識されたら、展開した `harucom_os-<バージョン>.uf2` をそこにコピーします。書き込みが終わると、Harucom が自動的に再起動します。

### picotool で書き込む

`harucom_os_full` は、ファームウェアと辞書が離れた 2 つの領域に分かれています。ドラッグ＆ドロップでは書き込めないので、[picotool](https://github.com/raspberrypi/picotool) を使ってコマンドラインから書き込んでください。

Harucom board を BOOTSEL モードにして、展開したファイルを指定して実行します。

```
picotool load -x harucom_os_full-1.0.0.uf2
```

`-x` を付けると、書き込みが終わったあとに Harucom が自動的に再起動します。
