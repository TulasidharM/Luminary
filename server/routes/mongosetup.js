const express = require('express');
const { MongoClient } = require("mongodb");

const router = express.Router();

const connectionString = process.env.ATLAS_URI || '';
const client = new MongoClient(connectionString);

let db;

const getDb = async ()=>{
    try {
      conn = await client.connect();
      db = conn.db("test");
    } catch(e) {
      console.error(e);
      db=null;
    }
}

router.get('/',async (req,res)=>{
    await getDb();
    if(db === null){
        res.status(503).send("DB connection could not be established");
        return;
    }
    let usersCollection = await db.collection("users");
    let result = await usersCollection.find({}).toArray();
    res.status(200).send(result);
});

module.exports = router;