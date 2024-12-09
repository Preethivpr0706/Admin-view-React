const {
    getDepartments,
    getPocsByDepartment,
    getAppointmentDetailsForPoc,
} = require("../controllers/pocController");

const express = require("express");
const router = express.Router();


router.get("/departments", getDepartments);
router.get("/pocs/:departmentId", getPocsByDepartment);
router.get("/appointments/:pocId", getAppointmentDetailsForPoc);

module.exports = router;