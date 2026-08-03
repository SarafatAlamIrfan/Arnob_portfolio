import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', 'server', '.env') });

const projectSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  title: String,
  description: String,
  category: String,
  link: String,
  linkLabel: String,
  image: String,
});

const ProjectModel = mongoose.models.Project || mongoose.model('Project', projectSchema);

async function runTest() {
  console.log('Using MONGODB_URI:', process.env.MONGODB_URI);
  if (!process.env.MONGODB_URI) {
    console.error('No MONGODB_URI found in env!');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected!');

    const count = await ProjectModel.countDocuments();
    console.log('Projects count:', count);

    const projects = await ProjectModel.find();
    console.log('Projects list:', JSON.stringify(projects, null, 2));

    await mongoose.disconnect();
    console.log('Done!');
  } catch (error) {
    console.error('Database connection test failed:', error);
  }
}

runTest();
