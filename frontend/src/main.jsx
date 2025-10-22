import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'

import { AuthProvider } from './contexts/AuthContext.jsx'
import App from './App.jsx'
import { ToastProvider } from './contexts/ToastContext.jsx'

createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <BrowserRouter>
      <ToastProvider>
      <AuthProvider>
          <App />
      </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  // </StrictMode>,
)
