"use strict";

class DomainError extends Error {
  constructor(message, code = "INTERNAL_SERVER_ERROR", status = 500, details = null) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

class NotFoundError extends DomainError {
  constructor(message = "Không tìm thấy tài nguyên", details = null) {
    super(message, "NOT_FOUND", 404, details);
  }
}

class ValidationError extends DomainError {
  constructor(message = "Dữ liệu không hợp lệ", details = null) {
    super(message, "VALIDATION_ERROR", 400, details);
  }
}

class DuplicateError extends DomainError {
  constructor(message = "Tài nguyên đã tồn tại", details = null) {
    super(message, "DUPLICATE_RESOURCE", 409, details);
  }
}

class InsufficientFundsError extends DomainError {
  constructor(message = "Số dư tài khoản không đủ để thực hiện chi", details = null) {
    super(message, "INSUFFICIENT_FUNDS", 422, details);
  }
}

module.exports = {
  DomainError,
  NotFoundError,
  ValidationError,
  DuplicateError,
  InsufficientFundsError,
};
