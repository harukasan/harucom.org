---
layout: doc
title: デモアプリ
permalink: /docs/demos/
lang: ja
ref: docs-demos
---

Harucom には、機能を試すためのデモアプリがいくつか入っています。
IRB でアプリの名前を入力すると実行できます。

```ruby
irb> p5_demo
```

デモはすべて `/app` に置かれた Ruby スクリプトです。中身は `cat` で読めるので、
自分のプログラムを書くときの参考にもなります。

```ruby
irb> cat /app/p5_demo.rb
```

## 目次

- [グラフィックス](#グラフィックス)
- [音を鳴らす](#音を鳴らす)
- [ボタンを使う](#ボタンを使う)
- [照明を動かす](#照明を動かす)

## グラフィックス

### p5_demo

[P5 描画ライブラリ](../reference/p5/)の機能を順番に表示します。
背景・塗り・線・図形・文字・座標変換などを1つずつ描いていきます。

キーを押すと次のステップに進みます。<kbd>Esc</kbd> か <kbd><kbd>Ctrl</kbd>-<kbd>C</kbd></kbd> で終了します。

### p5_game_demo

P5 とキーボード入力を組み合わせた簡単なゲームです。
矢印キーで自機を動かし、星を集めると点数が増えます。

| キー | 動作 |
|------|------|
| <kbd>→</kbd> / <kbd>↑</kbd> / <kbd>←</kbd> / <kbd>↓</kbd> | 移動する |
| <kbd>Esc</kbd> または <kbd><kbd>Ctrl</kbd>-<kbd>C</kbd></kbd> | 終了する |

### text_demo

テキストモードで日本語を表示するデモです。
ひらがな・カタカナ・漢字、色つきの文字、太字、スクロールを順番に試します。

キーを押すと次のステップに進みます。

## 音を鳴らす

### audio_demo

USB キーボードをそのまま楽器にするデモです。画面にはキーボードの配列が表示され、
押しているキーが光ります。上の段が鍵盤、下の段がドラムパッドです。

| キー | 音 |
|------|-----|
| <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> <kbd>F</kbd> <kbd>G</kbd> <kbd>H</kbd> <kbd>J</kbd> <kbd>K</kbd> <kbd>L</kbd> <kbd>;</kbd> | 白鍵（ド・レ・ミ…） |
| <kbd>W</kbd> <kbd>E</kbd> <kbd>T</kbd> <kbd>Y</kbd> <kbd>U</kbd> <kbd>O</kbd> <kbd>P</kbd> | 黒鍵 |
| <kbd>Z</kbd> <kbd>X</kbd> <kbd>C</kbd> <kbd>V</kbd> <kbd>B</kbd> <kbd>N</kbd> <kbd>M</kbd> <kbd>,</kbd> | ドラム（バスドラム・スネア・ハイハットなど） |

鍵盤は3つまで同時に押せるので、和音も鳴らせます。

| キー | 動作 |
|------|------|
| <kbd>1</kbd> 〜 <kbd>4</kbd> | 音の波形を変える（サイン波・矩形波・三角波・のこぎり波） |
| <kbd>↑</kbd> / <kbd>↓</kbd> | オクターブを上げる / 下げる |
| <kbd>←</kbd> / <kbd>→</kbd> | 音程をずらす |
| <kbd>Esc</kbd> | 終了する |

音の鳴らしかたは[オーディオ](../reference/audio/)をご覧ください。

## ボタンを使う

### pad_demo

Harucom Board に付いている8つのボタンの状態を表示します。
押しているボタンが赤く光り、ADC の生の値もあわせて表示されます。

<kbd>Esc</kbd> か <kbd><kbd>Ctrl</kbd>-<kbd>C</kbd></kbd> で終了します。

ボタンをプログラムから読む方法は [Board::Pad](../reference/pad/) をご覧ください。

## 照明を動かす

DMX 対応の照明をつないだときに使えるデモです。
接続については [DMX モジュール](../reference/dmx/)をご覧ください。

### dmx_demo
{: .since-v2}

DMX のチャンネルをフェーダーで直接動かす、照明卓のようなアプリです。
`/data/dmx/fixtures` に置いた照明の定義ファイルを読み込むと、フェーダーに名前が付きます。

| キー | 動作 |
|------|------|
| <kbd>←</kbd> / <kbd>→</kbd> | フェーダーを選ぶ |
| <kbd>↑</kbd> / <kbd>↓</kbd> | 値を上げる / 下げる（Shift を押しながらだと1ずつ） |
| <kbd>PageUp</kbd> / <kbd>PageDown</kbd> | 値を16ずつ変える |
| <kbd>Home</kbd> / <kbd>End</kbd> | 最大 / 最小にする |
| <kbd>a</kbd> | 先頭のアドレスを変える |
| <kbd>c</kbd> | 選んでいるフェーダーのチャンネルを変える |
| <kbd>r</kbd> | 値の範囲を変える |
| <kbd><kbd>Ctrl</kbd>-<kbd>O</kbd></kbd> | 照明の定義ファイルを読み込む |
| <kbd>b</kbd> | すべて消灯する |
| <kbd>q</kbd> / <kbd>Esc</kbd> / <kbd><kbd>Ctrl</kbd>-<kbd>C</kbd></kbd> | 消灯して終了する |

### johakyu_demo
{: .since-v2}

音と照明を1つのパターンで動かす [Johakyu](../johakyu/) のデモです。
5つのプリセットが用意されていて、切り替えると次のサイクルの頭から新しいパターンに変わります。

| キー | 動作 |
|------|------|
| <kbd>1</kbd> 〜 <kbd>5</kbd> | プリセットを切り替える |
| <kbd>-</kbd> / <kbd>=</kbd> | テンポを下げる / 上げる |
| <kbd>[</kbd> / <kbd>]</kbd> | 音と照明のタイミングのずれを調整する |
| <kbd>q</kbd> / <kbd>Esc</kbd> | 終了する |
