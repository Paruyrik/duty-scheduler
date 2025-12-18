// src/api/employees.ts

export async function getEmployees() {
  return await window.api.invoke("get-employees");
}

export async function addEmployee(data: any) {
  return await window.api.invoke("add-employee", data);
}

export async function updateEmployee(data: any) {
  return await window.api.invoke("update-employee", data);
}

export async function deleteEmployee(id: number) {
  return await window.api.invoke("delete-employee", id);
}