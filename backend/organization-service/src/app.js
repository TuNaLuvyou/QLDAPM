"use strict";

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const config = require("../config");
const healthRouter = require("./api/routes/health");
const errorHandler = require("./api/middlewares/errorHandler");

const app = express();

app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
);
app.use(express.json());
if (config.env !== "test") {
  app.use(morgan("dev"));
}

app.use("/health", healthRouter);

// 404 — standard error envelope
app.use((req, res) => {
  res.status(404).json({
    error: { code: "NOT_FOUND", message: "Không tìm thấy tài nguyên", details: null },
  });
});

app.use(errorHandler);

module.exports = app;
