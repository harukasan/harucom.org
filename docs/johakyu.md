---
layout: doc
title: Johakyu（ライブコーディング）
permalink: /docs/johakyu/
lang: ja
ref: docs-johakyu
---

Johakyu（序破急）は、音と照明をパターンで動かすライブコーディングの環境です。
[TidalCycles](https://tidalcycles.org/) や [Strudel](https://strudel.cc/) と同じ考え方で、
短いコードを書き換えながら演奏します。

画面の上半分には時計と DMX の状態が、下半分にはエディタが表示されます。
コードを書き換えて <kbd><kbd>Ctrl</kbd>-<kbd>Enter</kbd></kbd> を押すと、
音を止めずに、次のサイクル（1周の区切り）の頭から新しいパターンに切り替わります。

照明をつながずに、ドラムマシンとして音だけで使うこともできます。

## 目次

- [起動する](#起動する)
- [キー操作](#キー操作)
- [パターンを書く](#パターンを書く)
  - [トラック](#トラック)
  - [ミニ表記](#ミニ表記)
  - [音を鳴らす](#音を鳴らす)
  - [音程のある音を鳴らす](#音程のある音を鳴らす)
  - [パターンを変形する](#パターンを変形する)
  - [信号でなめらかに動かす](#信号でなめらかに動かす)
- [照明を動かす](#照明を動かす)
  - [照明を登録する](#照明を登録する)
  - [照明のパラメータ](#照明のパラメータ)
- [プログラムから使う](#プログラムから使う)

## 起動する

```ruby
irb> johakyu
irb> johakyu /data/myshow.rb
```

ファイル名を指定しないと、新しいバッファが開きます。
`/data/johakyu/starter.rb` があれば、その内容がひな形として読み込まれます。

音を鳴らすには 3.5mm ジャックにイヤホンやスピーカーをつないでください。
照明を動かす場合は [DMX モジュール](../reference/dmx/)の接続を先に済ませておきます。

## キー操作

| キー | 動作 |
|------|------|
| <kbd><kbd>Ctrl</kbd>-<kbd>Enter</kbd></kbd> | バッファを評価する（次のサイクルの頭から反映される） |
| <kbd><kbd>Ctrl</kbd>-<kbd>S</kbd></kbd> | 保存して評価する（名前がなければ聞かれます） |
| <kbd><kbd>Ctrl</kbd>-<kbd>O</kbd></kbd> | ファイルを開く |
| <kbd><kbd>Alt</kbd>-<kbd>1</kbd></kbd> 〜 <kbd><kbd>Alt</kbd>-<kbd>0</kbd></kbd> | シーンを切り替える（10個のバッファを行き来できます） |
| <kbd><kbd>Ctrl</kbd>-<kbd>B</kbd></kbd> | 照明をすべて消す |
| <kbd><kbd>Ctrl</kbd>-<kbd>Z</kbd></kbd> / <kbd><kbd>Ctrl</kbd>-<kbd>Y</kbd></kbd> | 元に戻す / やり直す |
| <kbd><kbd>Ctrl</kbd>-<kbd>Q</kbd></kbd> | 照明を消して終了する |

エディタは `edit` コマンドと同じで、シンタックスハイライトと自動インデント、
[日本語入力](../japanese-input/)が使えます。

> 書いたコードにまちがいがあっても、演奏は止まりません。
> エラーが出た場合はその評価が捨てられ、前のパターンがそのまま続きます。
{: .tip}

## パターンを書く

1周する長さの単位を「サイクル」と呼びます。テンポは `tempo` で決めます。

```ruby
tempo 120

track(:drums) { sound("bd ~ sd ~") }
```

これで「バスドラム・休み・スネア・休み」が1サイクルの中で等間隔に鳴ります。

### トラック

`track(:名前) { ... }` でパターンに名前を付けます。名前ごとに独立して差し替えられるので、
1つのトラックだけを書き換えたときは、ほかのトラックは何も影響を受けません。

```ruby
track(:drums) { sound("bd*4") }
track(:hats)  { sound("hh*8") }
```

`_track` にするとそのトラックだけ鳴らなくなります。消さずに一時的に止められます。

```ruby
_track(:hats) { sound("hh*8") }
```

評価するたびに、バッファに書かれている内容が全体の状態になります。
書いていないトラックは消えるので、バッファを空にして評価すればすべて止まります。

### ミニ表記

パターンは文字列で書きます。この書き方をミニ表記と呼びます。

| 書き方 | 意味 |
|--------|------|
| `bd ~ sd ~` | 順番に並べる（`~` と `-` は休み） |
| `bd*2` | その場所で2回鳴らす |
| `bd!3` | 3つ分の場所に並べる |
| `bd/2` | 2サイクルに1回鳴らす |
| `[bd hh]` | 1つの場所にまとめる |
| `<a b c>` | 1サイクルにつき1つずつ順番に使う |
| `bd, hh*4` | 同時に重ねる |
| `[c5,e5,g5]` | 1つの場所で重ねる（和音になる） |
| `bd:2` | サンプルの番号を指定する |
| `_` | 直前の音を伸ばす |

```ruby
track(:drums) { sound("bd*2 [~ sd] bd sd, hh*8") }
```

### 音を鳴らす

`sound` にドラムの名前を渡します。

| 名前 | 音 |
|------|-----|
| `bd` | バスドラム |
| `sd` | スネア |
| `hh` | ハイハット |
| `oh` | オープンハイハット |
| `cp` | クラップ |
| `lt` | ロータム |
| `ht` | ハイタム |
| `rim` | リムショット |

音は `/data/drums` の WAV が使われます。ファイルがない場合は、
[Synth](../reference/audio/#synth音を作る) がその場で音を作ります。

### 音程のある音を鳴らす

`note` を使うと音階のある音が鳴らせます。

```ruby
track(:lead) { note("c5 e5 [c5,e5,g5] ~").sound("saw").gain(0.6) }
```

`c5` が真ん中のド（262 Hz）です。`c#5` や `cs5` でシャープ、`eb5` でフラットになります。
数字を省くと5オクターブ目になります。

`.sound` で波形（`sine`、`square`、`tri`、`saw`）、`.gain` で音量（0〜1）を指定できます。
同時に鳴らせるのは3音までです。

### パターンを変形する

パターンにはメソッドをつなげて変化を付けられます。

| メソッド | 動作 |
|----------|------|
| `fast(n)` / `slow(n)` | 速くする / 遅くする |
| `rev` | 逆順にする |
| `every(n) { ... }` | n サイクルに1回だけ変形する |
| `euclid(pulses, steps)` | ユークリッドリズムにする |
| `degrade_by(amount)` | ときどき音を抜く |
| `segment(n)` | なめらかな値を n 個に区切る |
| `range(min, max)` | 値の範囲を変える |
| `add` / `sub` / `mul` / `div` | 値を計算する |

```ruby
track(:drums) { sound("bd*4").every(4) { |p| p.fast(2) } }
```

### 信号でなめらかに動かす

`sine`、`cosine`、`saw`、`isaw`、`tri`、`square_signal` は、
時間とともになめらかに変わる値です。音量や照明の動きに使います。

```ruby
track(:wash) { dmx(:s1).dimmer(sine.slow(4)) }
```

`range` で範囲を変えたり、`slow` でゆっくりにしたりできます。

## 照明を動かす

### 照明を登録する

使う照明を `fixture` で登録します。定義ファイルは `/data/dmx/fixtures` に置いた
[Open Fixture Library](https://open-fixture-library.org/) の JSON を使います。

```ruby
fixture :s1, "shehds_80w_led_spot_light", mode: "13ch", address: 1
fixture :s2, "shehds_80w_led_spot_light", mode: "13ch", address: 14
group :all, :s1, :s2
```

`group` で複数の照明をまとめると、いっぺんに動かせます。
照明の登録はスクリプトの先頭に書いてください。
`fixture` を書かなかった場合は、いま登録されている照明がそのまま残ります。

### 照明のパラメータ

`dmx(:名前)` に続けてパラメータを指定します。値は 0.0 から 1.0 で表します。

```ruby
track(:s1) { dmx(:s1).dimmer("0 1 1 1").color("<red blue green>") }
track(:move) { dmx(:all).pan(sine.range(0.3, 0.7).slow(8)) }
```

| パラメータ | 意味 |
|------------|------|
| `dimmer` | 明るさ |
| `color` | 色 |
| `pan` / `tilt` | 向き（左右 / 上下） |
| `strobe` | ストロボ |
| `gobo` | ゴボ（模様） |
| `focus` | フォーカス |
| `prism` | プリズム |
| `speed` | 動きの速さ |

どのパラメータが使えるかは照明の機種によります。定義ファイルに載っているものだけが使えます。

色などの名前も定義ファイルから読み込まれるので、`color(:red)` のように名前で指定できます。
値をそのまま指定したいときは `raw` を使います。

```ruby
dmx(:s1).raw(:pan, 200)
```

音のパターンに照明をつなげると、音に合わせて照明が動きます。

```ruby
track(:drums) { sound("bd*4").color("<red blue>") }
```

`spread` を使うと、グループの中で少しずつ値をずらせます。

```ruby
track(:chase) { dimmer("1 0").spread(0.5, on: :all) }
```

## プログラムから使う

`johakyu` アプリを使わずに、自分のプログラムからパターンを鳴らすこともできます。

```ruby
require "board/pwm_audio"
require "johakyu/dsl"

session = Johakyu::Session.new(audio: Board::PWMAudio.new, bpm: 120)
session.load_kit
session.bind_statement(:drums, Johakyu.sound("bd*4 , hh*8"))

loop do
  session.update
  sleep_ms 10
end
```

`session.update` は毎回のループで呼んでください。ここで音の予約と照明の書き込みが行われます。
照明も使う場合は `DMX.keepalive` もあわせて呼びます。
