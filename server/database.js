const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");
dotenv.config();

let _db = null;

async function connectToDatabase() {
    if(!_db) {
        const connectionString = process.env.MONGO_DB_CONN_STRING;
        const dbName = process.env.MONGO_DB_NAME;
        console.log(`Connecting to database ${dbName}`)
        const client = await MongoClient.connect(connectionString);        
        _db = client.db(dbName);
        // console.log(_db);
    }

    return _db;
}

async function ping() {
    const db = await connectToDatabase();
    await db.command({ ping: 1 });
    console.log("Connected to MongoDB!");
}

ping();

// export { connectToDatabase, ping };

