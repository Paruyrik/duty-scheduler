import { app, BrowserWindow, dialog, ipcMain } from "electron";
import fs from "node:fs";
import path from "node:path";

const PROD_DB_FILE_NAME = "schedule_db.sqlite";

const PROD_DB_PATH = path.join(app.getPath("userData"), PROD_DB_FILE_NAME);

process.env.PROD_DB_STORAGE_PATH = PROD_DB_PATH;
console.log("🟢 SQLITE PROD DB PATH:", PROD_DB_PATH);

// const DATABASE_PATH = path.join(
//   app.getPath("userData"),
//   "dev_schedule_db.sqlite"
// );

// process.env.DB_PATH = DATABASE_PATH;
// console.log("🟢 SQLITE DB PATH:", DATABASE_PATH);

/* =========================
   IMPORTS (AFTER DB PATH)
   ========================= */

import bcrypt from "bcrypt";
import { prepareNext } from "sc-prepare-next";
import {
  handleDeleteSchedule,
  handleGenerateSchedule,
  handleGetSchedule,
} from "./api/schedule";
import { PORT } from "./constants";
import {
  Department,
  Employee,
  Role,
  sequelize,
  SubDepartment,
  User,
} from "./database";
import { ScheduleGenerationParams } from "./scheduling/types";
import { exportScheduleToExcel } from "./utils/export";

/* =========================
   AUTH STATE (IN-MEMORY)
   ========================= */

let loggedInUser: any = null;

/* =========================
   AUTH IPC
   ========================= */

ipcMain.handle("login", async (_, { email, password }) => {
  try {
    console.log("🔐 Login attempt:", email);

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return { success: false, message: "User not found" };
    }

    const userData = user.toJSON() as any;
    const isValid = await bcrypt.compare(password, userData.password);

    if (!isValid) {
      return { success: false, message: "Invalid password" };
    }

    loggedInUser = userData;
    return { success: true, user: loggedInUser };
  } catch (err) {
    console.error("❌ Login error:", err);
    return { success: false, message: "Login failed" };
  }
});

ipcMain.handle("get-current-user", async () => loggedInUser);

ipcMain.handle("logout", async () => {
  loggedInUser = null;
  return { success: true };
});

/* =========================
   WINDOW
   ========================= */

function createWindow(): void {
  const win = new BrowserWindow({
    title: "Scheduling Pro",
    width: 900,
    height: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (app.isPackaged) {
    // 1. Force DevTools to open IMMEDIATELY upon window creation
    win.webContents.openDevTools();

    // 2. Use app.getAppPath() for reliable pathing to your bundled files
    // Your files array included dist/frontend/**/*
    const frontendPath = path.join(
      app.getAppPath(),
      "dist",
      "frontend",
      "index.html"
    );
    console.log(`🟡 Attempting to load frontend from: ${frontendPath}`); // Use a logger in your main process if available
    win.loadFile(frontendPath);
  } else {
    win.loadURL(`http://localhost:${PORT}/`);
    win.webContents.openDevTools();
  }
}

async function checkAndInitializeDB() {
  const dbPath = process.env.DB_PATH!;

  if (!fs.existsSync(dbPath)) {
    console.log("🟡 DB not found → initializing");

    await sequelize.sync();
    console.log("✅ Tables created");

    // Seed admin
    const adminEmail = "admin@gmail.com";
    const existing = await User.findOne({ where: { email: adminEmail } });

    if (!existing) {
      const hashed = await bcrypt.hash("admin123", 10);
      await User.create({
        email: adminEmail,
        password: hashed,
      });
      console.log("✅ Admin user created");
    }
  } else {
    console.log("🟢 DB exists → skipping init");
  }
}

app.whenReady().then(async () => {
  try {
    if (!app.isPackaged) {
      await prepareNext("./src", PORT);
    }
    await sequelize.authenticate();
    await checkAndInitializeDB();
    //await sequelize.sync({ alter: true });
    console.log("🟢 Sequelize connected");

    /* =========================
       USER
       ========================= */

    ipcMain.handle(
      "export-schedule",
      async (_event, { assignments, month, year, deptName }) => {
        const { filePath } = await dialog.showSaveDialog({
          title: "Export Schedule",
          defaultPath: `Schedule_${deptName}_${month}_${year}.xlsx`,
          filters: [{ name: "Excel Files", extensions: ["xlsx"] }],
        });

        if (filePath) {
          const buffer = await exportScheduleToExcel(
            assignments,
            month,
            year,
            deptName
          );
          fs.writeFileSync(filePath, buffer);
          return { success: true };
        }
        return { success: false };
      }
    );

    ipcMain.handle("add-user", async (_, data) => {
      try {
        if (data.password) {
          data.password = await bcrypt.hash(data.password, 10);
        }

        const created = await User.create(data);
        return { error: false, data: created.toJSON() };
      } catch (error) {
        console.error("❌ add-user error:", error);
        return { error: true, message: "User creation failed" };
      }
    });

    /* =========================
       DEPARTMENTS
       ========================= */

    ipcMain.handle("add-department", async (_, data) => {
      const result = await Department.create(data);
      return { error: false, data: result.toJSON() };
    });

    ipcMain.handle("get-departments", async () => {
      const list = await Department.findAll({
        include: [SubDepartment, Role, Employee],
      });
      return list.map((d) => d.toJSON());
    });

    ipcMain.handle("update-department", async (_, data) => {
      await Department.update(data, { where: { id: data.id } });
      return { success: true };
    });

    ipcMain.handle("delete-department", async (_, id) => {
      await Department.destroy({ where: { id } });
      return { success: true };
    });

    /* =========================
       SUB DEPARTMENTS
       ========================= */

    ipcMain.handle("add-sub-department", async (_, data) => {
      const result = await SubDepartment.create(data);
      return { error: false, data: result.toJSON() };
    });

    ipcMain.handle("get-sub-departments", async () => {
      const list = await SubDepartment.findAll({ include: [Department] });
      return { error: false, data: list.map((i) => i.toJSON()) };
    });

    ipcMain.handle("update-sub-department", async (_, data) => {
      await SubDepartment.update(data, { where: { id: data.id } });
      return { error: false };
    });

    ipcMain.handle("delete-sub-department", async (_, id) => {
      await SubDepartment.destroy({ where: { id } });
      return { error: false };
    });

    /* =========================
       ROLES
       ========================= */

    ipcMain.handle("add-role", async (_, data) => {
      const result = await Role.create(data);
      return { error: false, data: result.toJSON() };
    });

    ipcMain.handle("get-roles", async () => {
      const list = await Role.findAll({ include: [Department] });
      return { error: false, data: list.map((i) => i.toJSON()) };
    });

    ipcMain.handle("update-role", async (_, data) => {
      await Role.update(data, { where: { id: data.id } });
      return { error: false };
    });

    ipcMain.handle("delete-role", async (_, id) => {
      await Role.destroy({ where: { id } });
      return { error: false };
    });

    /* =========================
       EMPLOYEES
       ========================= */

    ipcMain.handle("add-employee", async (_, data) => {
      const result = await Employee.create(data);
      return { error: false, data: result.toJSON() };
    });

    ipcMain.handle("get-employees", async () => {
      const list = await Employee.findAll({
        include: [Department, SubDepartment, Role],
      });
      return { error: false, data: list.map((i) => i.toJSON()) };
    });

    ipcMain.handle("update-employee", async (_, data) => {
      await Employee.update(data, { where: { id: data.id } });
      return { error: false };
    });

    ipcMain.handle("delete-employee", async (_, id) => {
      await Employee.destroy({ where: { id } });
      return { error: false };
    });

    /* =========================
       SCHEDULE
       ========================= */

    ipcMain.handle(
      "generate-schedule",
      async (_, params: ScheduleGenerationParams) =>
        handleGenerateSchedule(params)
    );

    ipcMain.handle("get-schedule", async (_, params) =>
      handleGetSchedule(params.departmentId, params.month, params.year)
    );

    ipcMain.handle("delete-schedule", async (_event, params) => {
      const { departmentId, month, year } = params;
      return await handleDeleteSchedule(departmentId, month, year);
    });

    createWindow();
  } catch (err) {
    console.error("❌ App init failed:", err);
  }
});

/* =========================
   APP EVENTS
   ========================= */

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
