import React from 'react';

const Input = ({ label, id, type = 'text', value, onChange, placeholder, error, className = '', ...props }) => {
  const inputId = id || props.name;
  return (
    <div className={`flex flex-col space-y-1 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`px-4 py-2 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-200 ${
          error ? 'border-red-500 ring-red-500' : 'border-gray-300 dark:border-gray-700'
        }`}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};

export { Input };
