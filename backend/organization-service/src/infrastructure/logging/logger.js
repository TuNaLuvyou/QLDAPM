"use strict";

const config = require("../../../config");

function prefix(level) {
  return `[${config.serviceName}][${level}]`;
}

module.exports = {
  info: (...args) => console.log(prefix("info"), ...args),
  warn: (...args) => console.warn(prefix("warn"), ...args),
  error: (...args) => console.error(prefix("error"), ...args),
};
