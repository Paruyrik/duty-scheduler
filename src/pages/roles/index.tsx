// src/pages/roles.tsx

import RoleList from "@/components/roles/RoleList";
import { Box } from "@chakra-ui/react";

export default function RolesPage() {
  return (
    <Box bg="gray.50" minH="100vh">
      <RoleList />
    </Box>
  );
}
