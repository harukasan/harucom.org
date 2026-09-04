---
layout: doc
title: Commands
permalink: /en/docs/commands/
lang: en
ref: docs-commands
---

Harucom's IRB runs commands for looking at files and copying them.

```ruby
irb> ls
irb> cat hello.rb
```

These commands are Ruby scripts stored in `/app`.
You can print one with `cat`, or change it with the [`edit` command](../app/edit/).
See [File I/O](../files/) for details.

## Contents

- [Looking at Files](#looking-at-files)
- [Moving Around](#moving-around)
- [Working with Files](#working-with-files)
- [Working with Directories](#working-with-directories)
- [Other Commands](#other-commands)

## Looking at Files

### ls — List files

```ruby
irb> ls
irb> ls /app
irb> ls -l
```

Lists the files in the current directory.
Directories are shown in a different color from files.

### cat — Show the contents of a file

```ruby
irb> cat hello.rb
irb> cat -n hello.rb
irb> cat file1.rb file2.rb
```

Prints the file as it is.
`-n` numbers each line.
Several files given at once are printed one after another.

### head / tail — Show the beginning or the end

```ruby
irb> head hello.rb
irb> head -n 20 hello.rb
irb> tail hello.rb
```

`head` prints the beginning of a file and `tail` prints the end.
`-n` changes how many lines they show.

## Moving Around

### pwd — Print the current directory

```ruby
irb> pwd
/
```

### cd — Change directory

```ruby
irb> cd /app
irb> cd ..
irb> cd
```

Changes the directory you are working in, the current directory.
After moving, a plain file name passed to `ls`, `cat`, or `edit` refers to a file in that directory.

```ruby
irb> cd /app
irb> cat ls.rb
```

Running `cd` without an argument moves to the root directory `/`.

## Working with Files

### touch — Create an empty file

```ruby
irb> touch memo.txt
```

### cp — Copy a file

```ruby
irb> cp hello.rb backup.rb
irb> cp hello.rb /data/
irb> cp -f hello.rb backup.rb
```

When the destination is a directory, the file is copied into it under the same name.
An existing file is not overwritten unless you pass `-f`.

### mv — Move or rename a file

```ruby
irb> mv old.rb new.rb
irb> mv hello.rb /data/
irb> mv -f hello.rb existing.rb
```

This works like `cp`. A destination directory receives the file under the same name.

### rm — Delete files

```ruby
irb> rm memo.txt
irb> rm file1.txt file2.txt
```

Several files can be given at once.

> Harucom needs `/system.rb` and the files under `/lib`, `/app`, and `/etc` in order to boot,
> so these are protected. `-f` overrides the protection, but the board may stop booting.
{: .tip}

## Working with Directories

### mkdir — Create a directory

```ruby
irb> mkdir data
irb> mkdir /data/photos
```

### rmdir — Remove an empty directory

```ruby
irb> rmdir data
```

A directory that still holds files cannot be removed. Delete the files with `rm` first.
As with `rm`, system directories need `-f`.

## Other Commands

| Command | Description |
|---------|-------------|
| [`edit`](../app/edit/) | Edit a file in the text editor |
| [`run`](../files/#running-scripts) | Run a Ruby script |
| [`zoom`](../settings/#zooming-the-screen) | Change the text size on screen <span class="badge-v2">2.0</span> |
| [`picorabbit`](../picorabbit/) | Show slides |
| [`johakyu`](../johakyu/) | Live code sound and light <span class="badge-v2">2.0</span> |

IRB itself provides a few commands.

| Command | Description |
|---------|-------------|
| `jobs` | Show whether an app is suspended <span class="badge-v2">2.0</span> |
| `fg` | Resume the suspended app <span class="badge-v2">2.0</span> |
| `exit` | Quit IRB and start it again |

An app that supports it, such as `picorabbit`, stops and hands you back to IRB when you press
<kbd><kbd>Ctrl</kbd>-<kbd>Z</kbd></kbd> while it runs. Typing `fg` picks it up where it left off. <span class="badge-v2">2.0</span>

To try out the built-in demos, see [Demo Apps](../demos/).
