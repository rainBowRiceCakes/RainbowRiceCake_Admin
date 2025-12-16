/**
 * @file src/main.jsx
 * @description main컴포넌트
 * 251210 v1.0.0 wook 최초 생성
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
