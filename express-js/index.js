const express = require("express");

const PORT = 3000;

// create express app.
const app = express();

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

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
