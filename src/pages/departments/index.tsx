"use client";

import { Box } from "@chakra-ui/react";
import AddDepartmentForm from "../../components/departments/DepartmentList";

export default function DepartmentsPage() {
  return (
    <Box bg="gray.50" minH="100vh">
      <AddDepartmentForm />
    </Box>
  );
}
