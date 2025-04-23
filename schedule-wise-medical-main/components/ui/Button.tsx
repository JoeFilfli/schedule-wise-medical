'use client';

import React from 'react';
import Link from 'next/link';

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'link' | 'outline-primary' | 'outline-secondary' | 'outline-success' | 'outline-danger' | 'outline-warning' | 'outline-info' | 'outline-light' | 'outline-dark';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  href?: string;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'start' | 'end';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  ariaLabel?: string;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  href,
  fullWidth = false,
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'start',
  onClick,
  type = 'button',
  ariaLabel,
}: ButtonProps) {
  const baseClasses = `
    btn 
    btn-${variant} 
    ${size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : ''}
    ${fullWidth ? 'w-100' : ''}
    ${disabled || loading ? 'disabled' : ''}
    ${loading ? 'position-relative' : ''}
    d-inline-flex align-items-center justify-content-center gap-2
    ${className}
  `;

  // If href is provided, render as Link
  if (href) {
    return (
      <Link 
        href={href} 
        className={baseClasses}
        aria-label={ariaLabel}
        tabIndex={disabled ? -1 : undefined}
        onClick={disabled ? (e) => e.preventDefault() : undefined}
      >
        {loading && (
          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
        )}
        {icon && iconPosition === 'start' && !loading && (
          <span>{icon}</span>
        )}
        {children}
        {icon && iconPosition === 'end' && !loading && (
          <span>{icon}</span>
        )}
      </Link>
    );
  }

  // Otherwise render as button
  return (
    <button
      type={type}
      className={baseClasses}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
    >
      {loading && (
        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
      )}
      {icon && iconPosition === 'start' && !loading && (
        <span>{icon}</span>
      )}
      {children}
      {icon && iconPosition === 'end' && !loading && (
        <span>{icon}</span>
      )}
    </button>
  );
} 