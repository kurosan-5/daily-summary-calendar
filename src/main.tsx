import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import dayjs from 'dayjs'
import 'dayjs/locale/ja'

// dayjs locale setup
dayjs.locale('ja')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
