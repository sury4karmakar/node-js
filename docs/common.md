# Common

## `PORT`

```js
const PORT = 3000;
```

**What it does:** Declares a constant that holds a number. It cannot be reassigned.

**In this code:** Holds the port number `3000` used by `server.listen` and the log message.

---

## `body.push`

```js
const body = [];

body.push(chunk);
```

**What it does:** `[]` creates an empty array. `push` adds a value to the end of the array.

**Parameter:**

| Param   | Type | Description               |
| ------- | ---- | ------------------------- |
| `chunk` | any  | The value to add at the end. |

**Returns:** number. The new length of the array.

**In this code:** `body` collects every `chunk` from the `"data"` event so the pieces can be joined later.
