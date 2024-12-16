import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ViewPOC from "./components/ViewPOC";
import ViewAppointments from "./components/ViewAppointments";
import BookAppointment from "./components/BookAppointment";
import LoginPage from "./components/LoginPage";
import AdminDashboard from "./components/AdminDashboard";
import UpdateAvailability from "./components/UpdateAvailability";
import DoctorDashboard from "./components/poc-view/DoctorDashboard";
import AddNewAppointment from "./components/AddNewAppointment";
import LogoutPage from "./components/LogoutPage";
import AvailabilityManager from "./components/poc-view/AvailabilityManager";

const App = () => {
  return (
    <Router>
      <div>
        <Routes>
          {/* LoginPage */}
          <Route path="/" element={<LoginPage />} />

          {/*Admin Dashboard */}
          <Route path="/admin-dashboard" element={<AdminDashboard />} />

          {/* VIEW POC: POCs for a Department */}
          <Route path="/view-poc" element={<ViewPOC />} />
          
          {/* VIEW POC: Appointments for a POC */}
          <Route path="/view-appointments/:pocId" element={<ViewAppointments />} />

          {/* Book appointment */}
          <Route path="/book-appointment" element={<BookAppointment />} /> 

          {/* Update availability */}
          <Route path="/update-availability" element={<UpdateAvailability />} />

          {/* Add new appointment */}
          <Route path="/add-new-appointment" element={<AddNewAppointment />} />

          {/* poc dashboard*/}
          <Route path="/poc-dashboard" element={<DoctorDashboard />}/>

          <Route path='/update-availability-poc' element={<AvailabilityManager />} />

          {/*Logout page */}
          <Route path="/logout" element={<LogoutPage />} />

        </Routes>
      </div>
    </Router>
  );
};

export default App;
