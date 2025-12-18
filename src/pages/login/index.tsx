"use client";

import { toaster } from "@/components/ui/toaster";
import {
  Box,
  Button,
  Card,
  Container,
  Field,
  Heading,
  Input,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const login = async () => {
    if (!email || !password) {
      toaster.create({
        description: "Please enter both email and password.",
        type: "warning",
      });
      return;
    }

    const res = await window.api.invoke("login", { email, password });

    if (!res.success) {
      toaster.create({
        description: res.message || "Invalid credentials provided.",
        type: "error",
      });
      return;
    }

    router.replace("/");
  };

  return (
    <Box
      minH="100vh"
      bg="#F8FAFC"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Container maxW="md">
        <Card.Root
          border="none"
          boxShadow="0 10px 40px rgba(0, 0, 0, 0.08)"
          borderRadius="2xl"
          overflow="hidden"
          bg="white"
        >
          {/* Professional Header */}
          <Box bg="gray.900" p={8} textAlign="center">
            <VStack gap={3}>
              <Box bg="brand.500" p={3} borderRadius="xl" color="white">
                <Lock size={24} />
              </Box>
              <VStack gap={1}>
                <Heading size="md" color="white" fontWeight="bold">
                  Scheduling Pro
                </Heading>
                <Text fontSize="xs" color="gray.400">
                  Secure Administrator Access
                </Text>
              </VStack>
            </VStack>
          </Box>

          <Card.Body p={10}>
            <Stack gap={6}>
              {/* Email Field */}
              <Field.Root>
                <Field.Label
                  fontSize="xs"
                  textTransform="uppercase"
                  fontWeight="800"
                  color="gray.500"
                  letterSpacing="wider"
                  ml={1}
                  mb={2}
                >
                  Email Address
                </Field.Label>
                <Input
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  bg="gray.100"
                  border="1px solid"
                  borderColor="transparent"
                  _focus={{
                    bg: "white",
                    borderColor: "brand.500",
                    outline: "none",
                  }}
                  px={5} // Fixes text touching the left border
                  h="56px"
                  borderRadius="xl"
                />
              </Field.Root>

              {/* Password Field */}
              <Field.Root>
                <Field.Label
                  fontSize="xs"
                  textTransform="uppercase"
                  fontWeight="800"
                  color="gray.500"
                  letterSpacing="wider"
                  ml={1}
                  mb={2}
                >
                  Password
                </Field.Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  bg="gray.100"
                  border="1px solid"
                  borderColor="transparent"
                  _focus={{
                    bg: "white",
                    borderColor: "brand.500",
                    outline: "none",
                  }}
                  px={5} // Fixes text touching the left border
                  h="56px"
                  borderRadius="xl"
                />
              </Field.Root>

              <Button
                onClick={login}
                colorPalette="brand"
                size="xl"
                width="full"
                h="60px"
                mt={4}
                borderRadius="2xl"
                fontWeight="bold"
                fontSize="md"
                boxShadow="0 8px 20px rgba(0, 119, 230, 0.15)"
              >
                Sign In
              </Button>
            </Stack>
          </Card.Body>
        </Card.Root>

        <Text textAlign="center" mt={8} color="gray.400" fontSize="xs">
          © 2025 Scheduling Pro. All rights reserved.
        </Text>
      </Container>
    </Box>
  );
}
