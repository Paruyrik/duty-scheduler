"use client";

import { toaster } from "@/components/ui/toaster";
import {
  Box,
  Button,
  HStack,
  Separator,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileUp,
} from "lucide-react";
import React, { useRef, useState } from "react";

// --- ADD THIS INTERFACE ---
interface EmployeeBulkImportProps {
  onImportSuccess: () => void;
}

// --- UPDATE COMPONENT DEFINITION ---
const EmployeeBulkImport: React.FC<EmployeeBulkImportProps> = ({
  onImportSuccess,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [lastResult, setLastResult] = useState<{
    count?: number;
    error?: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.match(/\.(xlsx|xls)$/)) {
      toaster.create({
        title: "Invalid file",
        description: "Please upload an Excel file.",
        type: "error",
      });
      return;
    }

    setIsUploading(true);
    setLastResult(null);

    try {
      const result = await (window as any).api.invoke(
        "import-employees",
        (file as any).path
      );

      if (result.success) {
        setLastResult({ count: result.count });

        // --- THIS NOW WORKS ---
        onImportSuccess();

        toaster.create({
          title: "Import Successful",
          description: `Added ${result.count} employees to the database.`,
          type: "success",
        });
      } else {
        setLastResult({ error: result.message });
        toaster.create({
          title: "Import Failed",
          description: result.message,
          type: "error",
        });
      }
    } catch (err) {
      setLastResult({ error: "System communication error." });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <Box
      p={8}
      borderRadius="2xl"
      bg="white"
      border="2px dashed"
      borderColor={lastResult?.error ? "red.200" : "gray.200"}
      transition="all 0.2s"
      _hover={{ borderColor: "brand.500" }}
    >
      <VStack gap={6}>
        <Box p={4} borderRadius="full" bg={isUploading ? "blue.50" : "gray.50"}>
          {isUploading ? (
            <Spinner color="blue.500" />
          ) : (
            <FileSpreadsheet size={32} color="gray" />
          )}
        </Box>

        <VStack gap={1} textAlign="center">
          <Text fontWeight="bold" fontSize="lg">
            Bulk Import Employees
          </Text>
          <Text fontSize="xs" color="gray.500" maxW="250px">
            Upload an Excel sheet to populate your staff list automatically.
          </Text>
        </VStack>

        <input
          type="file"
          accept=".xlsx, .xls"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: "none" }}
        />

        <VStack width="full" gap={3}>
          <Button
            width="full"
            h="48px"
            colorPalette="brand"
            onClick={() => fileInputRef.current?.click()}
            loading={isUploading}
            disabled={isUploading}
          >
            <FileUp size={18} /> Select Excel File
          </Button>

          <Button variant="ghost" size="xs" color="gray.500" gap={2}>
            <Download size={14} /> Download Template (.xlsx)
          </Button>
        </VStack>

        {lastResult && (
          <Box width="full" pt={4}>
            <Separator mb={4} />
            <HStack
              color={lastResult.error ? "red.600" : "green.600"}
              justify="center"
            >
              {lastResult.error ? (
                <AlertCircle size={16} />
              ) : (
                <CheckCircle2 size={16} />
              )}
              <Text fontSize="xs" fontWeight="bold">
                {lastResult.error
                  ? "Error in data format"
                  : `Imported ${lastResult.count} staff members`}
              </Text>
            </HStack>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default EmployeeBulkImport;
