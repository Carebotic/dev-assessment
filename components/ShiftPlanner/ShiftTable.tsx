import React, { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import ShiftDropdown, { ShiftType } from './ShiftDropdown';
import { employeesData } from "../../data/employees";
import { Employee } from '../../types';
import Notification from './Notification';

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

    const handleAddEmployee = (newEmployee: Employee) => {
        setEmployees([...employees, newEmployee]);
    };

    const handleRemoveEmployee = (employeeId: string) => {
        // Remove employee from the list
        setEmployees(employees.filter(emp => emp.id !== employeeId));

        // Remove employee's shift data
        const newShifts = {...shifts};
        delete newShifts[employeeId];
        setShifts(newShifts);
    };

    const handleShiftChange = (employeeId: string, day: string, shift: ShiftType) => {
        setShifts(prev => {
            const newShifts = {...prev};
            if (!newShifts[employeeId]) {
                newShifts[employeeId] = {};
            }
            newShifts[employeeId][day] = shift;
            return newShifts;
        });
        // Mark this employee as having unsaved changes
        setChangedEmployees(prev => new Set([...prev, employeeId]));
    };

    // Track which employees have changes
    useEffect(() => {
        const updatedChangedEmployees = new Set<string>();

        Object.keys(shifts).forEach(employeeId => {
            const employeeShifts = shifts[employeeId];
            const savedEmployeeShifts = savedShifts[employeeId] || {};

            // Check if the shifts are different
            const daysKeys = new Set([...Object.keys(employeeShifts), ...Object.keys(savedEmployeeShifts)]);
            let hasChanges = false;

            for (const day of daysKeys) {
                if (employeeShifts[day] !== savedEmployeeShifts[day]) {
                    hasChanges = true;
                    break;
                }
            }

            if (hasChanges) {
                updatedChangedEmployees.add(employeeId);
            }
        });

        // Check for employees that were in savedShifts but might have been removed in shifts
        Object.keys(savedShifts).forEach(employeeId => {
            if (!shifts[employeeId]) {
                updatedChangedEmployees.add(employeeId);
            }
        });

        setChangedEmployees(updatedChangedEmployees);
    }, [shifts, savedShifts]);

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
    const handleSaveEmployeeShifts = (employeeId: string) => {
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

        // Update saved shifts for this employee
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
    };

    // Check for incomplete schedules (cells with '-')
    const checkIncompleteSchedule = (employeeId: string): boolean => {
        // Get all days for this employee
        const employeeShifts = shifts[employeeId] || {};
        // Check if any day is missing a shift assignment
        return days.some(day => !employeeShifts[day]);
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
                />

                {/* Table */}
                <main className="flex-1 flex justify-center items-start p-8 pb-20 overflow-auto">
                <div className="w-full max-w-7xl bg-white border border-gray-300 rounded-2xl shadow-xl overflow-x-auto">
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
                                        disabled={!changedEmployees.has(emp.id)}
                                        className={`text-xs px-2 py-1 rounded ${changedEmployees.has(emp.id) ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-200 text-gray-500'} transition-colors focus:outline-none`}
                                    >
                                        Save
                                    </button>
                                </td>
                                {days.map((day) => (
                                    <td key={day} className="py-5 px-6 border-b border-gray-200">
                                        <ShiftDropdown
                                            value={shifts[emp.id]?.[day] || null}
                                            onChange={(shift) => handleShiftChange(emp.id, day, shift)}
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                </main>
            </div>
        </div>
    );
};

export default ShiftTable;
