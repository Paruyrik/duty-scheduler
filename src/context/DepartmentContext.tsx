"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from "react";

interface Department {
  id: number;
  name: string;
}

interface DepartmentContextType {
  departments: Department[];
  selectedDepartmentId: number | null;
  setSelectedDepartmentId: (id: number | null) => void;
  selectedMonth: number;
  setSelectedMonth: (month: number) => void;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  refreshDepartments: () => Promise<void>;
}

const DepartmentContext = createContext<DepartmentContextType | undefined>(undefined);

export const DepartmentProvider = ({ children }: { children: ReactNode }) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);
  
  // Default to current system date
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const fetchDepartments = async () => {
    try {
      const result = await window.api.invoke("get-departments");
      
      if (Array.isArray(result)) {
        setDepartments(result);
        
        if (result.length > 0 && selectedDepartmentId === null) {
          setSelectedDepartmentId(result[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to fetch departments:", error);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  return (
    <DepartmentContext.Provider
      value={{
        departments,
        selectedDepartmentId,
        setSelectedDepartmentId,
        selectedMonth,
        setSelectedMonth,
        selectedYear,
        setSelectedYear,
        refreshDepartments: fetchDepartments,
      }}
    >
      {children}
    </DepartmentContext.Provider>
  );
};

export const useDepartmentContext = () => {
  const context = useContext(DepartmentContext);
  if (!context) {
    throw new Error("useDepartmentContext must be used within a DepartmentProvider");
  }
  return context;
};