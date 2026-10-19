import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { locale } from './lib/i18n';
import './index.css';

// so Safari doesn't wipe the workouts when space runs low
navigator.storage?.persist?.().catch(() => {});
document.documentElement.lang = locale;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
