const express = require("express");
// const logger = require("morgan");
const indexRouter = require("./src/routes/index");
const { getViewsDir } = require("./src/utils/veiwPath.js");
const path = require("path");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// app.use(logger("common"));

app.use("/", indexRouter);

module.exports = app;
