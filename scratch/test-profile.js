import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', 'server', '.env') });

const profileSchema = new mongoose.Schema({
  name: String,
  firstName: String,
  lastName: String,
  navbarName: String,
  title: String,
  tagline: String,
  bio: String,
  aboutHeading: String,
  aboutText1: String,
  aboutText2: String,
  aboutHighlights: mongoose.Schema.Types.Mixed,
  avatar: String,
  coverImage: String,
  email: String,
  location: String,
  socialLinks: mongoose.Schema.Types.Mixed,
  typewriterTexts: [String],
  showSections: mongoose.Schema.Types.Mixed,
  projectCategories: [String],
});

const ProfileModel = mongoose.models.Profile || mongoose.model('Profile', profileSchema);

async function run() {
  console.log('Connecting to MongoDB...');
  const directUri = 'mongodb://raiyanarnobportfolio_db_user:W0rbtbge3jOFHHdg@arnob-shard-00-00.wpmn2ss.mongodb.net:27017,arnob-shard-00-01.wpmn2ss.mongodb.net:27017,arnob-shard-00-02.wpmn2ss.mongodb.net:27017/arnob?ssl=true&replicaSet=atlas-9wp8f5-shard-0&authSource=admin&retryWrites=true&w=majority';
  await mongoose.connect(directUri);
  console.log('Connected.');

  const p = await ProfileModel.findOne();
  console.log('Current Profile in DB:', JSON.stringify(p, null, 2));

  if (p) {
    console.log('Attempting save test with new fields...');
    p.firstName = 'Raiyan Rongon';
    p.lastName = 'Arnob';
    p.navbarName = 'Arnob';
    p.aboutText2 = 'Hello world description 2';
    p.aboutHighlights = [
      { icon: 'fa-palette', title: 'Creative Design', color: 'text-brand-light' },
      { icon: 'fa-microchip', title: 'Hardware Dev', color: 'text-pink-500' },
      { icon: 'fa-users-viewfinder', title: 'Coordination', color: 'text-blue-500' }
    ];
    try {
      await p.save();
      console.log('Save test succeeded!');
    } catch (saveError) {
      console.error('Save test failed:', saveError);
    }
  } else {
    console.log('No profile document found in DB.');
  }

  await mongoose.disconnect();
}

run();
