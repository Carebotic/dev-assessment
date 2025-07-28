import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import ShiftDropdown, { ShiftType } from './ShiftDropdown';
import { employeesData } from "../../data/employees";
import { Employee } from '../../types';

interface ShiftData {
  [employeeId: string]: {
    [day: string]: ShiftType;
  };
}

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const ShiftTable: React.FC = () => {
    const [employees, setEmployees] = useState<Employee[]>(employeesData);
    const [shifts, setShifts] = useState<ShiftData>({});

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
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-white">
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
                                <td className="py-5 px-6 text-left font-medium text-lg border-b border-gray-200">
                                    {emp.name}
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
