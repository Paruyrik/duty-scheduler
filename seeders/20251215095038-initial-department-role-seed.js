"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Insert Departments
    await queryInterface.bulkInsert(
      "departments",
      [
        {
          name: "Operations",
          description: "Core operational duties",
          dutyType: "Primary",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Security",
          description: "Site security and access control",
          dutyType: "Secondary",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );

    // 2. Insert Sub-Departments (Requires Department IDs)
    await queryInterface.bulkInsert(
      "sub_departments",
      [
        {
          name: "Shift A",
          departmentId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Shift B",
          departmentId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Night Watch",
          departmentId: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );

    // 3. Insert Roles (Requires Department IDs)
    await queryInterface.bulkInsert(
      "roles",
      [
        {
          name: "Manager",
          departmentId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Team Lead",
          departmentId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Guard",
          departmentId: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    // Deletes in reverse order of creation
    await queryInterface.bulkDelete("roles", null, {});
    await queryInterface.bulkDelete("sub_departments", null, {});
    await queryInterface.bulkDelete("departments", null, {});
  },
};
