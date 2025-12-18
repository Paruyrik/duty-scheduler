import { Box, Button, HStack, Text } from "@chakra-ui/react";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function WeekdaySelector({
  label,
  values,
  setValues,
  color = "brand.500",
}: any) {
  const toggleDay = (day: string) => {
    setValues(
      values.includes(day)
        ? values.filter((d: string) => d !== day)
        : [...values, day]
    );
  };

  return (
    <Box>
      <Text
        fontSize="xs"
        fontWeight="800"
        color="gray.500"
        textTransform="uppercase"
        mb={3}
      >
        {label}
      </Text>
      <HStack wrap="wrap" gap={2}>
        {WEEKDAYS.map((day) => {
          const isActive = values.includes(day);
          return (
            <Button
              key={day}
              size="xs"
              variant={isActive ? "solid" : "outline"}
              colorPalette={
                isActive ? (color.includes("red") ? "red" : "green") : "gray"
              }
              onClick={() => toggleDay(day)}
              borderRadius="full"
              px={3}
            >
              {day}
            </Button>
          );
        })}
      </HStack>
    </Box>
  );
}
