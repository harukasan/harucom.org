---
layout: doc
title: プログラミングリファレンス
permalink: /docs/reference/
lang: ja
ref: docs-reference
---

Harucom で使える Ruby API のリファレンスです。

## Harucom API

Harucom は画面の描画やキーボード入力、日本語入力、それに基板の周辺機能を扱うためのライブラリを備えています。

### [DVI モジュール](dvi/)

DVI 出力の制御と画面描画のための低レベル API です。
テキストモード（106桁 x 37行）とグラフィックスモード（640x480 / 320x240）の
2つの表示モードがあります。

```ruby
DVI.set_mode(DVI::GRAPHICS_MODE)
DVI::Graphics.fill_circle(160, 120, 50, 0xE0)
DVI::Graphics.commit
```

複雑な画面描画を行うには[P5 描画ライブラリ](p5/) を使うと便利です。


### [P5 描画ライブラリ](p5/)

Processingライクなインターフェースを提供する描画ライブラリです。
DVI::Graphics をラップして、塗りつぶし・線の色、座標変換、ブレンドモードなどを
扱いやすくまとめた API を提供します。

```ruby
require "p5"
p5 = P5.new
p5.fill(p5.color(255, 0, 0))
p5.circle(160, 120, 50)
p5.commit
```


### [Keyboard](keyboard/)

USB キーボードからの入力を扱う API です。
グローバル変数 `$keyboard` を通じてキー入力を取得できます。

```ruby
key = $keyboard.read_char
case key
when Keyboard::CTRL_Q then break
when Keyboard::ENTER  then puts "Enter"
end
```

### [InputMethod（日本語入力）](input-method/)

日本語入力を自分のプログラムから使う API です。
グローバル変数 `$ime` にキーを通すと、変換されて確定した文字列を受け取れます。

```ruby
text += $ime.take_committed if $ime.process(key) == :commit
```


### Board（基板の周辺機能）

Harucom Board に載っている周辺機能は `Board` モジュールにまとまっています。
使うときは `require` で読み込みます。

#### [Board::PWMAudio（オーディオ）](audio/)

PWM オーディオでの音の再生と、音そのものを作る Synth の API です。
8チャンネルのミキサーで、波形や WAV / QOA のサンプルを鳴らせます。

```ruby
require "board/pwm_audio"
audio = Board::PWMAudio.new
audio.beep(0, Board::PWMAudio::A4, 200)
```


#### [Board::DMX（DMX モジュールの制御）](dmx/)

DMX512 の信号を出力して、舞台照明を制御する API です。

```ruby
require "board/dmx"
dmx = Board::DMX.new
dmx.start
dmx[6] = 255
```


#### [Board::Pad（ボタン入力）](pad/)

基板に載っている8つのボタンを読み取る API です。

```ruby
require "board/pad"
pad = Board::Pad.new(Board::PAD0_PIN)
puts "上" if pad.read.up?
```


## PicoRuby ライブラリ

Harucom は [PicoRuby](https://picoruby.org/) で動いています。

以下の PicoRuby ライブラリが使えます。
詳しい使い方は各リンク先の PicoRuby リファレンスを参照してください。

### ファイルシステム

| クラス | 説明 |
|--------|------|
| [File](https://picoruby.org/File.html) | ファイルの読み書き |
| [Dir](https://picoruby.org/Dir.html) | ディレクトリの操作 |

```ruby
File.open("/data.txt", "r") { |f| f.read(256) }
File.open("/data.txt", "w") { |f| f.write("hello") }
Dir.mkdir("/mydir")
```

### データ形式

| クラス | 説明 |
|--------|------|
| [JSON](https://picoruby.org/JSON.html) | JSON の読み書き |
| [YAML](https://picoruby.org/YAML.html) | YAML の読み書き |
| [Marshal](https://picoruby.org/Marshal.html) | Ruby オブジェクトのシリアライズ |
| [Base64](https://picoruby.org/Base64.html) | Base64 エンコード・デコード |
| [Base16](https://picoruby.org/Base16.html) | 16進文字列の変換 |

### ハードウェア・システム

| クラス | 説明 |
|--------|------|
| [GPIO](https://picoruby.org/GPIO.html) | GPIO ピンの制御 |
| [Time](https://picoruby.org/Time.html) | 時刻の取得・操作 |
| [Watchdog](https://picoruby.org/Watchdog.html) | ウォッチドッグタイマー |
| [Math](https://picoruby.org/Math.html) | 数学関数 |

### 組み込みクラス

| クラス | 説明 |
|--------|------|
| [String](https://picoruby.org/String.html) | 文字列 |
| [Array](https://picoruby.org/Array.html) | 配列 |
| [Hash](https://picoruby.org/Hash.html) | ハッシュ |
| [Integer](https://picoruby.org/Integer.html) | 整数 |
| [Float](https://picoruby.org/Float.html) | 浮動小数点数 |
| [Kernel](https://picoruby.org/Kernel.html) | `puts`、`sleep` などの基本メソッド |

### require

```ruby
require "p5"   # $LOAD_PATH（デフォルト: ["/lib"]）から検索
```
