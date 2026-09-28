"use strict";

// Validation stub (C2). Later commits plug Joi/Zod schemas from validators/.
function validation(schema) {
  return (req, res, next) => next();
}

module.exports = validation;
