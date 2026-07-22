import React from 'react';
import ReactDOM from 'react-dom/client';
import { RootProvider } from '@/providers/root-provider';
import { AppRouter } from '@/router/app-router';
import '@/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RootProvider>
      <AppRouter />
    </RootProvider>
  </React.StrictMode>,
);
