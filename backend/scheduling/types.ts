// src/backend/scheduling/types.ts
export interface ScheduleGenerationParams {
  departmentId: number;
  month: number;
  year: number;
  requiredDailyCount: number;
}

export interface RawEmployeeDbRecord {
  id: number;
  fullName: string;
  departmentId: number;
  roleId: number;
  monthlyDesiredDuties: number;
  // JSON fields are returned as string or null
  unavailableDays: string | null;
  unavailableWeekdays: string | null;
  flexibleDays: string | null;
  preferredDays: string | null;
  preferredWeekdays: string | null;
  externalDutyDays: string | null;
  // Add other necessary DB fields if you use them (e.g., SubDepartmentId)
}

export interface EmployeeConstraint {
  id: number;
  fullName: string;
  departmentId: number;
  roleId: number;
  monthlyDesiredDuties: number;
  currentDuties: number;
  unavailableDays: string[];
  externalDutyDays: string[];
  unavailableWeekdays: string[];
  flexibleDays: string[];
  preferredDays: string[];
  preferredWeekdays: string[];
}

export interface DailyAssignment {
  date: string; // YYYY-MM-DD
  employees: string[];
  employeeIds: number[];
}

export interface ScheduleResult {
  schedule: DailyAssignment[];
  summary: {
    totalDaysScheduled: number;
    totalDutiesAssigned: number;
    employeeDutyCount: { [employeeId: number]: number };
    warnings?: string[];
  };
}

export interface ScheduleResponse {
  success?: boolean;
  error?: boolean;
  message: string;
  summary?: ScheduleResult["summary"]; // Summary of the generated schedule
}
