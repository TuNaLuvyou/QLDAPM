"use strict";

// C1: In-memory stub. C4 will add real stores + seed (branches, departments, employees).
// Keeps Clean Architecture boundary: services talk to repositories, not to this file directly.

const config = require("./index");

let connected = false;

async function connect() {
  // Placeholder for PostgreSQL (Supabase) + Prisma in later commits.
  // For now resolve immediately so GET /health and dev boot work.
  connected = true;
  if (config.env !== "test") {
    console.log(`[${config.serviceName}] database connected (${config.dbUri})`);
  }
  return true;
}

async function disconnect() {
  connected = false;
  return true;
}

function isConnected() {
  return connected;
}

module.exports = { connect, disconnect, isConnected };
