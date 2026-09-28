"use strict";

// Auth passthrough stub (C2).
// identity-service (4001, owner A) owns JWT + cookie hrm-session.
function auth(req, res, next) {
  const forwardedUser = req.headers["x-user-id"];
  if (forwardedUser) {
    req.user = { id: forwardedUser, role: req.headers["x-user-role"] || null };
  }
  next();
}

module.exports = auth;
