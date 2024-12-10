import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./ViewAppointments.css";

const ViewAppointments = () => {
  const { pocId } = useParams();
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    fetch(`/api/appointments/${pocId}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched appointments:", data);
        // Check if data is valid
        if (data && data.appointmentDetails && data.appointmentDetails.length > 0) {
          setAppointments(data);
        } else {
          setAppointments([]); // Set empty array if no appointments are available
        }
      })
      .catch((error) => console.error("Error fetching appointments:", error));
  }, [pocId]);
  

  return (
    <div className="view-appointments">
      <h1>Appointments for {appointments.clientName}</h1>
      <div className="poc-details">
        <h2>POC Name: {appointments.pocName}</h2>
        <h2>POC Specialization: {appointments.pocSpecialization}</h2>
      </div>
      <table>
        <thead>
          <tr>
            <th>S.No</th>
            <th>Date</th>
            <th>Day</th>
            <th>Time</th>
            <th>No.of Appointments Booked</th>
            <th>Total Slots</th>
          </tr>
        </thead>
        <tbody>
          {appointments.appointmentDetails && appointments.appointmentDetails.length > 0 ? (
            appointments.appointmentDetails.map((appointment, index) => (
              <tr key={index}>
                <td>{appointment.sNo}</td>
                <td>{appointment.date}</td>
                <td>{appointment.day}</td>
                <td>{appointment.time}</td>
                <td>{appointment.noOfAppointments}</td>
                <td>{appointment.totalSlots}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No appointments available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
  
};

export default ViewAppointments;
