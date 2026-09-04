---
layout: doc
title: Japanese Input
permalink: /en/docs/japanese-input/
lang: en
ref: docs-japanese-input
---

Harucom supports Japanese input. You can type Japanese at the IRB prompt and in the text editor
opened with `edit`.

Two input methods are available.

- **SKK** — type romaji to get kana, then convert to kanji. This is the one you will normally use.
- **T-Code** — type kanji directly with two-keystroke combinations.

## Contents

- [Switching Input Methods](#switching-input-methods)
- [Typing Japanese with SKK](#typing-japanese-with-skk)
  - [Typing Kana](#typing-kana)
  - [Converting to Kanji](#converting-to-kanji)
  - [Words with Okurigana](#words-with-okurigana)
  - [Registering Unknown Words](#registering-unknown-words)
- [Typing Kanji with T-Code](#typing-kanji-with-t-code)

## Switching Input Methods

| Key | Action |
|-----|--------|
| <kbd><kbd>Ctrl</kbd>-<kbd>J</kbd></kbd> | Turn SKK on (hiragana mode). Pressing it again in hiragana mode turns it off |
| <kbd><kbd>Ctrl</kbd>-<kbd>\\</kbd></kbd> | Cycle through the input methods (off → SKK → T-Code → off) |
| <kbd>半角/全角</kbd> | Toggle SKK on and off (JIS keyboards only) |
| <kbd>カタカナ/ひらがな</kbd> | Cycle hiragana → katakana → full-width ASCII (JIS keyboards only) |

While an input method is active, the current mode is shown at the bottom of the screen.

| Label | Mode |
|-------|------|
| `[あ]` | Hiragana |
| `[ア]` | Katakana |
| `[Ａ]` | Full-width ASCII |
| `[漢]` | T-Code |

When no label is shown, you are typing plain ASCII as usual.

> <kbd>半角/全角</kbd> and <kbd>カタカナ/ひらがな</kbd> exist only on JIS keyboards.
> On a US keyboard, use <kbd><kbd>Ctrl</kbd>-<kbd>J</kbd></kbd> instead.
> The keyboard layout can be changed in [Settings](../settings/).
{: .tip}

## Typing Japanese with SKK

Press <kbd><kbd>Ctrl</kbd>-<kbd>J</kbd></kbd>. The label `[あ]` appears and you are in hiragana mode.

### Typing Kana

Romaji turns into kana as you type.

```
nihongo   →  にほんご
kya       →  きゃ
nn        →  ん
```

These keys are available in kana mode.

| Key | Action |
|-----|--------|
| <kbd>q</kbd> | Switch between hiragana and katakana |
| <kbd>l</kbd> | Turn Japanese input off and return to ASCII |
| <kbd>L</kbd> | Switch to full-width ASCII mode |
| <kbd>Backspace</kbd> | Delete one character of the romaji being typed |

### Converting to Kanji

Start the word with a **capital letter** to begin a conversion.
The reading is shown with a `▽` in front of it.

```
Nihongo   →  ▽にほんご
```

Press <kbd>Space</kbd> when the reading is complete. The marker changes to `▼` and the
candidate list appears at the bottom of the screen.

| Key | Action |
|-----|--------|
| <kbd>Space</kbd> | Show the next candidate |
| <kbd>x</kbd> | Go back to the previous candidate (at the first one, return to the reading) |
| <kbd>Enter</kbd> | Accept the displayed candidate |
| <kbd>Esc</kbd> or <kbd><kbd>Ctrl</kbd>-<kbd>G</kbd></kbd> | Cancel the conversion and return to the reading |

Typing any other character accepts the current candidate and continues with that character.

Pressing <kbd>Enter</kbd> while in the `▽` state accepts the reading as it is, without converting.

### Words with Okurigana

For a word with okurigana, type the **first letter of the okurigana in capitals**.
The conversion starts right there, so there is no need to press <kbd>Space</kbd>.

```
Ugo       →  ▽うご
K         →  ▼動*k     (the conversion starts here)
u         →  動く       (the okurigana completes the word)
```

### Registering Unknown Words

When no candidate is found, the word registration mode starts.
`[登録: よみ]` appears, so type the word you want to register and press <kbd>Enter</kbd>.

```
[登録: はるこむ] Harucom
```

The word becomes available right away and is saved to `/data/skk-user-dict.txt`,
so it survives a power cycle.

To cancel the registration, press <kbd>Esc</kbd> or <kbd><kbd>Ctrl</kbd>-<kbd>G</kbd></kbd>.

## Typing Kanji with T-Code

T-Code types kanji directly with two keystrokes per character. There is no conversion step,
so you can write straight through without stopping.

Press <kbd><kbd>Ctrl</kbd>-<kbd>\\</kbd></kbd> while SKK is active to switch to T-Code. The label becomes `[漢]`.

The two keystrokes have to be typed within 0.5 seconds. After that, the first keystroke is
committed as a plain character. Keys that are not part of the T-Code layout are typed as
plain characters too.

## Related Pages

- [InputMethod (Japanese Input)](../reference/input-method/) — using Japanese input in your own program
- [Settings and Screen Zoom](../settings/) — changing the keyboard layout
- [Text Editor](../app/edit/) — Japanese can be typed in the editor too
