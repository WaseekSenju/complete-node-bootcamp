const fs = require("fs");

const server = require("http").createServer();

server.on("request", (req, res) => {
  //Sol:1 For small stuff 
  fs.readFile("test-file.txt", (err, data) => {
    if (err) console.log("There was an error reading the file");
    res.end(data);
  });
  //Sol:2 stream
  fs.readFile("test-file.txt", (err, data) => {
    if (err) console.log("There was an error reading the file");
    res.end(data);
  });
});

server.listen(8000, "127.0.0.1", () => {
  console.log("Listening to the request");
});
