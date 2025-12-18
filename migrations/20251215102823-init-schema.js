"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      email: { type: Sequelize.STRING, unique: true },
      password: { type: Sequelize.STRING },
      createdAt: { type: Sequelize.DATE },
      updatedAt: { type: Sequelize.DATE },
    });

    await queryInterface.createTable("departments", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.STRING },
      dutyType: { type: Sequelize.STRING, allowNull: false },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });

    await queryInterface.createTable("sub_departments", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING, allowNull: false },
      description: Sequelize.STRING,
      departmentId: {
        type: Sequelize.INTEGER,
        references: { model: "departments", key: "id" },
        onDelete: "CASCADE",
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });

    await queryInterface.createTable("roles", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING, allowNull: false },
      departmentId: {
        type: Sequelize.INTEGER,
        references: { model: "departments", key: "id" },
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });

    await queryInterface.createTable("employees", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      fullName: { type: Sequelize.STRING, allowNull: false },
      monthlyDesiredDuties: { type: Sequelize.INTEGER, defaultValue: 0 },

      unavailableDays: Sequelize.JSON,
      unavailableWeekdays: Sequelize.JSON,
      flexibleDays: Sequelize.JSON,
      preferredDays: Sequelize.JSON,
      preferredWeekdays: Sequelize.JSON,
      externalDutyDays: Sequelize.JSON,

      departmentId: Sequelize.INTEGER,
      subDepartmentId: Sequelize.INTEGER,
      roleId: Sequelize.INTEGER,

      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });

    await queryInterface.createTable("calendar_days", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      date: { type: Sequelize.DATEONLY, allowNull: false },
      departmentId: Sequelize.INTEGER,
      subDepartmentId: Sequelize.INTEGER,
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });

    await queryInterface.createTable("duty_assignments", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      isLocked: { type: Sequelize.BOOLEAN, defaultValue: false },
      createdBy: Sequelize.STRING,
      updatedBy: Sequelize.STRING,
      dutyType: Sequelize.STRING,
      calendarDayId: Sequelize.INTEGER,
      employeeId: Sequelize.INTEGER,
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("duty_assignments");
    await queryInterface.dropTable("calendar_days");
    await queryInterface.dropTable("employees");
    await queryInterface.dropTable("roles");
    await queryInterface.dropTable("sub_departments");
    await queryInterface.dropTable("departments");
    await queryInterface.dropTable("users");
  },
};
