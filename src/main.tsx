import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import WebApp from '@twa-dev/sdk';
import App from './App.tsx';
import './styles/main.css';
import ErrorBoundary from './components/ErrorBoundary.tsx';

WebApp.ready();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
