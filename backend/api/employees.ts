import * as XLSX from "xlsx";
import { Employee, sequelize } from "../database";

export async function handleBulkImportEmployees(filePath: string) {
  const transaction = await sequelize.transaction();

  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Parse Excel to JSON
    const rows: any[] = XLSX.utils.sheet_to_json(worksheet);

    if (rows.length === 0) {
      throw new Error("The uploaded file is empty.");
    }

    const employeesToCreate = rows.map((row) => {
      // Validation: Basic requirements
      if (!row["Full Name"] || !row["Department ID"] || !row["Role ID"]) {
        throw new Error(
          `Invalid row found. "Full Name", "Department ID", and "Role ID" are required.`
        );
      }

      return {
        fullName: row["Full Name"],
        monthlyDesiredDuties: Number(row["Monthly Desired Duties"]) || 4,
        departmentId: Number(row["Department ID"]),
        roleId: Number(row["Role ID"]),
        subDepartmentId: row["Sub-Dept ID"] ? Number(row["Sub-Dept ID"]) : null,

        // --- CRITICAL: MATCH FRONTEND JSON FORMAT ---
        // We initialize these as stringified empty arrays so JSON.parse() doesn't fail
        unavailableDays: "[]", // Matches undesirableDates
        flexibleDays: "[]", // Matches ifNecessaryDates
        preferredDays: "[]", // Matches desiredDates
        externalDutyDays: "[]", // Matches externalDutyDates
        unavailableWeekdays: "[]", // Matches WeekdaySelector
        preferredWeekdays: "[]", // Matches WeekdaySelector
      };
    });

    // Bulk insert for high performance
    const createdEmployees = await Employee.bulkCreate(employeesToCreate, {
      transaction,
    });

    await transaction.commit();
    return { success: true, count: createdEmployees.length };
  } catch (error: any) {
    if (transaction) await transaction.rollback();
    console.error("Bulk Import Error:", error);
    return {
      success: false,
      message: error.message || "An unknown error occurred during import.",
    };
  }
}
