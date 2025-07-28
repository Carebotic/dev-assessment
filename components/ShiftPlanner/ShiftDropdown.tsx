import React, { useState, useRef, useEffect } from 'react';

export enum ShiftType {
    EARLY = 'Early',
    LATE = 'Late',
    OFF = 'Off',
    NONE = '-'
}

interface ShiftDropdownProps {
    value: ShiftType | null | undefined;
    onChange: (value: ShiftType) => void;
    disabled?: boolean;
}

  const ShiftDropdown: React.FC<ShiftDropdownProps> = ({ value, onChange, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Convert the value to ShiftType enum for internal use
  const shiftValue = value || ShiftType.NONE;

  // Get background color based on shift type
  let bgColor = 'bg-gray-50';
  let textColor = 'text-gray-600';

  if (shiftValue === ShiftType.EARLY) {
    bgColor = 'bg-blue-50';
    textColor = 'text-blue-700';
  } else if (shiftValue === ShiftType.LATE) {
    bgColor = 'bg-purple-50';
    textColor = 'text-purple-700';
  } else if (shiftValue === ShiftType.OFF) {
    bgColor = 'bg-red-50';
    textColor = 'text-red-700';
  }

    return (
        <select 
            value={shiftValue}
            onChange={e => onChange(e.target.value as ShiftType)}
            className={`p-2 rounded-md border ${bgColor} ${textColor} ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'} font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 w-28 text-center`}
            disabled={disabled}
        >
            <option value={ShiftType.NONE}>{ShiftType.NONE}</option>
            <option value={ShiftType.EARLY}>{ShiftType.EARLY}</option>
            <option value={ShiftType.LATE}>{ShiftType.LATE}</option>
            <option value={ShiftType.OFF}>{ShiftType.OFF}</option>
        </select>
    );
};

export default ShiftDropdown;
