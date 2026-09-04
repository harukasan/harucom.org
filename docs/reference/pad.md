---
layout: doc
title: Board::Pad（ボタン入力）
permalink: /docs/reference/pad/
lang: ja
ref: docs-reference-pad
---

Harucom Board には8つのタクタイルボタンが載っています。
`Board::Pad` を使うと、このボタンの押し具合を Ruby から読み取れます。
ゲームの操作や、キーボードをつながずに動かしたいときに使います。

ボタンは4つずつ2組に分かれていて、それぞれが1本の ADC ピンにつながっています。
抵抗の値を変えて並列につないでいるので、押したボタンの組み合わせによって
読み取れる電圧が変わるしくみです。

| 組 | GPIO | 定数 |
|----|------|------|
| 左側の4つ | GPIO 28 | `Board::PAD0_PIN` |
| 右側の4つ | GPIO 29 | `Board::PAD1_PIN` |

## 目次

- [基本的な使い方](#基本的な使い方)
- [メソッド一覧](#メソッド一覧)
- [ボタンの定数](#ボタンの定数)
- [同時押しとキャリブレーション](#同時押しとキャリブレーション)

## 基本的な使い方

```ruby
require "board/pad"

pad = Board::Pad.new(Board::PAD0_PIN)

loop do
  pad.read

  puts "右" if pad.right?
  puts "上" if pad.up?
  puts "下" if pad.down?
  puts "左" if pad.left?

  sleep_ms 50
end
```

`read` を呼ぶとその時点の状態を読み取ります。
そのあとに `right?` などで、どのボタンが押されているかを調べます。

2組をどちらも使うときは、それぞれに `Board::Pad` を作ります。

```ruby
left_pad  = Board::Pad.new(Board::PAD0_PIN)
right_pad = Board::Pad.new(Board::PAD1_PIN)
```

## メソッド一覧

### Board::Pad.new(pin, calibration:, max_buttons:)

```ruby
pad = Board::Pad.new(Board::PAD0_PIN)
```

ADC ピンを指定して作ります。
`calibration` と `max_buttons` は省略できます（[同時押しとキャリブレーション](#同時押しとキャリブレーション)）。

### Board::Pad#read

```ruby
pad.read
```

ボタンの状態を読み取って更新します。自分自身を返すので、続けて書けます。

```ruby
puts "上" if pad.read.up?
```

### Board::Pad#pressed?(button)

```ruby
pad.pressed?(Board::Pad::UP)   #=> true / false
```

指定したボタンが押されているかを返します。

### Board::Pad#right? / #up? / #down? / #left?

```ruby
pad.up?
```

`pressed?` を書きやすくしたものです。

### Board::Pad#raw

```ruby
pad.raw   #=> 2000
```

ADC が読み取った生の値（0〜4095）を返します。
どのボタンにも触れていないときは 4095 に近い値になります。

### Board::Pad#state

```ruby
pad.state   #=> 5
```

押されているボタンをビットで表した値を返します。
たとえば `5` は右（ビット0）と下（ビット2）が押されている状態です。

## ボタンの定数

| 定数 | 値 | 向き |
|------|-----|------|
| `Board::Pad::RIGHT` | 0 | 右 |
| `Board::Pad::UP` | 1 | 上 |
| `Board::Pad::DOWN` | 2 | 下 |
| `Board::Pad::LEFT` | 3 | 左 |

## 同時押しとキャリブレーション

1本の ADC ピンで4つのボタンを読んでいるため、同時に押した数が増えるほど
値の差が小さくなり、区別が難しくなります。
既定では2つまでの同時押しを見分けます。

```ruby
pad = Board::Pad.new(Board::PAD0_PIN, max_buttons: 3)
```

`calibration` には、それぞれのボタンを単独で押したときの生の値を
右・上・下・左の順に並べて渡します。既定値は `[2000, 2760, 3300, 3646]` です。
基板の個体差でうまく判定できないときは、`raw` で実際の値を確かめて渡し直してください。

```ruby
pad = Board::Pad.new(Board::PAD0_PIN, calibration: [1980, 2740, 3290, 3640])
```

ボタンの状態を確かめられる [pad_demo](../../demos/#pad_demo) が入っています。
