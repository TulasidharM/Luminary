const { MongoClient } = require("mongodb");

const connectionString = process.env.ATLAS_URI || '';
const client = new MongoClient(connectionString);

const getDb = async () => {
    try {
      let conn = await client.connect();
      let db = conn.db("luminary");
      return db;
    } catch(e) {
      console.error(e);
      throw new Erorr("Could not create connection");
    }
}

module.exports = {getDb};