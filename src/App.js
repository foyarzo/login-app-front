import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Index from './components/views/Index'; // Importa el componente Index
import './index.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} /> {/* Ruta para Login */}
          <Route path="/index" element={<Index />} /> {/* Ruta para Index */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
