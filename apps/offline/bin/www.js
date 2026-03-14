// const dotenv = require("dotenv").config({ quiet: true });
// const app = require("../app");
// const debug = require("debug")("npbot-new:server");
// const http = require("http");
// import dotenv from "dotenv";
// dotenv.config({
//   quiet: true,
// });
import "dotenv/config";
import app from "../app.js";
import debug from "debug";
import http from "http";

import { welcomeMessage } from "../src/controllers/welcome.js";

const port = normalizePort(process.env.PORT || "3000");
app.set("port", port);

const server = http.createServer(app);

server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

function normalizePort(val) {
  const port = parseInt(val, 10);
  if (isNaN(port)) return val;
  if (port >= 0) return port;
  return false;
}

function onError(error) {
  if (error.syscall !== "listen") throw error;

  const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      console.log("Press ANY key to exit...");

      process.stdin.resume();
      process.stdin.on("data", () => process.exit(1));
      return;
    default:
      throw error;
  }
}

function onListening() {
  const addr = server.address();
  const bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  // console.log(`Listening on ${bind}`);
  debug("Listening on " + bind);

  welcomeMessage();
}
