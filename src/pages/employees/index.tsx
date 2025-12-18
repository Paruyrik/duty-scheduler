// src/pages/employees/index.tsx

"use client";

import { Box } from "@chakra-ui/react";
import dynamic from "next/dynamic";
const EmployeeList = dynamic(
  () => import("@/components/employees/EmployeeList"),
  {
    ssr: false,
  }
);

export default function StaffPage() {
  return (
    <Box bg="gray.50" minH="100vh">
      <EmployeeList />
    </Box>
  );
}
