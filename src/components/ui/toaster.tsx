// Imports needed for the dynamic design
import {
  Box,
  Toaster as ChakraToaster,
  createToaster,
  Flex,
  Icon, // Import Chakra's Icon component
  Portal,
  Spinner,
  Stack,
  Toast,
} from "@chakra-ui/react";
import { AlertTriangle, CheckCircle, Info, X } from "lucide-react";

// --- STATUS CONFIGURATION --- (Remains the same)
const STATUS_CONFIG = {
  success: { colorScheme: "green", icon: CheckCircle },
  error: { colorScheme: "red", icon: X },
  warning: { colorScheme: "orange", icon: AlertTriangle },
  info: { colorScheme: "blue", icon: Info },
  default: { colorScheme: "gray", icon: Info },
};
// -----------------------------

export const toaster = createToaster({
  placement: "bottom-end",
  pauseOnPageIdle: true,
});

export const Toaster = () => {
  return (
    <Portal>
      <ChakraToaster toaster={toaster} insetInline={{ mdDown: "4" }}>
        {(toast) => {
          const status = STATUS_CONFIG[toast.type] || STATUS_CONFIG.default;

          return (
            <Toast.Root
              width={{ md: "sm" }}
              // Use a white background for a clean look
              bg="white"
              borderColor={`${status.colorScheme}.500`}
              borderLeftWidth="4px" // Use a colored left border as a clear indicator
              borderRadius="md"
              boxShadow="xl" // Stronger shadow to pop out
              p={4} // Added padding to Toast.Root
              role="alert" // Accessibility improvement
            >
              <Flex align="center" gap={3} width="full">
                {/* 🛑 1. Dynamic Icon / Spinner Area 🛑 */}
                <Box minWidth="20px">
                  {toast.type === "loading" ? (
                    // Loading state uses Spinner
                    <Spinner size="sm" color={`${status.colorScheme}.500`} />
                  ) : (
                    // Non-Loading State: Explicitly render the Lucide Icon
                    <Icon
                      as={status.icon}
                      w={5} // Size of the icon
                      h={5}
                      color={`${status.colorScheme}.500`}
                    />
                  )}
                </Box>

                {/* 🛑 2. Content Stack Area 🛑 */}
                <Stack gap="0.5" flex="1" maxWidth="calc(100% - 70px)">
                  {" "}
                  {/* Adjusted max-width */}
                  {/* Title (e.g., Validation Error) */}
                  {toast.title && (
                    <Toast.Title
                      color="gray.800"
                      fontWeight="semibold" // Make the title bold
                      fontSize="md"
                    >
                      {toast.title}
                    </Toast.Title>
                  )}
                  {/* Description (e.g., Department name is required) */}
                  {toast.description && (
                    <Toast.Description color="gray.600" fontSize="sm">
                      {toast.description}
                    </Toast.Description>
                  )}
                </Stack>

                {/* 🛑 3. Action and Close Button 🛑 */}
                <Flex align="center" gap={2}>
                  {toast.action && (
                    <Toast.ActionTrigger>
                      {toast.action.label}
                    </Toast.ActionTrigger>
                  )}
                  {toast.closable && (
                    <Toast.CloseTrigger
                    >
                      <Icon
                        as={X}
                        w={4}
                        color="gray.400"
                        cursor="pointer"
                        _hover={{ color: "gray.700" }}
                      />
                    </Toast.CloseTrigger>
                  )}
                </Flex>
              </Flex>
            </Toast.Root>
          );
        }}
      </ChakraToaster>
    </Portal>
  );
};
