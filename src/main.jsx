import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { EstudianteProvider } from './core/contexts/EstudianteContext'
import { SocialProvider } from './core/contexts/SocialContext'
import { GamificacionProvider } from './core/contexts/GamificacionContext'
import { MentorProvider } from './core/contexts/MentorContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <EstudianteProvider>
      <SocialProvider>
        <GamificacionProvider>
          <MentorProvider>
            <App />
          </MentorProvider>
        </GamificacionProvider>
      </SocialProvider>
    </EstudianteProvider>
  </StrictMode>,
)
