const express = require("express");

const PORT = 3000;

// create express app.
const app = express();

const products = [
  {
    id: 1,
    name: "Iphone 18",
  },
  {
    id: 2,
    name: "Macbook",
  },
];

app.use(express.json());

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
app.use("/user", (req, res, next) => {
  console.log("Log: /user");
});

app.get("/products", (req, res) => {
  res.send({
    data: products,
  });
});

app.post("/products", (req, res) => {
  products.push(req.body);
  res.send({
    data: products,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
