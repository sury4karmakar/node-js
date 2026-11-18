# HTTP

## `Importing the module`

```js
const http = require("node:http");
```

**What it does:** Loads the built-in `http` module. The `node:` prefix shows it is a Node.js core module.

**Parameter:**

| Param         | Type   | Description                  |
| ------------- | ------ | ---------------------------- |
| `"node:http"` | string | The name of the module to load. |

**Returns:** object. The `http` module with its functions and classes.

**In this code:** Stores the module in the `http` constant to use `http.createServer`.

---

## `http.createServer`

```js
const server = http.createServer((req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.write("<html><h1>Welcome to Node js server</h1></html>");
  res.end();
});
```

**What it does:** Creates an HTTP server. The callback runs every time a request arrives.

**Parameter:**

| Param             | Type     | Description                     |
| ----------------- | -------- | ------------------------------- |
| `requestListener` | function | Runs for each incoming request. |

Callback arguments:

| Arg   | Class                 | What it is                                |
| ----- | --------------------- | ----------------------------------------- |
| `req` | `http.IncomingMessage` | The incoming request.                     |
| `res` | `http.ServerResponse`  | The response the server sends back.       |

**Returns:** `http.Server`. The server object.

**In this code:** Stores the server in `server`. Every request gets an HTML response with a header, a body, and an end.

---

## `res.setHeader`

```js
res.setHeader("Content-Type", "text/html");
```

**What it does:** Sets one response header.

**Parameters:**

| Param   | Type   | Description                  |
| ------- | ------ | ---------------------------- |
| `name`  | string | The header name.             |
| `value` | string | The header value.            |

**In this code:** Tells the client the response body is HTML.

---

## `res.write`

```js
res.write("<html><h1>Welcome to Node js server</h1></html>");
```

**What it does:** Writes a chunk of data to the response body. The headers are sent with the first chunk.

**Parameter:**

| Param   | Type   | Description                |
| ------- | ------ | -------------------------- |
| `chunk` | string | The data to send. |

**Returns:** boolean. `true` if the data was handled without a full buffer.

**In this code:** Sends an HTML page with the heading "Welcome to Node js server".

---

## `res.end`

```js
res.end();
```

**What it does:** Tells the server the response is complete.

**In this code:** Called with no data. It finishes the response after `res.write`.

---

## `server.listen`

```js
server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
```

**What it does:** Starts the server and makes it accept connections on a port.

**Parameters:**

| Param      | Type     | Description                                |
| ---------- | -------- | ------------------------------------------ |
| `port`     | number   | The port to listen on.                     |
| `callback` | function | Runs once when the server starts listening. |

**Returns:** `http.Server`. The same server object.

**In this code:** Listens on `PORT` (3000). The callback prints the server address.
