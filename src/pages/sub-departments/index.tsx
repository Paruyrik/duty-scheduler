"use client";

import AddSubDepartmentForm from "@/components/subDepartments/SubDepartmentList";
import { Box } from "@chakra-ui/react";

export default function SubDepartmentsPage() {
  return (
    <Box bg="gray.50" minH="100vh">
      <AddSubDepartmentForm />
    </Box>
  );
}
