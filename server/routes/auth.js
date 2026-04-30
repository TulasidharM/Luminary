const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'luminary_secret_dev';

router.post('/register', async (req, res) => {
  let db = req.app.locals.db;
   
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    
    let users = await db.collection("users");
    let result = await users.findOne({ username: username });

    if(result){
      res.status(400).json({ message:"Username already exists!" });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = {
      username,
      passwordHash,
      settings: {
        emojiSet: 0,
        disableEmojis: false
      }
    };

    const insertedUser = await users.insertOne(newUser);

    const token = jwt.sign({ userId: insertedUser.insertedId, username: newUser.username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error!" });
  }
});

router.post('/login', async (req, res) => {
  let db = req.app.locals.db;
  try {
    const { username, password } = req.body;
    let users = db.collection("users"); 
    const user = await users.findOne({username : username});
    if (!user || Object.keys(user).length === 0) return res.status(400).json({ message: 'Invalid credentials' });

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/wakeup', async (req, res) => {
  res.status(200).json({message: 'Im alive!'})
});

module.exports = router;