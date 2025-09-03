import dotenv from 'dotenv';
import express from "express";
import cors from "cors";
import dbConnection from "./DB/db.connection.js";
import userController from "./Modules/Users/user.controller.js";
import eventsController from "./Modules/Events/events.controller.js";
import seatsController from "./Modules/Seats/seats.controller.js";
import ticketsController from './Modules/Tickets/tickets.controller.js';
import analyticsController from './Modules/Analytics/analytics.controller.js';
import notificationsController from './Modules/Notifications/notifications.controller.js';

// Load environment variables from the parent directory
dotenv.config({ path: './.env' });

const app = express();

// cors middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));

// parsing middleware
app.use(express.json());

// handle routes
app.use('/users' , userController);
app.use('/events', eventsController);
app.use('/seats', seatsController); // Add seats module
app.use('/tickets', ticketsController); // Add tickets module
app.use('/analytics', analyticsController); // Add analytics module
app.use('/notifications', notificationsController); // Add notifications module

// database connection
dbConnection();

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something Broke!");
});

// Not found middleware
app.use((req, res) =>{
  res.status(404).send("Not found");
})

const PORT = process.env.PORT || 5000;

app.listen(+PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});