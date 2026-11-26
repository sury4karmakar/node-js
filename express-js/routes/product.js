const express = require("express");

const router = express.Router();

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

router.get("/product", (req, res) => {
  res.send(products);
});

router.post("/product", (req, res) => {
  products.push(req.body);
  res.send(products);
});

module.exports = router;
