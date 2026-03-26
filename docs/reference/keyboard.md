---
layout: doc
title: Keyboard クラス
permalink: /docs/reference/keyboard/
lang: ja
ref: docs-reference-keyboard
---

Keyboard クラスは、USB キーボードからの入力を扱うための API を提供します。
キーの押下を検出し、修飾キー（Ctrl、Shift、Alt、Super）の状態やキーリピートを管理します。

通常の Ruby スクリプトでは、グローバル変数 `$keyboard` として
あらかじめ用意された Keyboard インスタンスを使います。

## 目次

- [基本的な使い方](#基本的な使い方)
- [Keyboard のメソッド](#keyboard-のメソッド)
  - [キーの読み取り](#キーの読み取り)
  - [キーの検索](#キーの検索)
- [Keyboard::Key](#keyboardkey)
  - [キーの情報](#キーの情報)
  - [修飾キーの判定](#修飾キーの判定)
  - [キーの変換](#キーの変換)
  - [キーの比較](#キーの比較)
- [定義済みキー定数](#定義済みキー定数)
- [修飾キーの定数](#修飾キーの定数)
- [キーリピート](#キーリピート)

## 基本的な使い方

`$keyboard.read_char` でキー入力を1つ読み取ります。
キーが押されていなければ `nil` が返るので、ループの中で繰り返し呼び出します。

```ruby
keyboard = $keyboard

loop do
  key = keyboard.read_char
  if key
    if key.printable?
      puts key.char
    elsif key == Keyboard::ENTER
      puts "(Enter が押されました)"
    elsif key == Keyboard::CTRL_C
      break
    end
  end
  DVI.wait_vsync
end
```

### case 文でキーを判定する

`Keyboard.key` を使うと、任意のキーと修飾キーの組み合わせで case 文のマッチができます。

```ruby
keyboard = $keyboard

loop do
  key = keyboard.read_char
  if key
    case key
    when Keyboard::CTRL_Q
      break
    when Keyboard::CTRL_S
      save_file
    when Keyboard.key(:z, ctrl: true)
      undo
    when Keyboard.key(:z, ctrl: true, shift: true)
      redo
    when Keyboard::UP
      move_up
    when Keyboard::DOWN
      move_down
    else
      if key.printable?
        insert(key.char)
      end
    end
  end
  DVI.wait_vsync
end
```

---

## メソッド一覧

### キーの読み取り

#### Keyboard#read_char

```ruby
key = $keyboard.read_char  #=> Keyboard::Key または nil
```

キューからキー入力を1つ取り出して `Keyboard::Key` オブジェクトとして返します。
キューが空の場合は `nil` を返します（ブロックしません）。

#### Keyboard#ctrl_c_pressed?

```ruby
if $keyboard.ctrl_c_pressed?
  puts "中断します"
end
```

Ctrl+C が押されたかどうかを返します。確認後、フラグは自動的にクリアされます。
キューからは消費しないため、`read_char` とは独立して使えます。

### キーの検索

#### Keyboard.key(name, ctrl: false, shift: false, alt: false, super_key: false)

```ruby
key = Keyboard.key(:a)
key = Keyboard.key(:a, ctrl: true)
```

指定した名前と修飾キーの組み合わせに対応する `Keyboard::Key` オブジェクトを返します。
結果はキャッシュされるため、同じ組み合わせに対しては常に同じオブジェクトが返ります。

---

## Keyboard::Key

`Keyboard::Key` はキー入力1つを表すオブジェクトです。
キーの名前、文字、修飾キーの状態などを持っています。

### キーの情報

#### Keyboard::Key#name

```ruby
key.name  #=> :a, :enter, :escape など
```

キーの名前をシンボルで返します。アルファベットは常に小文字です。

#### Keyboard::Key#char

```ruby
key.char  #=> "a", "A", nil など
```

そのキーに対応する文字を返します。Shift が押されている場合は大文字や記号になります。
Enter や矢印キーなど文字に対応しないキーでは `nil` を返します。

#### Keyboard::Key#printable?

```ruby
key.printable?  #=> true または false
```

文字として入力できるキーかどうかを返します。
`char` が存在し、Ctrl が押されていない場合に `true` になります。

### 修飾キーの判定

#### Keyboard::Key#ctrl?

```ruby
key.ctrl?  #=> true または false
```

Ctrl キー（左右どちらか）が押されているかどうかを返します。

#### Keyboard::Key#shift?

```ruby
key.shift?  #=> true または false
```

Shift キー（左右どちらか）が押されているかどうかを返します。

#### Keyboard::Key#alt?

```ruby
key.alt?  #=> true または false
```

Alt キー（左右どちらか）が押されているかどうかを返します。

#### Keyboard::Key#super?

```ruby
key.super?  #=> true または false
```

Super（GUI/Windows/Command）キーが押されているかどうかを返します。

### キーの変換

#### Keyboard::Key#to_s

```ruby
key.to_s  #=> "a" または nil
```

`char` と同じ値を返します。文字として扱いたいときに使います。

#### Keyboard::Key#to_buffer_input

```ruby
input = key.to_buffer_input  #=> "a", :ENTER, :BSPACE, nil など
```

エディタのバッファに渡せる形式に変換します。
文字キーは文字列、特殊キーはシンボル（`:ENTER`、`:BSPACE` など）を返します。

#### Keyboard::Key#to_ansi

```ruby
key.to_ansi  #=> "\e[A" (上矢印の場合) など
```

キーに対応する ANSI エスケープシーケンスを返します。

### キーの比較

#### Keyboard::Key#match?(name, ctrl: nil, shift: nil, alt: nil, super_key: nil)

```ruby
key.match?(:a)                    # 名前だけで比較（修飾キーは無視）
key.match?(:a, ctrl: true)       # Ctrl+A かどうか
key.match?(:enter, shift: false) # Shift なしの Enter かどうか
```

キーが指定した条件に一致するかどうかを返します。
修飾キーの引数を省略（`nil`）すると、その修飾キーの状態は問いません。

`==` 演算子でも比較できます。定義済みキー定数との比較に使えます。

```ruby
key == Keyboard::CTRL_C   # Ctrl+C かどうか
key == Keyboard::ENTER    # Enter かどうか
```

---

## 定義済みキー定数

よく使うキーの組み合わせがあらかじめ定数として用意されています。

### Ctrl キーの組み合わせ

| 定数 | キー |
|------|------|
| `Keyboard::CTRL_C` | Ctrl+C |
| `Keyboard::CTRL_D` | Ctrl+D |
| `Keyboard::CTRL_L` | Ctrl+L |
| `Keyboard::CTRL_Q` | Ctrl+Q |
| `Keyboard::CTRL_S` | Ctrl+S |
| `Keyboard::CTRL_Y` | Ctrl+Y |
| `Keyboard::CTRL_Z` | Ctrl+Z |

### 特殊キー

| 定数 | キー |
|------|------|
| `Keyboard::ENTER` | Enter |
| `Keyboard::ESCAPE` | Escape |
| `Keyboard::BSPACE` | Backspace |
| `Keyboard::TAB` | Tab |
| `Keyboard::DELETE` | Delete |
| `Keyboard::HOME` | Home |
| `Keyboard::END_KEY` | End |
| `Keyboard::UP` | 上矢印 |
| `Keyboard::DOWN` | 下矢印 |
| `Keyboard::LEFT` | 左矢印 |
| `Keyboard::RIGHT` | 右矢印 |
| `Keyboard::PAGEUP` | Page Up |
| `Keyboard::PAGEDOWN` | Page Down |

### 修飾キービットマスク

USB HID の修飾キービットマスクです。

| 定数 | 値 | キー |
|------|----|------|
| `Keyboard::MOD_LEFTCTRL` | `0x01` | 左 Ctrl |
| `Keyboard::MOD_LEFTSHIFT` | `0x02` | 左 Shift |
| `Keyboard::MOD_LEFTALT` | `0x04` | 左 Alt |
| `Keyboard::MOD_LEFTGUI` | `0x08` | 左 Super |
| `Keyboard::MOD_RIGHTCTRL` | `0x10` | 右 Ctrl |
| `Keyboard::MOD_RIGHTSHIFT` | `0x20` | 右 Shift |
| `Keyboard::MOD_RIGHTALT` | `0x40` | 右 Alt |
| `Keyboard::MOD_RIGHTGUI` | `0x80` | 右 Super |

