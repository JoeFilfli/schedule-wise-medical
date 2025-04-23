'use client';

import Link from 'next/link';
import Card from '@/components/ui/Card';
import { useEffect, useState } from 'react';

interface WidgetProps {
  title: string;
  description: string;
  emoji: string;
  href: string;
  color: string;
}

const DashboardWidget = ({ title, description, emoji, href, color }: WidgetProps) => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return null;
  }
  
  return (
    <Link href={href} className="text-decoration-none">
      <Card 
        className="h-100" 
        hoverable={true}
        noPadding={false}
      >
        <div className="p-4 d-flex flex-column align-items-center text-center">
          <div 
            className="widget-icon mb-3 rounded-circle d-flex align-items-center justify-content-center" 
            style={{ 
              width: '56px', 
              height: '56px', 
              backgroundColor: `var(--${color}-50)`,
              color: `var(--${color})`,
              fontSize: '1.5rem'
            }}
          >
            <span>{emoji}</span>
          </div>
          <h5 className="mb-2 text-truncate w-100">{title}</h5>
          <p className="text-muted small">{description}</p>
        </div>
      </Card>
    </Link>
  );
};

export default DashboardWidget; 