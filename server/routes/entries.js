const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const fs = require('fs');
const auth = require('../middleware/auth');
const { generateDailySummary } = require('../services/summaryService');


router.use(auth);

// Generate manual summary for a specific date (usually today)
router.post('/summary', async (req, res) => {
  try {
    const { date } = req.body;
    const db = req.app.locals.db;
    const userId = req.user.userId;

    if (!date) return res.status(400).json({ message: 'Date is required' });

    // Fetch entries for that date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const dayEntries = await db.collection('entries')
      .find({ 
        userId,
        createdAt: {
          $gte: startOfDay.toISOString(),
          $lte: endOfDay.toISOString()
        }
      })
      .toArray();

    if (dayEntries.length === 0) {
      return res.status(400).json({ message: 'No entries found for this date' });
    }

    const summaryText = await generateDailySummary(dayEntries);
    
    if (summaryText) {
      const summaryData = {
        userId,
        date,
        summary: summaryText
      };

      await db.collection('summaries').updateOne(
        { userId, date },
        { $set: summaryData },
        { upsert: true }
      );

      res.json(summaryData);
    } else {
      res.status(500).json({ message: 'Failed to generate summary' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get specific entry
router.get('/:id', async (req, res) => {
  const db = req.app.locals.db;
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid entry ID' });
    }
    
    const entry = await db.collection("entries").findOne({
      _id: new ObjectId(id),
      userId: req.user.userId
    });
    
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    res.json(entry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all entries for user
router.get('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const userId = req.user.userId;

    const userEntries = await db.collection('entries')
      .find({ userId: userId })
      .sort({ createdAt: -1 })
      .toArray();
    
    const userSummaries = await db.collection('summaries')
      .find({ userId: userId })
      .toArray();

    res.json({
      entries: userEntries,
      summaries: userSummaries
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create entry
router.post('/', async (req, res) => {
  try {
    const { title, content, mood } = req.body;
    const db = req.app.locals.db;
    
    const newEntry = {
      userId: req.user.userId,
      title,
      content,
      mood,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const result = await db.collection("entries").insertOne(newEntry);
    res.status(201).json({ ...newEntry, _id: result.insertedId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update entry
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, mood } = req.body;
    const db = req.app.locals.db;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid entry ID' });
    }

    const result = await db.collection("entries").findOneAndUpdate(
      { 
        _id: new ObjectId(id),
        userId: req.user.userId
      },
      {
        $set: {
          title,
          content,
          mood,
          updatedAt: new Date().toISOString()
        }
      },
      { returnDocument: 'after' }
    );

    const updatedEntry = result.value || result;
    if (!updatedEntry) return res.status(404).json({ message: 'Entry not found' });
    
    res.json(updatedEntry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete entry
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = req.app.locals.db;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid entry ID' });
    }

    const result = await db.collection("entries").deleteOne({
      _id: new ObjectId(id),
      userId: req.user.userId
    });
    
    if (result.deletedCount === 0) return res.status(404).json({ message: 'Entry not found' });

    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/hello',(req,res)=>{
  res.status(200).send("hellow friend");
});

module.exports = router;