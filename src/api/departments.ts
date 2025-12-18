// src/api/departments.ts

export async function getDepartments() {
  return await window.api.invoke("get-departments");
}

export async function addDepartment(data: any) {
  return await window.api.invoke("add-department", data);
}

export async function updateDepartment(data: any) {
  return await window.api.invoke("update-department", data);
}

export async function deleteDepartment(id: number) {
  return await window.api.invoke("delete-department", id);
}
