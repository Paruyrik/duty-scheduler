"use client";

import {
  FormattedAssignment,
  getSchedule,
  GetScheduleResponse,
} from "@/api/schedule";
import AdminBackButton from "@/components/elements/AdminBackButton";
import ScheduleExportButton from "@/components/elements/ScheduleExport";
import { useDepartmentContext } from "@/context/DepartmentContext";
import {
  Box,
  Button,
  Card,
  Container,
  Flex,
  Heading,
  HStack,
  Input,
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
  NativeSelect,
  Separator,
  SimpleGrid,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  AlertCircle,
  CalendarDays,
  ChevronDown,
  Fingerprint,
  Printer,
  Search,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

const ScheduleViewer: React.FC = () => {
  const {
    selectedDepartmentId,
    selectedMonth,
    selectedYear,
    setSelectedDepartmentId,
    setSelectedMonth,
    setSelectedYear,
    departments,
  } = useDepartmentContext();

  const [scheduleData, setScheduleData] = useState<FormattedAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deptSearch, setDeptSearch] = useState("");

  // Get current department name for the UI
  const selectedDept = departments?.find((d) => d.id === selectedDepartmentId);
  const selectedDeptName = selectedDept?.name || "Select Department";

  // Filtered departments for the search functionality
  const filteredDepartments = useMemo(() => {
    
    const uniqueMap = new Map(departments.map((d) => [d.id, d]));
    const uniqueList = Array.from(uniqueMap.values());
    return uniqueList?.filter((d) =>
      d.name.toLowerCase().includes(deptSearch.toLowerCase())
    );
  }, [departments, deptSearch]);

  useEffect(() => {
    const fetchSchedule = async () => {
      if (!selectedDepartmentId || !selectedMonth || !selectedYear) return;

      setLoading(true);
      setError(null);

      try {
        const result: GetScheduleResponse = await getSchedule({
          departmentId: selectedDepartmentId,
          month: selectedMonth,
          year: selectedYear,
        });

        if (result.success && result.schedule) {
          setScheduleData(result.schedule);
        } else {
          setScheduleData([]);
          setError(result.message || "No schedule found for this period.");
        }
      } catch (err) {
        setError("Failed to connect to the scheduling service.");
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [selectedDepartmentId, selectedMonth, selectedYear]);

  const scheduleByDate = scheduleData.reduce((acc, assignment) => {
    const dateKey = assignment.date;
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(assignment);
    return acc;
  }, {} as Record<string, FormattedAssignment[]>);

  const dates = Object.keys(scheduleByDate).sort();

  return (
    <Box minHeight="100vh" bg="#F8FAFC">
      {/* TOP NAVIGATION */}
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
            <HStack gap={6}>
              <HStack gap={3}>
                <Box bg="brand.50" p={2} borderRadius="lg">
                  <CalendarDays
                    size={24}
                    color="var(--chakra-colors-brand-600)"
                  />
                </Box>
                <VStack align="flex-start" gap={0}>
                  <Heading size="sm" fontWeight="bold">
                    Monthly Roster
                  </Heading>
                  <Text fontSize="2xs" color="gray.500">
                    View & Export
                  </Text>
                </VStack>
              </HStack>

              <Separator orientation="vertical" h="30px" />

              {/* SEARCHABLE FILTERS */}
              <HStack gap={2}>
                {/* Searchable Department Menu */}
                <MenuRoot
                  positioning={{ placement: "bottom-start" }}
                  closeOnSelect={true} // Ensure it closes after selection
                >
                  <MenuTrigger asChild>
                    <Button
                      variant="ghost"
                      bg="#F1F1F1"
                      borderRadius="full"
                      height="48px"
                      px={5}
                      minW="220px"
                      justifyContent="space-between"
                      _hover={{ bg: "#E5E5E5" }}
                    >
                      <Text truncate fontWeight="bold" fontSize="sm">
                        {selectedDeptName}
                      </Text>
                      <ChevronDown size={16} />
                    </Button>
                  </MenuTrigger>
                  <MenuContent
                    borderRadius="xl"
                    boxShadow="lg"
                    p={2}
                    width="240px"
                    zIndex={1500}
                  >
                    <Box px={2} pb={2} onClick={(e) => e.stopPropagation()}>
                      <HStack
                        bg="gray.50"
                        px={3}
                        py={1}
                        borderRadius="md"
                        border="1px solid"
                        borderColor="gray.100"
                      >
                        <Search size={14} color="gray" />
                        <Input
                          placeholder="Search..."
                          //variant="plain" // Ensure this exists or use "unstyled"
                          size="sm"
                          value={deptSearch}
                          onChange={(e) => setDeptSearch(e.target.value)}
                          _focus={{ boxShadow: "none", outline: "none" }}
                          // Prevent the menu from closing when clicking inside the input
                          onKeyDown={(e) => e.stopPropagation()}
                        />
                      </HStack>
                    </Box>
                    <Box maxH="240px" overflowY="auto">
                      {filteredDepartments && filteredDepartments.length > 0 ? (
                        filteredDepartments.map((dept) => (
                          <MenuItem
                            key={dept.id}
                            value={dept.id.toString()}
                            // Use both for compatibility
                            onSelect={() => setSelectedDepartmentId(dept.id)}
                            onClick={() => setSelectedDepartmentId(dept.id)}
                            cursor="pointer"
                            borderRadius="lg"
                            fontWeight={
                              selectedDepartmentId === dept.id
                                ? "bold"
                                : "normal"
                            }
                            color={
                              selectedDepartmentId === dept.id
                                ? "brand.600"
                                : "gray.700"
                            }
                            _hover={{ bg: "brand.50" }}
                            px={3}
                            py={2}
                          >
                            {dept.name}
                          </MenuItem>
                        ))
                      ) : (
                        <Text
                          p={4}
                          fontSize="xs"
                          color="gray.500"
                          textAlign="center"
                        >
                          {departments?.length === 0
                            ? "Loading departments..."
                            : "No departments found"}
                        </Text>
                      )}
                    </Box>
                  </MenuContent>
                </MenuRoot>

                {/* Month Selector */}
                <NativeSelect.Root size="md" width="140px">
                  <NativeSelect.Field
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    bg="#F1F1F1"
                    borderRadius="full"
                    border="none"
                    fontWeight="bold"
                    fontSize="sm"
                    height="48px"
                    px={4}
                    _hover={{ bg: "#E5E5E5" }}
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(0, i).toLocaleString("default", {
                          month: "long",
                        })}
                      </option>
                    ))}
                  </NativeSelect.Field>
                </NativeSelect.Root>

                {/* Year Selector */}
                <NativeSelect.Root size="md" width="100px">
                  <NativeSelect.Field
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    bg="#F1F1F1"
                    borderRadius="full"
                    border="none"
                    fontWeight="bold"
                    fontSize="sm"
                    height="48px"
                    px={4}
                    _hover={{ bg: "#E5E5E5" }}
                  >
                    {[2024, 2025, 2026].map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </NativeSelect.Field>
                </NativeSelect.Root>
              </HStack>
            </HStack>

            {/* ACTION BUTTONS */}
            <HStack gap={4}>
              <ScheduleExportButton
                assignments={scheduleData}
                month={selectedMonth}
                year={selectedYear}
                departmentName={selectedDeptName}
                isDisabled={scheduleData.length === 0}
              />
              <Button
                variant="ghost"
                borderRadius="full"
                height="48px"
                width="48px"
                onClick={() => window.print()}
                color="gray.600"
              >
                <Printer size={20} />
              </Button>
              <AdminBackButton />
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* MAIN CONTENT AREA */}
      <Container maxW="8xl" py={8} px={10}>
        {loading ? (
          <Flex
            justify="center"
            align="center"
            minH="400px"
            direction="column"
            gap={4}
          >
            <Box className="animate-spin" color="brand.500">
              <CalendarDays size={48} />
            </Box>
            <Text fontWeight="bold" color="gray.500">
              Loading Roster...
            </Text>
          </Flex>
        ) : error ? (
          <Box
            bg="white"
            p={12}
            borderRadius="2xl"
            textAlign="center"
            border="1px solid"
            borderColor="gray.100"
          >
            <VStack gap={4}>
              <Box p={4} bg="orange.50" borderRadius="full" color="orange.500">
                <AlertCircle size={40} />
              </Box>
              <Text fontWeight="bold" fontSize="lg">
                {error}
              </Text>
              <Text fontSize="sm" color="gray.500">
                Try selecting a different department or period.
              </Text>
            </VStack>
          </Box>
        ) : (
          <VStack align="stretch" gap={8}>
            <VStack align="flex-start" gap={0}>
              <Text
                fontSize="xs"
                fontWeight="800"
                color="brand.600"
                letterSpacing="widest"
              >
                {selectedDeptName.toUpperCase()}
              </Text>
              <Heading size="xl" fontWeight="800">
                {new Date(0, selectedMonth - 1).toLocaleString("default", {
                  month: "long",
                })}{" "}
                {selectedYear}
              </Heading>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} gap={6}>
              {dates.map((date) => {
                const assignments = scheduleByDate[date];
                const dayName = new Date(date).toLocaleDateString(undefined, {
                  weekday: "long",
                });
                const dayNum = new Date(date).getDate();

                return (
                  <Card.Root
                    key={date}
                    border="none"
                    boxShadow="sm"
                    borderRadius="2xl"
                    overflow="hidden"
                  >
                    <Box bg="brand.600" p={4} color="white">
                      <Text
                        fontSize="2xs"
                        fontWeight="bold"
                        opacity={0.8}
                        textTransform="uppercase"
                      >
                        {dayName}
                      </Text>
                      <Text fontSize="2xl" fontWeight="800">
                        {dayNum}
                      </Text>
                    </Box>
                    <Card.Body p={5}>
                      <Stack gap={4}>
                        {assignments.map((a) => (
                          <Box key={a.assignmentId}>
                            <HStack gap={3}>
                              <Fingerprint
                                size={16}
                                color="var(--chakra-colors-brand-500)"
                              />
                              <VStack align="flex-start" gap={0}>
                                <Text fontWeight="bold" fontSize="sm">
                                  {a.employeeName}
                                </Text>
                                <Text fontSize="2xs" color="gray.400">
                                  {a.dutyType}
                                </Text>
                              </VStack>
                            </HStack>
                          </Box>
                        ))}
                      </Stack>
                    </Card.Body>
                  </Card.Root>
                );
              })}
            </SimpleGrid>
          </VStack>
        )}
      </Container>
    </Box>
  );
};

export default ScheduleViewer;
