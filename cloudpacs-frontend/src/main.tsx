import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Query from "./queryClientProvider"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* <Query /> */}
    <App />
  </StrictMode>,
)
