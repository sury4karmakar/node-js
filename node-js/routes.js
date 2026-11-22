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

    // runs each time a piece of the request body arrives.
    req.on("data", (chunk) => {
      body.push(chunk);
    });

    // runs once after the whole request body has been received.
    req.on("end", () => {
      // joins the chunks into the full request body.
      const parsedBody = JSON.parse(Buffer.concat(body));
      console.log(parsedBody);

      res.setHeader("Content-Type", "text/html");
      res.write("<html><h1>Post saved</h1></html>");
      res.end();
    });
  }
}

module.exports = requestHandler;
