---
layout: doc
title: File I/O
permalink: /en/docs/files/
lang: en
ref: docs-files
---


## Reading and Writing Files

Harucom can save and load files on its flash memory.
Since programs and data are stored as files, they persist even after the power is turned off.

Use Ruby's `File` class to read and write files.

```ruby
# Write a file
File.open("/hello.txt", "w") { |f| f.write("Hello!") }

# Read a file
content = File.open("/hello.txt", "r") { |f| f.read(256) }
puts content
```

## Directory Structure

Harucom's flash memory has the following directories.

```
/
├── lib/          # Libraries
│   ├── console.rb
│   ├── irb.rb
│   ├── p5.rb
│   └── ...
├── app/          # Command scripts
│   ├── edit.rb
│   ├── run.rb
│   └── ...
├── etc/          # Settings
│   └── env.yml
├── data/         # Data files
│   ├── drums/
│   └── ...
└── system.rb     # Boot script
```

| Directory | Description |
|-----------|-------------|
| `/lib/` | A place for libraries. Scripts here can be loaded with `require`. |
| `/app/` | A place for command scripts. Scripts saved here can be run as commands from IRB. |
| `/etc/` | A place for settings. [Settings](../settings/) live in `env.yml` here. |
| `/data/` | Data files such as the drum samples. |
| `/system.rb` | A script that runs when Harucom starts up. |

You can place files in any directory on Harucom.
Feel free to save your own scripts and data files in the root directory `/`.

Changes to the system scripts persist across a power cycle.
A [firmware update](/en/flash/) writes the system files back to their defaults.
To return everything to the factory state, see
[formatting the filesystem](../settings/#formatting-the-filesystem).

## Running Scripts

Use the `run` command to execute any script.

```ruby
irb> run hello.rb
```

If you specify only a filename, it loads from the root directory `/`.
In this example, `/hello.rb` is executed.

You can also specify an absolute path including the directory.

```ruby
irb> run /home/script.rb
```

## Creating Command Scripts

Ruby scripts saved in the `/app` directory can be run directly as commands from IRB without using the `run` command.
For example, if you create `/app/hello.rb`, you can run it by simply typing `hello` in IRB.

```ruby
irb> edit /app/hello.rb
```

Enter the following code in the editor and save it.

```ruby
name = ARGV[0] || "World"
puts "Hello, #{name}!"
```

Return to IRB and run it as a command.

```ruby
irb> hello
Hello, World!

irb> hello Harucom
Hello, Harucom!
```

Arguments after the command name are available as `ARGV` inside the script.

Commands for working with files, such as `ls` and `cp`, are listed in [Commands](../commands/).
