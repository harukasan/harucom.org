---
layout: doc
title: 基本的な使い方
permalink: /docs/getting-started/
lang: ja
ref: docs-getting-started
---

Harucom は電源を入れるとすぐに IRB（対話型 Ruby シェル）が起動します。USB キーボードとモニタを接続するだけで、Ruby プログラミングを始められます。

## 事前準備

Harucom を使うためには次のものが必要です。

* Harucom board (Harucom 本体)
* HDMI接続が可能なテレビやパソコンモニター
* HDMI ケーブル
* USB-C ケーブル
* USB-C が接続できる電源アダプター

> Harucom は 640x480px の解像度で画面を出力します。パソコンモニターは概ね対応していますが、テレビによっては対応していないことがあります。うまく映らない場合はお使いのテレビの取り扱い説明書を確認してみてください。
{: .tip}


## セットアップ

1. Harucom board の デジタルビデオ端子にモニタを接続する
2. USB-A ポートにキーボードを接続する
3. USB-C ポートに電源を接続する
4. (ついている場合) 電源スイッチをオンにする

電源を入れると、コンソール画面が表示され、IRB が起動します。
以下のような画面が表示されたら起動完了です！

```
Harucom OS 0.0.0 (888888)
(c) 2026 Shunsuke Michii

Powered by PicoRuby 3.4.1 on RP2350

くわしい使い方は https://harucom.org/ をごらんください

irb> ▊
```

## IRB (Interactive Ruby) の使い方

Harucom は起動すると対話型のRubyシェルであるIRBが起動します。
プロンプト `irb> ` が表示されたら、Ruby のコードを入力するだけでその式を実行することができます。

```ruby
irb> puts "Hello Harucom"
Hello Harucom
=> nil
irb> 5 + 3
=> 8
irb> _ * 2
=> 16
```

`_` で直前の結果を参照できます。

### 複数行入力

`def` や `if` などのブロック構文は改行すれば自動的に複数行入力になります。

```ruby
irb> def greet(name)
..     "Hello, #{name}!"
..   end
=> :greet

irb> greet("Harucom")
=> "Hello, Harucom!"
```

## LEDを光らせてみる

Harucom boardについてるLEDを光らせてみましょう。
下のプログラムを入力するとLEDがチカチカ点滅します。

```ruby
irb> led = GPIO.new(1, GPIO::OUT)
irb> loop do
..     led.write 1
..     sleep 1
..     led.write 0
..     sleep 1
..   end
```

> 実行を途中で止めるには <kbd title="CtrlキーとCキーを同時に押す"><kbd>Ctrl</kbd>-<kbd>C</kbd></kbd> を押します。
{: .tip}

### キーボードショートカット

| キー | 動作 |
|------|------|
| <kbd>Enter</kbd> | 入力したコードを実行する |
| <kbd><kbd>Ctrl</kbd>-<kbd>C</kbd></kbd> | 実行中のコードを中断する |
| <kbd>Backspace</kbd> | 文字を削除する |
| <kbd>→</kbd> / <kbd>↑</kbd> / <kbd>←</kbd> / <kbd>↓</kbd> | カーソルを移動する |
| <kbd>Home</kbd> / <kbd>End</kbd> | 行頭に移動する / 行末に移動する |
| <kbd>PageUp</kbd> / <kbd>PageDown</kbd> | ページスクロール |
| <kbd>Backspace</kbd> | 文字を削除する |

## テキストエディターでファイルを編集する

`edit` コマンドでテキストエディターを起動して、Ruby スクリプトをファイルに保存・編集できます。

```ruby
irb> edit hello.rb
```

### ショートカットキー

| キー | 動作 |
|------|------|
| <kbd><kbd>Ctrl</kbd>-<kbd>S</kbd></kbd> | 保存 |
| <kbd><kbd>Ctrl</kbd>-<kbd>Q</kbd></kbd> | 終了 |
| <kbd><kbd>Ctrl</kbd>-<kbd>Z</kbd></kbd> | 元に戻す |
| <kbd><kbd>Ctrl</kbd>-<kbd>Y</kbd></kbd> | やり直し |
| <kbd>→</kbd> / <kbd>↑</kbd> / <kbd>←</kbd> / <kbd>↓</kbd> | カーソルを移動する |
| <kbd>Home</kbd> / <kbd>End</kbd> | 行頭に移動する / 行末に移動する |
| <kbd>PageUp</kbd> / <kbd>PageDown</kbd> | ページスクロール |

エディタはステータスバーにファイル名と位置を表示し、未保存の変更がある場合は `[+]` が表示されます。

## はじめてのプログラム

エディタを使って `hello.rb` を作成してみましょう。

```ruby
irb> edit hello.rb
```

以下のコードを入力して Ctrl-S で保存、Ctrl-Q で終了します。

Harucom にはコンソールのような文字ベースの画面モードだけではなく、グラフィカルな表示ができるグラフィックモードがあります。
`P5` はHarucomに内蔵されている[Processing](https://processing.org)ライクな描画ライブラリです。

```ruby
require "p5"

p5 = P5.new

colors = [
  p5.color(255, 0, 0),
  p5.color(0, 255, 0),
  p5.color(0, 0, 255),
]

p5.background(0)

loop do
  p5.fill(colors[rand(3)])
  p5.circle(rand(p5.width), rand(p5.height), 10)
  p5.commit
  sleep_ms 100
end
```

IRB に戻って実行します。

```ruby
irb> run hello.rb
```

画面にたくさんの丸が表示されたら成功です。Ctrl-Cを押して実行を停止しましょう。

プログラムに問題があれば実行時にエラーが表示されます。
もう一度エディタで開いて内容がまちがってないか確認してみてください。

## ネクストステップ

* [ファイルを読み書きする](../files/)
* [プログラミングリファレンスを読む](../reference/)

