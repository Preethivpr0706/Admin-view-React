import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import './ViewPOC.css';

const ViewPOC = () => {
  const { departmentId } = useParams();
  const [pocs, setPocs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`/api/pocs/${departmentId}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched POCs:", data);
        setPocs(data);
      })
      .catch((error) => console.error("Error fetching POCs:", error));
  }, [departmentId]);

  const handleViewAppointments = (pocId) => {
    navigate(`/view-appointments/${pocId}`);
  };

  return (
    <div class='view-poc'>
      <h1>POCs in Department</h1>
      {pocs.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>POC Name</th>
              <th>Specialization</th>
              <th>Contact</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pocs.map((poc) => (
              <tr key={poc.POC_ID}>
                <td>{poc.POC_Name}</td>
                <td>{poc.Specialization}</td>
                <td>{poc.Contact_Number}</td>
                <td>{poc.Email}</td>
                <td>
                  <button onClick={() => handleViewAppointments(poc.POC_ID)}>
                    View Appointments
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No POCs found in this department.</p>
      )}
    </div>
  );
};

export default ViewPOC;
