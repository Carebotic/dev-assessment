import React, { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import ShiftDropdown, { ShiftType } from './ShiftDropdown';
import { employeesData } from "../../data/employees";
import { Employee } from '../../types';
import Notification from './Notification';
import { ShiftData, saveEmployeeShifts, fetchAllShifts, fetchEmployees, saveAllShifts, saveEmployees } from '../../lib/shift-service';
import supabase from '../../lib/supabase';

interface ShiftData {
  [employeeId: string]: {
    [day: string]: ShiftType;
  };
}

type ValidationResult = {
  valid: boolean;
  invalidEmployees: { id: string; name: string; count: number }[];
};

type NotificationType = 'error' | 'success' | 'warning' | null;

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const ShiftTable: React.FC = () => {
    const [employees, setEmployees] = useState<Employee[]>(employeesData);
    const [shifts, setShifts] = useState<ShiftData>({});
    const [savedShifts, setSavedShifts] = useState<ShiftData>({});
    const [changedEmployees, setChangedEmployees] = useState<Set<string>>(new Set());
    const [notification, setNotification] = useState<{type: NotificationType; message: string}>({type: null, message: ''});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const handleAddEmployee = async (newEmployee: Employee) => {
        setIsSaving(true);
        try {
            // Save the new employee to Supabase
            const { success, error } = await saveEmployees([...employees, newEmployee]);

            if (!success) {
                throw new Error(error);
            }

            setEmployees([...employees, newEmployee]);

            setNotification({
                type: 'success',
                message: `${newEmployee.name} added successfully.`
            });
        } catch (error: any) {
            setNotification({
                type: 'error',
                message: `Failed to add employee: ${error.message}`
            });
            console.error('Error adding employee:', error);
        } finally {
            setIsSaving(false);
        }
    };

    // Fetch data from Supabase on component mount
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Fetch employees
                const { data: employeesData, error: employeesError } = await fetchEmployees();
                if (employeesError) {
                    throw new Error(employeesError);
                }

                if (employeesData) {
                    setEmployees(employeesData);
                }

                // Fetch all shifts
                const { data: shiftsData, error: shiftsError } = await fetchAllShifts();
                if (shiftsError) {
                    throw new Error(shiftsError);
                }

                if (shiftsData) {
                    setShifts(shiftsData);
                    setSavedShifts(shiftsData);
                }

            } catch (error) {
                console.error('Error loading data:', error);
                setNotification({
                    type: 'error',
                    message: 'Failed to load data from the server.'
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleRemoveEmployee = async (employeeId: string) => {
        const employeeName = employees.find(emp => emp.id === employeeId)?.name || 'Employee';

        setIsSaving(true);
        try {
            // Remove employee from database by saving the filtered list
            const updatedEmployees = employees.filter(emp => emp.id !== employeeId);
            const { success, error } = await saveEmployees(updatedEmployees);

            if (!success) {
                throw new Error(error);
            }

            // Remove employee from the list
            setEmployees(updatedEmployees);

            // Remove employee's shift data
            const newShifts = {...shifts};
            delete newShifts[employeeId];
            setShifts(newShifts);

            // Also remove from saved shifts
            const newSavedShifts = {...savedShifts};
            delete newSavedShifts[employeeId];
            setSavedShifts(newSavedShifts);

            // Delete employee's shifts from database
            await supabase
                .from('shifts')
                .delete()
                .eq('employee_id', employeeId);

            setNotification({
                type: 'success',
                message: `${employeeName} removed successfully.`
            });
        } catch (error: any) {
            setNotification({
                type: 'error',
                message: `Failed to remove ${employeeName}: ${error.message}`
            });
            console.error('Error removing employee:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleShiftChange = (employeeId: string, day: string, shift: ShiftType) => {
        // Update shifts data
        setShifts(prev => {
            const newShifts = {...prev};
            if (!newShifts[employeeId]) {
                newShifts[employeeId] = {};
            }
            newShifts[employeeId][day] = shift;
            return newShifts;
        });

        // Always mark this employee as having unsaved changes when any shift is changed
        // This ensures the save button is enabled even when modifying existing shifts
        setChangedEmployees(prev => new Set([...prev, employeeId]));
    };

    // We now mark changes directly in handleShiftChange rather than using this effect

    // Validate max 5 shifts per employee
    const validateSchedule = (): ValidationResult => {
        const invalidEmployees: { id: string; name: string; count: number }[] = [];

        employees.forEach(employee => {
            if (shifts[employee.id]) {
                const shiftCount = Object.values(shifts[employee.id]).filter(
                    shift => shift === 'Early' || shift === 'Late'
                ).length;

                if (shiftCount > 5) {
                    invalidEmployees.push({
                        id: employee.id,
                        name: employee.name,
                        count: shiftCount
                    });
                }
            }
        });

        return {
            valid: invalidEmployees.length === 0,
            invalidEmployees
        };
    };

    // Handle save for specific employee
    const handleSaveEmployeeShifts = async (employeeId: string) => {
        // First validate all shifts
        const validation = validateSchedule();
        const employeeName = employees.find(emp => emp.id === employeeId)?.name || 'Employee';

        // Check for incomplete schedule (cells with '-')
        const hasIncompleteSchedule = checkIncompleteSchedule(employeeId);

        // Check for max shifts validation
        if (!validation.valid) {
            const invalidEmployee = validation.invalidEmployees.find(emp => emp.id === employeeId);

            if (invalidEmployee) {
                const errorMessage = `${invalidEmployee.name} has ${invalidEmployee.count} shifts. Maximum allowed is 5.`;
                setNotification({
                    type: 'error',
                    message: errorMessage
                });
                console.error(errorMessage);
                return;
            }
        }

        setIsSaving(true);
        try {
            // Save this employee's shifts to Supabase
            const { success, error } = await saveEmployeeShifts(
                employeeId,
                shifts[employeeId] || {}
            );

            if (!success) {
                throw new Error(error);
            }

            // Update saved shifts locally
            setSavedShifts(prev => ({
                ...prev,
                [employeeId]: {...(shifts[employeeId] || {})}
            }));

            // Clear change status for this employee
            setChangedEmployees(prev => {
                const newSet = new Set([...prev]);
                newSet.delete(employeeId);
                return newSet;
            });

            // Show appropriate notification
            if (hasIncompleteSchedule) {
                const warningMessage = `${employeeName} has incomplete shifts. Some days don't have assignments.`;
                setNotification({
                    type: 'warning',
                    message: warningMessage
                });
                console.warn(warningMessage, shifts[employeeId]);
            } else {
                const successMessage = `${employeeName}'s schedule saved successfully.`;
                setNotification({
                    type: 'success',
                    message: successMessage
                });
                console.log(successMessage, shifts[employeeId]);
            }
        } catch (error: any) {
            setNotification({
                type: 'error',
                message: `Failed to save ${employeeName}'s shifts: ${error.message}`
            });
            console.error('Error saving shifts:', error);
        } finally {
            setIsSaving(false);
        }
    };

    // Check for incomplete schedules (cells with '-')
    const checkIncompleteSchedule = (employeeId: string): boolean => {
        // Get all days for this employee
        const employeeShifts = shifts[employeeId] || {};
        // Check if any day is missing a shift assignment
        return days.some(day => !employeeShifts[day] || employeeShifts[day] === ShiftType.NONE);
    };

    // Close notification
    const closeNotification = () => {
        setNotification({type: null, message: ''});
    };


    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-white relative">
            {notification.type && (
                <Notification
                    type={notification.type}
                    message={notification.message}
                    onClose={closeNotification}
                />
            )}
            {/* Sticky Header */}
            <Header />

            {/* Main Content */}
            <div className="flex pt-[76px] relative">
                {/* Sidebar */}
                <Sidebar 
                    employees={employees} 
                    onAddEmployee={handleAddEmployee} 
                    onRemoveEmployee={handleRemoveEmployee} 
                    isLoading={isSaving}
                />

                {/* Table */}
                <main className="flex-1 flex justify-center items-start p-8 pb-20 overflow-auto">
                <div className="w-full max-w-7xl bg-white border border-gray-300 rounded-2xl shadow-xl overflow-x-auto">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : (
                    <table className="w-full table-fixed text-base text-center text-gray-700">
                        <thead className="bg-gray-100 text-gray-600 uppercase text-sm tracking-wide">
                        <tr>
                            <th className="w-44 py-5 px-6 text-left font-semibold border-b border-gray-300">
                                Employee
                            </th>
                            {days.map((day) => (
                                <th key={day} className="py-5 px-6 font-semibold border-b border-gray-300">
                                    {day}
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {employees.map((emp, idx) => (
                            <tr key={emp.id} className={`${idx % 2 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition`}>
                                <td className="py-5 px-6 text-left font-medium text-lg border-b border-gray-200 flex items-center justify-between gap-2">
                                    <div className="flex flex-col">
                                        <span className="text-lg">{emp.name}</span>
                                        <span className="text-xs text-gray-500">ID: {emp.id}</span>
                                    </div>
                                    <button
                                        onClick={() => handleSaveEmployeeShifts(emp.id)}
                                        disabled={!changedEmployees.has(emp.id) || isSaving}
                                        className={`text-xs px-2 py-1 rounded ${changedEmployees.has(emp.id) && !isSaving ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-200 text-gray-500'} transition-colors focus:outline-none`}
                                    >
                                        {isSaving && changedEmployees.has(emp.id) ? 'Saving...' : changedEmployees.has(emp.id) ? 'Save' : 'Saved'}
                                    </button>
                                </td>
                                {days.map((day) => (
                                    <td key={day} className="py-5 px-6 border-b border-gray-200">
                                        <ShiftDropdown
                                            value={shifts[emp.id]?.[day] || ShiftType.NONE}
                                            onChange={(shift) => handleShiftChange(emp.id, day, shift)}
                                            disabled={isSaving}
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    )}
                </div>
                </main>
            </div>
        </div>
    );
};

export default ShiftTable;
