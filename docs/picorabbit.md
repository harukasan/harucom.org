---
layout: doc
title: PicoRabbit
permalink: /docs/picorabbit/
lang: ja
ref: docs-picorabbit
---

# PicoRabbit

PicoRabbit は Rubyist 用のプレゼンツール [Rabbit](https://rabbit-shocker.org) にインスパイアされたプレゼンテーションツールです。
Markdown で書いたスライドを画面に表示して、キーボードで操作できます。

## 目次

- [基本的な使い方](#基本的な使い方)
- [スライドの書き方](#スライドの書き方)
  - [フロントマター](#フロントマター)
  - [スライドの区切り](#スライドの区切り)
  - [テキスト](#テキスト)
  - [リスト](#リスト)
  - [引用](#引用)
  - [コードブロック](#コードブロック)
  - [画像](#画像)
  - [テキストの配置](#テキストの配置)
  - [アニメーション](#アニメーション)
- [キーボード操作](#キーボード操作)
- [テーマ](#テーマ)
- [タイマー](#タイマー)

## 基本的な使い方

Markdown ファイルを用意して、`picorabbit` コマンドで起動します。

```
picorabbit slides.md
```

### スライドファイルの例

```markdown
---
title: My First Presentation
author: Harucom
---

# About Me

- Name: Harucom
- Hobby: Programming

# What I Want to Do

I want to give a presentation on **Harucom**!

> Do big things with a tiny computer

{::wait/}

Can I do it?
```

## スライドの書き方

### Frontmatter

ファイルの先頭に YAML 形式でプレゼンテーションの情報を書けます。

```yaml
---
title: Presentation Title
subtitle: Subtitle
author: Your Name
theme: dark
allotted_time: 15
---
```

| 項目 | 説明 |
|------|------|
| `title` | プレゼンのタイトル（タイトルスライドに表示されます） |
| `subtitle` | サブタイトル |
| `author` | 発表者の名前 |
| `theme` | テーマ名（`default` または `dark`） |
| `allotted_time` | 持ち時間（分）。指定するとタイマーが表示されます |

`title` を指定すると、最初にタイトルスライドが自動的に作られます。

### スライドの区切り

`#` 見出しが新しいスライドの始まりになります。見出しのテキストがそのスライドのタイトルとして表示されます。

```markdown
# The first slide

This is the first slide.

## The second slide

This is the second slide.

### The third slide

This is the third slide.
```

### テキスト

普通のテキストはそのまま表示されます。インライン書式として太字とインラインコードが使えます。

```markdown
This is a plain text.

You can **bold** text for emphasis.

You can write `inline code` like this.
```

### リスト

箇条書きと番号付きリストが使えます。箇条書きはインデントで入れ子にできます。

```markdown
- Item 1
- Item 2
  - Nested item

1. Do this first
2. Then do this
```

### 引用

`>` で引用を書けます。左側にラインが表示されます。

```markdown
> This is a quote
```

### コードブロック

バッククォート3つで囲むとコードブロックになります。背景色付きで表示されます。

````markdown
```
def hello
  puts "Hello!"
end
```
````

### 画像

BMP 画像を表示できます（8ビット RGB332 形式）。

```markdown
![alt text](/data/image.bmp)
```

### テキストの配置

`{:.center}` や `{:.right}` を要素の後に書くと、テキストの配置を変えられます。

```markdown
Centring the text
{:.center}

Right-aligning the text
{:.right}
```

### アニメーション

`{::wait/}` を書くと、そこでスライドの表示が一時停止します。
右矢印キーや Enter を押すと、続きが表示されます。

```markdown
# 段階的に表示する

まずこれが見えます。

{::wait/}

次にこれが見えます。

{::wait/}

最後にこれが見えます。
```

1つのスライドに `{::wait/}` を複数書くと、キーを押すたびに次の部分が表示されます。

---

## キーボード操作

| キー | 動作 |
|------|------|
| 右矢印、PageDown、Enter、Space | 次のスライド（アニメーションがあれば次のステップ） |
| 左矢印、PageUp、Backspace | 前のスライド（アニメーションがあれば前のステップ） |
| Home | 最初のスライドに移動 |
| End | 最後のスライドに移動 |
| 上矢印 | ジャンプ（タイマーが有効なとき、うさぎがジャンプします） |
| Escape、Ctrl+Q | プレゼンテーションを終了 |

---

## テーマ

フロントマターの `theme` でテーマを選べます。

| テーマ名 | 説明 |
|----------|------|
| `default` | 明るい背景のテーマ（初期値） |
| `dark` | 暗い背景のテーマ |

---

## タイマー

フロントマターに `allotted_time` を指定すると、画面下部にタイマーが表示されます。
値は持ち時間を分単位で指定します。

```yaml
---
allotted_time: 15
---
```

タイマーが有効なとき、画面下部にうさぎとかめのレースが表示されます。
うさぎが発表者のペース、かめが理想的なペースを表しています。
上矢印キーを押すとうさぎがジャンプします。
