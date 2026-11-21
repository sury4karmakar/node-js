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

---

## `requestHandler`

```js
function requestHandler(req, res) {
  const url = req.url;
  const method = req.method;
  // ...
}
```

**What it does:** Declares a function that holds the routing logic for the server. It runs once for every incoming request.

**Parameters:**

| Param | Type                  | Description                    |
| ----- | --------------------- | ------------------------------ |
| `req` | `http.IncomingMessage` | The incoming request.          |
| `res` | `http.ServerResponse`  | The response sent to the client. |

**Returns:** nothing (`undefined`).

**In this code:** The routing code lives in `routes.js` as a separate function, so it can be exported and passed to `http.createServer`.

---

## `module.exports`

```js
module.exports = requestHandler;
```

**What it does:** Sets what another file receives when it calls `require` on this file (CommonJS).

**In this code:** Exports the `requestHandler` function as the whole module value. A file that runs `require("./routes")` gets the function directly.

---

## `start` script

```json
"start": "node --watch index.js "
```

**What it does:** An npm script in `package.json`. `npm start` runs it. `node --watch` runs the file and restarts the process when the file or the files it imports change.

**In this code:** Runs `index.js` and restarts it after any edit, including edits to `routes.js`.
