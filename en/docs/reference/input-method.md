---
layout: doc
title: InputMethod (Japanese Input)
permalink: /en/docs/reference/input-method/
lang: en
ref: docs-reference-input-method
---

Japanese input is handled by `InputMethod`. It is set up at boot as the global variable
`$ime`, so a program that draws its own screen only has to pass key input through it
to accept Japanese.

IRB and the text editor use it internally. For the key bindings themselves, see
[Japanese Input](../../japanese-input/).

## Contents

- [Getting Started](#getting-started)
  - [Processing Keys](#processing-keys)
  - [Displaying Uncommitted Text](#displaying-uncommitted-text)
- [InputMethod Methods](#inputmethod-methods)
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
- [The Dictionary](#the-dictionary)
  - [InputMethod.dict_available?](#inputmethoddict_available)
  - [InputMethod.skk_lookup](#inputmethodskk_lookupreading)
  - [InputMethod.tcode_lookup](#inputmethodtcode_lookupkey1-key2)
  - [The User Dictionary](#the-user-dictionary)
- [Constants](#constants)

## Getting Started

### Processing Keys

`InputMethod` sits between the keyboard and the program. Instead of using the key from
`$keyboard.read_char` directly, pass it to `$ime.process` and act on what comes back.

| Return value | Meaning | What the program does |
|--------------|---------|-----------------------|
| `:commit` | Text was committed | Take it with `take_committed` |
| `:consumed` | Composition in progress, the key was used up | Redraw the uncommitted text |
| `:passthrough` | Japanese input did not take the key | Handle it as an ordinary key |

While Japanese input is off, every key returns `:passthrough`.
The keys that turn it on and off (<kbd><kbd>Ctrl</kbd>-<kbd>J</kbd></kbd> and friends) are
handled inside `process`, so the program does not have to.

```ruby
text = ""

loop do
  key = $keyboard.read_char
  next unless key

  case $ime.process(key)
  when :commit
    text += $ime.take_committed
  when :consumed
    # Composing. The draw below repaints it
  when :passthrough
    break if key == Keyboard::ESCAPE
    text += key.to_s if key.printable?
  end

  draw(text)
end
```

### Displaying Uncommitted Text

Text that is not committed yet never reaches the screen on its own. Read `preedit`,
`candidates`, and `mode_label`, and draw them yourself. Nothing dictates where they go,
so pick what suits the screen.

```ruby
def draw(text)
  DVI::Text.clear(0xF0)
  DVI::Text.put_string(0, 0, text, 0xF0)

  # Draw the composition after the committed text, in its own color
  # (Editor.display_width counts a full-width character as two columns)
  preedit = $ime.preedit
  if preedit.bytesize > 0
    DVI::Text.put_string(Editor.display_width(text), 0, preedit, InputMethod::PREEDIT_ATTR)
  end

  # Put the candidate list on a row of its own
  if list = $ime.candidates
    line = ""
    i = 0
    while i < list.length
      line += "#{i + 1}:#{list[i]} "
      i += 1
    end
    DVI::Text.put_string(0, 2, line, InputMethod::CANDIDATE_ATTR)
  end

  # The current mode ([あ] and so on)
  label = $ime.mode_label
  DVI::Text.put_string(0, 4, label, 0xF0) if label

  DVI::Text.commit
end
```

## InputMethod Methods

### InputMethod#process(key)

```ruby
result = $ime.process(key)
```

Processes one key and returns `:commit`, `:consumed`, or `:passthrough`.
`key` is the [Keyboard::Key](../keyboard/#keyboardkey) that `Keyboard#read_char` returns.

During word registration even committed text returns `:consumed`, so nothing leaks into
the input. `:commit` arrives once, when the registration finishes.

### InputMethod#take_committed

```ruby
text = $ime.take_committed
```

Returns the committed text and empties the internal buffer. Call it once when `process`
returned `:commit`. A second call returns an empty string.

### InputMethod#preedit

Returns the text being composed but not committed yet, or an empty string when there is none.

A half-typed romaji `k`, a reading being prepared for conversion (`▽にほんご`), a conversion
in progress (`▼動*k`), and the `[登録: はるこむ] ...` of word registration all appear here.

### InputMethod#candidates

Returns the conversion candidates as an array of strings, or `nil` when none are shown.

### InputMethod#candidate_index

Returns the position of the selected candidate, counting from 0.

### InputMethod#mode_label

Returns a string for the current mode, or `nil` while Japanese input is off.

| Return value | Mode |
|--------------|------|
| `"[あ]"` | Hiragana (also shown while converting) |
| `"[ア]"` | Katakana |
| `"[Ａ]"` | Full-width ASCII |
| `"[漢]"` | T-Code |

### InputMethod#registering

Returns whether word registration is in progress.
Nothing reaches the input while it is, so a program can lay out its screen differently.

### InputMethod#reset
{: .since-v2}

```ruby
$ime.reset
```

Throws away the composition in progress: pending romaji, the reading being converted,
the candidates, and any word registration. Whether input is on, and which mode it is in,
stay as they were.

Use it where the buffer underneath changes — opening another file, for example — and a
half-typed composition must not follow into it.

### InputMethod#set_engine(name)

```ruby
$ime.set_engine(:skk)     # switch to SKK
$ime.set_engine(:tcode)   # switch to T-Code
$ime.set_engine(nil)      # turn Japanese input off
```

Switches the input method. Returns `true` when the switch happened and `false` when it
could not. Both methods read [the dictionary](#the-dictionary), so without one the call
returns `false`.

Anything half-typed is committed before the switch.

### InputMethod#cycle_engine

```ruby
$ime.cycle_engine
```

Cycles off → SKK → T-Code → off, skipping whatever is unavailable.
This is what <kbd><kbd>Ctrl</kbd>-<kbd>\\</kbd></kbd> does.

## The Dictionary

The dictionary used for kanji conversion is written to a flash region of its own, separate
from the firmware.

### InputMethod.dict_available?

```ruby
irb> InputMethod.dict_available?
=> true
```

Returns whether the dictionary is present in flash.
When it is `false`, neither SKK nor T-Code can be turned on.

### InputMethod.skk_lookup(reading)

```ruby
candidates = InputMethod.skk_lookup("にほん")
```

Takes a reading and returns the candidates as an array of strings, or `nil` when the
reading is not found. At most 32 candidates come back.

This reads the flash dictionary only. Words you registered yourself are not included.

### InputMethod.tcode_lookup(key1, key2)

```ruby
InputMethod.tcode_lookup(20, 25)
```

Returns the character assigned to a T-Code two-stroke sequence, or `nil` when nothing is
assigned to it.

`key1` and `key2` are stroke positions from 0 to 39: `1` through `0` are 0-9, `q` through
`p` are 10-19, `a` through `;` are 20-29, and `z` through `/` are 30-39.

### The User Dictionary

Words learned through registration are saved to `/data/skk-user-dict.txt`.
Their candidates come before those from the flash dictionary during conversion.

`InputMethod.skk_lookup` does not read this dictionary.

## Constants

| Constant | Value | Used for |
|----------|-------|----------|
| `InputMethod::PREEDIT_ATTR` | `0xA0` | Text being composed (bright green on black) |
| `InputMethod::CANDIDATE_ATTR` | `0xD0` | Conversion candidates (bright magenta on black) |

Both can be passed straight to `DVI::Text.put_string` as the attribute.

## Related Pages

- [Japanese Input](../../japanese-input/) — key bindings and switching input methods
- [Keyboard](../keyboard/) — reading key input
- [DVI Module](../dvi/) — drawing on screen
