const express = require('express');
const router = express.Router();
const { MongoClient } = require("mongodb");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const { getDb } = require('../helper/mongo');


const JWT_SECRET = process.env.JWT_SECRET || 'luminary_secret_dev';

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    
    let users = await db.collection("users");
    result = await users.findOne({ username: username });

    if(result){
      res.status(400).json({ message:"Username already exists!" });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = {
      username,
      passwordHash
    };

    await users.insertOne(newUser);

    const token = jwt.sign({ userId: newUser.id, username: newUser.username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error!" });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    // const db = readDB(req.dbPath);
    
    const user = db.users.find(u => u.username === username);
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;