import { createContext, useContext, useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom'; // Per i portali
import { Toast, ToastContainer } from 'react-bootstrap';

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const toastId = useRef(0); 

  // Aggiungi un toast alla coda
  const addToast = (message, variant = 'info', delay = 4000) => {
    toastId.current += 1;
    setToasts((prevToasts) => [
      ...prevToasts,
      {
        id: toastId.current,
        message,
        variant,
        delay,
      },
    ]);
  };

  const removeToast = (id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  const toastRoot = useRef(document.getElementById('toast-root'));
  useEffect(() => {
    if (!toastRoot.current) {
      const div = document.createElement('div');
      div.id = 'toast-root';
      document.body.appendChild(div);
      toastRoot.current = div;
    }
  }, []);


  const toastPortal = toastRoot.current
    ? ReactDOM.createPortal(
        <ToastContainer className="p-3" 
        style={{
            position: 'fixed', // Questo è il cambiamento chiave
            top: '20px',       // Distanza dal top del viewport
            right: '20px',     // Distanza dal bordo destro del viewport
            zIndex: 9999,      // Assicurati che sia sopra tutto il resto
          }}
        >
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              onClose={() => removeToast(toast.id)}
              show={true}
              delay={toast.delay}
              autohide
              bg={toast.variant}
            >
              <Toast.Header closeButton>
                <strong className="me-auto">
                  {toast.variant === 'info' ? 'Info' :
                   toast.variant === 'warning' ? 'Attenzione' :
                   toast.variant === 'danger' ? 'Errore' : 'Messaggio'}
                </strong>
              </Toast.Header>
              <Toast.Body className={toast.variant === 'light' ? 'text-dark' : 'text-white'}>
                {toast.message}
              </Toast.Body>
            </Toast>
          ))}
        </ToastContainer>,
        toastRoot.current
      )
    : null;

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {toastPortal} {/* Renderizza il portale */}
    </ToastContext.Provider>
  );
};

const ToastContext = createContext();

export const useToast = () => {
  return useContext(ToastContext);
};
