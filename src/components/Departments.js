import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Departments.css";

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/departments")
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched departments:", data);
        setDepartments(data);
      })
      .catch((error) => console.error("Error fetching departments:", error));
  }, []);

  const handleDepartmentClick = (departmentId) => {
    navigate(`/view-poc/${departmentId}`);
  };

  return (
    <div class="view-dept">
      <h1>Select a Department</h1>
      {departments.map((dept) => (
        <button
          key={dept.departmentId}
          onClick={() => handleDepartmentClick(dept.departmentId)}
        >
          {dept.Value_name}
        </button>
      ))}
    </div>
  );
};

export default Departments;
