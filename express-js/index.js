const express = require("express");
const path = require("node:path");

const userRoutes = require("./routes/user");
const productRoutes = require("./routes/product");
const adminRoutes = require("./routes/admin");

// create express app.
const app = express();

const PORT = 3000;

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
app.use("/doc", (req, res, next) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
