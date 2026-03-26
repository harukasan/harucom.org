---
layout: doc
title: ファイルの入出力
permalink: /docs/files/
lang: ja
ref: docs-files
---


## ファイルの読み書き

Harucom はフラッシュメモリにファイルを保存したり読み込んだりできます。
プログラムやデータをファイルとして残しておけるので、電源を切っても消えません。

ファイルの読み書きには Ruby の `File` クラスを使います。

```ruby
# ファイルの書き込み
File.open("/hello.txt", "w") { |f| f.write("Hello!") }

# ファイルの読み込み
content = File.open("/hello.txt", "r") { |f| f.read(256) }
puts content
```

## ディレクトリ構造

Harucom のフラッシュメモリには以下のディレクトリがあります。

```
/
├── lib/          # ライブラリ
│   ├── console.rb
│   ├── irb.rb
│   ├── p5.rb
│   └── ...
├── app/          # コマンドスクリプト
│   ├── edit.rb
│   ├── run.rb
│   └── ...
└── system.rb     # 起動スクリプト
```

| ディレクトリ | 説明 |
|---|---|
| `/lib/` | ライブラリを置く場所です。ここにあるスクリプトは `require` で読み込めます。 |
| `/app/` | コマンドスクリプトを置く場所です。ここに保存したスクリプトは IRB からコマンドとして実行できます。 |
| `/system.rb` | Harucom の起動時に実行されるスクリプトです。 |

Harucom ではどのディレクトリにもファイルを配置できます。
ルートディレクトリ `/` に自分のスクリプトやデータファイルを自由に保存して構いません。

システムが使用するスクリプトは書換えても電源を入れ直すと初期化されます。

## スクリプトを実行する

`run` コマンドを使うことで任意のスクリプトを実行できます。

```ruby
irb> run hello.rb
```

ファイル名だけを指定すると、ルートディレクトリ `/` から読み込みます。
この例では `/hello.rb` が実行されます。

ディレクトリも含めて絶対パスで指定することもできます。

```ruby
irb> run /home/script.rb
```

## コマンドスクリプトを作成する

`/app` ディレクトリに保存した Ruby スクリプトは、`run` コマンドを使わなくても IRB からそのままコマンドとして実行できます。
たとえば `/app/hello.rb` を作成すると、IRB で `hello` と入力するだけで実行されます。

```ruby
irb> edit /app/hello.rb
```

エディタで以下のコードを入力して保存します。

```ruby
name = ARGV[0] || "World"
puts "Hello, #{name}!"
```

IRB に戻ってコマンドとして実行します。

```ruby
irb> hello
Hello, World!

irb> hello Harucom
Hello, Harucom!
```

コマンド名のあとの引数はスクリプト内で `ARGV` として受け取れます。
