function requestHandler(req, res) {
  const url = req.url;
  const method = req.method;

  if (url === "/" && method === "GET") {
    res.setHeader("Content-Type", "text/html");
    res.write("<html><h1>Welcome to Node js server</h1></html>");
    res.end();
  }

  if (url === "/post" && method === "POST") {
    const body = [];

    req.on("data", (chunk) => {
      body.push(chunk);
    });

    req.on("end", () => {
      const parsedBody = JSON.parse(Buffer.concat(body));
      console.log(parsedBody);

      res.setHeader("Content-Type", "text/html");
      res.write("<html><h1>Post saved</h1></html>");
      res.end();
    });
  }
}

module.exports = requestHandler;

// module.exports = {
//   requestHandler,
// };
