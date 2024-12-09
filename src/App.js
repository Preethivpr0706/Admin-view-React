import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Departments from "./components/Departments";
import ViewPOC from "./components/ViewPOC";
import ViewAppointments from "./components/ViewAppointments";
import HomePage from "./components/HomePage";

const App = () => {
  return (
    <Router>
      <div>
        <Routes>
          {/* Home Page */}
          <Route path="/" element={<HomePage />} />
          
          {/* Departments Page */}
          <Route path="/departments" element={<Departments />} />
          
          {/* POCs for a Department */}
          <Route path="/view-poc/:departmentId" element={<ViewPOC />} />
          
          {/* Appointments for a POC */}
          <Route path="/view-appointments/:pocId" element={<ViewAppointments />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
