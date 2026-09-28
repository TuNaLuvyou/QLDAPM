"use strict";

const config = require("../../../config");

function health(req, res) {
  res.status(200).json({
    status: "ok",
    service: config.serviceName,
    time: new Date().toISOString(),
  });
}

module.exports = { health };
