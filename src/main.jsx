import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import TargetCursor from './components/TargetCursor.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TargetCursor 
      spinDuration={2}
      hideDefaultCursor
      parallaxOn
      hoverDuration={0.2}
    />
    <App />
  </StrictMode>,
)
