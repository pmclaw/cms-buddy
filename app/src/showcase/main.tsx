import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '../index.css'
import PhoneShowcase from './phone-showcase'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PhoneShowcase />
  </StrictMode>
)
