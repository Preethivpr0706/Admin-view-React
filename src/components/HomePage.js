import React from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="homepage">
      <h1>Admin Dashboard</h1>
      <button onClick={() => navigate("/departments")}>View POCs</button>
      <button onClick={() =>  navigate("/book-appointment")}>Book Appointment</button>
    </div>
  );
};

export default HomePage;
