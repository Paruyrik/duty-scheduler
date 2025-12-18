//backend/utils/export

import * as XLSX from "xlsx";

export async function exportScheduleToExcel(
  formattedAssignments: any[],
  month: number,
  year: number,
  _deptName: string
) {
  // 1. Create a Header Row (Dates: 1, 2, 3...)
  const daysInMonth = new Date(year, month, 0).getDate();
  const headers = [
    "Staff Member",
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // 2. Group assignments by Employee Name
  const staffMap: Record<string, string[]> = {};

  formattedAssignments.forEach((asm) => {
    if (!staffMap[asm.employeeName]) {
      staffMap[asm.employeeName] = new Array(daysInMonth).fill("");
    }
    const day = new Date(asm.date).getDate();
    staffMap[asm.employeeName][day - 1] = "DUTY"; // You can replace with asm.dutyType
  });

  // 3. Create the Data Rows
  const rows = Object.entries(staffMap).map(([name, duties]) => {
    return [name, ...duties];
  });

  // 4. Build the Workbook
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Roster");

  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
}
