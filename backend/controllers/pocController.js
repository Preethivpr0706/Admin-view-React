const pool = require("../models/db");
const moment = require("moment-timezone");

// Fetch departments from the List table
async function getDepartments(req, res) {
    const clientId = 1; // Hardcoded client ID (can be dynamic if required)
    try {
        const [departments] = await pool.execute(
            `SELECT Key_name, Value_name, Item_ID as departmentId FROM list WHERE Client_ID = ? AND Key_name = 'DEPARTMENT' ORDER BY Display_Order`, [clientId]
        );
        res.json(departments);
    } catch (error) {
        console.error('Error fetching departments:', error.message);
        res.status(500).json({ message: 'Error fetching departments' });
    }
}

// Fetch POCs by department
async function getPocsByDepartment(req, res) {
    const { departmentId } = req.params;
    const clientId = 1; // Hardcoded client ID
    try {
        const [pocs] = await pool.execute(
            `SELECT * FROM poc WHERE Client_ID = ? AND Department_ID = ?`, [clientId, departmentId]
        );
        res.json(pocs);
    } catch (error) {
        console.error('Error fetching POCs:', error.message);
        res.status(500).json({ message: 'Error fetching POCs' });
    }
}
// Function to fetch POC details and their appointments
const getAppointmentDetailsForPoc = async(req, res) => {
    try {
        const { pocId } = req.params;
        const clientId = 1; // Hardcoded client ID
        const query1 = `SELECT * FROM poc_available_slots WHERE POC_ID = ? AND (Schedule_Date > CURDATE() OR (Schedule_Date = CURDATE() AND Start_Time >= CURTIME())) ORDER BY Schedule_Date, Start_Time`;
        const query2 = `SELECT * FROM poc_schedules WHERE POC_ID = ?`;
        const query3 = `SELECT Client_Name FROM client WHERE Client_ID = ?`;
        const query4 = `SELECT POC_Name, Specialization FROM poc WHERE POC_ID = ? AND Client_ID=?`;

        const [availableSlots] = await pool.execute(query1, [pocId]);
        const [schedules] = await pool.execute(query2, [pocId]);
        const [client] = await pool.execute(query3, [clientId]);
        const [poc] = await pool.execute(query4, [pocId, clientId]);

        const appointmentDetails = [];
        let sNo = 1;
        availableSlots.forEach((slot) => {
            const schedule = schedules.find(
                (schedule) =>
                schedule.Day_of_Week === getDayOfWeek(slot.Schedule_Date) &&
                schedule.Start_Time <= slot.Start_Time &&
                schedule.End_Time >= slot.End_Time
            );
            if (schedule) {
                const appointmentsCount = schedule.appointments_per_slot - slot.appointments_per_slot;
                const date = moment(slot.Schedule_Date);
                const time = moment(slot.Start_Time, "HH:mm:ss");

                if (appointmentsCount > 0) {
                    appointmentDetails.push({
                        sNo: sNo++,
                        date: date.format("YYYY-MM-DD"),
                        day: date.format("dddd"),
                        time: time.format("HH:mm:ss"),
                        noOfAppointments: appointmentsCount,
                        totalSlots: schedule.appointments_per_slot,
                    });
                }
            }
        });

        res.json({
            appointmentDetails,
            clientName: client[0].Client_Name,
            pocName: poc[0].POC_Name,
            pocSpecialization: poc[0].Specialization,
        });
    } catch (err) {
        console.error("Error fetching appointment details:", err.message);
        res.status(500).json({ error: "Error fetching appointment details" });
    }
};


// Helper function to get the day of the week from a date
function getDayOfWeek(date) {
    const dayOfWeek = new Date(date).getDay();
    switch (dayOfWeek) {
        case 0:
            return "Sunday";
        case 1:
            return "Monday";
        case 2:
            return "Tuesday";
        case 3:
            return "Wednesday";
        case 4:
            return "Thursday";
        case 5:
            return "Friday";
        case 6:
            return "Saturday";
    }
}



module.exports = {
    getDepartments,
    getPocsByDepartment,
    getAppointmentDetailsForPoc,
};