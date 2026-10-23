import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables (.env from server/ or root)
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config();

const pingDatabase = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error(`[${new Date().toISOString()}] Error: MONGODB_URI environment variable is not defined.`);
    process.exit(1);
  }

  console.log(`[${new Date().toISOString()}] Connecting to MongoDB Atlas...`);
  const startTime = Date.now();
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
    const result = await mongoose.connection.db.command({ ping: 1 });
    const latency = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] ✅ MongoDB ping successful! Latency: ${latency}ms. Response:`, result);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] ❌ MongoDB ping failed:`, error.message);
    process.exit(1);
  }
};

pingDatabase();
