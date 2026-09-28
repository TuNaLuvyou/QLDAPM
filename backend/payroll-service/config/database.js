"use strict";

// C2: In-memory stub. Later commits add real stores + seed (bank-accounts, payouts, payslips).
// Keeps Clean Architecture boundary: services talk to repositories, not to this file directly.

const config = require("./index");

let connected = false;

async function connect() {
  // Placeholder for PostgreSQL (Supabase) + Prisma in later commits.
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
