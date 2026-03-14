// const express = require("express");
// const logger = require("morgan");
// const indexRouter = require("./src/routes/index");
import express from "express";
import indexRouter from "./src/routes/index.js";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(logger("common"));

app.use("/", indexRouter);

export default app;
