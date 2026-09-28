"use strict";
const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const config = require("../../config");

describe("config", () => {
  it("defaults to organization-service on port 4002", () => {
    assert.equal(config.serviceName, process.env.SERVICE_NAME || "organization-service");
    assert.equal(config.port, parseInt(process.env.PORT, 10) || 4002);
  });
});
