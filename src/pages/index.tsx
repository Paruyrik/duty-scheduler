import { RequireAuth } from "@/components/RequireAuth";
import {
  Box,
  Circle,
  Container,
  Heading,
  HStack,
  Separator,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  Building2,
  CalendarPlus,
  LayoutDashboard,
  Network,
  Users,
  UserSquare2,
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  const managementLinks = [
    {
      title: "Departments",
      href: "/departments",
      icon: Building2,
      desc: "Manage main business units",
    },
    {
      title: "Sub-Departments",
      href: "/sub-departments",
      icon: Network,
      desc: "Organize teams and groups",
    },
    {
      title: "Roles",
      href: "/roles",
      icon: UserSquare2,
      desc: "Define job responsibilities",
    },
    {
      title: "Employees",
      href: "/employees",
      icon: Users,
      desc: "Staff profiles and availability",
    },
  ];

  const schedulingLinks = [
    {
      title: "Schedule Generator",
      href: "/schedule-generator",
      icon: CalendarPlus,
      desc: "Create new weekly shifts",
    },
    {
      title: "Schedule Viewer",
      href: "/schedule-viewer",
      icon: LayoutDashboard,
      desc: "View and export rotations",
    },
  ];

  return (
    <RequireAuth>
      {/* Increased py to 20 for more top/bottom breathing room */}
      <Box minHeight="100vh" bg="gray.50" py={20} px={8}>
        <Container maxW="6xl">
          {" "}
          {/* Increased from lg to 6xl for a wider desktop feel */}
          <VStack gap={2} align="flex-start" mb={16}>
            <Heading size="3xl" letterSpacing="tight" color="brand.800">
              Scheduling Pro
            </Heading>
            <Text color="gray.500" fontSize="xl" fontWeight="medium">
              Systems Administration & Operations Portal
            </Text>
          </VStack>
          {/* Section 1 */}
          <Box mb={14}>
            <HStack mb={6} gap={4}>
              <Heading
                size="sm"
                color="gray.400"
                textTransform="uppercase"
                letterSpacing="widest"
              >
                Management
              </Heading>
              <Separator flex="1" borderColor="gray.200" />
            </HStack>

            <SimpleGrid columns={{ base: 1, md: 2 }} gap={8}>
              {" "}
              {managementLinks.map((item) => (
                <NavCard key={item.href} {...item} />
              ))}
            </SimpleGrid>
          </Box>
          <Box>
            <HStack mb={6} gap={4}>
              <Heading
                size="sm"
                color="gray.400"
                textTransform="uppercase"
                letterSpacing="widest"
              >
                Operations
              </Heading>
              <Separator flex="1" borderColor="gray.200" />
            </HStack>

            <SimpleGrid columns={{ base: 1, md: 2 }} gap={8}>
              {schedulingLinks.map((item) => (
                <NavCard key={item.href} {...item} variant="primary" />
              ))}
            </SimpleGrid>
          </Box>
        </Container>
      </Box>
    </RequireAuth>
  );
}

function NavCard({
  title,
  href,
  icon: IconComponent,
  desc,
  variant = "default",
}: any) {
  const isPrimary = variant === "primary";

  return (
    <Link href={href} prefetch={false} style={{ textDecoration: "none" }}>
      <Box
        as="article"
        p={8}
        bg="white"
        borderRadius="2xl"
        borderWidth="1px"
        borderColor="gray.100"
        boxShadow="sm"
        transition="all 0.25s ease"
        _hover={{
          transform: "translateY(-5px)",
          boxShadow: "xl",
          borderColor: isPrimary ? "brand.500" : "gray.300",
        }}
      >
        <HStack gap={6} align="center">
          <Circle
            size="60px"
            bg={isPrimary ? "brand.50" : "gray.50"}
            color={isPrimary ? "brand.600" : "gray.600"}
          >
            <IconComponent size={28} />
          </Circle>

          <VStack align="flex-start" gap={1}>
            <Text fontWeight="bold" fontSize="xl" color="gray.800">
              {title}
            </Text>
            <Text fontSize="md" color="gray.500" lineHeight="tall">
              {desc}
            </Text>
          </VStack>
        </HStack>
      </Box>
    </Link>
  );
}
