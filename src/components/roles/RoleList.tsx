"use client";

import { getDepartments } from "@/api/departments";
import { addRole, deleteRole, getRoles, updateRole } from "@/api/roles";
import { toaster } from "@/components/ui/toaster";
import {
  Badge,
  Box,
  Button,
  Card,
  Container,
  Field,
  Flex,
  Heading,
  HStack,
  IconButton,
  Input,
  NativeSelect,
  Stack,
  Table,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Check, Pencil, Plus, Search, ShieldCheck, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import AdminBackButton from "../elements/AdminBackButton";

export default function RolesPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Form State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [departmentId, setDepartmentId] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [roleRes, deptRes] = await Promise.all([
        getRoles(),
        getDepartments(),
      ]);

      const rolesArray = roleRes?.data ? roleRes.data : roleRes;
      const depsArray = deptRes?.data ? deptRes.data : deptRes;

      setRoles(Array.isArray(rolesArray) ? rolesArray : []);
      setDepartments(Array.isArray(depsArray) ? depsArray : []);
    } catch (error) {
      toaster.create({ description: "Failed to load roles", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async () => {
    if (!name || !departmentId) {
      toaster.create({
        description: "Name and Department are required",
        type: "warning",
      });
      return;
    }

    const payload = {
      name,
      departmentId: Number(departmentId),
      ...(editingId && { id: editingId }),
    };

    try {
      if (editingId) {
        await updateRole(payload);
        toaster.create({ description: "Role updated", type: "success" });
      } else {
        await addRole(payload);
        toaster.create({ description: "Role created", type: "success" });
      }
      resetForm();
      loadData();
    } catch (error) {
      toaster.create({ description: "Operation failed", type: "error" });
    }
  };

  const handleEditClick = (role: any) => {
    setEditingId(role.id);
    setName(role.name);
    setDepartmentId(role.departmentId.toString());
  };

  const handleDelete = async (id: number, roleName: string) => {
    if (!confirm(`Delete the role "${roleName}"?`)) return;
    try {
      await deleteRole(id);
      loadData();
      if (editingId === id) resetForm();
      toaster.create({ description: "Role removed", type: "info" });
    } catch (error) {}
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setDepartmentId("");
  };

  const filteredRoles = roles.filter((r) => {
    const deptName =
      r.Department?.name ||
      departments.find((d) => d.id === r.departmentId)?.name ||
      "";
    return (
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deptName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <Box minHeight="100vh" bg="#F8FAFC">
      {/* Top Nav */}
      <Box
        bg="white"
        borderBottom="1px solid"
        borderColor="gray.200"
        py={4}
        px={8}
        position="sticky"
        top={0}
        zIndex={10}
      >
        <Container maxW="8xl">
          <Flex justify="space-between" align="center">
            <HStack gap={4}>
              <Box bg="brand.50" p={2} borderRadius="lg">
                <ShieldCheck size={24} color="var(--chakra-colors-brand-600)" />
              </Box>
              <VStack align="flex-start" gap={0}>
                <Heading size="md" fontWeight="bold" color="gray.800">
                  Role Management
                </Heading>
                <Text fontSize="xs" color="gray.500">
                  Access Control & Designations
                </Text>
              </VStack>
            </HStack>
            <AdminBackButton label="Back to Dashboard" />
          </Flex>
        </Container>
      </Box>

      <Container maxW="8xl" py={12} px={10}>
        <Flex
          gap={12}
          direction={{ base: "column", xl: "row" }}
          align="flex-start"
        >
          {/* FORM PANEL */}
          <Box width={{ base: "100%", xl: "440px" }} flexShrink={0}>
            <Card.Root
              border="none"
              boxShadow="0 10px 30px rgba(0, 0, 0, 0.04)"
              borderRadius="2xl"
              overflow="hidden"
              bg="white"
            >
              <Box bg="gray.900" p={8} color="white">
                <VStack align="flex-start" gap={1}>
                  <Text fontWeight="bold" fontSize="xl">
                    {editingId ? "Modify Role" : "Create New Role"}
                  </Text>
                  <Text fontSize="xs" color="gray.400">
                    Define employee designations within departments.
                  </Text>
                </VStack>
              </Box>

              <Card.Body p={10}>
                <Stack gap={8}>
                  <Field.Root>
                    <Field.Label
                      fontSize="xs"
                      textTransform="uppercase"
                      fontWeight="800"
                      color="gray.500"
                      letterSpacing="wider"
                      mb={3}
                      ml={1}
                    >
                      Parent Department
                    </Field.Label>
                    <NativeSelect.Root size="lg">
                      <NativeSelect.Field
                        bg="gray.100"
                        border="1px solid"
                        borderColor="transparent"
                        _focus={{
                          bg: "white",
                          borderColor: "brand.500",
                          outline: "none",
                        }}
                        px={5}
                        h="56px"
                        borderRadius="xl"
                        value={departmentId}
                        onChange={(e) => setDepartmentId(e.target.value)}
                      >
                        <option value="">Choose Department...</option>
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </NativeSelect.Field>
                      <NativeSelect.Indicator />
                    </NativeSelect.Root>
                  </Field.Root>

                  <Field.Root>
                    <Field.Label
                      fontSize="xs"
                      textTransform="uppercase"
                      fontWeight="800"
                      color="gray.500"
                      letterSpacing="wider"
                      mb={3}
                      ml={1}
                    >
                      Role Designation
                    </Field.Label>
                    <Input
                      bg="gray.100"
                      border="1px solid"
                      borderColor="transparent"
                      _focus={{
                        bg: "white",
                        borderColor: "brand.500",
                        outline: "none",
                      }}
                      px={5}
                      h="56px"
                      borderRadius="xl"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Senior Surgeon"
                    />
                  </Field.Root>

                  <VStack gap={4} pt={4}>
                    <Button
                      onClick={handleSave}
                      colorPalette={editingId ? "orange" : "brand"}
                      size="xl"
                      width="full"
                      h="64px"
                      borderRadius="2xl"
                      fontWeight="bold"
                    >
                      {editingId ? <Check size={22} /> : <Plus size={22} />}
                      {editingId ? "Update Role" : "Confirm & Create"}
                    </Button>
                    {editingId && (
                      <Button
                        variant="ghost"
                        width="full"
                        onClick={resetForm}
                        color="gray.500"
                      >
                        Cancel
                      </Button>
                    )}
                  </VStack>
                </Stack>
              </Card.Body>
            </Card.Root>
          </Box>

          {/* TABLE PANEL */}
          <Box flex="1">
            <Stack gap={4}>
              <Flex
                bg="white"
                p={4}
                borderRadius="xl"
                boxShadow="0 2px 10px rgba(0,0,0,0.03)"
                align="center"
                justify="space-between"
              >
                <HStack flex="1" maxW="400px" position="relative">
                  <Box position="absolute" left={4} zIndex={1} color="gray.400">
                    <Search size={18} />
                  </Box>
                  <Input
                    placeholder="Search roles or departments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    bg="gray.50"
                    border="none"
                    px={12}
                    h="44px"
                    borderRadius="lg"
                    fontSize="sm"
                    _focus={{
                      bg: "white",
                      boxShadow: "0 0 0 2px var(--chakra-colors-brand-500)",
                    }}
                  />
                </HStack>
                <Badge
                  variant="subtle"
                  colorPalette="gray"
                  px={4}
                  py={1}
                  borderRadius="full"
                >
                  {filteredRoles.length} Active Roles
                </Badge>
              </Flex>

              <Card.Root
                border="none"
                boxShadow="0 4px 20px rgba(0, 0, 0, 0.05)"
                borderRadius="2xl"
                overflow="hidden"
                bg="white"
              >
                <Table.Root variant="line" size="md">
                  <Table.Header bg="gray.50/80">
                    <Table.Row borderBottomWidth="1px" borderColor="gray.100">
                      <Table.ColumnHeader
                        color="gray.500"
                        textTransform="uppercase"
                        fontSize="xs"
                        fontWeight="800"
                        py={5}
                        px={6}
                      >
                        Role Name
                      </Table.ColumnHeader>
                      <Table.ColumnHeader
                        color="gray.500"
                        textTransform="uppercase"
                        fontSize="xs"
                        fontWeight="800"
                      >
                        Department
                      </Table.ColumnHeader>
                      <Table.ColumnHeader
                        textAlign="right"
                        px={6}
                      ></Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {filteredRoles.map((r) => (
                      <Table.Row
                        key={r.id}
                        _hover={{ bg: "gray.50/50" }}
                        transition="all 0.2s"
                      >
                        <Table.Cell py={6} px={6}>
                          <Text fontWeight="700" color="gray.800">
                            {r.name}
                          </Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Badge
                            variant="subtle"
                            colorPalette="purple"
                            px={3}
                            py={1}
                            borderRadius="lg"
                          >
                            {r.Department?.name ||
                              departments.find((d) => d.id === r.departmentId)
                                ?.name ||
                              "---"}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell textAlign="right" px={6}>
                          <HStack justify="flex-end" gap={2}>
                            <IconButton
                              size="sm"
                              variant="subtle"
                              bg="transparent"
                              onClick={() => handleEditClick(r)}
                              color="gray.400"
                              _hover={{ color: "brand.600", bg: "brand.50" }}
                            >
                              <Pencil size={16} />
                            </IconButton>
                            <IconButton
                              size="sm"
                              variant="subtle"
                              bg="transparent"
                              onClick={() => handleDelete(r.id, r.name)}
                              color="gray.400"
                              _hover={{ color: "red.600", bg: "red.50" }}
                            >
                              <Trash2 size={16} />
                            </IconButton>
                          </HStack>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              </Card.Root>
            </Stack>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
}
