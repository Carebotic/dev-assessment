import React, { useState } from 'react';
import { Employee } from '../../types';

interface SidebarProps {
  employees: Employee[];
  onAddEmployee: (employee: Employee) => void;
  onRemoveEmployee: (employeeId: string) => void;
  isLoading?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ employees, onAddEmployee, onRemoveEmployee, isLoading = false }) => {
  const [newEmployeeName, setNewEmployeeName] = useState('');

  const handleAddEmployee = () => {
    if (newEmployeeName.trim()) {
      onAddEmployee({
        id: Date.now().toString(), // Simple unique ID generation
        name: newEmployeeName.trim()
      });
      setNewEmployeeName('');
    }
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 shadow-md p-4 flex flex-col sticky top-[76px] h-[calc(100vh-76px)] overflow-hidden z-40">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Team Management</h2>

      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-600 mb-2">Add Employee</h3>
        <div className="flex flex-col space-y-2">
          <input 
            type="text" 
            value={newEmployeeName}
            onChange={(e) => setNewEmployeeName(e.target.value)}
            placeholder="Employee name"
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
          />
          <button 
            onClick={handleAddEmployee}
            disabled={!newEmployeeName.trim() || isLoading}
            className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Adding...' : 'Add Employee'}
          </button>
        </div>
      </div>

              <div className="flex-1 overflow-hidden">
        <h3 className="text-sm font-medium text-gray-600 mb-2">Current Team</h3>
        <ul className="space-y-2 overflow-y-auto max-h-full pr-1">
          {employees.map(employee => (
            <li key={employee.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
              <span className="text-gray-700">{employee.name}</span>
              <button 
                onClick={() => onRemoveEmployee(employee.id)}
                className="text-red-500 hover:text-red-700 focus:outline-none"
                aria-label={`Remove ${employee.name}`}
                disabled={isLoading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
