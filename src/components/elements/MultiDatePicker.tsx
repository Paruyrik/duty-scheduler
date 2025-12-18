import { Badge, Box, HStack, Text } from "@chakra-ui/react";
import { SingleDatepicker } from "chakra-dayzed-datepicker";
import { X } from "lucide-react";

export default function MultiDatePicker({
  label,
  dates,
  setDates,
  colorScheme = "blue",
}: any) {
  return (
    <Box>
      <Text
        fontSize="xs"
        fontWeight="800"
        color="gray.500"
        textTransform="uppercase"
        mb={2}
      >
        {label}
      </Text>

      <SingleDatepicker
        propsConfigs={{
          inputProps: {
            placeholder: "Add specific dates...",
            bg: "white",
            h: "40px",
            fontSize: "sm",
            borderRadius: "lg",
          },
        }}
        onDateChange={(date) => {
          if (
            !dates.find((d: any) => d.toDateString() === date.toDateString())
          ) {
            setDates([...dates, date]);
          }
        }}
      />

      <HStack mt={3} wrap="wrap" gap={2}>
        {dates.map((d: any, i: number) => (
          <Badge
            key={i}
            variant="subtle"
            colorPalette={colorScheme}
            px={2}
            py={1}
            borderRadius="md"
            display="flex"
            alignItems="center"
            gap={2}
          >
            {d.toISOString().slice(0, 10)}
            <Box
              cursor="pointer"
              onClick={() =>
                setDates(dates.filter((_: any, idx: number) => idx !== i))
              }
            >
              <X size={12} />
            </Box>
          </Badge>
        ))}
      </HStack>
    </Box>
  );
}
