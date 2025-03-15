import React, { InputHTMLAttributes } from 'react';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  error?: string;
  wrapperClass?: string;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  name,
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
      <input
        className={`shadow appearance-none border ${error ? 'border-red-500' : ''} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${className}`}
        id={name}
        name={name}
        {...rest}
      />
      {error && (
        <p className="text-red-500 text-xs italic mt-1">{error}</p>
      )}
    </div>
  );
};

export default FormInput;