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
  - [送信を始める](#送信を始める)
  - [チャンネルに値を書く](#チャンネルに値を書く)
- [照明を制御する](#照明を制御する)
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
- [デッドマンスイッチ](#デッドマンスイッチ)
- [DMX モジュール](#dmx-モジュール)
  - [DMX.init](#dmxinitunit-txd_pin)
  - [DMX.stop と DMX.shutdown](#dmxstop-と-dmxshutdown)
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

### 送信を始める

```ruby
require "board/dmx"

dmx = Board::DMX.new
dmx.start            # すべてのチャンネルを0にして送信を始める

dmx[6] = 255         # 6番のチャンネルを最大にする

loop do
  dmx.keepalive      # 動いていることを知らせる
  sleep_ms 10
end

dmx.stop             # 消灯してから送信を止める
```

`Board::DMX.new` で初期化し、`start` で送信を始めます。
あとはチャンネルに値を書き換えていくだけで、送信はバックグラウンドで続きます。

主ループでは `keepalive` を呼びます。
これを止めると照明が消える仕組みになっています。
[デッドマンスイッチ](#デッドマンスイッチ)で説明します。

### チャンネルに値を書く

チャンネルの番号は 1 から 512、値は 0 から 255 です。
どのチャンネルが何を意味するかは、つないだ照明によって決まります。

```ruby
dmx[6] = 255                                  # 1チャンネルだけ書く
dmx.set_range(1, [pan, tilt, 0, 0, 0, 128])   # 連続したチャンネルにまとめて書く
```

ムービングライトのように、まとまった数のチャンネルを1台で使う照明では
`set_range` が使えます。

書いた値は次のフレーム（最大 25 ミリ秒後）で照明に届きます。

## 照明を制御する

`require "board/dmx"` で読み込みます。

### Board::DMX.new

```ruby
dmx = Board::DMX.new
```

基板の既定の配線（Grove コネクタ）で DMX を初期化します。
この時点ではまだ何も送りません。
配線を変えたい場合は [DMX モジュール](#dmx-モジュール)を使います。

### Board::DMX#start

すべてのチャンネルを0にしてから、送信を始めます。

> `start` はチャンネルを0に戻します。値を設定するのは `start` のあとにしてください。
{: .tip}

### Board::DMX#stop

すべてのチャンネルを0にし、それが照明に届くのを待ってから送信を止めます。

照明は信号が届かなくなっても最後の値を保つので、送信を止めるだけでは点いたままになります。
`stop` はそれを避けるために、消灯を確かめてから止めます。

### Board::DMX#set(channel, value)

```ruby
dmx.set(6, 255)
dmx[6] = 255      # 同じ意味
```

1つのチャンネルに値を書きます。`channel` は 1 から 512、`value` は 0 から 255 です。
範囲の外を指定した場合は何も起きません。

### Board::DMX#set_range(channel, values)

```ruby
dmx.set_range(1, [pan, tilt, 0, 0, 0, dimmer])
```

`channel` から順に、配列の値を書きます。
1台で複数のチャンネルを使う照明に便利です。

### Board::DMX#get(channel)

```ruby
dmx.get(6)   #=> 255
dmx[6]       # 同じ意味
```

チャンネルにいま書かれている値を返します。

### Board::DMX#blackout

すべてのチャンネルを0にします。次のフレームで照明が消えます。
送信は続くので、値を書けばまた点きます。

### Board::DMX#keepalive

デッドマンスイッチに、プログラムが動いていることを知らせます。
主ループから毎回呼んでください。くわしくは[デッドマンスイッチ](#デッドマンスイッチ)をご覧ください。

### Board::DMX#deadman_ms=(ms)

```ruby
dmx.deadman_ms = 1000
dmx.deadman_ms = 0      # 無効にする
```

`keepalive` が途切れてから照明を消すまでの時間をミリ秒で指定します。
既定は 500 ミリ秒で、`0` にすると無効になります。

### Board::DMX#active_slots=(count)

送信するチャンネル数を 1 から 512 で指定します。
使っているチャンネルの数まで減らすと、フレームとフレームの間隔が空きます。

### Board::DMX#frame_count

`start` してから送信したフレームの数を返します。
1秒あたり約40増えるので、実際の送信レートを確かめられます。

## デッドマンスイッチ

照明は、信号が届かなくなっても最後に受け取った値を保ち続けます。
そのためプログラムが止まってしまうと、照明が点いたままになってしまいます。

これを防ぐために、エンジンにはデッドマンスイッチが組み込まれています。
`keepalive` がしばらく呼ばれないと、エンジンがすべてのチャンネルを0にして照明を消します。

```ruby
loop do
  dmx.keepalive
  # ここで値を変える
  sleep_ms 10
end
```

待ち時間は `deadman_ms=` で変えられます。既定は 500 ミリ秒です。
`keepalive` を再び呼ぶと、Ruby で設定した値がまた反映されるようになります。

この仕組みはエンジンの側だけで動くので、Ruby が止まっていても働きます。

## DMX モジュール

`Board::DMX` は `DMX` モジュールを使いやすくしたものです。
`set` や `keepalive` などは `DMX` にも同じ名前と引数であります（`DMX.set(6, 255)` のように書きます）。
`DMX` を直接使うのは、配線を変えたいときです。

### DMX.init(unit:, txd_pin:)

```ruby
DMX.init                                       # 基板の既定の配線を使う
DMX.init(unit: :RP2040_UART1, txd_pin: 20)
```

UART を DMX512 用に初期化します。引数を省略すると基板の既定の配線になります。
`txd_pin` には、その UART で TX に使えるピンを指定してください。
確保した DMA チャンネルの番号を返します。

通信速度（250000 baud、8ビット、パリティなし、ストップビット2）は規格で決まっているので変えられません。

`Board::DMX.new` は、このメソッドを引数なしで呼んでいます。

### DMX.stop と DMX.shutdown

`DMX.stop` は送信を止めるだけです。照明は最後の値を保ったままなので、点いていれば点いたままになります。

`DMX.shutdown` は消灯してから送信を止めます。`Board::DMX#stop` が呼んでいるのはこちらです。

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
