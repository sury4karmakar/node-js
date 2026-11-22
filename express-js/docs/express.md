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
