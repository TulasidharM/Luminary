const express = require('express');
const router = express.Router();
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const auth = require('../middleware/auth');
const { generateDailySummary, calculateAvgMoodEmoji } = require('../services/summaryService');

function readDB(dbPath) {
  return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
}

function writeDB(dbPath, data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

//router.use(auth);

// Get specific entry
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const db = readDB(req.dbPath);
    const entry = db.entries.find(e => e.id === id && e.userId === req.user.userId);
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    res.json(entry);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all entries for user
router.get('/', async (req, res) => {
  try {
    const db = readDB(req.dbPath);
    const userEntries = db.entries
      .filter(e => e.userId === req.user.userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Grouping entries by date string (YYYY-MM-DD)
    const grouped = {};
    userEntries.forEach(e => {
      const d = new Date(e.createdAt).toISOString().split('T')[0];
      if (!grouped[d]) grouped[d] = [];
      grouped[d].push(e);
    });

    const todayStr = new Date().toISOString().split('T')[0];
    let dbUpdated = false;

    // Process summaries for completed days
    for (const [date, entries] of Object.entries(grouped)) {
      if (date === todayStr) continue; // Skip today

      const existingSummary = db.summaries.find(s => s.userId === req.user.userId && s.date === date);
      if (!existingSummary) {
        console.log("Getting summaries");
        const summaryText = await generateDailySummary(entries);
        
        if (summaryText) {
          db.summaries.push({
            userId: req.user.userId,
            date,
            summary: summaryText,
            avgEmoji: calculateAvgMoodEmoji(entries)
          });
          dbUpdated = true;
        }
      }
    }

    if (dbUpdated) writeDB(req.dbPath, db);

    res.json({
      entries: userEntries,
      summaries: db.summaries.filter(s => s.userId === req.user.userId)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create entry
router.post('/', (req, res) => {
  try {
    const { title, content, mood, moodEmoji } = req.body;
    const db = readDB(req.dbPath);
    
    const newEntry = {
      id: uuidv4(),
      userId: req.user.userId,
      title,
      content,
      mood,
      moodEmoji,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.entries.push(newEntry);
    writeDB(req.dbPath, db);
    res.status(201).json(newEntry);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update entry
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, mood, moodEmoji } = req.body;
    const db = readDB(req.dbPath);
    
    const entryIndex = db.entries.findIndex(e => e.id === id && e.userId === req.user.userId);
    if (entryIndex === -1) return res.status(404).json({ message: 'Entry not found' });

    db.entries[entryIndex] = {
      ...db.entries[entryIndex],
      title,
      content,
      mood,
      moodEmoji,
      updatedAt: new Date().toISOString()
    };

    writeDB(req.dbPath, db);
    res.json(db.entries[entryIndex]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete entry
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const db = readDB(req.dbPath);
    
    const entryIndex = db.entries.findIndex(e => e.id === id && e.userId === req.user.userId);
    if (entryIndex === -1) return res.status(404).json({ message: 'Entry not found' });

    db.entries.splice(entryIndex, 1);
    writeDB(req.dbPath, db);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/hello',(req,res)=>{
  res.status(200).send("hellow friend");
});

module.exports = router;