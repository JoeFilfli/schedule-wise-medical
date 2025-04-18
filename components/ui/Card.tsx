'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  footer?: React.ReactNode;
  headerAction?: React.ReactNode;
  noPadding?: boolean;
  hoverable?: boolean;
  bordered?: boolean;
}

export default function Card({
  children,
  className = '',
  title,
  subtitle,
  icon,
  footer,
  headerAction,
  noPadding = false,
  hoverable = false,
  bordered = true,
}: CardProps) {
  return (
    <div 
      className={`
        bg-white
        ${bordered ? 'border' : ''} 
        rounded-3 shadow-sm 
        ${hoverable ? 'hover-shadow transition-all' : ''} 
        ${className}
      `}
    >
      {(title || icon || headerAction) && (
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
          <div className="d-flex align-items-center">
            {icon && <div className="me-2">{icon}</div>}
            <div>
              {title && <h5 className="mb-0 fw-semibold">{title}</h5>}
              {subtitle && <div className="text-muted small">{subtitle}</div>}
            </div>
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-3'}>
        {children}
      </div>
      {footer && (
        <div className="border-top p-3 bg-light rounded-bottom">
          {footer}
        </div>
      )}
    </div>
  );
} 