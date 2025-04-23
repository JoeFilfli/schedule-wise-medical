import React, { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  size?: 'default' | 'large';
}

export default function PageHeader({ 
  title, 
  subtitle,
  children,
  size = 'default'
}: PageHeaderProps) {
  return (
    <div className="page-header">
      <div className="page-header-content">
        <h1 className={`${size === 'large' ? 'h2' : 'h3'} mb-0`}>{title}</h1>
        {subtitle && <p className="text-muted mb-0 mt-1 subtitle-text">{subtitle}</p>}
      </div>
      {children && <div className="page-header-actions">{children}</div>}
    </div>
  );
} 