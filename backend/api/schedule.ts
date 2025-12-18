// src/backend/api/schedule.ts

import { Op } from "sequelize";
import {
  CalendarDay,
  Department,
  DutyAssignment,
  Employee,
  sequelize,
} from "../database";
import { generateSchedule as runDutyScheduler } from "../scheduling/DutyScheduler";
import {
  ScheduleGenerationParams,
  ScheduleResponse,
  ScheduleResult,
} from "../scheduling/types";

export async function handleGenerateSchedule(
  params: ScheduleGenerationParams
): Promise<ScheduleResponse> {
  const { departmentId, month, year, requiredDailyCount } = params;

  if (
    !departmentId ||
    !month ||
    !year ||
    requiredDailyCount === undefined ||
    requiredDailyCount < 0
  ) {
    return {
      error: true,
      message:
        "Missing or invalid required scheduling parameters (Department, Month, Year, Daily Count).",
    };
  }

  // --- 2. Input Setup and Date Generation ---
  const transaction = await sequelize.transaction();
  try {
    const daysInMonth = new Date(year, month, 0).getDate();

    // Ensure CalendarDay records exist for the entire month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);

      // Find or Create the CalendarDay record
      await CalendarDay.findOrCreate({
        where: {
          date: date.toISOString().slice(0, 10),
        },
        defaults: {
          departmentId: params.departmentId,
        },
        transaction,
      });
    }

    // --- 3. Run Scheduler Algorithm ---

    // 🛑 FIX 2: Updated clearExistingSchedule to use the more robust employee-based clearing
    await clearExistingSchedule(departmentId, month, year, transaction);

    const scheduleResult: ScheduleResult = await runDutyScheduler(params);

    // --- 4. Persist Results (Store Assignments) ---

    const newAssignments: any[] = [];

    for (const dailyAssignment of scheduleResult.schedule) {
      const calendarDayRecord = await CalendarDay.findOne({
        where: { date: dailyAssignment.date },
        attributes: ["id"],
        transaction,
      });

      if (!calendarDayRecord || !calendarDayRecord.getDataValue("id")) continue;
      const calendarDayId = calendarDayRecord.getDataValue("id");

      // Find the department's dutyType to save with the assignment
      const department = await Department.findOne({
        where: { id: departmentId },
        attributes: ["dutyType"],
        transaction,
      });

      const dutyType = department ? department.getDataValue("dutyType") : null;

      // Create one DutyAssignment record for each assigned employee
      for (const employeeId of dailyAssignment.employeeIds) {
        newAssignments.push({
          employeeId: employeeId,
          calendarDayId: calendarDayId,
          isLocked: false,
          dutyType: dutyType, // Save the department's duty type
        });
      }
    }

    // Bulk insert all new assignments
    await DutyAssignment.bulkCreate(newAssignments, { transaction });

    await transaction.commit();

    return {
      success: true,
      message: "Schedule generated and saved successfully.",
      summary: scheduleResult.summary,
    };
  } catch (error: any) {
    await transaction.rollback();
    console.error("Schedule generation failed:", error);
    return {
      error: true,
      message: `Failed to generate schedule: ${error.message}`,
    };
  }
}

async function clearExistingSchedule(
  departmentId: number,
  month: number,
  year: number,
  transaction: any
) {
  const startDate = new Date(year, month - 1, 1).toISOString().slice(0, 10);
  const endDate = new Date(year, month, 0).toISOString().slice(0, 10); // Last day of the month

  // 1. Fetch CalendarDay IDs for the month (no department filter)
  const calendarDays = (await CalendarDay.findAll({
    where: {
      date: {
        [Op.between]: [startDate, endDate],
      },
    },
    attributes: ["id"],
    raw: true,
    transaction,
  })) as unknown as Array<{ id: number }>;

  const calendarDayIds = calendarDays.map((d) => d.id);

  if (calendarDayIds.length === 0) return;

  // 2. Fetch Employee IDs belonging to the target Department
  const departmentEmployees = (await Employee.findAll({
    where: { departmentId: departmentId },
    attributes: ["id"],
    raw: true,
    transaction,
  })) as unknown as Array<{ id: number }>;

  const employeeIds = departmentEmployees.map((e) => e.id);

  if (employeeIds.length === 0) return;

  // 3. Clear DutyAssignments linked to these employees AND these calendar days
  await DutyAssignment.destroy({
    where: {
      calendarDayId: {
        [Op.in]: calendarDayIds,
      },
      employeeId: {
        [Op.in]: employeeIds,
      },
    },
    transaction,
  });
}

export async function handleGetSchedule(
  departmentId: number,
  month: number,
  year: number
): Promise<any> {
  try {
    // 1. Calculate Date Range
    const startDate = new Date(year, month - 1, 1).toISOString().slice(0, 10);
    const endDate = new Date(year, month, 0).toISOString().slice(0, 10); // Last day of the month

    // 2. Fetch Assignments with Employee and Day details
    const assignments = await DutyAssignment.findAll({
      // 🛑 The include structure is critical for retrieving associated data
      include: [
        {
          model: Employee,
          as: "employee",
          attributes: ["id", "fullName", "departmentId"],
          // 🛑 Filter by the Employee's department
          where: { departmentId: departmentId },
        },
        {
          model: CalendarDay,
          as: "calendarDay",
          attributes: ["id", "date"],
          // 🛑 Filter by the CalendarDay's date range
          where: {
            date: {
              [Op.between]: [startDate, endDate],
            },
          },
        },
      ],
      // 3. Select only the necessary assignment attributes
      attributes: ["id", "dutyType", "isLocked"],
      // 4. Order the results by date for easy processing on the frontend
      order: [[{ model: CalendarDay, as: "calendarDay" }, "date", "ASC"]],
    });

    // We can clean up the results to make them easier for the frontend (optional but recommended)
    const formattedSchedule = assignments.map((assignment) => {
      const raw = assignment.get({ plain: true });

      return {
        assignmentId: raw.id,
        date: raw.calendarDay.date,
        dutyType: raw.dutyType,
        employeeId: raw.employee.id,
        employeeName: raw.employee.fullName,
        isLocked: raw.isLocked,
      };
    });

    return { success: true, schedule: formattedSchedule };
  } catch (error: any) {
    console.error("Schedule retrieval failed:", error);
    return {
      error: true,
      message: `Failed to retrieve schedule: ${error.message}`,
    };
  }
}

export async function handleDeleteSchedule(
  departmentId: number,
  month: number,
  year: number
): Promise<{ success: boolean; message: string }> {
  const transaction = await sequelize.transaction();

  try {
    // 2. Clear using your existing robust logic
    await clearExistingSchedule(departmentId, month, year, transaction);

    await transaction.commit();
    return {
      success: true,
      message: `Successfully cleared the roster for ${month}/${year}.`,
    };
  } catch (error: any) {
    await transaction.rollback();
    return {
      success: false,
      message: `Failed to delete: ${error.message}`,
    };
  }
}
