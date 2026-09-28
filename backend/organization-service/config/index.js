"use strict";

module.exports = {
  port: parseInt(process.env.PORT, 10) || 4002,
  env: process.env.NODE_ENV || "development",
  serviceName: process.env.SERVICE_NAME || "organization-service",
  dbUri: process.env.DB_URI || "memory://hrm-db",
  jwtSecret: process.env.JWT_SECRET || "enterprise_jwt_secret_key",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
};
