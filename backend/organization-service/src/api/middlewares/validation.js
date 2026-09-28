"use strict";

// Validation stub (C1). C9 will plug Joi/Zod schemas from validators/.

function validation(schema) {
  return (req, res, next) => next();
}

module.exports = validation;
