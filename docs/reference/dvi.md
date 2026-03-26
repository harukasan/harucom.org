---
layout: doc
title: DVI モジュール
permalink: /docs/reference/dvi/
lang: ja
ref: docs-reference-dvi
---

DVI モジュールは、DVI 出力の制御と画面描画のための低レベル API を提供します。

Harucom にはテキストモードとグラフィックスモードの2つの表示モードがあり、
グラフィックスモードではピクセル単位の描画や図形・テキストの描画ができます。

より手軽に描画したい場合は、DVI::Graphics をラップした [P5 描画ライブラリ](../p5/) を使います。

## 目次

- [基本的な使い方](#基本的な使い方)
- [DVI モジュールのメソッド](#dvi-モジュールのメソッド)
  - [DVI.set_mode](#dviset_modemode)
  - [DVI.wait_vsync](#dviwait_vsync)
  - [DVI.frame_count](#dviframe_count)
- [DVI::Text（テキストモード）](#dvitextテキストモード)
  - [文字の表示](#文字の表示)
  - [画面のクリア](#画面のクリア)
  - [スクロール](#スクロール)
  - [属性の操作](#属性の操作)
  - [行の読み書き](#行の読み書き)
  - [画面の反映](#画面の反映)
- [DVI::Graphics（グラフィックスモード）](#dvigraphicsグラフィックスモード)
  - [画面の制御](#画面の制御)
  - [ピクセル操作](#ピクセル操作)
  - [図形の描画](#図形の描画)
  - [線の描画](#線の描画)
  - [テキストの描画](#テキストの描画)
  - [画像の描画](#画像の描画)
  - [ブレンドモード](#ブレンドモード)
- [色の形式](#色の形式)
- [フォント一覧](#フォント一覧)

## 基本的な使い方

### テキストモード

```ruby
DVI.set_mode(DVI::TEXT_MODE)

# 画面をクリア（黒背景・白文字）
attr = (DVI::Text::WHITE << 4) | DVI::Text::BLACK
DVI::Text.clear(attr)

# 文字列を表示
DVI::Text.put_string(0, 0, "Hello, world!", attr)
DVI::Text.commit
```

### グラフィックスモード

```ruby
DVI.set_mode(DVI::GRAPHICS_MODE)

G = DVI::Graphics

# 画面を黒で塗りつぶす
G.fill(0x00)

# 赤い円を描く
G.fill_circle(160, 120, 50, 0xE0)

# テキストを描く
G.draw_text(10, 10, "Hello!", 0xFF, G::FONT_MPLUS_12)

G.commit
```

---

## DVI モジュールのメソッド

### DVI.set_mode(mode)

```ruby
DVI.set_mode(DVI::TEXT_MODE)
DVI.set_mode(DVI::GRAPHICS_MODE)
```

表示モードを切り替えます。切り替えは次の VBlank で反映されます。

| 定数 | モード |
|------|--------|
| `DVI::TEXT_MODE` | テキストモード（106桁 x 37行） |
| `DVI::GRAPHICS_MODE` | グラフィックスモード（640x480 または 320x240） |

### DVI.wait_vsync

```ruby
DVI.wait_vsync
```

次の VBlank（垂直帰線期間）まで待ちます。

### DVI.frame_count

```ruby
DVI.frame_count  #=> Integer
```

DVI 出力を開始してからのフレーム数を返します。約60フレーム/秒で増加します。

---

## DVI::Text（テキストモード）

テキストモードでは、106桁 x 37行の画面に文字を配置できます。
各セルには文字コードと属性（前景色・背景色）が設定されます。

### 画面サイズ

| 定数 | 値 |
|------|-----|
| `DVI::Text::COLS` | 106（桁数） |
| `DVI::Text::ROWS` | 37（行数） |

### 色の定数

属性の前景色・背景色には次の定数が使えます。

| 定数 | 色 |
|------|-----|
| `DVI::Text::BLACK` | 黒 |
| `DVI::Text::BLUE` | 青 |
| `DVI::Text::GREEN` | 緑 |
| `DVI::Text::CYAN` | シアン |
| `DVI::Text::RED` | 赤 |
| `DVI::Text::MAGENTA` | マゼンタ |
| `DVI::Text::BROWN` | 茶 |
| `DVI::Text::LIGHT_GRAY` | 明るい灰色 |
| `DVI::Text::DARK_GRAY` | 暗い灰色 |
| `DVI::Text::LIGHT_BLUE` | 明るい青 |
| `DVI::Text::LIGHT_GREEN` | 明るい緑 |
| `DVI::Text::LIGHT_CYAN` | 明るいシアン |
| `DVI::Text::LIGHT_RED` | 明るい赤 |
| `DVI::Text::LIGHT_MAGENTA` | 明るいマゼンタ |
| `DVI::Text::YELLOW` | 黄 |
| `DVI::Text::WHITE` | 白 |

### 属性の作り方

属性は1バイトの値で、上位4ビットが前景色、下位4ビットが背景色です。

```ruby
# 白い文字、黒い背景
attr = (DVI::Text::WHITE << 4) | DVI::Text::BLACK

# 黄色い文字、青い背景
attr = (DVI::Text::YELLOW << 4) | DVI::Text::BLUE
```

### 文字の表示

#### DVI::Text.put_char(col, row, ch, attr)

```ruby
DVI::Text.put_char(0, 0, 65, attr)  # 'A' を表示
```

(col, row) の位置に文字コード ch を属性 attr で配置します。

#### DVI::Text.put_string(col, row, str, attr)

```ruby
DVI::Text.put_string(0, 0, "Hello!", attr)
```

(col, row) の位置から UTF-8 文字列を属性 attr で表示します。
全角文字（日本語など）にも対応しています。

### 画面のクリア

#### DVI::Text.clear(attr)

```ruby
DVI::Text.clear(attr)
```

画面全体を指定した属性でクリアします。

#### DVI::Text.clear_line(row, attr)

```ruby
DVI::Text.clear_line(5, attr)
```

指定した行を属性 attr でクリアします。

#### DVI::Text.clear_range(col, row, width, attr)

```ruby
DVI::Text.clear_range(10, 5, 20, attr)
```

(col, row) の位置から width セルぶんを属性 attr でクリアします。

### スクロール

#### DVI::Text.scroll_up(lines, attr)

```ruby
DVI::Text.scroll_up(1, attr)
```

画面を lines 行ぶん上にスクロールします。下側にできた空き行は属性 attr で埋められます。

#### DVI::Text.scroll_down(lines, attr)

```ruby
DVI::Text.scroll_down(1, attr)
```

画面を lines 行ぶん下にスクロールします。上側にできた空き行は属性 attr で埋められます。

### 属性の操作

#### DVI::Text.get_attr(col, row)

```ruby
a = DVI::Text.get_attr(0, 0)
```

(col, row) の位置にあるセルの属性を返します。

#### DVI::Text.set_attr(col, row, attr)

```ruby
DVI::Text.set_attr(0, 0, attr)
```

(col, row) の位置にあるセルの属性を変更します。

### 行の読み書き

#### DVI::Text.read_line(row)

```ruby
line = DVI::Text.read_line(0)
```

指定した行の内容を `DVI::Text::Line` オブジェクトとして読み取ります。
スクロールバックバッファなどに使えます。

#### DVI::Text.write_line(row, line)

```ruby
DVI::Text.write_line(5, line)
```

`read_line` で読み取った `DVI::Text::Line` オブジェクトを指定した行に書き込みます。

### 画面の反映

#### DVI::Text.commit

```ruby
DVI::Text.commit
```

裏画面の内容を表画面に反映します。VBlank を待ってからコピーするため、
画面のちらつきが起きません。

---

## DVI::Graphics（グラフィックスモード）

グラフィックスモードでは、ピクセル単位で画面に描画できます。
色は RGB332 形式（1バイト）で指定します。

### 画面の制御

#### DVI::Graphics.width

```ruby
DVI::Graphics.width  #=> 640 または 320
```

フレームバッファの幅をピクセル数で返します。

#### DVI::Graphics.height

```ruby
DVI::Graphics.height  #=> 480 または 240
```

フレームバッファの高さをピクセル数で返します。

#### DVI::Graphics.set_resolution(width, height)

```ruby
DVI::Graphics.set_resolution(320, 240)  # 320x240 に切り替え
DVI::Graphics.set_resolution(640, 480)  # 640x480 に戻す
```

画面の解像度を切り替えます。指定できるのは 640x480（初期値）と 320x240 の2種類です。

#### DVI::Graphics.fill(color)

```ruby
DVI::Graphics.fill(0x00)  # 画面を黒で塗りつぶす
```

画面全体を指定した RGB332 カラーで塗りつぶします。

#### DVI::Graphics.commit

```ruby
DVI::Graphics.commit
```

VBlank を待ってから裏画面の内容を表画面にコピーして表示します。
1フレームぶんの描画が終わったあとに呼び出してください。

### ピクセル操作

#### DVI::Graphics.set_pixel(x, y, color)

```ruby
DVI::Graphics.set_pixel(100, 50, 0xFF)
```

(x, y) の位置のピクセルを指定した RGB332 カラーに設定します。

#### DVI::Graphics.get_pixel(x, y)

```ruby
c = DVI::Graphics.get_pixel(100, 50)
```

(x, y) の位置にあるピクセルの RGB332 カラー値を返します。
範囲外の場合は 0 を返します。

### 図形の描画

図形の描画メソッドには、塗りつぶし用（`fill_` ではじまるもの）と
輪郭線のみ（`draw_` ではじまるもの）の2種類があります。

#### DVI::Graphics.fill_rect(x, y, w, h, color)

```ruby
DVI::Graphics.fill_rect(10, 10, 100, 50, 0xE0)
```

(x, y) を左上の角として、幅 w、高さ h の塗りつぶした長方形を描きます。

#### DVI::Graphics.draw_rect(x, y, w, h, color)

```ruby
DVI::Graphics.draw_rect(10, 10, 100, 50, 0xFF)
```

(x, y) を左上の角として、幅 w、高さ h の長方形の輪郭を描きます。

#### DVI::Graphics.fill_circle(cx, cy, r, color)

```ruby
DVI::Graphics.fill_circle(160, 120, 50, 0xE0)
```

(cx, cy) を中心、r を半径とする塗りつぶした円を描きます。

#### DVI::Graphics.draw_circle(cx, cy, r, color)

```ruby
DVI::Graphics.draw_circle(160, 120, 50, 0xFF)
```

(cx, cy) を中心、r を半径とする円の輪郭を描きます。

#### DVI::Graphics.fill_ellipse(cx, cy, rx, ry, color)

```ruby
DVI::Graphics.fill_ellipse(160, 120, 80, 40, 0xE0)
```

(cx, cy) を中心、rx と ry をそれぞれ横と縦の半径とする塗りつぶした楕円を描きます。

#### DVI::Graphics.draw_ellipse(cx, cy, rx, ry, color)

```ruby
DVI::Graphics.draw_ellipse(160, 120, 80, 40, 0xFF)
```

(cx, cy) を中心とする楕円の輪郭を描きます。

#### DVI::Graphics.fill_triangle(x0, y0, x1, y1, x2, y2, color)

```ruby
DVI::Graphics.fill_triangle(100, 10, 50, 90, 150, 90, 0x1C)
```

3つの頂点を結ぶ塗りつぶした三角形を描きます。

#### DVI::Graphics.fill_arc(cx, cy, r, start_angle, stop_angle, color)

```ruby
DVI::Graphics.fill_arc(160, 120, 50, 0, Math::PI / 2, 0xE0)
```

塗りつぶした扇形を描きます。角度はラジアンで指定します（0 が右方向、PI/2 が下方向）。

#### DVI::Graphics.draw_arc(cx, cy, r, start_angle, stop_angle, color)

```ruby
DVI::Graphics.draw_arc(160, 120, 50, 0, Math::PI / 2, 0xFF)
```

扇形の輪郭を描きます。

### 線の描画

#### DVI::Graphics.draw_line(x0, y0, x1, y1, color)

```ruby
DVI::Graphics.draw_line(0, 0, 100, 100, 0xFF)
```

(x0, y0) から (x1, y1) へ線を引きます。

#### DVI::Graphics.draw_thick_line(x0, y0, x1, y1, thickness, color)

```ruby
DVI::Graphics.draw_thick_line(0, 0, 100, 100, 3, 0xFF)
```

太さ thickness ピクセルの線を引きます。

### テキストの描画

#### DVI::Graphics.draw_text(x, y, text, color, font = FONT_8X8, wide_font = nil)

```ruby
# 基本的な使い方
DVI::Graphics.draw_text(10, 10, "Hello!", 0xFF)

# フォントを指定
DVI::Graphics.draw_text(10, 10, "Hello!", 0xFF, DVI::Graphics::FONT_MPLUS_12)

# 日本語フォントも指定
DVI::Graphics.draw_text(10, 10, "こんにちは", 0xFF,
  DVI::Graphics::FONT_MPLUS_12, DVI::Graphics::FONT_MPLUS_J12)
```

(x, y) の位置に UTF-8 文字列を描画します。
第5引数にフォント、第6引数に全角文字用フォントを指定できます。

#### DVI::Graphics.text_width(text, font = FONT_8X8, wide_font = nil)

```ruby
w = DVI::Graphics.text_width("Hello!", DVI::Graphics::FONT_MPLUS_12)
```

文字列を描画したときの幅をピクセル数で返します（実際には描画しません）。

#### DVI::Graphics.font_height(font)

```ruby
h = DVI::Graphics.font_height(DVI::Graphics::FONT_MPLUS_12)
```

指定したフォントのグリフの高さをピクセル数で返します。

### 画像の描画

#### DVI::Graphics.draw_image(data, x, y, w, h)

```ruby
DVI::Graphics.draw_image(pixel_data, 10, 10, 32, 32)
```

RGB332 形式の画像データ（バイト列）を (x, y) の位置に描画します。
data の長さは w * h バイト以上が必要です。

#### DVI::Graphics.draw_image_masked(data, mask, x, y, w, h)

```ruby
DVI::Graphics.draw_image_masked(pixel_data, mask_data, 10, 10, 32, 32)
```

透過マスク付きで画像を描画します。
mask は 1bpp（1ビット/ピクセル）の透過マスクで、1 のビットが不透明、0 のビットが透明です。
mask の長さは (w * h + 7) / 8 バイト以上が必要です。

### ブレンドモード

#### DVI::Graphics.set_blend_mode(mode)

```ruby
DVI::Graphics.set_blend_mode(DVI::Graphics::BLEND_ADD)
```

ピクセルの合成方法を変更します。

| 定数 | 動作 |
|------|------|
| `DVI::Graphics::BLEND_REPLACE` | 上書き（初期値） |
| `DVI::Graphics::BLEND_ADD` | チャンネルごとに加算（飽和加算） |
| `DVI::Graphics::BLEND_SUBTRACT` | チャンネルごとに減算（飽和減算） |
| `DVI::Graphics::BLEND_MULTIPLY` | チャンネルごとに乗算 |
| `DVI::Graphics::BLEND_SCREEN` | チャンネルごとにスクリーン合成 |
| `DVI::Graphics::BLEND_ALPHA` | アルファブレンド（`set_alpha` で不透明度を設定） |

#### DVI::Graphics.set_alpha(alpha)

```ruby
DVI::Graphics.set_alpha(128)  # 半透明
```

`BLEND_ALPHA` モード時の不透明度（0〜255）を設定します。
0 で完全に透明、255 で完全に不透明になります。

---

## 色の形式

グラフィックスモードでは RGB332 形式（1バイト）で色を指定します。

```
ビット 7-5: 赤（0〜7）
ビット 4-2: 緑（0〜7）
ビット 1-0: 青（0〜3）
```

よく使う色の例:

| 値 | 色 |
|-----|------|
| `0x00` | 黒 |
| `0xFF` | 白 |
| `0xE0` | 赤 |
| `0x1C` | 緑 |
| `0x03` | 青 |
| `0xFC` | 黄 |

[P5 描画ライブラリ](p5.md) の `color(r, g, b)` メソッドを使うと、通常の RGB 値（0〜255）
から RGB332 に変換できます。

---

## フォント一覧

`DVI::Graphics` で使えるフォントの定数です。

| 定数 | 説明 |
|------|------|
| `FONT_8X8` | 8x8 等幅フォント |
| `FONT_MPLUS_12` | M+ 12px プロポーショナルフォント |
| `FONT_FIXED_4X6` | Misc-Fixed 4x6 等幅フォント |
| `FONT_FIXED_5X7` | Misc-Fixed 5x7 等幅フォント |
| `FONT_FIXED_6X13` | Misc-Fixed 6x13 等幅フォント |
| `FONT_SPLEEN_5X8` | Spleen 5x8 等幅フォント |
| `FONT_SPLEEN_8X16` | Spleen 8x16 等幅フォント |
| `FONT_SPLEEN_12X24` | Spleen 12x24 等幅フォント |
| `FONT_DENKICHIP` | DenkiChip 12px フォント（ASCII） |
| `FONT_MPLUS_J12` | M+ 12px 日本語フォント（JIS X 0208） |
| `FONT_DENKICHIP_J` | DenkiChip 12px 日本語フォント（JIS X 0208） |

日本語などの全角文字を表示するには、`draw_text` の wide_font 引数に
`FONT_MPLUS_J12` または `FONT_DENKICHIP_J` を指定します。
