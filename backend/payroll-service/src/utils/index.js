"use strict";

// Pure helpers. Later commits add formatVND, id generators (TXN-*, BANK-*), month parsing.
function paginate(items, page = 1, limit = 20) {
  const start = (page - 1) * limit;
  return { items: items.slice(start, start + limit), total: items.length, page, limit };
}

module.exports = { paginate };
