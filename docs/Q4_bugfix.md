# Q4: Troubleshoot & Explain

## The Buggy Code

```javascript
function getTotalUsageMB(records) {
  return records.reduce((total, record) => {
    total += record.dataUsageMB;
  });
}
```

---

## Root Cause

The bug has **two issues**:

### Issue 1: Missing `return` statement inside the `reduce` callback

The arrow function body uses curly braces `{}`, making it a **block body**. In a block body, `return` is **not** implicit — you must explicitly `return` a value. Because the callback never returns anything, it implicitly returns `undefined`. On the next iteration, `total` becomes `undefined`, and `undefined += number` produces `NaN`. The final result is **`NaN`**.

### Issue 2: Missing initial value for `reduce`

When no initial value (second argument to `reduce`) is provided, `reduce` uses the **first element of the array** as the initial accumulator. This means `total` starts as the first **record object** — not a number — which immediately causes incorrect behavior (`[object Object]` + number = string concatenation or `NaN`).

---

## The Fix

```javascript
function getTotalUsageMB(records) {
  return records.reduce((total, record) => {
    return total + record.dataUsageMB;
  }, 0);
}
```

Or more concisely with an implicit return (arrow function without curly braces):

```javascript
function getTotalUsageMB(records) {
  return records.reduce((total, record) => total + record.dataUsageMB, 0);
}
```

### What changed:
1. **Added `return total + record.dataUsageMB;`** — ensures each iteration returns the updated accumulator to the next iteration.
2. **Added `, 0` as the initial value** — ensures the accumulator starts as the number `0`, not as the first array element (which is an object).

---

## Why It Broke

JavaScript's `Array.prototype.reduce()` works by passing the **return value** of each callback invocation as the `total` (accumulator) for the next invocation. If the callback does not return a value, `total` becomes `undefined` on the second iteration, and all subsequent additions produce `NaN`.

Additionally, without an explicit initial value, `reduce` treats `records[0]` (an object like `{ dataUsageMB: 1500, ... }`) as the starting accumulator, which is semantically wrong for a numeric summation.

---

## Prevention Strategies

| Strategy | Description |
|---|---|
| **Lint Rules** | Use ESLint with `array-callback-return` rule enabled. It flags `reduce`/`map`/`filter` callbacks that don't return a value. |
| **Always provide an initial value** | Make it a team convention to always pass the second argument to `.reduce()`. This avoids bugs with empty arrays (which throw `TypeError` without an initial value) and incorrect accumulator types. |
| **Use concise arrow syntax for one-liners** | `(total, record) => total + record.dataUsageMB` — the implicit return makes it impossible to forget `return`. |
| **TypeScript** | TypeScript would flag the missing return via type inference: the callback returns `void` but `reduce<number>` expects `number`. |
| **Unit Tests** | Write test cases covering edge cases: empty arrays, single-element arrays, and multi-element arrays. A test asserting `getTotalUsageMB([{dataUsageMB:10},{dataUsageMB:20}]) === 30` would immediately catch this bug. |
| **Code Review** | Reviewers should pay special attention to `.reduce()` calls — it's the most commonly misused array method. |
