"use client";

import { exportSchedule, FormattedAssignment } from "@/api/schedule";
import { toaster } from "@/components/ui/toaster";
import { Box, Button, Text } from "@chakra-ui/react";
import { FileSpreadsheet } from "lucide-react";
import React, { useState } from "react";

interface ScheduleExportButtonProps {
  assignments: FormattedAssignment[];
  month: number;
  year: number;
  departmentName: string;
  isDisabled: boolean;
}

const ScheduleExportButton: React.FC<ScheduleExportButtonProps> = ({
  assignments,
  month,
  year,
  departmentName,
  isDisabled,
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!assignments || assignments.length === 0) {
      toaster.create({
        title: "Export Failed",
        description: "There is no schedule data to export for this period.",
        type: "error",
      });
      return;
    }

    setIsExporting(true);

    try {
      const result = await exportSchedule({
        assignments,
        month,
        year,
        deptName: departmentName,
      });

      if (result.success) {
        toaster.create({
          title: "Success",
          description: "Schedule exported successfully.",
          type: "success",
        });
      } else if (result.message !== "Export cancelled by user") {
        toaster.create({
          title: "Export Error",
          description: result.message || "An error occurred while saving.",
          type: "error",
        });
      }
    } catch (error: any) {
      console.error("Export component error:", error);
      toaster.create({
        title: "System Error",
        description: "Failed to communicate with the export service.",
        type: "error",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      loading={isExporting}
      disabled={isDisabled || isExporting}
      // Matching the pill style from your screenshot
      height="48px"
      px={6}
      bg="#F1F1F1" // Light gray background per screenshot
      _hover={{ bg: "#E5E5E5" }}
      color="gray.800"
      borderRadius="full"
      variant="ghost"
      gap={4}
    >
      <FileSpreadsheet size={20} />
      <Box textAlign="left">
        <Text fontSize="sm" fontWeight="bold" lineHeight="1.1">
          Export Roster
        </Text>
        <Text fontSize="10px" color="gray.500" fontWeight="medium">
          Excel (.xlsx)
        </Text>
      </Box>
    </Button>
  );
};

export default ScheduleExportButton;
