// src/api/schedule.ts (Frontend API Helper)

// Define the required types on the frontend as well for type safety
interface ScheduleGenerationParams {
  departmentId: number;
  month: number;
  year: number;
  requiredDailyCount: number;
}

interface ScheduleResponse {
  success?: boolean;
  error?: boolean;
  message: string;
  summary?: any; // The summary object from the scheduler
}

export interface FormattedAssignment {
  assignmentId: number;
  date: string; // ISO date string (YYYY-MM-DD)
  dutyType: string;
  employeeId: number;
  employeeName: string;
  isLocked: boolean;
}

export interface GetScheduleResponse {
  success: boolean;
  error?: boolean;
  message?: string;
  schedule?: FormattedAssignment[];
}

/**
 * Calls the Electron main process to generate a new schedule for a given period.
 * @param params The generation parameters.
 * @returns A promise that resolves to the schedule response or error object.
 */
export async function generateSchedule(
  params: ScheduleGenerationParams
): Promise<ScheduleResponse> {
  try {
    // This invokes the ipcMain.handle("generate-schedule", ...) function in the main process
    const result: ScheduleResponse = await (window as any).api.invoke(
      "generate-schedule",
      params
    );
    return result;
  } catch (error: any) {
    console.error("Frontend IPC Error during generateSchedule:", error);
    return { error: true, message: "Network or IPC communication failed." };
  }
}

export async function getSchedule(
  params: Omit<ScheduleGenerationParams, "requiredDailyCount">
): Promise<GetScheduleResponse> {
  if (!window.api || typeof window.api.invoke !== "function") {
    console.error("Electron API not available.");
    return {
      success: false,
      error: true,
      message: "App not running in Electron context.",
    };
  }

  try {
    // 🛑 Call the IPC handler registered in the backend
    const result: GetScheduleResponse = await window.api.invoke(
      "get-schedule", // This channel is now correctly typed
      params
    );

    if (result.error) {
      console.error("Backend error retrieving schedule:", result.message);
    }

    return result;
  } catch (error: any) {
    console.error("Frontend IPC failed for schedule retrieval:", error);
    return {
      success: false,
      error: true,
      message: `Failed to fetch schedule: ${error.message}`,
    };
  }
}

export async function deleteSchedule(params: {
  departmentId: number;
  month: number;
  year: number;
}): Promise<{ success: boolean; error?: boolean; message: string }> {
  if (!window.api || typeof window.api.invoke !== "function") {
    return {
      success: false,
      error: true,
      message: "App not running in Electron context.",
    };
  }

  try {
    const result = await window.api.invoke("delete-schedule", params);
    return result;
  } catch (error: any) {
    console.error("Frontend IPC failed for schedule deletion:", error);
    return {
      success: false,
      error: true,
      message: `Failed to delete schedule: ${error.message}`,
    };
  }
}

export async function exportSchedule(params: {
  assignments: FormattedAssignment[];
  month: number;
  year: number;
  deptName: string;
}): Promise<{ success: boolean; message?: string }> {
  if (!window.api || typeof window.api.invoke !== "function") {
    return {
      success: false,
      message: "App not running in Electron context.",
    };
  }

  try {
    // This channel "export-schedule" must match the one in your Main process
    const result = await window.api.invoke("export-schedule", params);
    return result;
  } catch (error: any) {
    console.error("Frontend IPC failed for schedule export:", error);
    return {
      success: false,
      message: `Export failed: ${error.message}`,
    };
  }
}
