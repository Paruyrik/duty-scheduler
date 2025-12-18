import {
  Department as DepartmentModel,
  Employee as EmployeeModel,
} from "../database";
import {
  DailyAssignment,
  EmployeeConstraint,
  RawEmployeeDbRecord,
  ScheduleGenerationParams,
  ScheduleResult,
} from "./types";

export async function generateSchedule(
  params: ScheduleGenerationParams
): Promise<ScheduleResult> {
  const { departmentId, month, year, requiredDailyCount } = params;

  // --- 1. PRE-FETCH DATA (Avoid DB calls in loops) ---
  const [dbEmployees, _department] = await Promise.all([
    EmployeeModel.findAll({ where: { departmentId }, raw: true }),
    DepartmentModel.findOne({
      where: { id: departmentId },
      attributes: ["name"],
    }),
  ]);

  const rawEmployees = dbEmployees as unknown as RawEmployeeDbRecord[];
  const warnings: string[] = [];

  // Transform DB records into stateful constraints
  let constraints: (EmployeeConstraint & { lastAssignedDay: number })[] =
    rawEmployees.map((e) => ({
      id: e.id,
      fullName: e.fullName,
      departmentId: e.departmentId,
      roleId: e.roleId,
      monthlyDesiredDuties: e.monthlyDesiredDuties || 4,
      currentDuties: 0,
      lastAssignedDay: -2, // Allows assignment on Day 1
      unavailableDays: e.unavailableDays ? JSON.parse(e.unavailableDays) : [],
      externalDutyDays: e.externalDutyDays
        ? JSON.parse(e.externalDutyDays)
        : [],
      unavailableWeekdays: e.unavailableWeekdays
        ? JSON.parse(e.unavailableWeekdays)
        : [],
      preferredDays: e.preferredDays ? JSON.parse(e.preferredDays) : [],
      preferredWeekdays: e.preferredWeekdays
        ? JSON.parse(e.preferredWeekdays)
        : [],
      flexibleDays: e.flexibleDays ? JSON.parse(e.flexibleDays) : [],
    }));

  const daysInMonth = new Date(year, month, 0).getDate();
  const scheduledDays: DailyAssignment[] = [];
  let totalDutiesAssigned = 0;

  // --- 2. CORE SCHEDULING LOOP ---
  for (let day = 1; day <= daysInMonth; day++) {
    const dateString = `${year}-${String(month).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
    const dateObj = new Date(year, month - 1, day);
    const dayOfWeek = dateObj.toLocaleDateString("en-US", { weekday: "short" });

    // A. FILTER HARD CONSTRAINTS (Eligibility)
    let eligible = constraints.filter((emp) => {
      // 1. Absolute Unavailability
      if (emp.unavailableDays.includes(dateString)) return false;
      if (emp.unavailableWeekdays.includes(dayOfWeek)) return false;

      // 2. Duty Cap
      if (emp.currentDuties >= emp.monthlyDesiredDuties) return false;

      // 3. Rest Period (Min 24h between duties)
      if (day - emp.lastAssignedDay < 2) return false;

      // 4. External Duty Conflict
      if (emp.externalDutyDays.includes(dateString)) return false;

      return true;
    });

    // B. CALCULATE SCORES (Soft Constraints)
    // Lower score = higher priority
    const scoredEmployees = eligible.map((emp) => {
      let score = 0;

      // Priority 1: Distance from Duty Cap (Heavy Weight)
      // Someone with 0/4 duties should be picked before someone with 3/4
      const completionRatio = emp.currentDuties / emp.monthlyDesiredDuties;
      score += completionRatio * 50;

      // Priority 2: Preferred Days (Reward)
      if (emp.preferredDays.includes(dateString)) score -= 20;
      if (emp.preferredWeekdays.includes(dayOfWeek)) score -= 10;
      if (emp.flexibleDays.includes(dateString)) score -= 5;

      // Priority 3: Randomness (Prevents same people getting same days every month)
      score += Math.random() * 5;

      return { emp, score };
    });

    // C. SORT AND SELECT
    scoredEmployees.sort((a, b) => a.score - b.score);
    const selected = scoredEmployees.slice(0, requiredDailyCount);

    // --- SAFETY CHECK ---
    if (selected.length < requiredDailyCount) {
      warnings.push(
        `Shortage on ${dateString}: Found ${selected.length} of ${requiredDailyCount} required personnel.`
      );
    }

    const assignmentsForDay: DailyAssignment = {
      date: dateString,
      employees: [],
      employeeIds: [],
    };

    selected.forEach(({ emp }) => {
      assignmentsForDay.employees.push(emp.fullName);
      assignmentsForDay.employeeIds.push(emp.id);
      emp.currentDuties++;
      emp.lastAssignedDay = day;
      totalDutiesAssigned++;
    });

    scheduledDays.push(assignmentsForDay);
  }

return {
    schedule: scheduledDays,
    summary: {
      totalDaysScheduled: daysInMonth,
      totalDutiesAssigned,
      employeeDutyCount: constraints.reduce((acc, emp) => {
        acc[emp.id] = emp.currentDuties;
        return acc;
      }, {} as { [key: number]: number }),
      warnings, // Include the warnings in the response
    },
  };
}
