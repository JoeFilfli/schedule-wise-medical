'use client';

import { useState } from 'react';
import Image from 'next/image';

interface AvatarProps {
  src: string | null;
  alt: string;
  size?: number;
  className?: string;
}

export function Avatar({ src, alt, size = 40, className = '' }: AvatarProps) {
  const [error, setError] = useState(false);
  const initials = alt
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase();

  if (!src || error) {
    return (
      <div
        className={`rounded-circle bg-secondary d-flex align-items-center justify-content-center ${className}`}
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        <span className="text-white" style={{ fontSize: `${size * 0.4}px` }}>
          {initials}
        </span>
      </div>
    );
  }

  return (
    <div className={`position-relative ${className}`} style={{ width: `${size}px`, height: `${size}px` }}>
      <Image
        src={src}
        alt={alt}
        fill
        className="rounded-circle object-fit-cover"
        onError={() => setError(true)}
        sizes={`${size}px`}
      />
    </div>
  );
} 