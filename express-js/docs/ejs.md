# EJS

## `<%= heading %>`

```ejs
<h1><%= heading %></h1>
```

**What it does:** Prints the value of a variable inside an EJS template. The text is HTML-escaped.

**In this code:** `heading` is the key passed in the object of `res.render("docs.ejs", { heading: ... })`. Its value is placed inside the `<h1>` tag.
