"use client";

import {
  addDepartment,
  deleteDepartment,
  getDepartments,
  updateDepartment,
} from "@/api/departments";
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
import { Building2, Check, Info, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import AdminBackButton from "../elements/AdminBackButton";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [dutyType, setDutyType] = useState("24/48");
  const [description, setDescription] = useState("");

  const dutyTypes = ["24/48", "12-hour", "Daily duty"];

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getDepartments();
      setDepartments(res);
    } catch (error) {
      toaster.create({
        description: "Failed to load departments",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async () => {
    if (!name.trim()) {
      toaster.create({ description: "Name is required", type: "error" });
      return;
    }
    const payload = { name, description, dutyType };
    try {
      if (editingId) {
        await updateDepartment({ id: editingId, ...payload });
        toaster.create({
          description: "Updated successfully",
          type: "success",
        });
      } else {
        await addDepartment(payload);
        toaster.create({ description: "Added successfully", type: "success" });
      }
      resetForm();
      loadData();
    } catch (error) {
      toaster.create({ description: "An error occurred", type: "error" });
    }
  };

  const handleEditClick = (dept: any) => {
    setEditingId(dept.id);
    setName(dept.name);
    setDutyType(dept.dutyType);
    setDescription(dept.description || "");
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    try {
      await deleteDepartment(id);
      loadData();
      if (editingId === id) resetForm();
    } catch (error) {}
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setDutyType("24/48");
    setDescription("");
  };

  return (
    <Box minHeight="100vh" bg="#F8FAFC">
      {/* Top Navigation Bar */}
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
        <Container maxW="7xl">
          <Flex justify="space-between" align="center">
            <HStack gap={4}>
              <Box bg="brand.50" p={2} borderRadius="lg">
                <Building2 size={24} color="var(--chakra-colors-brand-600)" />
              </Box>
              <VStack align="flex-start" gap={0}>
                <Heading size="md" fontWeight="bold" color="gray.800">
                  Departments
                </Heading>
                <Text fontSize="xs" color="gray.500">
                  System Configuration
                </Text>
              </VStack>
            </HStack>
            <AdminBackButton label="Back to Dashboard" />
          </Flex>
        </Container>
      </Box>

      <Container maxW="8xl" py={12} px={10}>
        <Flex gap={8} direction={{ base: "column", xl: "row" }}>
          {/* Form Panel */}

          <Box width={{ base: "100%", xl: "400px" }}>
            <Card.Root
              border="none"
              boxShadow="0 4px 20px rgba(0, 0, 0, 0.05)"
              borderRadius="2xl"
              overflow="hidden"
              bg="white"
            >
              {/* Clean, Dark Header for visual structure */}
              <Box bg="gray.900" p={6}>
                <VStack align="flex-start" gap={1}>
                  <Text fontWeight="bold" fontSize="lg" color="white">
                    {editingId ? "Modify Department" : "Quick Add Unit"}
                  </Text>
                  <Text fontSize="xs" color="gray.400">
                    Set up operational parameters for the unit.
                  </Text>
                </VStack>
              </Box>

              <Card.Body p={8}>
                <Stack gap={6}>
                  {/* Department Name */}
                  <Field.Root>
                    <Field.Label
                      fontSize="xs"
                      textTransform="uppercase"
                      fontWeight="800"
                      color="gray.500"
                      letterSpacing="wider"
                      mb={2}
                      ml={1}
                    >
                      Official Name
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
                      px={4}
                      h="50px"
                      borderRadius="md"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Pediatrics"
                    />
                  </Field.Root>

                  {/* Duty Schedule */}
                  <Field.Root>
                    <Field.Label
                      fontSize="xs"
                      textTransform="uppercase"
                      fontWeight="800"
                      color="gray.500"
                      letterSpacing="wider"
                      mb={2}
                      ml={1}
                    >
                      Duty Cycle
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
                        px={4} // Matching internal padding
                        h="50px"
                        borderRadius="md"
                        value={dutyType}
                        onChange={(e) => setDutyType(e.target.value)}
                      >
                        {dutyTypes.map((t) => (
                          <option key={t} value={t}>
                            {t}
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
                      mb={2}
                      letterSpacing="wider"
                      ml={1}
                    >
                      Description / Notes
                    </Field.Label>
                    <Input
                      bg="gray.100"
                      border="1px solid"
                      borderColor="transparent"
                      _focus={{ bg: "white", borderColor: "brand.500" }}
                      px={4}
                      h="50px"
                      borderRadius="md"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Short unit description..."
                    />
                  </Field.Root>

                  <VStack gap={3} pt={4}>
                    <Button
                      onClick={handleSave}
                      colorPalette={editingId ? "orange" : "brand"}
                      size="xl"
                      width="full"
                      h="56px"
                      borderRadius="xl"
                      fontWeight="bold"
                      fontSize="md"
                      boxShadow="0 4px 12px {colors.brand.100}"
                    >
                      {editingId ? <Check size={20} /> : <Plus size={20} />}
                      {editingId ? "Update Department" : "Confirm & Create"}
                    </Button>

                    {editingId && (
                      <Button
                        variant="ghost"
                        width="full"
                        onClick={resetForm}
                        color="gray.500"
                        fontSize="sm"
                      >
                        Discard Changes
                      </Button>
                    )}
                  </VStack>
                </Stack>
              </Card.Body>
            </Card.Root>
          </Box>

          {/* Data List Panel */}
          <Box flex="1">
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
                      letterSpacing="wider"
                      py={5}
                      px={6}
                    >
                      Unit Name
                    </Table.ColumnHeader>
                    <Table.ColumnHeader
                      color="gray.500"
                      textTransform="uppercase"
                      fontSize="xs"
                      fontWeight="800"
                      letterSpacing="wider"
                    >
                      Schedule Type
                    </Table.ColumnHeader>
                    <Table.ColumnHeader
                      color="gray.500"
                      textTransform="uppercase"
                      fontSize="xs"
                      fontWeight="800"
                      letterSpacing="wider"
                    >
                      Description
                    </Table.ColumnHeader>
                    <Table.ColumnHeader
                      textAlign="right"
                      px={6}
                    ></Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>

                <Table.Body>
                  {departments.map((d) => (
                    <Table.Row
                      key={d.id}
                      _hover={{ bg: "gray.50/50" }}
                      bg={editingId === d.id ? "brand.50/30" : "transparent"}
                      transition="all 0.2s"
                      borderBottomWidth="1px"
                      borderColor="gray.50"
                    >
                      <Table.Cell py={6} px={6}>
                        <Text fontWeight="700" color="gray.800" fontSize="md">
                          {d.name}
                        </Text>
                      </Table.Cell>

                      <Table.Cell>
                        <Badge
                          variant="subtle"
                          colorPalette="blue"
                          px={3}
                          py={1}
                          borderRadius="lg"
                          textTransform="none"
                          fontWeight="bold"
                        >
                          {d.dutyType}
                        </Badge>
                      </Table.Cell>

                      <Table.Cell color="gray.600" fontSize="sm" maxW="300px">
                        <Text truncate>
                          {d.description || (
                            <Text color="gray.300" as="span" fontStyle="italic">
                              No description provided
                            </Text>
                          )}
                        </Text>
                      </Table.Cell>

                      <Table.Cell textAlign="right" px={6}>
                        <HStack justify="flex-end" gap={2}>
                          <IconButton
                            size="sm"
                            variant="subtle"
                            bg="transparent"
                            onClick={() => handleEditClick(d)}
                            color="gray.400"
                            _hover={{
                              color: "brand.600",
                              bg: "brand.50",
                              transform: "translateY(-1px)",
                            }}
                            transition="all 0.2s"
                          >
                            <Pencil size={16} />
                          </IconButton>
                          <IconButton
                            size="sm"
                            variant="subtle"
                            bg="transparent"
                            onClick={() => handleDelete(d.id)}
                            color="gray.400"
                            _hover={{
                              color: "red.600",
                              bg: "red.50",
                              transform: "translateY(-1px)",
                            }}
                            transition="all 0.2s"
                          >
                            <Trash2 size={16} />
                          </IconButton>
                        </HStack>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>

              {departments.length === 0 && (
                <VStack py={32} gap={4} bg="white">
                  <Box bg="gray.50" p={6} borderRadius="full">
                    <Info size={48} color="var(--chakra-colors-gray-300)" />
                  </Box>
                  <VStack gap={1}>
                    <Text color="gray.800" fontWeight="bold" fontSize="lg">
                      No units configured
                    </Text>
                    <Text color="gray.500" fontSize="sm">
                      Start by adding a department using the form on the left.
                    </Text>
                  </VStack>
                </VStack>
              )}
            </Card.Root>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
}
