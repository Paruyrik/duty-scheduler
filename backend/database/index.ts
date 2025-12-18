//databsae/index.ts
import { DataTypes, Sequelize } from "sequelize";
import { DATABASE_PATH } from "../constants";
import { resolveDatabasePath } from "../utils/dbPath";

export const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: resolveDatabasePath(),
  logging: false,
});

if (!DATABASE_PATH.endsWith(".sqlite")) {
  throw new Error("Invalid DB path");
}

export const User = sequelize.define(
  "users",
  {
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    // REMOVE THIS LINE: timestamps: { type: DataTypes.DATE },
    createdAt: { type: DataTypes.DATE },
    updatedAt: { type: DataTypes.DATE },
  },
  {
    timestamps: true,
  }
);

export const Department = sequelize.define("departments", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.STRING },
  dutyType: { type: DataTypes.STRING, allowNull: false },
  //maxDailyCount: { type: DataTypes.INTEGER, defaultValue: 2, allowNull: false },
  //shiftDurationHours: { type: DataTypes.INTEGER, defaultValue: 24, allowNull: false },
});

export const SubDepartment = sequelize.define("sub_departments", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.STRING },
});

Department.hasMany(SubDepartment);
SubDepartment.belongsTo(Department);

export const Role = sequelize.define("roles", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
});

Department.hasMany(Role);
Role.belongsTo(Department);

export const Employee = sequelize.define("employees", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  fullName: { type: DataTypes.STRING, allowNull: false },

  monthlyDesiredDuties: { type: DataTypes.INTEGER, defaultValue: 0 },

  unavailableDays: { type: DataTypes.JSON },
  unavailableWeekdays: { type: DataTypes.JSON },
  flexibleDays: { type: DataTypes.JSON },
  preferredDays: { type: DataTypes.JSON },
  preferredWeekdays: { type: DataTypes.JSON },
  externalDutyDays: { type: DataTypes.JSON },
});

// references
Department.hasMany(Employee);
Employee.belongsTo(Department);

SubDepartment.hasMany(Employee);
Employee.belongsTo(SubDepartment);

Role.hasMany(Employee);
Employee.belongsTo(Role);

export const CalendarDay = sequelize.define("calendar_days", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  date: { type: DataTypes.DATEONLY, allowNull: false },
});

Department.hasMany(CalendarDay);
CalendarDay.belongsTo(Department);

SubDepartment.hasMany(CalendarDay);
CalendarDay.belongsTo(SubDepartment);

export const DutyAssignment = sequelize.define("duty_assignments", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  isLocked: { type: DataTypes.BOOLEAN, defaultValue: false },
  createdBy: { type: DataTypes.STRING },
  updatedBy: { type: DataTypes.STRING },
  dutyType: { type: DataTypes.STRING, allowNull: true },
});

// relations
DutyAssignment.belongsTo(CalendarDay, {
  foreignKey: "calendarDayId",
  as: "calendarDay", // Use 'calendarDay' as the alias for easy inclusion/retrieval
});
CalendarDay.hasMany(DutyAssignment, {
  foreignKey: "calendarDayId",
});

// 2. Link DutyAssignment to Employee
DutyAssignment.belongsTo(Employee, {
  foreignKey: "employeeId",
  as: "employee", // Use 'employee' as the alias
});
Employee.hasMany(DutyAssignment, {
  foreignKey: "employeeId",
});
