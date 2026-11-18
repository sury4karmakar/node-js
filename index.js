const http = require("node:http");

const PORT = 3000;

const server = http.createServer((req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.write("<html><h1>Welcome to Node js server</h1></html>");
  res.end();
});

server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
