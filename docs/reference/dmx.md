---
layout: doc
title: DMX モジュール
permalink: /docs/reference/dmx/
lang: ja
ref: docs-reference-dmx
---

DMX モジュールは、舞台照明で使われている DMX512 の信号を出力します。
ムービングライトやパーライトを Harucom から制御できます。

信号の送信はバックグラウンドで動くエンジンが受け持ちます。
1秒間に40回、512チャンネル分のデータが自動で送られるので、
Ruby からは値を書き換えるだけで済みます。

## 目次

- [接続する](#接続する)
- [基本的な使い方](#基本的な使い方)
- [Board::DMX](#boarddmx)
- [デッドマンスイッチ](#デッドマンスイッチ)
- [DMX モジュール（低レベル API）](#dmx-モジュール低レベル-api)
- [照明の定義ファイル](#照明の定義ファイル)

## 接続する

DMX は RS-485 という規格の信号を使うので、変換モジュールが必要です。
M5Stack の DMX Unit のような、絶縁されたトランシーバを Grove コネクタ（J5）につないでください。

| 項目 | 値 |
|------|-----|
| UART | UART1、250000 baud、8ビット、パリティなし、ストップビット2 |
| TX ピン | GPIO 20（Grove コネクタ J5） |
| フレームレート | 約 40 Hz |

Harucom からは信号を送るだけなので、受信用のピンは使いません。

## 基本的な使い方

```ruby
require "board/dmx"

dmx = Board::DMX.new
dmx.start            # すべてのチャンネルを0にして送信を始める

dmx[6] = 255         # 6番のチャンネルを最大にする

loop do
  dmx.keepalive      # 動いていることを知らせる
  # ここで値を変える
  sleep_ms 10
end

dmx.stop             # 消灯してから送信を止める
```

チャンネルの番号は 1 から 512、値は 0 から 255 です。
どのチャンネルが何を意味するかは、つないだ照明によって決まります。

## Board::DMX

`require "board/dmx"` で読み込みます。

| メソッド | 説明 |
|----------|------|
| `Board::DMX.new` | DMX を初期化する（まだ送信はしない） |
| `#start` | すべてのチャンネルを0にしてから送信を始める |
| `#stop` | 消灯してから送信を止める |
| `#set(channel, value)` / `#[]=` | 1つのチャンネルに値を書く |
| `#set_range(channel, values)` | 連続したチャンネルにまとめて値を書く |
| `#get(channel)` / `#[]` | チャンネルの値を読む |
| `#blackout` | すべてのチャンネルを0にする（消灯する） |
| `#keepalive` | デッドマンスイッチに動作を知らせる |
| `#deadman_ms=` | デッドマンスイッチが働くまでの時間（ミリ秒） |
| `#active_slots=` | 送信するチャンネル数を減らす |
| `#frame_count` | 送信を始めてからのフレーム数 |

`set_range` はムービングライトのように、まとまった数のチャンネルを使う照明に便利です。

```ruby
dmx.set_range(1, [pan, tilt, 0, 0, 0, dimmer])
```

> `start` を呼ぶとすべてのチャンネルが0に戻ります。値を設定するのは `start` のあとにしてください。
{: .tip}

## デッドマンスイッチ

照明は、信号が届かなくなっても最後に受け取った値を保ち続けます。
そのためプログラムが止まってしまうと、照明が点いたままになってしまいます。

これを防ぐために、エンジンにはデッドマンスイッチが組み込まれています。
`keepalive` がしばらく呼ばれないと、エンジンがすべてのチャンネルを0にして照明を消します。

```ruby
loop do
  dmx.keepalive
  # ...
end
```

待ち時間は `deadman_ms=` で変えられます。既定は 500 ミリ秒で、`0` にすると無効になります。

```ruby
dmx.deadman_ms = 1000
dmx.deadman_ms = 0      # 無効にする
```

`keepalive` を再び呼ぶと、Ruby で設定した値がまた反映されるようになります。

## DMX モジュール（低レベル API）

`Board::DMX` は `DMX` モジュールを使いやすくしたものです。
配線を変えたい場合などは `DMX` を直接使います。

### DMX.init(unit:, txd_pin:)

```ruby
DMX.init                                       # 基板の既定の配線を使う
DMX.init(unit: :RP2040_UART1, txd_pin: 20)
```

UART を DMX512 用に初期化します。引数を省略すると基板の既定の配線になります。
確保した DMA チャンネルの番号を返します。

### そのほかのメソッド

| メソッド | 説明 |
|----------|------|
| `DMX.start` | 送信を始める |
| `DMX.stop` | 送信を止める（照明は消えません） |
| `DMX.shutdown` | 消灯してから送信を止める |
| `DMX.set(channel, value)` | チャンネルに値を書く |
| `DMX.set_range(channel, values)` | 連続したチャンネルに書く |
| `DMX.get(channel)` | チャンネルの値を読む |
| `DMX.blackout` | すべて0にする |
| `DMX.active_slots = count` | 送信するチャンネル数を変える |
| `DMX.frame_count` | 送信したフレーム数 |
| `DMX.keepalive` | デッドマンスイッチに知らせる |
| `DMX.deadman_ms = ms` | デッドマンスイッチの待ち時間 |

## 照明の定義ファイル

チャンネルの並びは照明の機種ごとに違います。
[Open Fixture Library](https://open-fixture-library.org/) の JSON 形式の定義ファイルを
`/data/dmx/fixtures` に置いておくと、チャンネルに名前を付けて扱えます。

```ruby
require "dmx/fixture"

paths = DMX::Fixture.list("/data/dmx/fixtures")
fixture = DMX::Fixture.read(paths[0])

fixture[:name]                #=> "SHEHDS 80W LED Spot Light"
mode = fixture[:modes][0]
mode[:label]                  #=> "13ch"
mode[:channels][5][:name]     #=> "Dimmer"
```

`mode[:channels]` は信号に流れる順番に並んでいます。
i 番目のチャンネルの番号は、その照明の先頭アドレスに i を足した値になります。

定義ファイルを使ったアプリとして [dmx_demo](../../demos/#dmx_demo) が入っています。
パターンで音と照明をまとめて動かしたい場合は [Johakyu](../../johakyu/) を使います。
