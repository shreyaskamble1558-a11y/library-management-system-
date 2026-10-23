const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoMemoryServer;

async function connectDB() {
  const mongoUri = process.env.MONGO_URI;

  if (mongoUri) {
    await mongoose.connect(mongoUri);
    console.log(`MongoDB connected: ${mongoUri}`);
    return;
  }

  mongoMemoryServer = await MongoMemoryServer.create();
  const uri = mongoMemoryServer.getUri();

  await mongoose.connect(uri);
  console.log(`MongoDB connected to in-memory server: ${uri}`);
}

async function disconnectDB() {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
}

module.exports = { connectDB, disconnectDB };
