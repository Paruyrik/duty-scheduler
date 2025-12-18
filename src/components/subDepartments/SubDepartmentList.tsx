"use client";

import { getDepartments } from "@/api/departments";
import {
  addSubDepartment,
  deleteSubDepartment,
  getSubDepartments,
  updateSubDepartment,
} from "@/api/subDepartments";
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
import { Check, Layers, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import AdminBackButton from "../elements/AdminBackButton";

export default function SubDepartmentsPage() {
  const [subDepartments, setSubDepartments] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const subsResponse = await getSubDepartments();
      const depsResponse = await getDepartments();

      const subsArray = subsResponse?.data ? subsResponse.data : subsResponse;
      const depsArray = depsResponse?.data ? depsResponse.data : depsResponse;

      setSubDepartments(Array.isArray(subsArray) ? subsArray : []);
      setDepartments(Array.isArray(depsArray) ? depsArray : []);
    } catch (error) {
      toaster.create({ description: "Failed to load data", type: "error" });
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
        description: "Name and Parent Department are required",
        type: "warning",
      });
      return;
    }

    const payload = { name, description, departmentId: departmentId };

    try {
      if (editingId) {
        await updateSubDepartment({ id: editingId, ...payload });
        toaster.create({
          description: "Updated successfully",
          type: "success",
        });
      } else {
        await addSubDepartment(payload);
        toaster.create({
          description: "Created successfully",
          type: "success",
        });
      }
      resetForm();
      loadData();
    } catch (error) {
      toaster.create({ description: "Action failed", type: "error" });
    }
  };

  const handleEditClick = (sub: any) => {
    setEditingId(sub.id);
    setName(sub.name);
    setDescription(sub.description || "");
    setDepartmentId(sub.departmentId.toString());
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    try {
      await deleteSubDepartment(id);
      loadData();
      if (editingId === id) resetForm();
    } catch (error) {}
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setDepartmentId("");
  };

  return (
    <Box minHeight="100vh" bg="#F8FAFC">
      {/* Top Navigation */}
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
                <Layers size={24} color="var(--chakra-colors-brand-600)" />
              </Box>
              <VStack align="flex-start" gap={0}>
                <Heading size="md" fontWeight="bold" color="gray.800">
                  Sub-Departments
                </Heading>
                <Text fontSize="xs" color="gray.500">
                  Organizational Hierarchy
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
                    {editingId ? "Modify Sub-Unit" : "Create Sub-Unit"}
                  </Text>
                  <Text fontSize="xs" color="gray.400">
                    Assign teams to their parent departments.
                  </Text>
                </VStack>
              </Box>

              <Card.Body p={10}>
                <Stack gap={8}>
                  {/* Parent Selection */}
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
                        <option value="">Select Parent...</option>
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </NativeSelect.Field>
                      <NativeSelect.Indicator />
                    </NativeSelect.Root>
                  </Field.Root>

                  {/* Sub-Dept Name */}
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
                      Sub-Department Name
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
                      placeholder="e.g. Night Shift Team A"
                    />
                  </Field.Root>

                  {/* Description */}
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
                      Notes
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
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Optional details..."
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
                      fontSize="lg"
                      boxShadow="0 8px 20px rgba(0, 119, 230, 0.15)"
                    >
                      {editingId ? <Check size={22} /> : <Plus size={22} />}
                      {editingId ? "Update Sub-Unit" : "Confirm & Create"}
                    </Button>
                    {editingId && (
                      <Button
                        variant="ghost"
                        width="full"
                        onClick={resetForm}
                        color="gray.500"
                      >
                        Discard Changes
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
              {/* Table Toolbar */}
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
                    <Plus size={18} style={{ transform: "rotate(45deg)" }} />{" "}
                    {/* Using Plus rotated as a Search crosshair or just use Search icon */}
                  </Box>
                  <Input
                    placeholder="Search sub-units or departments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    bg="gray.50"
                    border="1px solid"
                    borderColor="gray.100"
                    _focus={{
                      bg: "white",
                      borderColor: "brand.500",
                      boxShadow: "0 0 0 1px {colors.brand.500}",
                      outline: "none",
                    }}
                    h="44px"
                    pl={12}
                    borderRadius="lg"
                    fontSize="sm"
                  />
                </HStack>

                <Text
                  fontSize="xs"
                  fontWeight="bold"
                  color="gray.400"
                  textTransform="uppercase"
                  letterSpacing="widest"
                >
                  {
                    subDepartments.filter((s) =>
                      s.name.toLowerCase().includes(searchQuery.toLowerCase())
                    ).length
                  }{" "}
                  Results
                </Text>
              </Flex>

              {/* Table Card */}
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
                        Sub-Unit Info
                      </Table.ColumnHeader>
                      <Table.ColumnHeader
                        color="gray.500"
                        textTransform="uppercase"
                        fontSize="xs"
                        fontWeight="800"
                        letterSpacing="wider"
                      >
                        Parent Dept
                      </Table.ColumnHeader>
                      <Table.ColumnHeader
                        textAlign="right"
                        px={6}
                      ></Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {subDepartments
                      .filter(
                        (s) =>
                          s.name
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()) ||
                          (
                            departments.find((d) => d.id === s.departmentId)
                              ?.name || ""
                          )
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase())
                      )
                      .map((s) => (
                        <Table.Row
                          key={s.id}
                          _hover={{ bg: "gray.50/50" }}
                          bg={
                            editingId === s.id ? "brand.50/30" : "transparent"
                          }
                          transition="all 0.2s"
                        >
                          <Table.Cell py={6} px={6}>
                            <VStack align="flex-start" gap={0}>
                              <Text fontWeight="700" color="gray.800">
                                {s.name}
                              </Text>
                              <Text fontSize="xs" color="gray.400">
                                {s.description || "No description"}
                              </Text>
                            </VStack>
                          </Table.Cell>
                          <Table.Cell>
                            <Badge
                              variant="subtle"
                              colorPalette="blue"
                              px={3}
                              py={1}
                              borderRadius="lg"
                            >
                              {s.department?.name ||
                                departments.find((d) => d.id === s.departmentId)
                                  ?.name ||
                                "Unknown"}
                            </Badge>
                          </Table.Cell>
                          <Table.Cell textAlign="right" px={6}>
                            <HStack justify="flex-end" gap={2}>
                              <IconButton
                                size="sm"
                                variant="subtle"
                                bg="transparent"
                                onClick={() => handleEditClick(s)}
                                color="gray.400"
                                _hover={{ color: "brand.600", bg: "brand.50" }}
                              >
                                <Pencil size={16} />
                              </IconButton>
                              <IconButton
                                size="sm"
                                variant="subtle"
                                bg="transparent"
                                onClick={() => handleDelete(s.id)}
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

                {/* Empty Search State */}
                {subDepartments.length > 0 &&
                  subDepartments.filter((s) =>
                    s.name.toLowerCase().includes(searchQuery.toLowerCase())
                  ).length === 0 && (
                    <VStack py={20} bg="white">
                      <Text color="gray.400" fontSize="sm">
                        No sub-units match "{searchQuery}"
                      </Text>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSearchQuery("")}
                      >
                        Clear Search
                      </Button>
                    </VStack>
                  )}
              </Card.Root>
            </Stack>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
}
