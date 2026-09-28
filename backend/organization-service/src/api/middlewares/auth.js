"use strict";

// Auth passthrough stub (C1).
// identity-service (4001, owner A) owns JWT + cookie hrm-session.
// This service only attaches req.user when gateway forwards it; never blocks here.

function auth(req, res, next) {
  const forwardedUser = req.headers["x-user-id"];
  if (forwardedUser) {
    req.user = { id: forwardedUser, role: req.headers["x-user-role"] || null };
  }
  next();
}

module.exports = auth;
