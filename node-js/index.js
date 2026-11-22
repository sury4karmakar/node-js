const http = require("node:http");

const requestHandler = require("./routes");

const PORT = 3000;

// creates an HTTP server.
const server = http.createServer(requestHandler);

// starts the server and accept connections on a port 3000.
server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
