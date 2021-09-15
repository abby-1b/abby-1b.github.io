# What is this?

It's my attempt at a math notebook. I've been using a simple bookmark to do quick maths for a while now. It's so small it even fits here:

```
data:text/html,%3Chtml%20contenteditable%3E%3Cstyle%3Ebody,html%7Bbackground-color:black;color:white;font-family:monospace%7D%3C/style%3E
```

That was before this. It wasn't interactive, and it didn't do anything more than act as a notepad.


# Commands

It can run JavaScript code sequentially, so you could technically write a whole program with it.

### Math (`\` or `=`)
Put `\` or `=` at the end of a line to run it as JavaScript, but with some extra math features. For example, you could do `10x` to multiply `x` by 10. Same goes for parentheses, so doing `x(10)` and `x10` would work, too.

I decided to use both `\` and `=` because setting variables would look weird as `z = 10 =`, hence `z = 10 \`. But in the case of numbers, `3 + 5 =` looks much better when you just need to get a result.

```r = 3 + 5 \ 8```

### Graph (`$`)
Put `$` in a line (without anything else) to enable the graph.

After that, you can put `$` after any line to graph it. Sure, it can only graph `y = ...` equations right now, but it's better than nothing!

```$ Graph enabled```

### JavaScript (`~`)
Put `~` at the end of a line to run JavaScript code directly. This doesn't support things like `10x` multiplication. Variables executed from math mode can still be accessed and set.

Small disadvantage: there's no `window` object.

You can't do things like `window.location` or `alert`. This keeps it safe, so hopefully no bad code can be executed by copy-pasting.
