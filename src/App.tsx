import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './components/crypto/Dashboard';
import Markets from './components/crypto/Markets';
import Portfolio from './components/portfolio/Portfolio'; // Importing the Portfolio component

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/portfolio" element={<Portfolio />} /> {/* Updated Portfolio route */}
          <Route path="/markets" element={<Markets />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
