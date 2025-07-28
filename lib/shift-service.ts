import supabase from './supabase';
import { Employee } from '../types';
import { ShiftType } from '../components/ShiftPlanner/ShiftDropdown';

// Interface for shift data structure
export interface ShiftData {
  [employeeId: string]: {
    [day: string]: ShiftType;
  };
}

// Save employee data to Supabase
export const saveEmployees = async (employees: Employee[]): Promise<{ success: boolean; error?: string }> => {
  try {
    // First delete all existing employees to avoid duplicates
    await supabase.from('employees').delete().not('id', 'is', null);

    // Then insert all current employees
    const { error } = await supabase.from('employees').insert(employees);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Error saving employees:', error);
    return { success: false, error: error.message };
  }
};

// Fetch all employees from Supabase
export const fetchEmployees = async (): Promise<{ data: Employee[] | null; error?: string }> => {
  try {
    const { data, error } = await supabase.from('employees').select('*');

    if (error) throw error;

    return { data };
  } catch (error: any) {
    console.error('Error fetching employees:', error);
    return { data: null, error: error.message };
  }
};

// Save shift data for a specific employee
export const saveEmployeeShifts = async (
  employeeId: string,
  shifts: { [day: string]: ShiftType }
): Promise<{ success: boolean; error?: string }> => {
  try {
    // First delete existing shifts for this employee
    await supabase
      .from('shifts')
      .delete()
      .eq('employee_id', employeeId);

    // Format the shifts data for insertion
    const shiftsToInsert = Object.entries(shifts).map(([day, shiftType]) => ({
      employee_id: employeeId,
      day,
      shift_type: shiftType,
    }));

    if (shiftsToInsert.length > 0) {
      const { error } = await supabase.from('shifts').insert(shiftsToInsert);

      if (error) throw error;
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error saving shifts for employee:', error);
    return { success: false, error: error.message };
  }
};

// Fetch shifts for all employees
export const fetchAllShifts = async (): Promise<{ data: ShiftData | null; error?: string }> => {
  try {
    const { data, error } = await supabase.from('shifts').select('*');

    if (error) throw error;

    // Convert the flat structure to the nested ShiftData format
    const shiftData: ShiftData = {};

    data.forEach((shift: any) => {
      const { employee_id, day, shift_type } = shift;

      if (!shiftData[employee_id]) {
        shiftData[employee_id] = {};
      }

      shiftData[employee_id][day] = shift_type;
    });

    return { data: shiftData };
  } catch (error: any) {
    console.error('Error fetching all shifts:', error);
    return { data: null, error: error.message };
  }
};

// Save all shifts for all employees at once
export const saveAllShifts = async (shiftData: ShiftData): Promise<{ success: boolean; error?: string }> => {
  try {
    // First delete all existing shifts
    await supabase.from('shifts').delete().not('id', 'is', null);

    // Format all shifts for insertion
    const shiftsToInsert = Object.entries(shiftData).flatMap(([employeeId, employeeShifts]) => {
      return Object.entries(employeeShifts).map(([day, shiftType]) => ({
        employee_id: employeeId,
        day,
        shift_type: shiftType,
      }));
    });

    if (shiftsToInsert.length > 0) {
      const { error } = await supabase.from('shifts').insert(shiftsToInsert);

      if (error) throw error;
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error saving all shifts:', error);
    return { success: false, error: error.message };
  }
};
