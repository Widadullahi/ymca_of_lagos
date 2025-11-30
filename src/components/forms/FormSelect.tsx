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
      <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor={name}>
        {label}
      </label>
      <select
        className={`bg-white/70 backdrop-blur-md border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200 rounded-lg w-full py-2.5 px-4 text-gray-800 shadow-sm ${error ? 'border-red-500 focus:ring-red-100' : ''} ${className}`}
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
        <p className="text-red-500 text-xs italic mt-1 animate-fade-in">{error}</p>
      )}
    </div>
  );
};

export default FormSelect;