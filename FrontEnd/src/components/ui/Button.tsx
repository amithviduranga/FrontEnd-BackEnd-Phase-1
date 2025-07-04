import React from 'react';
import { cn } from '@/utils';
import { ButtonProps } from '@/types';

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  className,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed touch-action-manipulation';
  
  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white shadow-sm hover:shadow-md focus:ring-primary-500',
    secondary: 'bg-white hover:bg-secondary-50 text-secondary-700 border border-secondary-300 shadow-sm hover:shadow-md focus:ring-primary-500',
    outline: 'bg-transparent hover:bg-primary-50 text-primary-600 border border-primary-600 hover:border-primary-700 focus:ring-primary-500',
  };

  const sizes = {
    sm: 'px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm min-h-[36px]',
    md: 'px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base min-h-[40px] sm:min-h-[44px]',
    lg: 'px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg min-h-[48px] sm:min-h-[52px]',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        widthClass,
        className
      )}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      <span className="whitespace-nowrap">{children}</span>
    </button>
  );
};

export default Button;
