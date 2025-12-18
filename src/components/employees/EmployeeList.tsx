"use client";

import { getDepartments } from "@/api/departments";
import {
  addEmployee,
  deleteEmployee,
  getEmployees,
  updateEmployee,
} from "@/api/employees";
import { getRoles } from "@/api/roles";
import { getSubDepartments } from "@/api/subDepartments";
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
  Separator,
  Stack,
  Table,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  Calendar,
  CalendarOff,
  Check,
  Fingerprint,
  Heart,
  Pencil,
  Plane,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import AdminBackButton from "../elements/AdminBackButton";
import EmployeeBulkImport from "../elements/EmployeeBulkImport";
import MultiDatePicker from "../elements/MultiDatePicker";
import WeekdaySelector from "../elements/WeekdaySelector";
import { Tooltip } from "../ui/tooltip";

export default function EmployeeListPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [subDepartments, setSubDepartments] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Form State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [monthlyDutyCount, setMonthlyDutyCount] = useState<number>(4);
  const [departmentId, setDepartmentId] = useState("");
  const [subDepartmentId, setSubDepartmentId] = useState("");
  const [roleId, setRoleId] = useState("");

  // Constraint States
  const [undesirableDates, setUndesirableDates] = useState<Date[]>([]);
  const [ifNecessaryDates, setIfNecessaryDates] = useState<Date[]>([]);
  const [desiredDates, setDesiredDates] = useState<Date[]>([]);
  const [externalDutyDates, setExternalDutyDates] = useState<Date[]>([]);
  const [unavailableWeekdays, setUnavailableWeekdays] = useState<string[]>([]);
  const [preferredWeekdays, setPreferredWeekdays] = useState<string[]>([]);

  // --- SAFE PARSER HELPERS ---
  const safeParseJSON = (str: any) => {
    if (!str || typeof str !== "string" || str.trim() === "") return [];
    try {
      return JSON.parse(str);
    } catch (e) {
      console.error("JSON Parse Error:", e);
      return [];
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [depsRes, subsRes, rolesRes, empRes] = await Promise.all([
        getDepartments(),
        getSubDepartments(),
        getRoles(),
        getEmployees(),
      ]);
      const getArr = (res: any) => (Array.isArray(res) ? res : res?.data || []);
      setDepartments(getArr(depsRes));
      setSubDepartments(getArr(subsRes));
      setRoles(getArr(rolesRes));
      setEmployees(getArr(empRes));
    } catch (error) {
      toaster.create({
        description: "Failed to load staff data",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredSubs = useMemo(
    () => subDepartments.filter((s) => s.departmentId === Number(departmentId)),
    [departmentId, subDepartments]
  );

  const filteredRoles = useMemo(
    () => roles.filter((r) => r.departmentId === Number(departmentId)),
    [departmentId, roles]
  );

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setMonthlyDutyCount(4);
    setDepartmentId("");
    setSubDepartmentId("");
    setRoleId("");
    setUndesirableDates([]);
    setIfNecessaryDates([]);
    setDesiredDates([]);
    setExternalDutyDates([]);
    setUnavailableWeekdays([]);
    setPreferredWeekdays([]);
  };

  const handleSave = async () => {
    if (!name || !departmentId || !roleId) {
      toaster.create({
        description: "Please fill required fields",
        type: "warning",
      });
      return;
    }
    const payload = {
      ...(editingId && { id: editingId }),
      fullName: name,
      monthlyDesiredDuties: Number(monthlyDutyCount),
      unavailableDays: JSON.stringify(
        undesirableDates.map((d) => d.toISOString().slice(0, 10))
      ),
      flexibleDays: JSON.stringify(
        ifNecessaryDates.map((d) => d.toISOString().slice(0, 10))
      ),
      preferredDays: JSON.stringify(
        desiredDates.map((d) => d.toISOString().slice(0, 10))
      ),
      externalDutyDays: JSON.stringify(
        externalDutyDates.map((d) => d.toISOString().slice(0, 10))
      ),
      unavailableWeekdays: JSON.stringify(unavailableWeekdays),
      preferredWeekdays: JSON.stringify(preferredWeekdays),
      departmentId: Number(departmentId),
      subDepartmentId: subDepartmentId ? Number(subDepartmentId) : null,
      roleId: Number(roleId),
    };

    try {
      if (editingId) await updateEmployee(payload);
      else await addEmployee(payload);
      toaster.create({ description: "Staff record saved", type: "success" });
      resetForm();
      loadData();
    } catch (error) {
      toaster.create({ description: "Error saving staff", type: "error" });
    }
  };

  const handleEdit = (emp: any) => {
    setEditingId(emp.id);
    setName(emp.fullName || "");
    setMonthlyDutyCount(emp.monthlyDesiredDuties || 4);
    setDepartmentId(String(emp.departmentId));
    setSubDepartmentId(emp.subDepartmentId ? String(emp.subDepartmentId) : "");
    setRoleId(String(emp.roleId));
    const parseDates = (str: string) =>
      str ? JSON.parse(str).map((d: string) => new Date(d)) : [];
    const parseStrs = (str: string) => (str ? JSON.parse(str) : []);
    setUndesirableDates(parseDates(emp.unavailableDays));
    setIfNecessaryDates(parseDates(emp.flexibleDays));
    setDesiredDates(parseDates(emp.preferredDays));
    setExternalDutyDates(parseDates(emp.externalDutyDays));
    setUnavailableWeekdays(parseStrs(emp.unavailableWeekdays));
    setPreferredWeekdays(parseStrs(emp.preferredWeekdays));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete ${name}?`)) return;
    await deleteEmployee(id);
    loadData();
    toaster.create({ description: "Staff member removed", type: "info" });
  };

  const filteredEmployees = employees.filter((e) =>
    e.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box minHeight="100vh" bg="#F8FAFC">
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
                <Users size={24} color="var(--chakra-colors-brand-600)" />
              </Box>
              <VStack align="flex-start" gap={0}>
                <Heading size="md" fontWeight="bold">
                  Staff Directory
                </Heading>
                <Text fontSize="xs" color="gray.500">
                  Employee Profiles & Duty Constraints
                </Text>
              </VStack>
            </HStack>
            <AdminBackButton />
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
          <Box width={{ base: "100%", xl: "480px" }} flexShrink={0}>
            <Card.Root
              border="none"
              boxShadow="0 10px 30px rgba(0, 0, 0, 0.04)"
              borderRadius="2xl"
              bg="white"
            >
              <Box bg="gray.900" p={8} color="white">
                <Text fontWeight="bold" fontSize="xl">
                  {editingId ? "Edit Staff Member" : "Add New Staff"}
                </Text>
                <Text fontSize="xs" color="gray.400">
                  Basic info and scheduling rules.
                </Text>
              </Box>

              <Card.Body p={10}>
                <Stack gap={8}>
                  {/* FULL NAME INPUT */}
                  <Field.Root>
                    <Field.Label
                      fontSize="xs"
                      fontWeight="800"
                      color="gray.500"
                      mb={3}
                      ml={1}
                    >
                      FULL NAME
                    </Field.Label>
                    <Input
                      h="56px"
                      bg="gray.100"
                      border="1px solid"
                      borderColor="transparent"
                      px={5}
                      borderRadius="xl"
                      _focus={{
                        bg: "white",
                        borderColor: "brand.500",
                        outline: "none",
                      }}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Dr. John Doe"
                    />
                  </Field.Root>

                  {/* DEPT & DUTIES ROW */}
                  <HStack gap={4}>
                    <Field.Root flex="1">
                      <Field.Label
                        fontSize="xs"
                        fontWeight="800"
                        color="gray.500"
                        mb={3}
                        ml={1}
                      >
                        DEPARTMENT
                      </Field.Label>
                      <NativeSelect.Root size="lg">
                        <NativeSelect.Field
                          h="56px"
                          bg="gray.100"
                          px={5}
                          borderRadius="xl"
                          value={departmentId}
                          onChange={(e) => {
                            setDepartmentId(e.target.value);
                            setSubDepartmentId("");
                            setRoleId("");
                          }}
                        >
                          <option value="">Select...</option>
                          {departments.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name}
                            </option>
                          ))}
                        </NativeSelect.Field>
                        <NativeSelect.Indicator />
                      </NativeSelect.Root>
                    </Field.Root>
                    <Field.Root flex="1">
                      <Field.Label
                        fontSize="xs"
                        fontWeight="800"
                        color="gray.500"
                        mb={3}
                        ml={1}
                      >
                        MONTHLY DUTIES
                      </Field.Label>
                      <Input
                        h="56px"
                        type="number"
                        bg="gray.100"
                        border="1px solid"
                        borderColor="transparent"
                        px={5}
                        borderRadius="xl"
                        _focus={{
                          bg: "white",
                          borderColor: "brand.500",
                          outline: "none",
                        }}
                        value={monthlyDutyCount}
                        onChange={(e) =>
                          setMonthlyDutyCount(Number(e.target.value))
                        }
                      />
                    </Field.Root>
                  </HStack>

                  {/* SUB-DEPT & ROLE ROW */}
                  <HStack gap={4}>
                    <Field.Root flex="1">
                      <Field.Label
                        fontSize="xs"
                        fontWeight="800"
                        color="gray.500"
                        mb={3}
                        ml={1}
                      >
                        SUB-DEPT
                      </Field.Label>
                      <NativeSelect.Root disabled={!departmentId} size="lg">
                        <NativeSelect.Field
                          h="56px"
                          bg="gray.100"
                          px={5}
                          borderRadius="xl"
                          value={subDepartmentId}
                          onChange={(e) => setSubDepartmentId(e.target.value)}
                        >
                          <option value="">None</option>
                          {filteredSubs.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </NativeSelect.Field>
                        <NativeSelect.Indicator />
                      </NativeSelect.Root>
                    </Field.Root>
                    <Field.Root flex="1">
                      <Field.Label
                        fontSize="xs"
                        fontWeight="800"
                        color="gray.500"
                        mb={3}
                        ml={1}
                      >
                        ROLE
                      </Field.Label>
                      <NativeSelect.Root disabled={!departmentId} size="lg">
                        <NativeSelect.Field
                          h="56px"
                          bg="gray.100"
                          px={5}
                          borderRadius="xl"
                          value={roleId}
                          onChange={(e) => setRoleId(e.target.value)}
                        >
                          <option value="">Select...</option>
                          {filteredRoles.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name}
                            </option>
                          ))}
                        </NativeSelect.Field>
                        <NativeSelect.Indicator />
                      </NativeSelect.Root>
                    </Field.Root>
                  </HStack>

                  <Separator />

                  <VStack
                    align="stretch"
                    gap={6}
                    bg="gray.50"
                    p={6}
                    borderRadius="2xl"
                  >
                    <HStack color="brand.600">
                      <Calendar size={18} />
                      <Text fontSize="sm" fontWeight="bold">
                        Availability & Constraints
                      </Text>
                    </HStack>
                    <MultiDatePicker
                      label="Unavailable Dates"
                      dates={undesirableDates}
                      setDates={setUndesirableDates}
                      colorScheme="red"
                    />
                    <MultiDatePicker
                      label="Preferred Dates"
                      dates={desiredDates}
                      setDates={setDesiredDates}
                      colorScheme="green"
                    />
                    <MultiDatePicker
                      label="External Duty"
                      dates={externalDutyDates}
                      setDates={setExternalDutyDates}
                      colorScheme="purple"
                    />
                    <WeekdaySelector
                      label="Blocked Weekdays"
                      values={unavailableWeekdays}
                      setValues={setUnavailableWeekdays}
                      color="red.500"
                    />
                    <WeekdaySelector
                      label="Preferred Weekdays"
                      values={preferredWeekdays}
                      setValues={setPreferredWeekdays}
                      color="green.500"
                    />
                  </VStack>

                  <Stack gap={3} mt={2}>
                    <Button
                      onClick={handleSave}
                      colorPalette={editingId ? "orange" : "brand"}
                      size="xl"
                      h="64px"
                      borderRadius="2xl"
                      fontWeight="bold"
                      fontSize="lg"
                      boxShadow="0 8px 20px rgba(0, 119, 230, 0.15)"
                    >
                      {editingId ? <Check size={20} /> : <Plus size={20} />}{" "}
                      {editingId ? "Update Staff" : "Add Staff Member"}
                    </Button>
                    {editingId && (
                      <Button
                        variant="ghost"
                        h="48px"
                        borderRadius="xl"
                        onClick={resetForm}
                      >
                        Cancel Changes
                      </Button>
                    )}
                  </Stack>
                </Stack>
              </Card.Body>
              <Box mt={8}>
                <EmployeeBulkImport onImportSuccess={loadData} />
              </Box>
            </Card.Root>
          </Box>

          {/* TABLE PANEL */}
          <Box flex="1">
            <Stack gap={6}>
              {/* SEARCH BAR */}
              <Flex
                bg="white"
                p={5}
                borderRadius="2xl"
                boxShadow="0 4px 15px rgba(0,0,0,0.03)"
                align="center"
                justify="space-between"
              >
                <HStack flex="1" maxW="440px" position="relative">
                  <Box position="absolute" left={5} zIndex={1} color="gray.400">
                    <Search size={20} />
                  </Box>
                  <Input
                    placeholder="Search staff by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    bg="gray.100"
                    border="1px solid"
                    borderColor="transparent"
                    pl={12}
                    h="52px"
                    borderRadius="xl"
                    fontSize="sm"
                    _focus={{
                      bg: "white",
                      borderColor: "brand.500",
                      outline: "none",
                    }}
                  />
                </HStack>
                <Badge
                  variant="subtle"
                  colorPalette="gray"
                  px={4}
                  h="32px"
                  borderRadius="full"
                  display="flex"
                  alignItems="center"
                >
                  {filteredEmployees.length} Total Staff
                </Badge>
              </Flex>

              {/* TABLE */}
              <Card.Root
                border="none"
                boxShadow="0 4px 20px rgba(0, 0, 0, 0.05)"
                borderRadius="2xl"
                bg="white"
                overflow="hidden"
              >
                <Table.Root variant="line">
                  <Table.Header bg="gray.50/50">
                    <Table.Row>
                      <Table.ColumnHeader py={6} px={8} fontSize="xs">
                        Employee
                      </Table.ColumnHeader>
                      <Table.ColumnHeader fontSize="xs">
                        Assignment
                      </Table.ColumnHeader>
                      <Table.ColumnHeader fontSize="xs" textAlign="center">
                        Load
                      </Table.ColumnHeader>
                      <Table.ColumnHeader
                        textAlign="right"
                        px={8}
                      ></Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {filteredEmployees.map((e) => {
                      const blockedDates = safeParseJSON(e.unavailableDays);
                      const preferredDates = safeParseJSON(e.preferredDays);
                      const externalDates = safeParseJSON(e.externalDutyDays);
                      const blockedWeekdays = safeParseJSON(
                        e.unavailableWeekdays
                      );
                      const preferredWeekdays = safeParseJSON(
                        e.preferredWeekdays
                      );
                      return (
                        <Table.Row
                          key={e.id}
                          _hover={{ bg: "gray.50/30" }}
                          transition="background 0.2s"
                        >
                          <Table.Cell py={6} px={8}>
                            <HStack gap={4}>
                              <Box
                                bg="brand.50"
                                p={3}
                                borderRadius="xl"
                                color="brand.600"
                              >
                                <Fingerprint size={20} />
                              </Box>
                              <VStack align="flex-start" gap={0}>
                                <Text fontWeight="700" fontSize="md">
                                  {e.fullName}
                                </Text>
                                <Text fontSize="xs" color="gray.400">
                                  {roles.find((r) => r.id === e.roleId)?.name ||
                                    "No Role"}
                                </Text>
                              </VStack>
                            </HStack>
                          </Table.Cell>
                          <Table.Cell>
                            <VStack align="flex-start" gap={1.5}>
                              <Badge
                                variant="subtle"
                                colorPalette="blue"
                                px={3}
                                borderRadius="lg"
                                fontSize="2xs"
                              >
                                {departments.find(
                                  (d) => d.id === e.departmentId
                                )?.name || "---"}
                              </Badge>
                              {e.subDepartmentId && (
                                <Text fontSize="2xs" color="gray.400" ml={1}>
                                  ↳{" "}
                                  {
                                    subDepartments.find(
                                      (s) => s.id === e.subDepartmentId
                                    )?.name
                                  }
                                </Text>
                              )}
                            </VStack>
                          </Table.Cell>
                          <Table.Cell py={6} px={8}>
                            {/* ENHANCED CONSTRAINT SUMMARY COLUMN */}
                            <HStack gap={3}>
                              {/* Blocked Info */}
                              {(blockedDates.length > 0 ||
                                blockedWeekdays.length > 0) && (
                                <Tooltip
                                  showArrow
                                  content={
                                    <VStack align="start" gap={1} p={1}>
                                      <Text fontWeight="bold" color="red.300">
                                        Unavailable:
                                      </Text>
                                      {blockedWeekdays.length > 0 && (
                                        <Text fontSize="xs">
                                          Weekdays: {blockedWeekdays.join(", ")}
                                        </Text>
                                      )}
                                      {blockedDates.length > 0 && (
                                        <Text fontSize="xs">
                                          Dates: {blockedDates.join(", ")}
                                        </Text>
                                      )}
                                    </VStack>
                                  }
                                >
                                  <Box color="red.500" cursor="help">
                                    <CalendarOff size={18} />
                                  </Box>
                                </Tooltip>
                              )}

                              {/* Preferences Info */}
                              {(preferredDates.length > 0 ||
                                preferredWeekdays.length > 0) && (
                                <Tooltip
                                  showArrow
                                  content={
                                    <VStack align="start" gap={1} p={1}>
                                      <Text fontWeight="bold" color="green.300">
                                        Preferred:
                                      </Text>
                                      {preferredWeekdays.length > 0 && (
                                        <Text fontSize="xs">
                                          Weekdays:{" "}
                                          {preferredWeekdays.join(", ")}
                                        </Text>
                                      )}
                                      {preferredDates.length > 0 && (
                                        <Text fontSize="xs">
                                          Dates: {preferredDates.join(", ")}
                                        </Text>
                                      )}
                                    </VStack>
                                  }
                                >
                                  <Box color="green.500" cursor="help">
                                    <Heart size={18} />
                                  </Box>
                                </Tooltip>
                              )}

                              {/* External Duty Info */}
                              {externalDates.length > 0 && (
                                <Tooltip
                                  showArrow
                                  content={
                                    <VStack align="start" gap={1} p={1}>
                                      <Text
                                        fontWeight="bold"
                                        color="purple.300"
                                      >
                                        External Duty:
                                      </Text>
                                      <Text fontSize="xs">
                                        {externalDates.join(", ")}
                                      </Text>
                                    </VStack>
                                  }
                                >
                                  <Box color="purple.500" cursor="help">
                                    <Plane size={18} />
                                  </Box>
                                </Tooltip>
                              )}

                              {blockedDates.length === 0 &&
                                preferredDates.length === 0 &&
                                externalDates.length === 0 && (
                                  <Text fontSize="xs" color="gray.300">
                                    No constraints
                                  </Text>
                                )}
                            </HStack>
                          </Table.Cell>
                          <Table.Cell textAlign="center">
                            <Badge
                              variant="outline"
                              colorPalette="gray"
                              px={3}
                              borderRadius="lg"
                            >
                              {e.monthlyDesiredDuties}d/mo
                            </Badge>
                          </Table.Cell>
                          <Table.Cell textAlign="right" px={8}>
                            <HStack justify="flex-end" gap={2}>
                              <IconButton
                                variant="ghost"
                                size="sm"
                                color="gray.400"
                                _hover={{ bg: "brand.50", color: "brand.600" }}
                                borderRadius="lg"
                                onClick={() => handleEdit(e)}
                              >
                                <Pencil size={16} />
                              </IconButton>
                              <IconButton
                                variant="ghost"
                                size="sm"
                                color="gray.400"
                                _hover={{ bg: "red.50", color: "red.600" }}
                                borderRadius="lg"
                                onClick={() => handleDelete(e.id, e.fullName)}
                              >
                                <Trash2 size={16} />
                              </IconButton>
                            </HStack>
                          </Table.Cell>
                        </Table.Row>
                      );
                    })}
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
