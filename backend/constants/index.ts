// backend/constants/index
import { resolveDatabasePath } from "../utils/dbPath";

export const DATABASE_PATH = resolveDatabasePath();
export const PORT = Number(process.env.PORT) || 4444;
