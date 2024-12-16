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

// Create or update user details
const createUser = async(req, res) => {
    const { name, phone, email, location } = req.body;

    try {
        console.log("Request body:", req.body); // Log incoming request data
        const [user] = await pool.execute(
            "SELECT User_ID FROM Users WHERE User_Contact = ?", [phone]
        );

        console.log("Existing user query result:", user); // Log query result

        if (user.length > 0) {
            console.log("User already exists with ID:", user[0].User_ID);
            return res.json({ userId: user[0].User_ID });
        }

        const [result] = await pool.execute(
            "INSERT INTO Users (User_Name, User_Contact, User_Email, User_Location) VALUES (?, ?, ?, ?)", [name, phone, email, location]
        );

        console.log("User created with ID:", result.insertId);
        res.json({ userId: result.insertId });
    } catch (error) {
        console.error("Error in createUser function:", error.message); // Log the exact error
        res.status(500).json({ error: error.message });
    }
};


// Fetch available dates for a POC
const getAvailableDates = async(req, res) => {
    const { pocId } = req.body;
    console.log(pocId);

    if (!pocId) {
        return res.status(400).json({ error: "POC ID is required" });
    }

    try {
        const [dates] = await pool.execute(
            `SELECT DISTINCT
  DATE_FORMAT(Schedule_Date, '%Y-%m-%d') AS Schedule_Date
FROM poc_available_slots
WHERE POC_ID = ?
  AND Schedule_Date >= CURDATE()
  AND appointments_per_slot > 0
  AND Active_Status = 'unblocked'
  AND EXISTS (
    SELECT 1
    FROM poc_available_slots AS slots
    WHERE slots.POC_ID = poc_available_slots.POC_ID
      AND slots.Schedule_Date = poc_available_slots.Schedule_Date
      AND (slots.Schedule_Date > CURDATE() OR (slots.Schedule_Date = CURDATE() AND slots.Start_Time >= CURTIME()))
  )
ORDER BY Schedule_Date
LIMIT 10`, [pocId]
        );
        console.log(dates);
        res.json(dates.map((row) => row.Schedule_Date));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//Fetch available times for a POC on a selected date
const getAvailableTimes = async(req, res) => {
    const { pocId, date } = req.body;

    try {
        const [times] = await pool.execute(
            `SELECT DISTINCT   
        Start_Time AS appointment_time   
        FROM poc_available_slots   
        WHERE POC_ID = ?   
        AND Schedule_Date = STR_TO_DATE(?, '%Y-%m-%d')   
        AND appointments_per_slot > 0   
        AND Active_Status = 'unblocked'
        AND (Schedule_Date > CURDATE() OR (Schedule_Date = CURDATE() AND Start_Time >= CURTIME()))   
        ORDER BY Start_Time`, [pocId, date]
        );
        res.json(times.map((t) => t.appointment_time));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


//Create appointment
const createAppointment = async(req, res) => {
    const { userId, pocId, date, time, type } = req.body;
    console.log(req.body);
    const clientId = 1;

    try {
        // Insert the new appointment
        const [result] = await pool.execute(
            "INSERT INTO Appointments (Client_ID, User_ID, POC_ID, Appointment_Date, Appointment_Time, Appointment_Type, Status, Is_Active) VALUES (?, ?, ?, ?, ?, ?, 'Confirmed', true)", [clientId, userId, pocId, date, time, type]
        );

        console.log("Appointment created with ID:", result.insertId);

        // Update available slots
        const updateQuery = `
            UPDATE POC_Available_Slots
            SET appointments_per_slot = appointments_per_slot - 1
            WHERE POC_ID = ? AND Schedule_Date = ? AND Start_Time = ? AND appointments_per_slot > 0;
        `;
        const [updateResult] = await pool.execute(updateQuery, [pocId, date, time]);

        if (updateResult.affectedRows === 0) {
            console.warn("No available slots to update for the given POC ID, date, and time.");
            // Optionally handle this scenario by reverting the insert operation, if necessary.
        }

        res.json({ appointmentId: result.insertId });
    } catch (error) {
        console.error("Error in createAppointment function:", error.message); // Log the exact error
        res.status(500).json({ error: error.message });
    }
};
const updateFullAvailability = async(req, res) => {
    const { pocId, date } = req.body;
    console.log(req.body);
    try {
        await pool.execute(
            `UPDATE poc_available_slots SET Active_Status ='blocked' WHERE POC_ID = ? AND Schedule_Date = ?`, [pocId, date]
        );
        res.status(200).json({ message: 'Full availability updated successfully.' });
    } catch (error) {
        console.error('Error updating full availability:', error.message);
        res.status(500).json({ message: 'Error updating full availability.' });
    }
};



const updatePartialAvailability = async(req, res) => {
    const { pocId, date, timings } = req.body;
    console.log(req.body);
    try {
        if (!timings || timings.length === 0) {
            return res.status(400).json({ message: 'No timings selected.' });
        }

        const escapedTimings = timings.map(timing => pool.escape(timing));
        const query = `UPDATE poc_available_slots SET Active_Status ='blocked' WHERE POC_ID = ? AND Schedule_Date = ? AND Start_Time IN (${escapedTimings.join(', ')})`;
        const params = [pocId, date];

        await pool.execute(query, params);
        res.status(200).json({ message: 'Partial availability updated successfully.' });
    } catch (error) {
        console.error('Error updating partial availability:', error.message);
        res.status(500).json({ message: 'Error updating partial availability.' });
    }
};


//Fetch available times for a POC on a selected date for updating availability
const getAvailableTimesForUpdate = async(req, res) => {
    const { pocId, date } = req.body;
    console.log(req.body);

    try {
        const [times] = await pool.execute(
            `SELECT DISTINCT   
        Start_Time AS appointment_time,
        Active_Status AS active_status  
        FROM poc_available_slots   
        WHERE POC_ID = ?   
        AND Schedule_Date = STR_TO_DATE(?, '%Y-%m-%d')   
        AND (Schedule_Date > CURDATE() OR (Schedule_Date = CURDATE() AND Start_Time >= CURTIME()))   
        ORDER BY Start_Time`, [pocId, date]
        );
        console.log(times);
        res.json(times);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Fetch available dates for a POC for updating availability
const getAvailableDatesForUpdate = async(req, res) => {
    const { pocId } = req.body;
    console.log(req.body);
    if (!pocId) {
        return res.status(400).json({ error: "POC ID is required" });
    }

    try {
        const [dates] = await pool.execute(
            `SELECT DISTINCT  
  DATE_FORMAT(Schedule_Date, '%Y-%m-%d') AS Schedule_Date,  
  CASE  
   WHEN EXISTS (  
    SELECT 1  
    FROM poc_available_slots AS slots  
    WHERE slots.POC_ID = poc_available_slots.POC_ID  
      AND slots.Schedule_Date = poc_available_slots.Schedule_Date  
      AND slots.Active_Status = 'blocked'  
   ) AND NOT EXISTS (  
    SELECT 1  
    FROM poc_available_slots AS slots  
    WHERE slots.POC_ID = poc_available_slots.POC_ID  
      AND slots.Schedule_Date = poc_available_slots.Schedule_Date  
      AND slots.Active_Status = 'unblocked'  
   ) THEN 'blocked'  
   WHEN EXISTS (  
    SELECT 1  
    FROM poc_available_slots AS slots  
    WHERE slots.POC_ID = poc_available_slots.POC_ID  
      AND slots.Schedule_Date = poc_available_slots.Schedule_Date  
      AND slots.Active_Status = 'unblocked'  
   ) AND NOT EXISTS (  
    SELECT 1  
    FROM poc_available_slots AS slots  
    WHERE slots.POC_ID = poc_available_slots.POC_ID  
      AND slots.Schedule_Date = poc_available_slots.Schedule_Date  
      AND slots.Active_Status = 'blocked'  
   ) THEN 'available'  
   ELSE 'partial'  
  END AS active_status  
FROM poc_available_slots  
WHERE POC_ID = ?  
  AND Schedule_Date >= CURDATE()  
ORDER BY Schedule_Date;
;
`, [pocId]
        );
        console.log(dates);
        res.json(dates);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


module.exports = {
    getDepartments,
    getPocsByDepartment,
    getAppointmentDetailsForPoc,
    createAppointment,
    getAvailableDates,
    getAvailableTimes,
    createUser,
    updateFullAvailability,
    updatePartialAvailability,
    getAvailableTimesForUpdate,
    getAvailableDatesForUpdate
};