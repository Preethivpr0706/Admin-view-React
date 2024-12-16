const express = require("express");
const router = express.Router();
const {
    createUser,
    getDepartments,
    getPocsByDepartment,
    getAppointmentDetailsForPoc,
    getAvailableDates,
    getAvailableTimes,
    createAppointment,
    updateFullAvailability,
    updatePartialAvailability,
    getAvailableTimesForUpdate,
    getAvailableDatesForUpdate
} = require("../controllers/pocController");

router.post("/users", createUser);
router.get("/departments", getDepartments);
router.get("/pocs/:departmentId", getPocsByDepartment);
router.get("/appointments/:pocId", getAppointmentDetailsForPoc);
router.post("/pocs/available-dates", getAvailableDates);
router.post("/pocs/available-times", getAvailableTimes);
router.post("/create-appointments", createAppointment);
router.post("/pocs/available-times-update", getAvailableTimesForUpdate);
router.post("/pocs/available-dates-update", getAvailableDatesForUpdate);
router.post('/pocs/update-full', updateFullAvailability);
router.post('/pocs/update-partial', updatePartialAvailability);


//poc dashboard

module.exports = router;