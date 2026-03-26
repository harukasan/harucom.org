---
layout: doc
title: Keyboard Class
permalink: /en/docs/reference/keyboard/
lang: en
ref: docs-reference-keyboard
---

The Keyboard class provides an API for handling input from a USB keyboard.
It detects key presses and manages modifier key states (Ctrl, Shift, Alt, Super) and key repeat.

In normal Ruby scripts, use the pre-initialized Keyboard instance available as the global variable `$keyboard`.

## Table of Contents

- [Basic Usage](#basic-usage)
- [Keyboard Methods](#keyboard-methods)
  - [Reading Keys](#reading-keys)
  - [Key Lookup](#key-lookup)
- [Keyboard::Key](#keyboardkey)
  - [Key Information](#key-information)
  - [Modifier Key Detection](#modifier-key-detection)
  - [Key Conversion](#key-conversion)
  - [Key Comparison](#key-comparison)
- [Predefined Key Constants](#predefined-key-constants)
- [Modifier Key Constants](#modifier-key-constants)
- [Key Repeat](#key-repeat)

## Basic Usage

Use `$keyboard.read_char` to read one key input.
If no key has been pressed, it returns `nil`, so call it repeatedly in a loop.

```ruby
keyboard = $keyboard

loop do
  key = keyboard.read_char
  if key
    if key.printable?
      puts key.char
    elsif key == Keyboard::ENTER
      puts "(Enter was pressed)"
    elsif key == Keyboard::CTRL_C
      break
    end
  end
  DVI.wait_vsync
end
```

### Matching Keys with case

Using `Keyboard.key`, you can match any combination of key and modifiers in a case statement.

```ruby
keyboard = $keyboard

loop do
  key = keyboard.read_char
  if key
    case key
    when Keyboard::CTRL_Q
      break
    when Keyboard::CTRL_S
      save_file
    when Keyboard.key(:z, ctrl: true)
      undo
    when Keyboard.key(:z, ctrl: true, shift: true)
      redo
    when Keyboard::UP
      move_up
    when Keyboard::DOWN
      move_down
    else
      if key.printable?
        insert(key.char)
      end
    end
  end
  DVI.wait_vsync
end
```

---

## Keyboard Methods

### Reading Keys

#### Keyboard#read_char

```ruby
key = $keyboard.read_char  #=> Keyboard::Key or nil
```

Dequeues one key input from the queue and returns it as a `Keyboard::Key` object.
Returns `nil` if the queue is empty (non-blocking).

#### Keyboard#ctrl_c_pressed?

```ruby
if $keyboard.ctrl_c_pressed?
  puts "Interrupting"
end
```

Returns whether Ctrl+C has been pressed. The flag is automatically cleared after checking.
This does not consume from the queue, so it can be used independently of `read_char`.

### Key Lookup

#### Keyboard.key(name, ctrl: false, shift: false, alt: false, super_key: false)

```ruby
key = Keyboard.key(:a)
key = Keyboard.key(:a, ctrl: true)
```

Returns a `Keyboard::Key` object for the specified name and modifier combination.
Results are cached, so the same object is always returned for the same combination.

---

## Keyboard::Key

`Keyboard::Key` represents a single key input.
It holds the key name, character, and modifier key states.

### Key Information

#### Keyboard::Key#name

```ruby
key.name  #=> :a, :enter, :escape, etc.
```

Returns the key name as a symbol. Alphabetic keys are always lowercase.

#### Keyboard::Key#char

```ruby
key.char  #=> "a", "A", nil, etc.
```

Returns the character corresponding to the key. When Shift is held, returns uppercase or symbols.
Returns `nil` for keys without a character representation (such as Enter or arrow keys).

#### Keyboard::Key#printable?

```ruby
key.printable?  #=> true or false
```

Returns whether the key can be input as a character.
Returns `true` when `char` exists and Ctrl is not held.

### Modifier Key Detection

#### Keyboard::Key#ctrl?

```ruby
key.ctrl?  #=> true or false
```

Returns whether either Ctrl key (left or right) is held.

#### Keyboard::Key#shift?

```ruby
key.shift?  #=> true or false
```

Returns whether either Shift key (left or right) is held.

#### Keyboard::Key#alt?

```ruby
key.alt?  #=> true or false
```

Returns whether either Alt key (left or right) is held.

#### Keyboard::Key#super?

```ruby
key.super?  #=> true or false
```

Returns whether the Super (GUI/Windows/Command) key is held.

### Key Conversion

#### Keyboard::Key#to_s

```ruby
key.to_s  #=> "a" or nil
```

Returns the same value as `char`. Use this when treating the key as a character.

#### Keyboard::Key#to_buffer_input

```ruby
input = key.to_buffer_input  #=> "a", :ENTER, :BSPACE, nil, etc.
```

Converts to a format suitable for passing to an editor buffer.
Character keys return strings, special keys return symbols (`:ENTER`, `:BSPACE`, etc.).

#### Keyboard::Key#to_ansi

```ruby
key.to_ansi  #=> "\e[A" (for up arrow), etc.
```

Returns the ANSI escape sequence corresponding to the key.

### Key Comparison

#### Keyboard::Key#match?(name, ctrl: nil, shift: nil, alt: nil, super_key: nil)

```ruby
key.match?(:a)                    # Compare by name only (modifiers ignored)
key.match?(:a, ctrl: true)       # Is it Ctrl+A?
key.match?(:enter, shift: false) # Is it Enter without Shift?
```

Returns whether the key matches the specified conditions.
Omitting a modifier argument (`nil`) means that modifier's state is not checked.

The `==` operator can also be used for comparison with predefined key constants.

```ruby
key == Keyboard::CTRL_C   # Is it Ctrl+C?
key == Keyboard::ENTER    # Is it Enter?
```

---

## Predefined Key Constants

Commonly used key combinations are available as predefined constants.

### Ctrl Key Combinations

| Constant | Key |
|----------|-----|
| `Keyboard::CTRL_C` | Ctrl+C |
| `Keyboard::CTRL_D` | Ctrl+D |
| `Keyboard::CTRL_L` | Ctrl+L |
| `Keyboard::CTRL_Q` | Ctrl+Q |
| `Keyboard::CTRL_S` | Ctrl+S |
| `Keyboard::CTRL_Y` | Ctrl+Y |
| `Keyboard::CTRL_Z` | Ctrl+Z |

### Special Keys

| Constant | Key |
|----------|-----|
| `Keyboard::ENTER` | Enter |
| `Keyboard::ESCAPE` | Escape |
| `Keyboard::BSPACE` | Backspace |
| `Keyboard::TAB` | Tab |
| `Keyboard::DELETE` | Delete |
| `Keyboard::HOME` | Home |
| `Keyboard::END_KEY` | End |
| `Keyboard::UP` | Up arrow |
| `Keyboard::DOWN` | Down arrow |
| `Keyboard::LEFT` | Left arrow |
| `Keyboard::RIGHT` | Right arrow |
| `Keyboard::PAGEUP` | Page Up |
| `Keyboard::PAGEDOWN` | Page Down |

### Modifier Key Bitmasks

USB HID modifier key bitmasks.

| Constant | Value | Key |
|----------|-------|-----|
| `Keyboard::MOD_LEFTCTRL` | `0x01` | Left Ctrl |
| `Keyboard::MOD_LEFTSHIFT` | `0x02` | Left Shift |
| `Keyboard::MOD_LEFTALT` | `0x04` | Left Alt |
| `Keyboard::MOD_LEFTGUI` | `0x08` | Left Super |
| `Keyboard::MOD_RIGHTCTRL` | `0x10` | Right Ctrl |
| `Keyboard::MOD_RIGHTSHIFT` | `0x20` | Right Shift |
| `Keyboard::MOD_RIGHTALT` | `0x40` | Right Alt |
| `Keyboard::MOD_RIGHTGUI` | `0x80` | Right Super |
