'use client';

import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  fullWidth?: boolean;
  containerClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      startIcon,
      endIcon,
      fullWidth = false,
      containerClassName = '',
      className = '',
      ...props
    },
    ref
  ) => {
    const id = props.id || Math.random().toString(36).substring(2, 9);
    
    return (
      <div className={`mb-3 ${fullWidth ? 'w-100' : ''} ${containerClassName}`}>
        {label && (
          <label htmlFor={id} className="form-label">
            {label}
          </label>
        )}
        <div className="position-relative">
          {startIcon && (
            <div className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted">
              {startIcon}
            </div>
          )}
          <input
            {...props}
            ref={ref}
            id={id}
            className={`
              form-control
              ${error ? 'is-invalid' : ''}
              ${startIcon ? 'ps-4' : ''}
              ${endIcon ? 'pe-4' : ''}
              ${className}
            `}
          />
          {endIcon && (
            <div className="position-absolute top-50 end-0 translate-middle-y me-3 text-muted">
              {endIcon}
            </div>
          )}
        </div>
        {helperText && !error && <div className="form-text">{helperText}</div>}
        {error && <div className="invalid-feedback">{error}</div>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input; 