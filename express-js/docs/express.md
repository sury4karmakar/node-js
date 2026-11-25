# Express

## `Importing the module`

```js
const express = require("express");
```

**What it does:** Loads the `express` package from `node_modules` using CommonJS `require`. The returned value is the main `express` function.

**Parameter:**

| Param       | Type   | Description              |
| ----------- | ------ | ------------------------ |
| `"express"` | string | Name of the package.     |

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

| Param      | Type     | Description                                    |
| ---------- | -------- | ---------------------------------------------- |
| `callback` | function | The middleware function. No path, so it matches all paths. |

**Callback arguments:**

| Arg    | Class                 | What it is                                              |
| ------ | --------------------- | ------------------------------------------------------- |
| `req`  | `express.Request`     | The incoming request.                                   |
| `res`  | `express.Response`    | The response that will be sent back.                    |
| `next` | function              | Passes control to the next middleware in the order.     |

**Returns:** the `app` object, so calls can be chained.

**In this code:** Two middleware are added. For each request, the first logs `Log: Middleware 1` and calls `next()`. The second then logs `Log: Middleware 2` and calls `next()`. No route or response is defined, so after the second `next()` Express sends its default 404 response.

---

## `app.use(path, callback)`

```js
app.use("/", (req, res, next) => {
  console.log("Log: /");
  next();
});

app.use("/user", (req, res, next) => {
  console.log("Log: /user");
});
```

**What it does:** Adds a middleware function that runs only when the request path starts with the given `path`. Middleware run in the order they were added, from top to bottom. A request goes to the next matching middleware only if the current one calls `next()`.

**Parameters:**

| Param      | Type     | Description                                                  |
| ---------- | -------- | ------------------------------------------------------------ |
| `path`     | string   | The path prefix to match. `"/"` matches every request path.  |
| `callback` | function | The middleware function.                                     |

**Callback arguments:**

| Arg    | Class              | What it is                                          |
| ------ | ------------------ | --------------------------------------------------- |
| `req`  | `express.Request`  | The incoming request.                               |
| `res`  | `express.Response` | The response that will be sent back.                |
| `next` | function           | Passes control to the next middleware in the order. |

**Returns:** the `app` object, so calls can be chained.

**In this code:** The `"/"` middleware is added after the two path-less middleware. It logs `Log: /` and calls `next()`, so every request continues to the next one. The `"/user"` middleware is added after it and runs only for paths that start with `/user`. It logs `Log: /user` but does not call `next()` or send a response, so the request stops there and does not finish. For a request to `/user`, the logs print in this order: `Log: Middleware 1`, `Log: Middleware 2`, `Log: /`, `Log: /user`. For any other path, `Log: /user` is not printed and Express sends its default 404 response.
