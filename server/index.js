const express = require('express');
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const corsMiddleware = require('cors');

const app = express();
const PORT = 3001;

app.use(corsMiddleware());
app.use(express.json());

// Initialize DB
const dbPath = path.join(__dirname, 'db.json');
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify({ users: [], entries: [], summaries: [] }, null, 2));
} else {
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  if (!db.summaries) {
    db.summaries = [];
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  }
}

app.use((req, res, next) => {
  req.dbPath = dbPath;
  next();
});

const authRoutes = require('./routes/auth');
const entriesRoutes = require('./routes/entries');
const mongoRoutes = require('./routes/mongosetup');

app.use('/api/auth', authRoutes);
app.use('/api/entries', entriesRoutes);
app.use('/api/mongo', mongoRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});