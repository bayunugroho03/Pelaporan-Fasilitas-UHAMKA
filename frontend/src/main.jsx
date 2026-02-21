import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import axios from "axios";
import { BrowserRouter } from "react-router-dom"; // Pindahkan BrowserRouter kesini

// HANYA INI settingan axios yang boleh ada
axios.defaults.withCredentials = true;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)