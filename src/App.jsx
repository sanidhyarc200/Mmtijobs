import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Header from './components/header';  // import the header
import JobsPage from './pages/JobsPage';
import LandingPage from './pages/LandingPage';
import MaintenancePage from './pages/MaintenancePage';

export default function App() {
  return (
    <Router>
      <Header /> {/* Header here, so it shows on all pages */}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/maintenance" element={<MaintenancePage />} />
        <Route path="/register" element={<MaintenancePage />} />
      </Routes>
    </Router>
  );
}
