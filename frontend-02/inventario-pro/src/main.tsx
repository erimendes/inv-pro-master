import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { NotificationProvider } from './app/providers/NotificationProvider';

import App from './App';
import './index.css';

ReactDOM.createRoot(
  document.getElementById('root')!
).render(
  <React.StrictMode>
    <NotificationProvider>

    
    <BrowserRouter>
      <App />
    </BrowserRouter>
    </NotificationProvider>
  </React.StrictMode>
);
