# Express Handlebars

## `Importing the module`

```js
const { engine } = require("express-handlebars");
```

**What it does:** Loads the `express-handlebars` package and takes the `engine` function from it using destructuring.

**In this code:** `engine` is passed to `app.engine()` to render `.hbs` files.

---

## `engine`

```js
engine({ defaultLayout: false });
```

**What it does:** Creates a template engine function for Express that renders Handlebars files.

**Parameter:**

| Param     | Type   | Description                        |
| --------- | ------ | ---------------------------------- |
| `options` | object | Optional. Settings for the engine. |

**Options used:**

| Option          | Type    | Description                                                                   |
| --------------- | ------- | ----------------------------------------------------------------------------- |
| `defaultLayout` | boolean | When `false`, no layout file is used. The view file is sent as the full page. |

**Returns:** A function that Express can use as a template engine.

**In this code:** `defaultLayout: false` is set because `views/docs.hbs` is a full HTML page. Without it, the engine looks for `views/layouts/main.hbs`.

---

## `{{heading}}`

```hbs
<h1>{{heading}}</h1>
```

**What it does:** Prints the value of a variable inside a Handlebars template. The text is HTML-escaped.

**In this code:** `heading` is the key passed in the object of `res.render("docs.hbs", { heading: ... })`. Its value is placed inside the `<h1>` tag.
