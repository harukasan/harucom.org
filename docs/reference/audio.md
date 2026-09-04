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
  - [チャンネルに音源を割り当てる](#チャンネルに音源を割り当てる)
  - [オーディオサンプルを鳴らす](#オーディオサンプルを鳴らす)
- [音を鳴らす](#音を鳴らす)
  - [Board::PWMAudio#tone](#boardpwmaudiotonechannel-frequency-waveform-volume)
  - [Board::PWMAudio#beep](#boardpwmaudiobeepchannel-frequency-duration_ms-waveform-volume)
  - [Board::PWMAudio#stop](#boardpwmaudiostopchannel)
  - [Board::PWMAudio#stop_all](#boardpwmaudiostop_all)
  - [Board::PWMAudio#pan](#boardpwmaudiopanchannel-value)
  - [Board::PWMAudio#mute](#boardpwmaudiomutechannel-flag)
  - [Board::PWMAudio#channel](#boardpwmaudiochannelindex)
  - [Board::PWMAudio#load_sample](#boardpwmaudioload_sampleslot-data)
  - [Board::PWMAudio#sample_clock](#boardpwmaudiosample_clock)
  - [Board::PWMAudio#tone_at](#boardpwmaudiotone_atat-channel-frequency-waveform-volume)
  - [Board::PWMAudio#play_at](#boardpwmaudioplay_atat-channel-volume-slot)
  - [Board::PWMAudio#stop_at](#boardpwmaudiostop_atat-channel)
  - [Board::PWMAudio#cancel_scheduled](#boardpwmaudiocancel_scheduledchannel)
  - [Board::PWMAudio#deinit](#boardpwmaudiodeinit)
- [チャンネルオブジェクトを使う](#チャンネルオブジェクトを使う)
  - [PWMAudio::Channel#source=](#pwmaudiochannelsourcesource)
  - [PWMAudio::Channel#source](#pwmaudiochannelsource)
  - [PWMAudio::Channel#play](#pwmaudiochannelplayvolume-slot)
  - [PWMAudio::Channel#play_at](#pwmaudiochannelplay_atat-volume-slot)
  - [PWMAudio::Channel#tone](#pwmaudiochanneltonefrequency-waveform-volume)
  - [PWMAudio::Channel#tone_at](#pwmaudiochanneltone_atat-frequency-waveform-volume)
  - [PWMAudio::Channel#stop](#pwmaudiochannelstop)
  - [PWMAudio::Channel#stop_at](#pwmaudiochannelstop_atat)
  - [PWMAudio::Channel#volume=](#pwmaudiochannelvolumevalue)
  - [PWMAudio::Channel#pan=](#pwmaudiochannelpanvalue)
  - [PWMAudio::Channel#mute=](#pwmaudiochannelmuteflag)
  - [PWMAudio::Channel#cancel_scheduled](#pwmaudiochannelcancel_scheduled)
  - [PWMAudio::Channel#index](#pwmaudiochannelindex)
- [音源](#音源)
  - [PWMAudio::Tone](#pwmaudiotone)
  - [PWMAudio::Sample](#pwmaudiosample)
  - [PWMAudio::Stream](#pwmaudiostream)
  - [サンプルバンク](#サンプルバンク)
- [時間を指定して鳴らす](#時間を指定して鳴らす)
- [定数](#定数)
- [Synth（音を作る）](#synth音を作る)
  - [ドラムキット](#ドラムキット)

## 基本的な使い方

### チャンネルを操作する

`Board::PWMAudio` を作ると音が出せるようになります。
基板のオーディオピン（GPIO 24 / 25）を使って初期化されます。

```ruby
require "board/pwm_audio"

audio = Board::PWMAudio.new

# チャンネル0で440Hz（ラの音）を鳴らす
audio.tone(0, 440)
sleep 1
audio.stop(0)

audio.deinit
```

チャンネルは 0 から 7 までの8つあります。
それぞれ別の音を鳴らせて、同時に鳴らすと重なって聞こえます。

```ruby
A = Board::PWMAudio

audio.beep(0, A::C4, 200)   # ドを 200ms 鳴らす
audio.beep(0, A::E4, 200)
audio.beep(0, A::G4, 200)
```

### チャンネルに音源を割り当てる
{: .since-v2}

`audio.channel(0)` でチャンネルオブジェクトを取り出すと、音源を割り当てて鳴らせます。

```ruby
ch = audio.channel(0)
ch.source = PWMAudio::Tone.new(440, waveform: PWMAudio::SINE)
ch.volume = 12
ch.play

sleep 1
ch.stop
```

音源には波形・サンプル・ストリームの3種類があります。
くわしくは[音源](#音源)をご覧ください。

### オーディオサンプルを鳴らす
{: .since-v2}

ドラムの音は WAV ファイルとして `/data/drums` に入っています。
読み込んで `PWMAudio::Sample` に渡すと、チャンネルで鳴らせます。

```ruby
kick = PWMAudio::Sample.new(File.open("/data/drums/bd.wav", "r") { |f| f.read })

ch = audio.channel(3)
ch.source = kick
ch.play
```

波形は止めるまで鳴り続け、サンプルは最後まで鳴ると止まります。
もう一度 `play` を呼ぶと、最初から鳴り直します。

## 音を鳴らす

`Board::PWMAudio` のメソッドは、チャンネル番号を渡して使います。手軽に音を鳴らしたいときはこちらです。

### Board::PWMAudio#tone(channel, frequency, waveform:, volume:)

```ruby
audio.tone(0, 440)
audio.tone(1, 880, waveform: Board::PWMAudio::SINE, volume: 10)
```

チャンネル（0〜7）で、指定した周波数（Hz）の波形を鳴らします。止めるまで鳴り続けます。

`waveform` には波形の[定数](#定数)を渡します。
`SINE`（サイン波）、`SQUARE`（矩形波）、`TRIANGLE`（三角波）、`SAWTOOTH`（のこぎり波）の4つがあり、
省略すると `SQUARE` になります。

`volume` は音量で、0（無音）から 15（最大）までの整数です。省略すると 15 になります。

### Board::PWMAudio#beep(channel, frequency, duration_ms, waveform:, volume:)

```ruby
audio.beep(0, 440, 200)
```

`duration_ms` ミリ秒のあいだ音を鳴らして、止めます。
鳴り終わるまで次の行には進みません。

### Board::PWMAudio#stop(channel)

```ruby
audio.stop(0)
```

チャンネルの音を止めます。波形でもサンプルでも止められます。
音量は数ミリ秒かけて下がるので、ぷつっというノイズは出ません。

### Board::PWMAudio#stop_all

すべてのチャンネルの音を止めます。

### Board::PWMAudio#pan(channel, value)

```ruby
audio.pan(0, 0)    # 左だけ
audio.pan(0, 8)    # 中央
audio.pan(0, 15)   # 右だけ
```

左右の音量のバランスを 0 から 15 の整数で指定します。0 が左、8 が中央、15 が右です。
ステレオのサンプルでは、反対側の音量を下げる形で働きます。

### Board::PWMAudio#mute(channel, flag)

```ruby
audio.mute(0, true)    # 消音する
audio.mute(0, false)   # 元に戻す
```

チャンネルの音を消します。周波数や音源などの設定はそのまま残るので、
戻すと続きから聞こえます。切り替えは数ミリ秒かけて行われます。

### Board::PWMAudio#channel(index)
{: .since-v2}

```ruby
ch = audio.channel(3)
```

チャンネル番号（0〜7）の [PWMAudio::Channel](#チャンネルオブジェクトを使う) を返します。
同じ番号からは、いつも同じオブジェクトが返ります。

> 1つのチャンネルを、番号を渡す方法とチャンネルオブジェクトの両方で操作するのは避けてください。
> 音を鳴らしているエンジンはどちらも同じなので、あとから呼んだほうで上書きされます。
{: .tip}

### Board::PWMAudio#load_sample(slot, data)
{: .since-v2}

```ruby
audio.load_sample(0, File.open("/data/drums/hh.wav", "r") { |f| f.read })
```

サンプルを[バンク](#サンプルバンク)のスロットに読み込みます。
`slot` は 0 から 15 までのスロットの番号、`data` は WAV か QOA のデータです。
範囲の外の番号や、WAV でも QOA でもないデータを渡すと `ArgumentError` になります。
その音を鳴らしている最中のスロットには読み込み直さないでください。

### Board::PWMAudio#sample_clock
{: .since-v2}

```ruby
now = audio.sample_clock
```

現在の再生位置をサンプル数で返します。
電源を入れてからの経過にあたる値で、1秒あたり 50,000 増えます。
[時間を指定して鳴らす](#時間を指定して鳴らす)ときの基準に使います。

### Board::PWMAudio#tone_at(at, channel, frequency, waveform:, volume:)
{: .since-v2}

```ruby
audio.tone_at(audio.sample_clock + 25_000, 0, 440)   # 0.5秒後に鳴らす
```

再生位置 `at` になったときに波形を鳴らすよう予約します。
`waveform` と `volume` は `tone` と同じです。
予約できたら `true`、予約がいっぱいのときは `false` を返します。

### Board::PWMAudio#play_at(at, channel, volume, slot)
{: .since-v2}

再生位置 `at` になったときに音源を鳴らすよう予約します。
`slot` を渡すと、チャンネルに割り当てた音源のかわりに[バンク](#サンプルバンク)の音を鳴らします。
`tone_at` と同じく、予約できたかどうかを返します。

### Board::PWMAudio#stop_at(at, channel)
{: .since-v2}

再生位置 `at` になったときに音を止めるよう予約します。
`tone_at` と同じく、予約できたかどうかを返します。

### Board::PWMAudio#cancel_scheduled(channel)
{: .since-v2}

そのチャンネルに残っている予約を取り消します。
同じ音を鳴らし直すときは、古い停止予約に切られないよう先に呼びます。

### Board::PWMAudio#deinit

オーディオ出力を停止して後始末をします。

## チャンネルオブジェクトを使う
{: .since-v2}

`Board::PWMAudio#channel(index)` が返すのが `PWMAudio::Channel` です。
音源を割り当てて鳴らすときはこちらを使います。

チャンネル番号を渡す必要がないほかは、同じ名前のメソッドは
[音を鳴らす](#音を鳴らす)のものと同じ動きをします。

### PWMAudio::Channel#source=(source)

```ruby
ch.source = kick
```

チャンネルに[音源](#音源)を割り当てます。まだ鳴りません。
サンプルとストリームはこの時点でエンジンに渡され、波形は鳴らすときに渡されます。

### PWMAudio::Channel#source

割り当てている音源を返します。まだ割り当てていなければ `nil` です。

### PWMAudio::Channel#play(volume:, slot:)

```ruby
ch.play
ch.play(volume: 10)
ch.play(slot: 0)
```

割り当てた音源を鳴らします。
波形は止めるまで鳴り続け、サンプルとストリームは最初から鳴って最後で止まります。
鳴っている最中に呼ぶと、最初から鳴り直します。

`volume` を省略すると、そのチャンネルの `volume` が使われます。
`slot` を渡すと、割り当てた音源のかわりに[バンク](#サンプルバンク)の音を鳴らします。

### PWMAudio::Channel#play_at(at, volume:, slot:)

再生位置 `at` になったときに音源を鳴らすよう予約します。

### PWMAudio::Channel#tone(frequency, waveform:, volume:)

```ruby
ch.tone(440)
```

波形を割り当てて、すぐに鳴らします。

### PWMAudio::Channel#tone_at(at, frequency, waveform:, volume:)

再生位置 `at` になったときに波形を鳴らすよう予約します。

### PWMAudio::Channel#stop

音を止めます。

### PWMAudio::Channel#stop_at(at)

再生位置 `at` になったときに音を止めるよう予約します。

### PWMAudio::Channel#volume=(value)

```ruby
ch.volume = 12
```

音量を 0 から 15 の整数で指定します。既定は 15 です。
`play` で音量を指定しなかったときに使われます。

### PWMAudio::Channel#pan=(value)

```ruby
ch.pan = 8
```

左右の音量のバランスを 0 から 15 の整数で指定します。0 が左、8 が中央、15 が右です。

### PWMAudio::Channel#mute=(flag)

```ruby
ch.mute = true
```

チャンネルの音を消します。設定はそのまま残ります。

### PWMAudio::Channel#cancel_scheduled

このチャンネルに残っている予約を取り消します。

### PWMAudio::Channel#index

チャンネル番号を返します。

## 音源
{: .since-v2}

音源は3種類あります。どれもチャンネルに割り当てて鳴らします。

### PWMAudio::Tone

```ruby
PWMAudio::Tone.new(440)
PWMAudio::Tone.new(440, waveform: PWMAudio::SINE)
```

波形と周波数を表すオブジェクトです。`frequency` と `waveform` で内容を取得できます。

### PWMAudio::Sample

```ruby
PWMAudio::Sample.new(data)
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
メモリに収まらない長い曲でも鳴らせます。扱える形式は `PWMAudio::Sample` と同じです。

再生中のファイルを書き換えないでください。ファイルの位置が変わり、音が壊れてしまいます。

### サンプルバンク

短い音をあらかじめ読み込んでおくと、1つのチャンネルで複数の音を鳴らし分けられます。

```ruby
audio.load_sample(0, File.open("/data/drums/hh.wav", "r") { |f| f.read })
audio.load_sample(1, File.open("/data/drums/oh.wav", "r") { |f| f.read })

ch = audio.channel(5)
ch.play(slot: 0)
```

同じチャンネルに割り当てた音どうしは、あとから鳴らした音が前の音を止めます。
ハイハットのオープンとクローズのように、同時に鳴ってほしくない音に使います。

## 時間を指定して鳴らす
{: .since-v2}

拍に合わせて鳴らすときなど、正確なタイミングが必要な場面では、
`sleep` で待つかわりに再生位置を指定して予約します。

```ruby
now = audio.sample_clock
audio.tone_at(now + 25_000, 0, 440)   # 0.5秒後に鳴らす
audio.stop_at(now + 50_000, 0)        # 1秒後に止める
```

基準になるのが `sample_clock` で、1秒あたり 50,000 増えるサンプル数です。
そこに足した値が、鳴らしたい時刻になります。

予約できるメソッドは次の4つです。チャンネルオブジェクトにも同じ名前があります。

- [`tone_at`](#boardpwmaudiotone_atat-channel-frequency-waveform-volume) — 波形を鳴らす
- [`play_at`](#boardpwmaudioplay_atat-channel-volume-slot) — 音源を鳴らす
- [`stop_at`](#boardpwmaudiostop_atat-channel) — 止める
- [`cancel_scheduled`](#boardpwmaudiocancel_scheduledchannel) — 予約を取り消す

予約は32件までで、いっぱいのときは `false` が返ります。

> 予約は、少なくとも 2048 サンプル（約41ミリ秒）先を指定したときに正確なタイミングになります。
> それより近い時刻を指定すると、できるだけ早く（ただし少し遅れて）鳴ります。
{: .tip}

## 定数

| 定数 | 値 |
|------|-----|
| `Board::PWMAudio::SAMPLE_RATE` <span class="badge-v2">2.0 から</span> | 50000（1秒あたりのサンプル数） |
| `Board::PWMAudio::CHANNELS` <span class="badge-v2">2.0 から</span> | 8（チャンネル数） |
| `Board::PWMAudio::NUM_BANKS` <span class="badge-v2">2.0 から</span> | 16（サンプルバンクのスロット数） |
| `Board::PWMAudio::SINE` | サイン波 |
| `Board::PWMAudio::SQUARE` | 矩形波（既定） |
| `Board::PWMAudio::TRIANGLE` | 三角波 |
| `Board::PWMAudio::SAWTOOTH` | のこぎり波 |

音階は `C4` から `C6` までが定数として用意されています（`C4`、`CS4`、`D4`、… `B5`、`C6`）。
`CS4` はド♯、`DS4` はレ♯のように、`S` はシャープを表します。

## Synth（音を作る）
{: .since-v2}

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
