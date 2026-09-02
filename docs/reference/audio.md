---
layout: doc
title: オーディオ
permalink: /docs/reference/audio/
lang: ja
ref: docs-reference-audio
---

Harucom Board はステレオの PWM オーディオ出力を備えていて、3.5mm ジャックにイヤホンやスピーカーをつなぐと音が鳴ります。

音は8チャンネルのミキサーで鳴らします。1つのチャンネルにつき、
波形（サイン波・矩形波・三角波・のこぎり波）か、WAV / QOA のサンプルを1つ鳴らせます。
音を作る処理は C 言語のエンジンが自動で行うので、Ruby からは値を変えるだけで済みます。

## 目次

- [基本的な使い方](#基本的な使い方)
- [チャンネルを操作する](#チャンネルを操作する)
- [音源](#音源)
  - [PWMAudio::Tone](#pwmaudiotone)
  - [PWMAudio::Sample](#pwmaudiosample)
  - [PWMAudio::Stream](#pwmaudiostream)
  - [サンプルバンク](#サンプルバンク)
- [時間を指定して鳴らす](#時間を指定して鳴らす)
- [定数](#定数)
- [Synth（音を作る）](#synth音を作る)

## 基本的な使い方

`Board::PWMAudio` を作ると音が出せるようになります。

```ruby
require "board/pwm_audio"

audio = Board::PWMAudio.new

# チャンネル0で440Hz（ラの音）を鳴らす
audio.tone(0, 440)
sleep 1
audio.stop(0)

audio.deinit
```

音階の定数も用意されています。

```ruby
A = Board::PWMAudio

audio.beep(0, A::C4, 200)   # ドを 200ms 鳴らす
audio.beep(0, A::E4, 200)
audio.beep(0, A::G4, 200)
```

ドラムの音はファイルとして `/data/drums` に入っています。

```ruby
audio = Board::PWMAudio.new

kick = PWMAudio::Sample.new(File.open("/data/drums/bd.wav", "r") { |f| f.read })
ch = audio.channel(3)
ch.source = kick
ch.play
```

## チャンネルを操作する

`Board::PWMAudio.new` は基板のオーディオピン（GPIO 24 / 25）を使ってオーディオを初期化します。
チャンネルは 0 から 7 までの8つです。

操作のしかたは2通りあります。チャンネル番号を渡す方法と、
`audio.channel(0)` で取り出したチャンネルオブジェクトを使う方法です。

```ruby
audio.tone(0, 440)           # 番号を渡す
audio.channel(0).tone(440)   # チャンネルオブジェクト
```

| 操作 | 番号を渡す | チャンネルオブジェクト |
|------|-----------|------------------------|
| 波形を鳴らす | `audio.tone(0, 440, waveform:, volume:)` | `ch.tone(440, waveform:, volume:)` |
| 止める | `audio.stop(0)` | `ch.stop` |
| 左右のバランス（0=左、8=中央、15=右） | `audio.pan(0, 8)` | `ch.pan = 8` |
| 消音する | `audio.mute(0, true)` | `ch.mute = true` |
| 音量（0〜15、既定は15） | — | `ch.volume = 12` |
| 音源を割り当てる | — | `ch.source = kick` |
| 音源を鳴らす | — | `ch.play` |

サンプルを鳴らすときはチャンネルオブジェクトを使います。

`audio` にはチャンネルによらないメソッドもあります。

| メソッド | 説明 |
|----------|------|
| `audio.beep(0, 440, 200)` | 指定した長さ（ミリ秒）だけ鳴らして止める。鳴り終わるまで待つ |
| `audio.stop_all` | すべてのチャンネルを止める |
| `audio.deinit` | オーディオ出力を停止して後始末をする |

波形は止めるまで鳴り続け、サンプルは最後まで鳴ると止まります。
音は数ミリ秒かけて消えるので、ぷつっというノイズは出ません。
消音してもチャンネルの設定はそのまま残ります。

## 音源

チャンネルには音源を1つ割り当てて鳴らします。音源は3種類あります。

```ruby
ch = audio.channel(0)
ch.source = PWMAudio::Tone.new(440)
ch.volume = 12
ch.play
```

### PWMAudio::Tone

```ruby
tone = PWMAudio::Tone.new(440, waveform: PWMAudio::SINE)
```

波形と周波数を表すオブジェクトです。チャンネルに割り当てて鳴らします。

### PWMAudio::Sample

```ruby
data = File.open("/data/drums/sd.wav", "r") { |f| f.read }
sample = PWMAudio::Sample.new(data)
```

WAV（16ビット PCM）または QOA のデータを渡すと、音源として使えます。
モノラルでもステレオでも構いません。形式はデータの中身から自動で判断します。

`samplerate`、`frames`、`channels` で情報を取得できます。

> QOA は WAV のおよそ5分の1のサイズになります。フラッシュメモリの容量を節約したいときに便利です。
{: .tip}

### PWMAudio::Stream

```ruby
song = audio.channel(7)
song.source = PWMAudio::Stream.new("/data/song.qoa")
song.play
```

フラッシュメモリ上のファイルを読みながら再生します。
メモリに収まらない長い曲でも鳴らせます。

再生中のファイルを書き換えないでください。ファイルの位置が変わり、音が壊れてしまいます。

### サンプルバンク

短い音をあらかじめ読み込んでおくと、1つのチャンネルで複数の音を鳴らし分けられます。

```ruby
audio.load_sample(0, File.open("/data/drums/hh.wav", "r") { |f| f.read })
audio.load_sample(1, File.open("/data/drums/oh.wav", "r") { |f| f.read })

now = audio.sample_clock
audio.play_at(now + 5000, 5, 14, 0)   # チャンネル5でスロット0を鳴らす
```

同じチャンネルに割り当てた音どうしは、あとから鳴らした音が前の音を止めます。
ハイハットのオープンとクローズのように、同時に鳴ってほしくない音に使います。

## 時間を指定して鳴らす

音を正確なタイミングで鳴らしたいときは、再生位置を指定して予約します。
`audio.sample_clock` は現在の再生位置をサンプル数で返します。
1秒あたり 50,000 増えるので、これを基準に未来の時刻を計算します。

```ruby
now = audio.sample_clock
audio.tone_at(now + 25_000, 0, 440)   # 0.5秒後に鳴らす
audio.stop_at(now + 50_000, 0)        # 1秒後に止める
```

| 操作 | 番号を渡す | チャンネルオブジェクト |
|------|-----------|------------------------|
| 波形を鳴らす | `audio.tone_at(at, 0, 440)` | `ch.tone_at(at, 440)` |
| 音源を鳴らす | `audio.play_at(at, 0, volume, slot)` | `ch.play_at(at)` |
| 止める | `audio.stop_at(at, 0)` | `ch.stop_at(at)` |
| 予約を取り消す | `audio.cancel_scheduled(0)` | `ch.cancel_scheduled` |

予約は32件までで、いっぱいのときは `false` を返します。
同じ音を鳴らし直すときは、古い停止予約が残らないよう先に取り消します。

> 予約は、少なくとも 2048 サンプル（約41ミリ秒）先を指定したときに正確なタイミングになります。
> それより近い時刻を指定すると、できるだけ早く（ただし少し遅れて）鳴ります。
{: .tip}

## 定数

| 定数 | 値 |
|------|-----|
| `Board::PWMAudio::SAMPLE_RATE` | 50000（1秒あたりのサンプル数） |
| `Board::PWMAudio::CHANNELS` | 8（チャンネル数） |
| `Board::PWMAudio::SINE` | サイン波 |
| `Board::PWMAudio::SQUARE` | 矩形波（既定） |
| `Board::PWMAudio::TRIANGLE` | 三角波 |
| `Board::PWMAudio::SAWTOOTH` | のこぎり波 |

音階は `C4` から `C6` までが定数として用意されています（`C4`、`CS4`、`D4`、… `B5`、`C6`）。
`CS4` はド♯、`DS4` はレ♯のように、`S` はシャープを表します。

## Synth（音を作る）

`Synth` は Ruby のコードから音そのものを作るライブラリです。
作った音は WAV のデータとして返るので、`PWMAudio::Sample` にそのまま渡せます。

```ruby
require "synth"

kick = PWMAudio::Sample.new(Synth.render(rate: 44100) {
  sweep(0.28, from: 160, to: 44, curve: 28, decay: 12) +
    noise(0.02, decay: 300).highpass(900) * 0.5
})

ch = audio.channel(0)
ch.source = kick
ch.play
```

ブロックの中では次の音のもとが使えます。

| メソッド | 音 |
|----------|-----|
| `sweep(seconds, from:, to:, curve:, decay:)` | 音程が変わっていくサイン波。バスドラムやタムに使う |
| `noise(seconds, decay:)` | ホワイトノイズ。スネアやハイハットのもとになる |
| `metallic(seconds, decay:, partials:)` | 金属的な音。ハイハットに使う |
| `silence(seconds)` | 無音 |

これらは `Synth::Buffer` という値になり、次の操作でつなげられます。

| 操作 | 説明 |
|------|------|
| `+` | 音を重ねる |
| `*` | 音量を変える |
| `highpass(cutoff)` / `lowpass(cutoff)` | 高い音 / 低い音だけ通す |
| `bandpass(center, q:)` | ある高さの音だけ通す |
| `env(decay, at:, cut:, level:)` | 音の減衰を付ける |
| `normalize(peak:)` | 音量をそろえる |
| `fade_tail(ms:)` | 終わりを滑らかに消す |

### ドラムキット

よく使うドラムの音はあらかじめ定義されています。

```ruby
require "synth"
require "synth/drum_kit"

snare = PWMAudio::Sample.new(Synth::DrumKit.render("sd"))
```

`bd`（バスドラム）、`sd`（スネア）、`hh`（ハイハット）、`oh`（オープンハイハット）、
`cp`（クラップ）、`lt`（ロータム）、`ht`（ハイタム）、`rim`（リムショット）が使えます。

同じ音は `/data/drums` に WAV としても入っているので、
そちらを読み込んだほうが速く鳴らせます。
