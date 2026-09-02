---
layout: doc
title: Commands
permalink: /en/docs/commands/
lang: en
ref: docs-commands
---

Harucom comes with commands for looking at files, copying them, and moving around the filesystem.
Type the command name at the IRB prompt to run it.

```ruby
irb> ls
irb> cat hello.rb
```

Commands are just Ruby scripts stored in `/app`.
You can read them with `cat`, and you can write your own.
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

Lists the files in the current directory. Directories are shown in color.
With `-l`, the permissions, size, and modification time are shown as well.

### cat — Show the contents of a file

```ruby
irb> cat hello.rb
irb> cat -n hello.rb
irb> cat file1.rb file2.rb
```

Prints the file as it is. `-n` adds line numbers.
Several files given at once are printed one after another.

### head / tail — Show the beginning or the end

```ruby
irb> head hello.rb
irb> head -n 20 hello.rb
irb> tail hello.rb
```

`head` prints the beginning of a file and `tail` prints the end.
Both show 10 lines by default, which `-n` changes.

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

Running `cd` without an argument moves to the root directory `/`.

After moving, `ls`, `cat`, and `edit` take plain file names relative to that directory.

```ruby
irb> cd /app
irb> cat ls.rb
```

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
| [`edit`](../getting-started/#editing-files-with-the-text-editor) | Edit a file in the text editor |
| [`run`](../files/#running-scripts) | Run a Ruby script |
| [`zoom`](../settings/#zooming-the-screen) | Change the text size on screen |
| [`picorabbit`](../picorabbit/) | Show slides |
| [`johakyu`](../johakyu/) | Live code sound and light |

IRB itself provides a few commands.

| Command | Description |
|---------|-------------|
| `jobs` | Show whether an app is suspended |
| `fg` | Resume the suspended app |
| `exit` | Quit IRB and start it again |

To try out the built-in demos, see [Demo Apps](../demos/).
