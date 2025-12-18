const path = require("path");

const dbFileName = process.env.DATABASE_FILE_NAME || "dev_schedule_db.sqlite";

const resolveDbPath = () => {
  // CLI runs OUTSIDE electron → process.cwd()
  return path.join(process.cwd(), dbFileName);
};

module.exports = {
  development: {
    dialect: "sqlite",
    storage:
      "/Users/paruyrtsaturyan/Library/Application Support/sc-next-electron/dev_schedule_db.sqlite",
    //storage: resolveDbPath(),
    logging: true,
  },
  test: {
    dialect: "sqlite",
    storage: ":memory:",
  },
  production: {
    dialect: "sqlite",
    storage: process.env.PROD_DB_STORAGE_PATH,
  },
};
