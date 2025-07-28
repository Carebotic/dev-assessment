import React, { useState, useRef, useEffect } from 'react';

export type ShiftType = 'Early' | 'Late' | 'Off' | null;

interface ShiftDropdownProps {
  value: ShiftType;
  onChange: (value: ShiftType) => void;
}

const ShiftDropdown: React.FC<ShiftDropdownProps> = ({ value, onChange }) => {
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

  const options: ShiftType[] = ['Early', 'Late', 'Off'];

  const getDisplayValue = () => {
    return value || '-';
  };

  const getBackgroundColor = () => {
    if (value === 'Early') return 'bg-blue-50 text-blue-700 border-blue-300';
    if (value === 'Late') return 'bg-purple-50 text-purple-700 border-purple-300';
    if (value === 'Off') return 'bg-red-50 text-red-700 border-red-300';
    return 'bg-gray-50 text-gray-600 border-gray-300';
  };

      // Calculate direction for the dropdown (up or down) when opened
      const [dropDirection, setDropDirection] = useState<'up' | 'down'>('down');

      // Check position when opening the dropdown
      const checkPosition = () => {
    if (dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      // If less than 150px below, show dropdown above
      setDropDirection(spaceBelow < 150 ? 'up' : 'down');
    }
      };

      const handleOpenDropdown = () => {
    checkPosition();
    setIsOpen(!isOpen);
      };

      return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className={`inline-block w-full max-w-[100px] rounded-md border px-3 py-2 text-sm shadow-sm ${getBackgroundColor()} hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500`}
        onClick={handleOpenDropdown}
      >
        {getDisplayValue()}
      </button>

      {isOpen && (
        <div 
          className={`fixed ${dropDirection === 'up' ? 'bottom-0' : 'top-0'} left-0 rounded-md border border-gray-200 bg-white shadow-lg z-50`}
          style={{
            bottom: dropDirection === 'up' ? `${window.innerHeight - dropdownRef.current!.getBoundingClientRect().top}px` : 'auto',
            top: dropDirection === 'down' ? `${dropdownRef.current!.getBoundingClientRect().bottom}px` : 'auto',
            left: `${dropdownRef.current!.getBoundingClientRect().left}px`,
            width: `${dropdownRef.current!.offsetWidth}px`,
            maxHeight: '200px',
            overflowY: 'auto'
          }}
        >
          {options.map((option) => (
            <button
              key={option}
              type="button"
              className={`block w-full px-3 py-2 text-left text-sm hover:bg-gray-100 ${value === option ? 'bg-gray-50 font-medium' : ''}`}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
            >
              {option}
            </button>
          ))}
          {value && (
            <button
              type="button"
              className="block w-full px-3 py-2 text-left text-sm text-gray-500 hover:bg-gray-100 border-t border-gray-100"
              onClick={() => {
                onChange(null);
                setIsOpen(false);
              }}
            >
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ShiftDropdown;
