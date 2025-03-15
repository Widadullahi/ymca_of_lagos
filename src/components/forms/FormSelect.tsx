import React, { SelectHTMLAttributes } from 'react';

interface Option {
  value: string;
  label: string;
}

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  name: string;
  options: Option[];
  error?: string;
  wrapperClass?: string;
}

const FormSelect: React.FC<FormSelectProps> = ({
  label,
  name,
  options,
  error,
  wrapperClass = "mb-4",
  className = "",
  ...rest
}) => {
  return (
    <div className={wrapperClass}>
      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={name}>
        {label}
      </label>
      <select
        className={`shadow appearance-none border ${error ? 'border-red-500' : ''} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${className}`}
        id={name}
        name={name}
        {...rest}
      >
        <option value="">Select {label}</option>
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-red-500 text-xs italic mt-1">{error}</p>
      )}
    </div>
  );
};

export default FormSelect;