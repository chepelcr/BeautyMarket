import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import { queryClient } from './lib/queryClient';
import { LanguageProvider } from './contexts/LanguageContext';
import { initBrand } from './lib/brand-theme';
import './index.css';

// Initialize Amplify
import './lib/amplify';

// Apply active brand theme + favicon (visual no-op while the seeded theme
// mirrors the current palette and the favicon is empty).
initBrand();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </LanguageProvider>
  </React.StrictMode>
);
