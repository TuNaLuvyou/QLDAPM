"use strict";
const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");

process.env.NODE_ENV = "test";
process.env.PORT = "0";

const app = require("../../src/app");

describe("GET /health", () => {
  let server;
  let baseUrl;

  before(async () => {
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        baseUrl = `http://127.0.0.1:${server.address().port}`;
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  it("responds { status: ok, service, time }", async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, "ok");
    assert.equal(body.service, "organization-service");
    assert.ok(Date.parse(body.time), "time must be ISO date");
  });

  it("returns 404 envelope for unknown route", async () => {
    const res = await fetch(`${baseUrl}/nope`);
    assert.equal(res.status, 404);
    const body = await res.json();
    assert.equal(body.error.code, "NOT_FOUND");
  });
});
