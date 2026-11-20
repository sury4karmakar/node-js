# HTTP

## `Importing the module`

```js
const http = require("node:http");
```

**What it does:** Loads the built-in `http` module. The `node:` prefix shows it is a Node.js core module.

**Parameter:**

| Param         | Type   | Description                     |
| ------------- | ------ | ------------------------------- |
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

| Arg   | Class                  | What it is                          |
| ----- | ---------------------- | ----------------------------------- |
| `req` | `http.IncomingMessage` | The incoming request.               |
| `res` | `http.ServerResponse`  | The response the server sends back. |

**Returns:** `http.Server`. The server object.

**In this code:** Stores the server in `server`. Every request gets an HTML response with a header, a body, and an end.

---

## `res.setHeader`

```js
res.setHeader("Content-Type", "text/html");
```

**What it does:** Sets one response header.

**Parameters:**

| Param   | Type   | Description       |
| ------- | ------ | ----------------- |
| `name`  | string | The header name.  |
| `value` | string | The header value. |

**In this code:** Tells the client the response body is HTML.

---

## `res.write`

```js
res.write("<html><h1>Welcome to Node js server</h1></html>");
```

**What it does:** Writes a chunk of data to the response body. The headers are sent with the first chunk.

**Parameter:**

| Param   | Type   | Description       |
| ------- | ------ | ----------------- |
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

| Param      | Type     | Description                                 |
| ---------- | -------- | ------------------------------------------- |
| `port`     | number   | The port to listen on.                      |
| `callback` | function | Runs once when the server starts listening. |

**Returns:** `http.Server`. The same server object.

**In this code:** Listens on `PORT` (3000). The callback prints the server address.

---

## `req.url` and `req.method`

```js
const url = req.url;
const method = req.method;
```

**What it does:** Reads the path and the HTTP method of the incoming request from the `req` object.

**Returns:** `req.url` is a string such as `"/"` or `"/post"`. `req.method` is an uppercase string such as `"GET"` or `"POST"`.

**In this code:** Both values are saved in local constants so the routing conditions can compare them.

---

## URL and method based routing

```js
if (url === "/" && method === "GET") {
  // ...
}

if (url === "/post" && method === "POST") {
  // ...
}
```

**What it does:** Chooses what code runs by checking the request path and the request method together. Each `if` block is one route.

**In this code:**

- `GET /` sends the welcome HTML.
- `POST /post` reads the request body and, after the body is fully received, sends the "Post saved" HTML.
- A request that matches neither condition gets no response from the code, so the connection stays open.

---

## `req.on("data")`

```js
req.on("data", (chunk) => {
  body.push(chunk);
});
```

**What it does:** Adds an event listener to the request. The callback runs each time a piece of the request body arrives. This is event-driven code: the code registers a function, and Node.js calls it when the event happens.

**Parameters:**

| Param      | Type     | Description                                  |
| ---------- | -------- | -------------------------------------------- |
| `event`    | string   | The event name. Here `"data"`.               |
| `callback` | function | Runs every time a chunk of data is received. |

| Arg     | Class    | What it is                                 |
| ------- | -------- | ------------------------------------------ |
| `chunk` | `Buffer` | One piece of the request body (raw bytes). |

**Returns:** The same `req` object (`http.IncomingMessage`).

**In this code:** Each `chunk` is pushed into the `body` array. A large body can arrive as many chunks.

---

## `req.on("end")`

```js
req.on("end", () => {
  const parsedBody = JSON.parse(Buffer.concat(body));
  console.log(parsedBody);

  res.setHeader("Content-Type", "text/html");
  res.write("<html><h1>Post saved</h1></html>");
  res.end();
});
```

**What it does:** Adds an event listener that runs once, after the whole request body has been received.

**Parameters:**

| Param      | Type     | Description                              |
| ---------- | -------- | ---------------------------------------- |
| `event`    | string   | The event name. Here `"end"`.            |
| `callback` | function | Runs when there is no more data to read. |

**In this code:** The callback has no arguments. It joins all chunks, parses them as JSON, prints the result, then sends the response (`res.setHeader`, `res.write`, `res.end`). The response is sent inside this callback, so it is sent only after the whole body has been received. `res.on()` is not used in this code. The `on` calls are made on `req`.

---

## `Buffer.concat`

```js
Buffer.concat(body);
```

**What it does:** Joins an array of `Buffer` objects into one `Buffer`.

**Parameter:**

| Param  | Type       | Description                   |
| ------ | ---------- | ----------------------------- |
| `list` | `Buffer[]` | The array of buffers to join. |

**Returns:** `Buffer`. One buffer that holds all the bytes.

**In this code:** Joins the chunks collected in `body` into the full request body.

---

## `JSON.parse`

```js
const parsedBody = JSON.parse(Buffer.concat(body));
```

**What it does:** Converts a JSON text into a JavaScript value.

**Parameter:**

| Param  | Type               | Description                                               |
| ------ | ------------------ | --------------------------------------------------------- |
| `text` | string or `Buffer` | The JSON text. A `Buffer` is converted to a string first. |

**Returns:** The parsed value (object, array, string, number, boolean, or `null`).

**In this code:** Turns the request body bytes into an object stored in `parsedBody`.
