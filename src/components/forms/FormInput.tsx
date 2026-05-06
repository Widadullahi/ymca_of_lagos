import React, { InputHTMLAttributes, memo, useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

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
  type,
  ...rest
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === 'password';
  const inputType = isPasswordField ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={wrapperClass}>
      <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor={name}>
        {label}
      </label>
      <div className="relative">
        <input
          className={`bg-white/70 backdrop-blur-md border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200 rounded-lg w-full py-2.5 px-4 text-gray-800 placeholder-gray-400 shadow-sm ${isPasswordField ? 'pr-12' : ''} ${error ? 'border-red-500 focus:ring-red-100' : ''} ${className}`}
          id={name}
          name={name}
          autoComplete="off"
          type={inputType}
          {...rest}
        />
        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 hover:text-gray-700"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        )}
      </div>
      {error && (
        <p className="text-red-500 text-xs italic mt-1 animate-fade-in">{error}</p>
      )}
    </div>
  );
};

export default memo(FormInput);
