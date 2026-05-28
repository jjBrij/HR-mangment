// src/App.jsx (Updated)
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import AddEmployee from './pages/AddEmployee';
import Payroll from './pages/Payroll';
import Leave from './pages/Leave';
import Settings from './pages/Settings';
import Attendance from './pages/Attendance';
import Performance from './pages/Performance';
import EditEmployee from './pages/EditEmployee';


function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/employees/add" element={<AddEmployee />} />
          <Route path="/payroll" element={<Payroll />} />
          <Route path="/leave" element={<Leave />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/performance" element={<Performance />} />
          <Route path="/employees/edit" element={<EditEmployee />} />


        </Routes>
      </Layout>
    </Router>
  );
}

export default App;