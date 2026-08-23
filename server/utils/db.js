const mongoose = require("mongoose");

const connectDb = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not configured.");

  const options = {};
  if (process.env.MONGODB_DB_NAME) {
    options.dbName = process.env.MONGODB_DB_NAME;
  }

  await mongoose.connect(uri, options);
  console.log(`MongoDB connected: ${mongoose.connection.name}`);
};

module.exports = connectDb;
