var express = require("express");
var indexRouter = require("./routes/index");
var app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/", indexRouter);

var port = process.env.PORT || 1054;
app.listen(port, () => {});

module.exports = app;
