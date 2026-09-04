---
layout: doc
title: InputMethod（日本語入力）
permalink: /docs/reference/input-method/
lang: ja
ref: docs-reference-input-method
---

日本語入力は `InputMethod` が受け持っています。起動したときにグローバル変数 `$ime` として
用意されているので、自分で画面を描くプログラムでも、キー入力をこれに通すだけで日本語が打てます。

IRB とテキストエディタは中でこれを使っています。キーの操作そのものは
[日本語を入力する](../../japanese-input/)をご覧ください。

## 目次

- [基本的な使い方](#基本的な使い方)
  - [キーを処理する](#キーを処理する)
  - [入力中の文字を表示する](#入力中の文字を表示する)
- [InputMethod のメソッド](#inputmethod-のメソッド)
  - [InputMethod#process](#inputmethodprocesskey)
  - [InputMethod#take_committed](#inputmethodtake_committed)
  - [InputMethod#preedit](#inputmethodpreedit)
  - [InputMethod#candidates](#inputmethodcandidates)
  - [InputMethod#candidate_index](#inputmethodcandidate_index)
  - [InputMethod#mode_label](#inputmethodmode_label)
  - [InputMethod#registering](#inputmethodregistering)
  - [InputMethod#reset](#inputmethodreset)
  - [InputMethod#set_engine](#inputmethodset_enginename)
  - [InputMethod#cycle_engine](#inputmethodcycle_engine)
- [辞書](#辞書)
  - [InputMethod.dict_available?](#inputmethoddict_available)
  - [InputMethod.skk_lookup](#inputmethodskk_lookupreading)
  - [InputMethod.tcode_lookup](#inputmethodtcode_lookupkey1-key2)
  - [ユーザー辞書](#ユーザー辞書)
- [定数](#定数)

## 基本的な使い方

### キーを処理する

`InputMethod` はキーボードとプログラムのあいだに入ります。
`$keyboard.read_char` で読んだキーをそのまま使うのではなく、`$ime.process` に渡してから、
返ってきた種類に応じて処理します。

| 戻り値 | 意味 | プログラムがすること |
|--------|------|----------------------|
| `:commit` | 文字が確定した | `take_committed` で受け取る |
| `:consumed` | 変換の途中で、キーを使い切った | 入力中の表示を描き直す |
| `:passthrough` | 日本語入力が受け取らなかった | ふつうのキーとして処理する |

日本語入力がオフのときは、いつも `:passthrough` が返ります。
オンとオフを切り替えるキー（<kbd><kbd>Ctrl</kbd>-<kbd>J</kbd></kbd> など）は `process` の中で
処理されるので、プログラム側で書く必要はありません。

```ruby
text = ""

loop do
  key = $keyboard.read_char
  next unless key

  case $ime.process(key)
  when :commit
    text += $ime.take_committed
  when :consumed
    # 変換中。下の draw で描き直す
  when :passthrough
    break if key == Keyboard::ESCAPE
    text += key.to_s if key.printable?
  end

  draw(text)
end
```

### 入力中の文字を表示する

確定していない文字は画面に出てきません。`preedit` と `candidates`、`mode_label` を読んで、
プログラムが自分で描きます。どこに出すかは決まっていないので、画面に合わせて選べます。

```ruby
def draw(text)
  DVI::Text.clear(0xF0)
  DVI::Text.put_string(0, 0, text, 0xF0)

  # 変換中の文字は、確定した文字の続きに別の色で出す
  # （Editor.display_width は全角の文字を2桁として数えます）
  preedit = $ime.preedit
  if preedit.bytesize > 0
    DVI::Text.put_string(Editor.display_width(text), 0, preedit, InputMethod::PREEDIT_ATTR)
  end

  # 変換の候補は別の行にまとめて出す
  if list = $ime.candidates
    line = ""
    i = 0
    while i < list.length
      line += "#{i + 1}:#{list[i]} "
      i += 1
    end
    DVI::Text.put_string(0, 2, line, InputMethod::CANDIDATE_ATTR)
  end

  # いまのモード（[あ] など）
  label = $ime.mode_label
  DVI::Text.put_string(0, 4, label, 0xF0) if label

  DVI::Text.commit
end
```

## InputMethod のメソッド

### InputMethod#process(key)

```ruby
result = $ime.process(key)
```

キーを1つ処理して、`:commit`・`:consumed`・`:passthrough` のどれかを返します。
`key` には `Keyboard#read_char` が返す [Keyboard::Key](../keyboard/#keyboardkey) を渡します。

単語登録の最中は、確定した文字も入力欄に漏れないよう `:consumed` になります。
登録が終わったときにまとめて `:commit` が返ります。

### InputMethod#take_committed

```ruby
text = $ime.take_committed
```

確定した文字列を返して、内部の入れ物を空にします。`:commit` が返ったときに一度だけ呼びます。
続けて呼ぶと、2回目からは空の文字列が返ります。

### InputMethod#preedit

入力の途中でまだ確定していない文字列を返します。何もなければ空の文字列です。

ローマ字を打っている最中の `k` や、変換の準備をしている `▽にほんご`、変換中の `▼動*k`、
単語登録中の `[登録: はるこむ] ...` がここに入ります。

### InputMethod#candidates

変換の候補を文字列の配列で返します。候補が出ていないときは `nil` です。

### InputMethod#candidate_index

いま選んでいる候補が何番目かを返します。数えはじめは 0 です。

### InputMethod#mode_label

いまのモードを表す文字列を返します。日本語入力がオフのときは `nil` です。

| 戻り値 | モード |
|--------|--------|
| `"[あ]"` | ひらがな（変換の準備や変換中もこの表示です） |
| `"[ア]"` | カタカナ |
| `"[Ａ]"` | 全角英字 |
| `"[漢]"` | T-Code |

### InputMethod#registering

単語登録の最中かどうかを返します。
登録中は入力欄に文字が渡らないので、画面の作りを変えたいときに使えます。

### InputMethod#reset
{: .since-v2}

```ruby
$ime.reset
```

入力の途中の状態を捨てます。打ちかけのローマ字、変換の準備をしている読み、候補、
単語登録がすべて消えます。オンとオフ、モードはそのままです。

編集するファイルを切り替えるときなど、書きかけの変換を次の画面に持ち込みたくない場面で使います。

### InputMethod#set_engine(name)

```ruby
$ime.set_engine(:skk)     # SKK に切り替える
$ime.set_engine(:tcode)   # T-Code に切り替える
$ime.set_engine(nil)      # 日本語入力をオフにする
```

入力方式を切り替えます。切り替えられたら `true`、切り替えられなければ `false` を返します。
どちらの方式も[辞書](#辞書)を使うので、辞書がないときは `false` になります。

切り替える前に、入力の途中だったものは確定します。

### InputMethod#cycle_engine

```ruby
$ime.cycle_engine
```

オフ → SKK → T-Code → オフ の順に切り替えます。使えない方式は飛ばします。
<kbd><kbd>Ctrl</kbd>-<kbd>\\</kbd></kbd> を押したときと同じ動きです。

## 辞書

漢字の変換に使う辞書は、ファームウェアとは別の領域としてフラッシュメモリに書き込まれています。

### InputMethod.dict_available?

```ruby
irb> InputMethod.dict_available?
=> true
```

辞書がフラッシュメモリに入っているかどうかを返します。
`false` のときは、SKK も T-Code もオンにできません。

### InputMethod.skk_lookup(reading)

```ruby
candidates = InputMethod.skk_lookup("にほん")
```

読みを渡すと、変換の候補を文字列の配列で返します。見つからなければ `nil` です。
返る候補は最大32件です。

これはフラッシュメモリの辞書だけを引きます。自分で登録した言葉は含まれません。

### InputMethod.tcode_lookup(key1, key2)

```ruby
InputMethod.tcode_lookup(20, 25)
```

T-Code の2打鍵に割り当てられた文字を返します。割り当てがなければ `nil` です。

`key1` と `key2` は打鍵の位置を表す 0 から 39 までの番号です。
`1` から `0` が 0〜9、`q` から `p` が 10〜19、`a` から `;` が 20〜29、`z` から `/` が 30〜39 になります。

### ユーザー辞書

単語登録で覚えた言葉は `/data/skk-user-dict.txt` に保存されます。
変換のときは、この辞書の候補がフラッシュメモリの辞書より先に出ます。

`InputMethod.skk_lookup` はこの辞書を見ません。

## 定数

| 定数 | 値 | 使いどころ |
|------|-----|-----------|
| `InputMethod::PREEDIT_ATTR` | `0xA0` | 入力中の文字（黒地に明るい緑） |
| `InputMethod::CANDIDATE_ATTR` | `0xD0` | 変換の候補（黒地に明るいマゼンタ） |

どちらも `DVI::Text.put_string` の属性としてそのまま渡せます。

## 関連ページ

- [日本語を入力する](../../japanese-input/) — キーの操作と入力方式の切り替え
- [Keyboard](../keyboard/) — キー入力の読み取り
- [DVI モジュール](../dvi/) — 画面への描画
