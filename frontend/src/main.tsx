import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import '@xyflow/react/dist/style.css';
import { ReactFlowProvider } from '@xyflow/react';
import App from './App.tsx'
import { ProjectCanvas } from './HybridApp.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ReactFlowProvider>
    {/* <App /> */}
    <ProjectCanvas/>
    </ReactFlowProvider>
  </StrictMode>,
)
