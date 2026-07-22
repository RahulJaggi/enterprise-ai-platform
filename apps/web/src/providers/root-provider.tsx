import React from 'react';
import { ThemeProvider } from './theme-provider';
import { QueryProvider } from './query-provider';

interface RootProviderProps {
  children: React.ReactNode;
}

export function RootProvider({ children }: RootProviderProps) {
  return (
    <ThemeProvider defaultTheme="dark">
      <QueryProvider>{children}</QueryProvider>
    </ThemeProvider>
  );
}
