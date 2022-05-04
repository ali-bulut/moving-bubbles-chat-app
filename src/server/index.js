// imports start
const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const path = require("path");

const SocketService = require("./lib/services/SocketService");
// imports end

const app = express(); // to create express application (Express is a minimal and flexible Node.js web application framework)
const server = http.createServer(app); // to create http server by using express app
const socket = socketIO(server, { cors: { origin: "*" } }); // to create socket server by setting cors

const port = process.env.PORT || 3005; // if there is any port specified in .env variables use it, if not use 3005.

// to run index.html inside /build folder while / (index) is being called from client
app.use(express.static(path.join(__dirname, "../../build")));
app.get("/", (req, res, next) => res.sendFile(__dirname + "./index.html"));

SocketService.createEvents(socket); // creating events for socket

server.listen(port); // starting the server in specified port
