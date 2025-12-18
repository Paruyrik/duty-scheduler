"use client";

import { Button, HStack, Text } from "@chakra-ui/react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface AdminBackButtonProps {
  backPath?: string;
  label?: string;
}

export default function AdminBackButton({
  backPath = "/",
  label = "Back to Dashboard",
}: AdminBackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    router.push(backPath);
  };

  return (
    <Button
      onClick={handleBack}
      variant="ghost"
      size="sm"
      h="40px"
      px={4}
      borderRadius="xl"
      color="gray.600"
      _hover={{
        bg: "gray.100",
        color: "brand.600",
        "& svg": { transform: "translateX(-4px)" },
      }}
      transition="all 0.2s"
    >
      <HStack gap={2}>
        <ArrowLeft size={18} style={{ transition: "transform 0.2s ease" }} />
        <Text fontSize="sm" fontWeight="600">
          {label}
        </Text>
      </HStack>
    </Button>
  );
}
