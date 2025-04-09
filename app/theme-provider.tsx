'use client';

import { useEffect } from 'react';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.body.dataset.bsTheme = 'light';
  }, []);

  return <>{children}</>;
}
