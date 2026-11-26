const express = require("express");

const router = express.Router();

const users = [
  {
    id: 1,
    name: "Surya Karmakar",
  },
  {
    id: 2,
    name: "John Doe",
  },
];

router.get("/user", (req, res) => {
  res.send(users);
});

router.post("/user", (req, res) => {
  users.push(req.body);
  res.send(users);
});

module.exports = router;
