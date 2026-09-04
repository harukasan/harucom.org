---
layout: doc
title: プログラミングリファレンス
permalink: /docs/reference/
lang: ja
ref: docs-reference
---

Harucom で使える Ruby API のリファレンスです。

## 目次

- [Harucom API](#harucom-api)
  - [DVI モジュール](#dvi-モジュール)
  - [P5 描画ライブラリ](#p5-描画ライブラリ)
  - [Keyboard](#keyboard)
  - [InputMethod（日本語入力）](#inputmethod日本語入力)
  - [Boardモジュール（周辺機能）](#boardモジュール周辺機能)
    - [Board::PWMAudio（オーディオ）](#boardpwmaudioオーディオ)
    - [Board::Pad（ボタン入力）](#boardpadボタン入力)
    - [Board::DMX（DMX モジュールの制御）](#boarddmxdmx-モジュールの制御)
- [PicoRuby ライブラリ](#picoruby-ライブラリ)
  - [ファイルシステム](#ファイルシステム)
  - [データ形式](#データ形式)
  - [ハードウェア](#ハードウェア)
  - [システム](#システム)
  - [組み込みクラス](#組み込みクラス)
  - [Kernel](#kernel)
    - [puts](#putsargs)
    - [print](#printargs)
    - [p](#pargs)
    - [gets](#gets)
    - [getc](#getc)
    - [sleep](#sleepsec)
    - [sleep_ms](#sleep_msms)
    - [usleep](#usleepusec)
    - [require](#requirename)
    - [load](#loadpath)
    - [exit](#exitstatus--0)

## Harucom API

Harucom は画面の描画やキーボード入力、日本語入力、基板の周辺機能を扱うためのライブラリを備えています。

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


### Boardモジュール（周辺機能）

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

#### [Board::Pad（ボタン入力）](pad/)

基板に載っている8つのボタンを読み取る API です。

```ruby
require "board/pad"
pad = Board::Pad.new(Board::PAD0_PIN)
puts "up" if pad.read.up?
```

#### [Board::DMX（DMX モジュールの制御）](dmx/)

DMX512 の信号を出力して、舞台照明を制御する API です。

```ruby
require "board/dmx"
dmx = Board::DMX.new
dmx.start
dmx[6] = 255
```


## PicoRuby ライブラリ

Harucom は [PicoRuby](https://picoruby.org/) で動いています。

以下のライブラリが組み込まれています。
リンクの付いているものは、リンク先の PicoRuby または [mruby](https://mruby.org/) の
リファレンスに詳しい説明があります。

### ファイルシステム

| クラス | 説明 |
|--------|------|
| [File](https://mruby.org/docs/api/File.html) ([PicoRuby](https://picoruby.org/File.html)) | ファイルの読み書き |
| [File::Stat](https://picoruby.org/File_Stat.html) | ファイルの大きさや更新日時 |
| [Dir](https://mruby.org/docs/api/Dir.html) ([PicoRuby](https://picoruby.org/Dir.html)) | ディレクトリの操作 |
| [VFS](https://picoruby.org/VFS.html) | ファイルシステムのマウント |
| [Littlefs](https://picoruby.org/Littlefs.html) | フラッシュメモリのファイルシステム |

```ruby
File.open("/data.txt", "r") { |f| f.read(256) }
File.open("/data.txt", "w") { |f| f.write("hello") }
Dir.mkdir("/mydir")
```

ファイルの置き場所は[ファイルの入出力](../files/)をご覧ください。

### データ形式

| クラス | 説明 |
|--------|------|
| [JSON](https://picoruby.org/JSON.html) | JSON の読み書き |
| [YAML](https://picoruby.org/YAML.html) | YAML の読み書き |
| [Marshal](https://picoruby.org/Marshal.html) | Ruby オブジェクトのシリアライズ |
| [Base64](https://picoruby.org/Base64.html) | Base64 エンコード・デコード |
| [Base16](https://picoruby.org/Base16.html) | 16進文字列の変換 |

### ハードウェア

| クラス | 説明 |
|--------|------|
| [GPIO](https://picoruby.org/GPIO.html) | GPIO ピンの制御 |
| [ADC](https://picoruby.org/ADC.html) | アナログ入力の読み取り |
| [UART](https://picoruby.org/UART.html) | シリアル通信 <span class="badge-v2">2.0 から</span> |
| [PWM](https://picoruby.org/PWM.html) | PWM 出力 <span class="badge-v2">2.0 から</span> |
| [Watchdog](https://picoruby.org/Watchdog.html) | ウォッチドッグタイマー |

どのピンが何につながっているかは [Harucom Board](../harucom-board/#gpio-の割り当て)をご覧ください。

### システム

| クラス | 説明 |
|--------|------|
| [Machine](https://picoruby.org/Machine.html) | 起動からの経過時間、スリープ、再起動、個体の ID |
| [Time](https://picoruby.org/Time.html) | 時刻の取得・操作 |
| [Task](https://picoruby.org/Task.html) | タスクの生成と制御 |
| [Sandbox](https://picoruby.org/Sandbox.html) | Ruby のコードを別のタスクで実行する |
| [PicoRubyVM](https://picoruby.org/PicoRubyVM.html) | メモリの使用状況を調べる |
| [RNG](https://picoruby.org/RNG.html) | 乱数 |
| [ENV](https://picoruby.org/ENVClass.html) | 環境変数（[設定](../settings/)の内容が入ります） |
| [Logger](https://picoruby.org/Logger.html) | ログの出力 |
| [Editor](https://picoruby.org/Editor.html) | テキスト編集のバッファと、全角を数える文字幅の計算 |

### 組み込みクラス

| クラス | 説明 |
|--------|------|
| [String](https://mruby.org/docs/api/String.html) | 文字列 |
| [Array](https://mruby.org/docs/api/Array.html) | 配列 |
| [Hash](https://mruby.org/docs/api/Hash.html) | ハッシュ |
| [Integer](https://mruby.org/docs/api/Integer.html) | 整数 |
| [Float](https://mruby.org/docs/api/Float.html) | 浮動小数点数 |
| [Rational](https://mruby.org/docs/api/Rational.html) | 有理数 <span class="badge-v2">2.0 から</span> |
| [Math](https://github.com/mruby/mruby/blob/master/mrbgems/mruby-math/README.md) | 三角関数、平方根、対数などの数学関数 |
| [Range](https://mruby.org/docs/api/Range.html) | 範囲 |
| [Symbol](https://mruby.org/docs/api/Symbol.html) | シンボル |
| [Enumerable](https://mruby.org/docs/api/Enumerable.html) | `map` や `select` などの繰り返しの操作 |
| [Comparable](https://mruby.org/docs/api/Comparable.html) | 大小の比較 |
| [Proc](https://mruby.org/docs/api/Proc.html) | ブロックと lambda |
| [ObjectSpace](https://mruby.org/docs/api/ObjectSpace.html) | 生きているオブジェクトをたどる |
| [Regexp](https://picoruby.org/Regexp.html) | 正規表現 |
| [Data](https://picoruby.org/Data.html) | 値だけを持つクラスを作る |

### Kernel

Kernelモジュールは共通メソッドを定義していて、メソッドはクラスを書かずにそのまま呼べます。
mruby から受け継いだ `tap` や `then` は[mruby のリファレンス](https://mruby.org/docs/api/Kernel.html)にあります。

#### puts(*args)

```ruby
puts "hello"
```

`$stdout` に書き出して、最後に改行します。Harucom では画面に表示されます。

#### print(*args)

`$stdout` に書き出します。改行はつけません。

#### p(*args)

それぞれの引数を `inspect` して、1行ずつ書き出します。
引数が1つのときはその値を、複数のときは配列を返すので、式の途中に挟んで中身を覗けます。

#### gets

`$stdin` から1行読んで返します。読むものがなければ `nil` を返します。

#### getc

`$stdin` から1文字読んで返します。読むものがなければ `nil` を返します。

#### sleep(sec)

```ruby
sleep 1      # 1秒待つ
sleep 0.5    # 0.5秒待つ
```

指定した秒数だけ待ちます。小数も指定できます。
待っているあいだもほかのタスクは動くので、音の再生などは止まりません。

引数を省略すると、そのタスクは起こされるまで止まったままになります。
負の数を渡すと `ArgumentError` になります。

#### sleep_ms(ms)

```ruby
sleep_ms 100
```

指定したミリ秒だけ待ちます。`sleep` と同じく、待っているあいだはほかのタスクが動きます。

#### usleep(usec)

指定したマイクロ秒だけ待ちます。

#### require(name)

```ruby
require "p5"
```

ライブラリを読み込みます。`$LOAD_PATH`（既定は `["/lib"]`）から探すので、
`/lib` に置いたスクリプトは名前だけで読み込めます。
すでに読み込んでいるときは何もせずに `false` を返します。

#### load(path)

`require` と違って、読み込み済みでももう一度読み込みます。
書きかえたライブラリを試すときに使えます。

#### exit(status = 0)

プログラムを終了します。`SystemExit` を投げるので、アプリの中で呼ぶと IRB に戻ります。
