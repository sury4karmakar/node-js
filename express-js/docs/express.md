# Express

## `Importing the module`

```js
const express = require("express");
```

**What it does:** Loads the `express` package from `node_modules` using CommonJS `require`. The returned value is the main `express` function.

**Parameter:**

| Param       | Type   | Description          |
| ----------- | ------ | -------------------- |
| `"express"` | string | Name of the package. |

**Returns:** function — the `express` factory function, with helpers attached to it.

**In this code:** Stored in the constant `express` and used to create the app. `package.json` has `"type": "commonjs"`, so `require` works.

---

## `express()`

```js
const app = express();
```

**What it does:** Creates a new Express application. The app holds the middleware and routes and can start an HTTP server.

**Returns:** function — the `app` object. It has methods such as `use` and `listen`.

**In this code:** The result is stored in `app`. All middleware in this file is added to this `app`.

---

## `app.use`

```js
app.use((req, res, next) => {
  console.log("Log: Middleware 1");
  next();
});

app.use((req, res, next) => {
  console.log("Log: Middleware 2");
  next();
});
```

**What it does:** Adds a middleware function to the app. A middleware runs for every incoming request, in the order it was added. It can read or change `req` and `res`, end the response, or pass control on by calling `next()`.

**Parameter:**

| Param      | Type     | Description                                                |
| ---------- | -------- | ---------------------------------------------------------- |
| `callback` | function | The middleware function. No path, so it matches all paths. |

**Callback arguments:**

| Arg    | Class              | What it is                                          |
| ------ | ------------------ | --------------------------------------------------- |
| `req`  | `express.Request`  | The incoming request.                               |
| `res`  | `express.Response` | The response that will be sent back.                |
| `next` | function           | Passes control to the next middleware in the order. |

**Returns:** the `app` object, so calls can be chained.

**In this code:** Two middleware are added. For each request, the first logs `Log: Middleware 1` and calls `next()`. The second then logs `Log: Middleware 2` and calls `next()`. No route or response is defined, so after the second `next()` Express sends its default 404 response.

---

## `app.use(path, callback)`

```js
app.use("/", (req, res, next) => {
  console.log("Log: /");
  next();
});

app.use("/logs", (req, res, next) => {
  console.log("Log: /logs");
});
```

**What it does:** Adds a middleware function that runs only when the request path starts with the given `path`. Middleware run in the order they were added, from top to bottom. A request goes to the next matching middleware only if the current one calls `next()`.

**Parameters:**

| Param      | Type     | Description                                                 |
| ---------- | -------- | ----------------------------------------------------------- |
| `path`     | string   | The path prefix to match. `"/"` matches every request path. |
| `callback` | function | The middleware function.                                    |

**Callback arguments:**

| Arg    | Class              | What it is                                          |
| ------ | ------------------ | --------------------------------------------------- |
| `req`  | `express.Request`  | The incoming request.                               |
| `res`  | `express.Response` | The response that will be sent back.                |
| `next` | function           | Passes control to the next middleware in the order. |

**Returns:** the `app` object, so calls can be chained.

**In this code:** The `"/"` middleware is added after the two path-less middleware. It logs `Log: /` and calls `next()`, so every request continues to the next one. The `"/logs"` middleware is added after it and runs only for paths that start with `/logs`. It logs `Log: /logs` but does not call `next()` or send a response, so the request stops there and does not finish. For a request to `/logs`, the logs print in this order: `Log: Middleware 1`, `Log: Middleware 2`, `Log: /`, `Log: /logs`. For any other path, `Log: /logs` is not printed and Express sends its default 404 response.

---

## `express.json()`

```js
app.use(express.json());
```

**What it does:** Built-in middleware that reads a request body sent as JSON and parses it into a JavaScript object. It only parses requests whose `Content-Type` is `application/json`.

**Parameter:**

| Param     | Type   | Description                                                     |
| --------- | ------ | --------------------------------------------------------------- |
| `options` | object | Optional. Settings such as `limit` and `strict`. Not used here. |

**Returns:** A middleware function `(req, res, next)`.

**In this code:** `app.use(express.json())` runs for every request. After it runs, the parsed JSON is available as `req.body` in the route handlers below it.

---

## `res.send`

```js
res.send({
  data: products,
});
```

**What it does:** Sends the HTTP response and ends the request. If the argument is an object or array, Express sends it as JSON and sets `Content-Type: application/json`.

**Parameter:**

| Param  | Type                          | Description                     |
| ------ | ----------------------------- | ------------------------------- |
| `body` | object, array, string, Buffer | The data to send to the client. |

**Returns:** The `res` object, so calls can be chained.

**In this code:** Both `GET /products` and `POST /products` send an object with a `data` key that holds the `products` array.

---

## `req.body`

```js
products.push(req.body);
```

**What it does:** Holds the parsed body of the incoming request. It is `undefined` unless a body-parsing middleware such as `express.json()` ran before the handler.

**Property:**

| Property   | Type   | Description                                             |
| ---------- | ------ | ------------------------------------------------------- |
| `req.body` | object | The parsed request body (a JavaScript object for JSON). |

**In this code:** In `POST /products`, `req.body` is the JSON the client sent. It is pushed into the `products` array as a new item.

---

## `res.sendFile`

```js
app.use("/doc", (req, res, next) => {
  res.sendFile(path.join(__dirname, "index.html"));
});
```

**What it does:** Sends a file from disk as the response and ends the request. It sets the `Content-Type` from the file extension (for example `text/html` for `.html`).

**Parameter:**

| Param  | Type   | Description                                                               |
| ------ | ------ | ------------------------------------------------------------------------- |
| `path` | string | Absolute path of the file to send. A relative path needs a `root` option. |

**Returns:** Nothing useful. The file is streamed to the client.

**In this code:** Any request that starts with `/doc` sends `index.html` from the project folder. `path.join(__dirname, "index.html")` builds the absolute path.

---

## `express.Router()`

```js
const router = express.Router();

router.get("/user", (req, res) => {
  res.send(users);
});

router.post("/user", (req, res) => {
  users.push(req.body);
  res.send(users);
});

module.exports = router;
```

**What it does:** Creates a router, a small separate group of routes and middleware. Routes are defined on the router and then mounted on the app, so each file in `routes/` can hold its own routes.

**Returns:** A router object. It is also a middleware function, so it can be passed to `app.use()`.

**Router methods used:**

| Method                       | Description                                |
| ---------------------------- | ------------------------------------------ |
| `router.get(path, handler)`  | Handles `GET` requests that match `path`.  |
| `router.post(path, handler)` | Handles `POST` requests that match `path`. |

**In this code:** `routes/user.js` and `routes/product.js` each create a router with `GET` and `POST` routes, then export it with `module.exports`. In `index.js`, `app.use(userRoutes)` and `app.use(productRoutes)` mount them with no prefix, so the paths are `/user` and `/product`.

---

## `app.use("/admin", adminRoutes)`

```js
const adminRoutes = require("./routes/admin");

app.use("/admin", adminRoutes);
```

**What it does:** Mounts a router under a path prefix. The prefix is added in front of every route path inside the router.

**Parameters:**

| Param      | Type              | Description                                                    |
| ---------- | ----------------- | -------------------------------------------------------------- |
| `path`     | string            | The prefix. Only requests that start with it reach the router. |
| `callback` | function / router | The router to run for those requests.                          |

**In this code:** `routes/admin.js` defines `/user`, but it is mounted on `/admin`. The real routes are `GET /admin/user` and `POST /admin/user`. The routes from `routes/user.js` use the same `/user` path without a prefix, so the two do not clash.
