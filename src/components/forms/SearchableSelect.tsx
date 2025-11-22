// components/forms/SearchableSelect.tsx
import React from 'react';
import Select from 'react-select';

type OptionType = {
  value: string;
  label: string;
};

interface SearchableSelectProps {
  label: string;
  name: string;
  options: OptionType[];
  value: string;
  onChange: (event: { target: { name: string; value: string } }) => void;
  error?: string;
  required?: boolean;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  name,
  options,
  value,
  onChange,
  error,
  required,
}) => {
  const selectedOption = options.find(option => option.value === value);

  const handleChange = (selected: OptionType | null) => {
    onChange({
      target: {
        name,
        value: selected ? selected.value : '',
      },
    });
  };

  return (
    <div className="mb-4">
      <label className="block text-gray-700 text-sm font-bold mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Select
        name={name}
        options={options}
        value={selectedOption || null}
        onChange={handleChange}
        classNamePrefix="react-select"
        isClearable
      />
      {error && <p className="text-red-500 text-xs italic mt-1">{error}</p>}
    </div>
  );
};

export default SearchableSelect;
