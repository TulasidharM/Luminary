const express = require('express');
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const corsMiddleware = require('cors');
const { connectToDatabase } = require('./helper/mongo');

const app = express();
const PORT = 3000;

app.use(corsMiddleware({
  origin: true,
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Connect to MongoDB and start the server
connectToDatabase()
  .then((dbInstance) => {
    app.locals.db = dbInstance;
    
    // Initialize Cron Jobs
    const setupCron = require('./cron');
    setupCron(dbInstance);

    // Routes
    const authRoutes = require('./routes/auth');
    const entriesRoutes = require('./routes/entries');
    const mongoRoutes = require('./routes/mongosetup');
    const usersRoutes = require('./routes/users');

    app.use('/api/auth', authRoutes);
    app.use('/api/entries', entriesRoutes);
    app.use('/api/mongo', mongoRoutes);
    app.use('/api/users', usersRoutes);

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Critical: Could not connect to database on startup.", err);
    process.exit(1);
  });