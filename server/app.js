const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    credentials: true,
  })
);
app.use(cookieParser());

app.use("/ping", (req, res, next) => {
  res.send("/pong");
});

app.all("*", (req, res) => {
  res.status(404).send("Error! Page not found");
});

module.exports = app;
