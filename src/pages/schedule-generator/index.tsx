"use client";

import { getDepartments } from "@/api/departments";
import { deleteSchedule, generateSchedule, getSchedule } from "@/api/schedule";
import AdminBackButton from "@/components/elements/AdminBackButton";
import ScheduleExportButton from "@/components/elements/ScheduleExport";
import { toaster } from "@/components/ui/toaster";
import {
  Box,
  Button,
  Card,
  Container,
  Field,
  Flex,
  Heading,
  HStack,
  Input,
  NativeSelect,
  Separator,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  Building2,
  CalendarClock,
  CalendarDays,
  Info,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import React, { useEffect, useState } from "react";

interface DepartmentData {
  id: number;
  name: string;
}

const ScheduleGeneratorPage: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [formState, setFormState] = useState({
    departmentId: "" as string | number,
    month: currentMonth,
    year: currentYear,
    requiredDailyCount: 2,
  });

  const [departments, setDepartments] = useState<DepartmentData[]>([]);
  const [loading, setLoading] = useState(false);
  const [deptSearch, setDeptSearch] = useState("");
  const [lastResult, setLastResult] = useState<any>(null);

  useEffect(() => {
    const fetchDeps = async () => {
      try {
        const data = await getDepartments();
        const depsArray = data?.data ? data.data : data;
        const finalizedDeps = Array.isArray(depsArray) ? depsArray : [];
        setDepartments(finalizedDeps);

        if (finalizedDeps.length > 0) {
          setFormState((prev) => ({
            ...prev,
            departmentId: finalizedDeps[0].id,
          }));
        }
      } catch (error) {
        toaster.create({
          description: "Error loading departments.",
          type: "error",
        });
      }
    };
    fetchDeps();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: ["requiredDailyCount", "month", "year", "departmentId"].includes(
        name
      )
        ? Number(value)
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLastResult(null);
    try {
      const params = {
        ...formState,
        departmentId: Number(formState.departmentId),
      };
      const result = await generateSchedule(params);
      if (result.success) {
        const freshSchedule = await getSchedule({
          departmentId: params.departmentId,
          month: params.month,
          year: params.year,
        });
        if (freshSchedule.success) {
          setLastResult({
            ...result,
            schedule: freshSchedule.schedule,
          });
          toaster.create({
            title: "Schedule Success!",
            description: `Total duties assigned: ${result.summary?.totalDutiesAssigned}.`,
            type: "success",
          });
        }
      }
    } catch (error) {
      toaster.create({
        description: "An unexpected error occurred.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredDepartments = departments.filter((d) =>
    d.name.toLowerCase().includes(deptSearch.toLowerCase())
  );

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from({ length: 5 }, (_, i) => currentYear + i);
  const selectedDeptName =
    departments.find((d) => d.id === Number(formState.departmentId))?.name ||
    "---";

  const handleDeleteSchedule = async () => {
    // 1. Simple confirmation (or use a Chakra Modal)
    const confirmDelete = window.confirm(
      `Are you sure? This will permanently delete the ${selectedDeptName} roster for ${formState.month}/${formState.year}.`
    );

    if (!confirmDelete) return;

    setLoading(true);
    try {
      const result = await deleteSchedule({
        departmentId: Number(formState.departmentId),
        month: formState.month,
        year: formState.year,
      });

      if (result.success) {
        setLastResult(null);
        toaster.create({
          title: "Roster Cleared",
          description: result.message,
          type: "info",
        });
      }
    } catch (error) {
      toaster.create({
        description: "Failed to clear schedule.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minHeight="100vh" bg="#F8FAFC" position="relative">
      {/* 1. LOADING OVERLAY (Remains same as your pulse design) */}
      {loading && (
        <Box
          position="fixed"
          top={0}
          left={0}
          width="100vw"
          height="100vh"
          bg="rgba(255, 255, 255, 0.85)"
          backdropFilter="blur(10px)"
          zIndex={9999}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <VStack gap={8}>
            <Box
              position="relative"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Box
                position="absolute"
                width="160px"
                height="160px"
                borderRadius="full"
                border="3px solid"
                borderColor="brand.500"
                opacity={0.3}
                animation="ping 2s infinite"
              />
              <Box
                bg="brand.600"
                p={8}
                borderRadius="full"
                color="white"
                shadow="0 15px 45px rgba(0, 119, 230, 0.4)"
              >
                <Sparkles size={48} className="animate-spin" />
              </Box>
            </Box>
            <VStack gap={2} textAlign="center">
              <Text
                fontWeight="800"
                fontSize="2xl"
                color="gray.900"
                letterSpacing="tight"
              >
                Generating Schedule...
              </Text>
              <Text color="gray.500" fontSize="md">
                Optimizing for <strong>{selectedDeptName}</strong>
              </Text>
            </VStack>
          </VStack>
        </Box>
      )}

      {/* 2. TOP NAVIGATION */}
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
                <CalendarClock
                  size={24}
                  color="var(--chakra-colors-brand-600)"
                />
              </Box>
              <VStack align="flex-start" gap={0}>
                <Heading size="md" fontWeight="bold">
                  Schedule Generator
                </Heading>
                <Text fontSize="xs" color="gray.500">
                  Intelligent Workforce Planning
                </Text>
              </VStack>
            </HStack>
            <AdminBackButton label="Back to Dashboard" />
          </Flex>
        </Container>
      </Box>

      {/* 3. MAIN CONTENT */}
      <Container maxW="7xl" py={12} px={10}>
        <Flex
          gap={12}
          direction={{ base: "column", xl: "row" }}
          align="flex-start"
        >
          {/* SETTINGS CARD */}
          <Box width={{ base: "100%", xl: "480px" }} flexShrink={0}>
            <Card.Root
              border="none"
              boxShadow="0 10px 40px rgba(0, 0, 0, 0.04)"
              borderRadius="2xl"
              bg="white"
            >
              <Box bg="gray.900" p={8} color="white">
                <Text fontWeight="bold" fontSize="xl">
                  Generation Settings
                </Text>
                <Text fontSize="xs" color="gray.400">
                  Set parameters for the auto-generation engine.
                </Text>
              </Box>

              <Card.Body p={10}>
                <Stack gap={8}>
                  {/* Dept Selector */}
                  <Field.Root>
                    <Field.Label
                      fontSize="xs"
                      fontWeight="800"
                      color="gray.500"
                      mb={3}
                      ml={1}
                    >
                      TARGET DEPARTMENT
                    </Field.Label>
                    <Stack gap={3}>
                      <HStack width="full" position="relative">
                        <Box
                          position="absolute"
                          left={4}
                          zIndex={1}
                          color="gray.400"
                        >
                          <Search size={18} />
                        </Box>
                        <Input
                          placeholder="Quick find department..."
                          bg="gray.50"
                          border="1px solid"
                          borderColor="gray.100"
                          h="44px"
                          pl={11}
                          borderRadius="xl"
                          fontSize="sm"
                          _focus={{
                            bg: "white",
                            borderColor: "brand.300",
                            outline: "none",
                          }}
                          value={deptSearch}
                          onChange={(e) => setDeptSearch(e.target.value)}
                        />
                      </HStack>
                      <NativeSelect.Root size="lg">
                        <NativeSelect.Field
                          name="departmentId"
                          h="56px"
                          bg="gray.100"
                          px={5}
                          borderRadius="xl"
                          value={formState.departmentId}
                          onChange={handleChange}
                        >
                          {filteredDepartments.map((dep) => (
                            <option key={dep.id} value={dep.id}>
                              {dep.name}
                            </option>
                          ))}
                        </NativeSelect.Field>
                        <NativeSelect.Indicator />
                      </NativeSelect.Root>
                    </Stack>
                  </Field.Root>

                  {/* Month/Year Row */}
                  <HStack gap={4}>
                    <Field.Root flex="1">
                      <Field.Label
                        fontSize="xs"
                        fontWeight="800"
                        color="gray.500"
                        mb={3}
                        ml={1}
                      >
                        MONTH
                      </Field.Label>
                      <NativeSelect.Root size="lg">
                        <NativeSelect.Field
                          name="month"
                          h="56px"
                          bg="gray.100"
                          px={5}
                          borderRadius="xl"
                          value={formState.month}
                          onChange={handleChange}
                        >
                          {months.map((m) => (
                            <option key={m} value={m}>
                              {new Date(0, m - 1).toLocaleString("default", {
                                month: "long",
                              })}
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
                        YEAR
                      </Field.Label>
                      <NativeSelect.Root size="lg">
                        <NativeSelect.Field
                          name="year"
                          h="56px"
                          bg="gray.100"
                          px={5}
                          borderRadius="xl"
                          value={formState.year}
                          onChange={handleChange}
                        >
                          {years.map((y) => (
                            <option key={y} value={y}>
                              {y}
                            </option>
                          ))}
                        </NativeSelect.Field>
                        <NativeSelect.Indicator />
                      </NativeSelect.Root>
                    </Field.Root>
                  </HStack>

                  {/* Daily Count */}
                  <Field.Root>
                    <Field.Label
                      fontSize="xs"
                      fontWeight="800"
                      color="gray.500"
                      mb={3}
                      ml={1}
                    >
                      REQUIRED DUTIES PER DAY
                    </Field.Label>
                    <Input
                      type="number"
                      name="requiredDailyCount"
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
                      value={formState.requiredDailyCount}
                      onChange={handleChange}
                    />
                  </Field.Root>

                  <Button
                    onClick={handleSubmit}
                    size="xl"
                    h="64px"
                    borderRadius="2xl"
                    colorPalette="brand"
                    fontWeight="bold"
                    fontSize="lg"
                    mt={2}
                    boxShadow="0 8px 25px rgba(0, 119, 230, 0.2)"
                  >
                    <Sparkles size={20} /> Generate & Save Schedule
                  </Button>
                </Stack>
                {/* ... Generate Button ... */}

                <Separator mt={8} />

                <Box
                  mt={6}
                  p={4}
                  borderRadius="xl"
                  border="1px solid"
                  borderColor="red.100"
                  bg="red.50/30"
                >
                  <VStack align="flex-start" gap={3}>
                    <HStack color="red.700">
                      <Info size={16} />
                      <Text
                        fontSize="xs"
                        fontWeight="800"
                        letterSpacing="wider"
                      >
                        DANGER ZONE
                      </Text>
                    </HStack>
                    <Text fontSize="2xs" color="gray.500">
                      Wipe all duty assignments for this department and month.
                      This action cannot be undone.
                    </Text>
                    <Button
                      variant="outline"
                      colorPalette="red"
                      size="sm"
                      width="full"
                      h="40px"
                      borderRadius="lg"
                      fontWeight="bold"
                      onClick={handleDeleteSchedule}
                      disabled={loading}
                    >
                      Clear Existing Roster
                    </Button>
                  </VStack>
                </Box>
              </Card.Body>
            </Card.Root>
          </Box>

          {/* PREVIEW PANEL */}
          <Box flex="1">
            <Card.Root
              variant="subtle"
              border="1px dashed"
              borderColor="gray.200"
              bg="white"
              p={12}
              borderRadius="2xl"
            >
              <Heading
                size="xs"
                mb={10}
                color="gray.400"
                textTransform="uppercase"
                letterSpacing="widest"
              >
                Generation Summary
              </Heading>

              <Stack gap={10}>
                <HStack gap={6}>
                  <Box p={4} bg="blue.50" borderRadius="2xl" color="blue.600">
                    <Building2 size={28} />
                  </Box>
                  <VStack align="flex-start" gap={0}>
                    <Text fontSize="xs" color="gray.400" fontWeight="800">
                      TARGET DEPARTMENT
                    </Text>
                    <Text fontSize="xl" fontWeight="bold">
                      {selectedDeptName}
                    </Text>
                  </VStack>
                </HStack>

                <HStack gap={6}>
                  <Box
                    p={4}
                    bg="purple.50"
                    borderRadius="2xl"
                    color="purple.600"
                  >
                    <CalendarDays size={28} />
                  </Box>
                  <VStack align="flex-start" gap={0}>
                    <Text fontSize="xs" color="gray.400" fontWeight="800">
                      PLANNING PERIOD
                    </Text>
                    <Text fontSize="xl" fontWeight="bold">
                      {new Date(0, formState.month - 1).toLocaleString(
                        "default",
                        { month: "long" }
                      )}{" "}
                      {formState.year}
                    </Text>
                  </VStack>
                </HStack>

                <HStack gap={6}>
                  <Box
                    p={4}
                    bg="orange.50"
                    borderRadius="2xl"
                    color="orange.600"
                  >
                    <Users size={28} />
                  </Box>
                  <VStack align="flex-start" gap={0}>
                    <Text fontSize="xs" color="gray.400" fontWeight="800">
                      DAILY STAFF LOAD
                    </Text>
                    <Text fontSize="xl" fontWeight="bold">
                      {formState.requiredDailyCount} Personnel / Day
                    </Text>
                  </VStack>
                </HStack>

                {/* STAFFING WARNINGS SECTION */}
                {lastResult?.summary?.warnings &&
                  lastResult.summary.warnings.length > 0 && (
                    <Box
                      bg="orange.50"
                      p={6}
                      borderRadius="2xl"
                      border="1px solid"
                      borderColor="orange.200"
                    >
                      <VStack align="flex-start" gap={3}>
                        <HStack color="orange.700">
                          <Info size={20} />
                          <Text fontWeight="bold" fontSize="sm">
                            Staffing Gaps Detected (
                            {lastResult.summary.warnings.length})
                          </Text>
                        </HStack>

                        <Box
                          maxH="150px"
                          overflowY="auto"
                          width="full"
                          pr={2}
                          css={{
                            "&::-webkit-scrollbar": { width: "4px" },
                            "&::-webkit-scrollbar-thumb": {
                              background: "#FBD38D",
                              borderRadius: "10px",
                            },
                          }}
                        >
                          <VStack align="flex-start" gap={2}>
                            {lastResult.summary.warnings.map(
                              (warn: string, index: number) => (
                                <Text
                                  key={index}
                                  fontSize="xs"
                                  color="orange.800"
                                  lineHeight="short"
                                >
                                  • {warn}
                                </Text>
                              )
                            )}
                          </VStack>
                        </Box>
                        <Text fontSize="2xs" color="orange.600">
                          Recommendation: Reduce required daily count or check
                          employee unavailabilities.
                        </Text>
                      </VStack>
                    </Box>
                  )}

                <Separator />

                <ScheduleExportButton
                  assignments={lastResult?.schedule || []}
                  month={formState.month}
                  year={formState.year}
                  departmentName={selectedDeptName}
                  isDisabled={!lastResult || !lastResult.schedule?.length}
                />

                <Box
                  bg="gray.900"
                  p={6}
                  borderRadius="2xl"
                  color="white"
                  borderLeft="5px solid"
                  borderColor="brand.500"
                >
                  <HStack gap={4} align="flex-start">
                    <Info size={22} color="var(--chakra-colors-brand-500)" />
                    <VStack align="flex-start" gap={1}>
                      <Text fontSize="sm" fontWeight="700">
                        Important System Notice
                      </Text>
                      <Text fontSize="sm" lineHeight="tall" color="gray.400">
                        The engine prioritizes employee availability and rest
                        periods. Please note that clicking generate will{" "}
                        <strong>overwrite</strong> any existing rosters for this
                        period.
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              </Stack>
            </Card.Root>
          </Box>
        </Flex>
      </Container>

      <style jsx global>{`
        @keyframes ping {
          75%,
          100% {
            transform: scale(1.8);
            opacity: 0;
          }
        }
        .animate-spin {
          animation: spin 4s linear infinite;
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </Box>
  );
};

export default ScheduleGeneratorPage;
