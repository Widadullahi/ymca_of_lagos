import React from 'react';
import Select from 'react-select';

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (e: { target: { name: string; value: string } }) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  name,
  options,
  value,
  onChange,
  error,
  required = false,
  placeholder = 'Select...',
  className = '',
}) => {
  // Convert options to react-select format if they aren't already
  const selectOptions: Option[] = options.map(option => 
    typeof option === 'string' 
      ? { value: option, label: option } 
      : option
  );

  // Find the currently selected option
  const selectedOption = selectOptions.find(option => option.value === value);

  // Handle react-select onChange and convert it to match the expected format
  const handleSelectChange = (selected: Option | null) => {
    onChange({
      target: {
        name,
        value: selected ? selected.value : '',
      },
    });
  };

  return (
    <div className={`mb-4 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Select
        id={name}
        name={name}
        options={selectOptions}
        value={selectedOption}
        onChange={handleSelectChange}
        placeholder={placeholder}
        className="basic-single"
        classNamePrefix="select"
        isClearable
        isSearchable
        styles={{
          control: (baseStyles, state) => ({
            ...baseStyles,
            borderColor: error ? '#ef4444' : state.isFocused ? '#3b82f6' : '#d1d5db',
            boxShadow: error ? '0 0 0 1px #ef4444' : state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
            '&:hover': {
              borderColor: error ? '#ef4444' : '#3b82f6',
            },
            borderRadius: '0.375rem',
            padding: '0.25rem',
          }),
          placeholder: (baseStyles) => ({
            ...baseStyles,
            color: '#9ca3af',
          }),
        }}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default SearchableSelect;