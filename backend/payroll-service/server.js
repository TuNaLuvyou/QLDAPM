require("dotenv").config();
const app = require("./src/app");
const config = require("./config");
const database = require("./config/database");

const PORT = config.port || 4004;

async function startServer() {
  try {
    await database.connect();
    if (require.main === module) {
      app.listen(PORT, () => {
        console.log(`[${config.serviceName}] running at http://localhost:${PORT}`);
      });
    }
  } catch (error) {
    console.error(`[${config.serviceName}] Failed to start:`, error);
    process.exit(1);
  }
}

startServer();
module.exports = app;
