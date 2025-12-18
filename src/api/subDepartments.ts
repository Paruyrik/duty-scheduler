export const addSubDepartment = (data: any) =>
  window.api.invoke("add-sub-department", data);

export const getSubDepartments = () => window.api.invoke("get-sub-departments");

export const updateSubDepartment = (data: any) =>
  window.api.invoke("update-sub-department", data);

export const deleteSubDepartment = (id: number) =>
  window.api.invoke("delete-sub-department", id);
