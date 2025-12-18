// src/api/roles.ts
export async function getRoles() {
  return await window.api.invoke("get-roles");
}

export async function addRole(data: any) {
  return await window.api.invoke("add-role", data);
}

export async function updateRole(data: any) {
  return await window.api.invoke("update-role", data);
}

export async function deleteRole(id: number) {
  return await window.api.invoke("delete-role", id);
}