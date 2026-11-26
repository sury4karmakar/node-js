const express = require("express");
const path = require("node:path");
const { engine } = require("express-handlebars");

const userRoutes = require("./routes/user");
const productRoutes = require("./routes/product");
const adminRoutes = require("./routes/admin");

const PORT = 3000;

// create express app.
const app = express();

// setup template engine
app.engine("hbs", engine({ defaultLayout: false }));
app.set("view engine", "hbs");
app.set("view engine", "ejs"); // default template engine
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use(userRoutes);
app.use(productRoutes);
app.use("/admin", adminRoutes);

// adds middleware function to the app.
app.use((req, res, next) => {
  console.log("Log: Middleware 1");
  // passes control to the next middleware in the order.
  next();
});

app.use((req, res, next) => {
  console.log("Log: Middleware 2");
  next();
});

// order matters: handlers run top to bottom, and the first one that matches.
app.use("/", (req, res, next) => {
  console.log("Log: /");
  next();
});

// put specific routes before general ones.
app.use("/logs", (req, res, next) => {
  console.log("Log: /logs");
  next();
});

// send html
app.use("/docs-html", (req, res, next) => {
  res.sendFile(path.join(__dirname, "views", "docs.html"));
});

// renders hbs template
app.use("/docs-hbs", (req, res, next) => {
  res.render("docs.hbs", {
    heading: "Welcome to Node JS Documentation - HBS",
  });
});

// renders ejs template
app.use("/docs-ejs", (req, res, next) => {
  res.render("docs.ejs", {
    heading: "Welcome to Node JS Documentation - EJS",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
