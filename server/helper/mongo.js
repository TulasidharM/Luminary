const { MongoClient } = require("mongodb");

const connectionString = process.env.ATLAS_URI || '';
const client = new MongoClient(connectionString);


const connectToDatabase = async () => {
  try {
    const conn = await client.connect();
    let db = conn.db("luminary");
    console.log("Successfully connected to MongoDB.");
    return db;
  } catch (e) {
    console.error("Failed to connect to MongoDB:", e);
    throw new Error("Could not create connection");
  }
};

module.exports = { connectToDatabase };