// 20251215095038-initial-user-seed.js

"use strict";
// Use require for compatibility with the sequelize-cli environment
import { genSalt, hash } from "bcrypt";

export async function up(queryInterface, Sequelize) {
  const salt = await genSalt(10);
  const hashedPassword = await hash("password123", salt);

  // Using a simple date string that SQLite prefers
  const now = new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");

  await queryInterface.bulkInsert(
    "users",
    [
      {
        email: "admin@gmail.com",
        password: hashedPassword,
        // 🛑 Explicitly include createdAt and updatedAt with a standardized string 🛑
        createdAt: now,
        updatedAt: now,
      },
    ],
    {
      // This option tells Sequelize exactly which columns we are inserting into
      fields: ["email", "password", "createdAt", "updatedAt"],
    }
  );
}
export async function down(queryInterface, Sequelize) {
  await queryInterface.bulkDelete("users", { email: "admin@gmail.com" }, {});
}
