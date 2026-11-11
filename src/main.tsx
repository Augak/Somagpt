import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './style.css';

// Register the lightweight service worker after the first render so it never
// delays the initial screen on slower Android devices.
createRoot(document.getElementById('root')!).render(
  <React.StrictMode><App /></React.StrictMode>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.warn('SomaGPT offline support could not be registered:', error);
    });
  });
}
