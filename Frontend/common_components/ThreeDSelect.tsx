// ThreeDSelect.tsx
import { useState, useRef, useEffect } from 'react';

interface IProps {
  options: Array<{ value: string | number; label: string }>;
  value: string | number | null;
  onChange: (value: string | number) => void;
  placeholder?: string;
  className?: string;
}

export const ThreeDSelect = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  className = '',
}: IProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`custom-select ${className}`} ref={selectRef}>
      <div
        className="custom-select__control"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedOption ? selectedOption.label : placeholder}
      </div>
      {isOpen && (
        <div className="custom-select__options">
          {options.map(option => (
            <div
              key={option.value}
              className={`custom-select__option ${
                option.value === value ? 'custom-select__option--selected' : ''
              }`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
