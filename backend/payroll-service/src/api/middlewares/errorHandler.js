"use strict";

// Centralized error middleware — standard envelope { error: { code, message, details } }.

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const code = err.code || "INTERNAL_SERVER_ERROR";
  const message = err.message || "Đã xảy ra lỗi không mong đợi trên hệ thống";
  res.status(status).json({ error: { code, message, details: err.details || null } });
}

module.exports = errorHandler;
