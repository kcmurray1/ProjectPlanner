import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import '@xyflow/react/dist/style.css';
import { ReactFlowProvider } from '@xyflow/react';
import { ProjectCanvas } from './HybridApp.tsx';

createRoot(document.getElementById('root')!).render(
  < StrictMode>
    <ReactFlowProvider>
    <ProjectCanvas/>
    </ReactFlowProvider>
  </StrictMode>
)
