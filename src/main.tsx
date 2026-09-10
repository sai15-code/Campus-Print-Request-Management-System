import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { PrintProvider } from './context/PrintContext.jsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PrintProvider>
      <App />
    </PrintProvider>
  </StrictMode>,
);
