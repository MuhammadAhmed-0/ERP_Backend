const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
require("dotenv").config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Define routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/students", require("./routes/studentRoutes"));
app.use("/api/teachers", require("./routes/teacherRoutes"));
app.use("/api/supervisors", require("./routes/supervisorRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/schedules", require("./routes/scheduleRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/announcements", require("./routes/announcementRoutes"));
app.use("/api/clients", require("./routes/clientRoutes"));

// // Basic route
app.get("/", (req, res) => {
  res.send("ERP API is running");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
