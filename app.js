const express = require("express");
const logger = require('morgan');
const path = require("path");
const api = require("./utils/api")

var app = express();
app.set('trust proxy', 1);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", express.static("public"));
app.use("/assets", express.static("assets"));
app.use("/admin", express.static("admin"));
app.use("/api", api);


module.exports = app;