const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const auth = require('../middleware/auth');

router.use(auth);

// Get user profile/settings
router.get('/me', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const userId = req.user.userId;

    const user = await db.collection('users').findOne(
      { _id: new ObjectId(userId) },
      { projection: { passwordHash: 0 } }
    );

    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Ensure settings exist (for older users)
    if (!user.settings) {
      user.settings = {
        emojiSet: 0,
        disableEmojis: false
      };
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user settings
router.put('/settings', async (req, res) => {
  try {
    const { emojiSet, disableEmojis } = req.body;
    const db = req.app.locals.db;
    const userId = req.user.userId;

    const update = {
      $set: {
        'settings.emojiSet': emojiSet,
        'settings.disableEmojis': disableEmojis
      }
    };

    const result = await db.collection('users').findOneAndUpdate(
      { _id: new ObjectId(userId) },
      update,
      { returnDocument: 'after', projection: { passwordHash: 0 } }
    );

    const updatedUser = result.value || result;
    if (!updatedUser) return res.status(404).json({ message: 'User not found' });

    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
