---
layout: doc
title: テキストエディタ
permalink: /docs/app/edit/
lang: ja
ref: docs-app-edit
---

`edit` は Harucom に入っている全画面のテキストエディタです。
Ruby のスクリプトを書いたり、設定ファイルを直したりするのに使います。

## 目次

- [起動する](#起動する)
- [画面の見かた](#画面の見かた)
- [キー操作](#キー操作)
- [保存する](#保存する)
- [終了する](#終了する)
- [Ruby を書きやすくする機能](#ruby-を書きやすくする機能)

## 起動する

IRB のプロンプトで `edit` に続けてファイル名を入力します。

```ruby
irb> edit hello.rb
```

ファイルがなければ新しく作ります。ある場合はその内容を開きます。

パスを指定すると、そのファイルを開きます。

```ruby
irb> edit /app/hello.rb
```

`cd` でディレクトリを移動しているときは、ファイル名だけでそのディレクトリのファイルを開けます。

ファイル名を付けずに起動することもできます。この場合は保存するときに名前を聞かれます。

```ruby
irb> edit
```

## 画面の見かた

いちばん上の行はステータスバーです。ファイル名と、カーソルのある行と桁を表示します。

```
 hello.rb [+]  12:5
```

`[+]` は、まだ保存していない変更があることを表します。
ファイル名を付けずに起動した場合は `[untitled]` と表示されます。

いちばん下の行はコマンドバーで、よく使うキーが並んでいます。
[日本語入力](../../japanese-input/)がオンのときは、右端に `[あ]` のようなモードが表示されます。

```
 Ctrl-S:Save  Ctrl-Q:Quit  Ctrl-Z:Undo  Ctrl-Y:Redo                    [あ]
```

## キー操作

| キー | 動作 |
|------|------|
| <kbd><kbd>Ctrl</kbd>-<kbd>S</kbd></kbd> | 保存する |
| <kbd><kbd>Ctrl</kbd>-<kbd>Q</kbd></kbd> | 終了する |
| <kbd><kbd>Ctrl</kbd>-<kbd>Z</kbd></kbd> | 元に戻す |
| <kbd><kbd>Ctrl</kbd>-<kbd>Y</kbd></kbd> | やり直す |
| <kbd>→</kbd> / <kbd>↑</kbd> / <kbd>←</kbd> / <kbd>↓</kbd> | カーソルを移動する |
| <kbd>Home</kbd> / <kbd>End</kbd> | 行頭に移動する / 行末に移動する |
| <kbd>PageUp</kbd> / <kbd>PageDown</kbd> | ページスクロール |
| <kbd>Backspace</kbd> | カーソルの前の文字を消す |
| <kbd>Delete</kbd> | カーソルの位置の文字を消す |
| <kbd>Enter</kbd> | 改行する |

## 保存する

<kbd><kbd>Ctrl</kbd>-<kbd>S</kbd></kbd> で保存します。
保存するとステータスバーに `Saved hello.rb` と表示され、`[+]` が消えます。

ファイル名を付けずに起動した場合は、保存するときに名前を聞かれます。

```
 Save as: memo.txt
```

<kbd>Esc</kbd> を押すと保存をやめられます。

## 終了する

<kbd><kbd>Ctrl</kbd>-<kbd>Q</kbd></kbd> で終了して IRB に戻ります。

保存していない変更があるときは確認されます。

```
 Unsaved changes. Quit? (y/n):
```

<kbd>y</kbd> を押すと保存せずに終了し、<kbd>n</kbd> を押すと編集に戻ります。

## Ruby を書きやすくする機能

ファイル名が `.rb` で終わるときは、Ruby のコードを書きやすくするしくみが働きます。

### 色分け

文字列やキーワード、コメント、数値などが色分けして表示されます。
書きかけの `end` や閉じていない文字列にも気づきやすくなります。

### 自動インデント

`def` や `if`、`do` のあとで改行すると、字下げが自動で入ります。
`end` や `else` を打つと、その行の字下げが正しい位置に戻ります。

```ruby
def greet(name)
  puts "Hello, #{name}!"
end
```

### 日本語入力

<kbd><kbd>Ctrl</kbd>-<kbd>J</kbd></kbd> を押すと[日本語入力](../../japanese-input/)に切り替わります。
コメントや文字列に日本語を書けます。

## 関連ページ

- [コマンド](../../commands/) — `cat` や `cp` などのファイル操作
- [ファイルの入出力](../../files/) — ファイルの置き場所とスクリプトの実行
- [基本的な使い方](../../getting-started/) — はじめてのプログラムを書く
