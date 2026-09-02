---
layout: doc
title: コマンド一覧
permalink: /docs/commands/
lang: ja
ref: docs-commands
---

Harucom には、ファイルを見たりコピーしたりするためのコマンドが用意されています。
IRB のプロンプトでコマンド名を入力すると実行できます。

```ruby
irb> ls
irb> cat hello.rb
```

コマンドの正体は `/app` に置かれた Ruby スクリプトです。
中身は `cat` で読めますし、自分でコマンドを作ることもできます。
くわしくは[ファイルの入出力](../files/)をご覧ください。

## 目次

- [ファイルを見る](#ファイルを見る)
- [ディレクトリを移動する](#ディレクトリを移動する)
- [ファイルを操作する](#ファイルを操作する)
- [ディレクトリを操作する](#ディレクトリを操作する)
- [その他のコマンド](#その他のコマンド)

## ファイルを見る

### ls — ファイルの一覧を見る

```ruby
irb> ls
irb> ls /app
irb> ls -l
```

いまいるディレクトリのファイルを一覧表示します。ディレクトリは色をつけて表示されます。
`-l` を付けると、パーミッション・サイズ・更新日時もあわせて表示します。

### cat — ファイルの中身を見る

```ruby
irb> cat hello.rb
irb> cat -n hello.rb
irb> cat file1.rb file2.rb
```

ファイルの中身をそのまま表示します。`-n` を付けると行番号が付きます。
複数のファイルを並べて指定すると、続けて表示します。

### head / tail — 先頭・末尾だけ見る

```ruby
irb> head hello.rb
irb> head -n 20 hello.rb
irb> tail hello.rb
```

`head` はファイルの先頭、`tail` は末尾を表示します。
どちらも既定では10行で、`-n` で行数を変えられます。

長いファイルの様子をすばやく確かめたいときに便利です。

## ディレクトリを移動する

### pwd — いまいるディレクトリを表示する

```ruby
irb> pwd
/
```

### cd — ディレクトリを移動する

```ruby
irb> cd /app
irb> cd ..
irb> cd
```

引数なしで実行するとルートディレクトリ `/` に移動します。

移動したあとは、`ls` や `cat`、`edit` にファイル名だけを渡せばそのディレクトリのファイルを指します。

```ruby
irb> cd /app
irb> cat ls.rb
```

## ファイルを操作する

### touch — 空のファイルを作る

```ruby
irb> touch memo.txt
```

### cp — ファイルをコピーする

```ruby
irb> cp hello.rb backup.rb
irb> cp hello.rb /data/
irb> cp -f hello.rb backup.rb
```

コピー先にディレクトリを指定すると、その中に同じ名前でコピーします。
すでに同じ名前のファイルがある場合は上書きしません。上書きするには `-f` を付けます。

### mv — ファイルを移動する・名前を変える

```ruby
irb> mv old.rb new.rb
irb> mv hello.rb /data/
irb> mv -f hello.rb existing.rb
```

使い方は `cp` と同じです。移動先がディレクトリなら、その中に移動します。

### rm — ファイルを消す

```ruby
irb> rm memo.txt
irb> rm file1.txt file2.txt
```

複数のファイルをまとめて指定できます。

> `/system.rb`、`/lib`、`/app`、`/etc` の中のファイルは、Harucom が起動するために必要です。
> これらは通常は消せないようになっています。どうしても消すときは `-f` を付けますが、
> 起動できなくなることがあります。
{: .tip}

## ディレクトリを操作する

### mkdir — ディレクトリを作る

```ruby
irb> mkdir data
irb> mkdir /data/photos
```

### rmdir — 空のディレクトリを消す

```ruby
irb> rmdir data
```

中にファイルが残っているディレクトリは消せません。先に `rm` でファイルを消してください。
`rm` と同じく、システムのディレクトリは `-f` を付けないと消せません。

## その他のコマンド

| コマンド | 説明 |
|----------|------|
| [`edit`](../getting-started/#テキストエディターでファイルを編集する) | テキストエディタでファイルを編集する |
| [`run`](../files/#スクリプトを実行する) | Ruby スクリプトを実行する |
| [`zoom`](../settings/#画面をズームする) | 画面の文字の大きさを変える |
| [`picorabbit`](../picorabbit/) | スライドを表示する |
| [`johakyu`](../johakyu/) | 音と照明のライブコーディングをする |

IRB そのものにも次のコマンドがあります。

| コマンド | 説明 |
|----------|------|
| `jobs` | 中断しているアプリがあるか確認する |
| `fg` | 中断しているアプリを再開する |
| `exit` | IRB を終了して起動し直す |

デモを試したい場合は[デモアプリ](../demos/)をご覧ください。
