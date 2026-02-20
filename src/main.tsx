import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
// Initialize theme BEFORE React renders to prevent flash
const initTheme = () => {
  const stored = localStorage.getItem('nyneos-theme');
  const theme = stored ? JSON.parse(stored)?.state?.theme : 'dark-orange';
  document.documentElement.setAttribute('data-theme', theme || 'dark-orange');
  if (theme === 'light-orange') {
    document.documentElement.classList.add('light');
  }
};

initTheme();
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
