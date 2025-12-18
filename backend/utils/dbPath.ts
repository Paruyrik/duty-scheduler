// backend/dbPath.ts
import { join } from "node:path";

export function resolveDatabasePath() {
  const dbFileName =
    process.env.DATABASE_FILE_NAME || "dev_schedule_db.sqlite";

  try {
    const { app } = require("electron");
    return join(app.getPath("userData"), dbFileName);
  } catch {
    return join(process.cwd(), dbFileName);
  }
}
