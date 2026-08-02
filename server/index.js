import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import mongoose from 'mongoose';

// Configure dotenv
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Set up directory variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');

// Ensure directories exist
const ensureDirectories = async () => {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
  } catch (err) {
    console.error('Error creating directory structures:', err);
  }
};
if (!process.env.VERCEL) {
  ensureDirectories();
}

let isMongo = false;

// --- MONGOOSE SCHEMAS & MODELS ---
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
const ProfileModel = mongoose.model('Profile', profileSchema);

const projectSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  title: String,
  description: String,
  category: String,
  link: String,
  linkLabel: String,
  image: String,
});
const ProjectModel = mongoose.model('Project', projectSchema);

const achievementSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  title: String,
  description: String,
  image: String,
});
const AchievementModel = mongoose.model('Achievement', achievementSchema);

const skillSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  name: String,
  icon: String,
  color: String,
  category: String,
});
const SkillModel = mongoose.model('Skill', skillSchema);

const educationSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  degree: String,
  institution: String,
  timeline: String,
  details: String,
});
const EducationModel = mongoose.model('Education', educationSchema);

const experienceSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  role: String,
  company: String,
  timeline: String,
  details: String,
});
const ExperienceModel = mongoose.model('Experience', experienceSchema);

const messageSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  timestamp: String,
  name: String,
  email: String,
  subject: String,
  message: String,
  read: Boolean,
});
const MessageModel = mongoose.model('Message', messageSchema);

// Cloudinary configuration
const isCloudinaryConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('Cloudinary successfully initialized');
} else {
  console.log('Cloudinary credentials missing. Uploads will fall back to local disk storage');
}

// Multer Storage Configuration
const storage = isCloudinaryConfigured
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, UPLOADS_DIR);
      },
      filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
      },
    });

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp|gif|svg/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images (jpg, jpeg, png, webp, gif, svg) are allowed'));
  },
});

// CORS settings
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

if (!allowedOrigins.includes('http://localhost:5173')) {
  allowedOrigins.push('http://localhost:5173');
}

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
        return callback(null, true);
      } else {
        return callback(null, false);
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  })
);

app.use(bodyParser.json());

// Serve backend static files (like public images and local uploads)
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(UPLOADS_DIR));

// Helper: JSON Database Reader/Writer
const readJsonFile = async (filename, defaultValue = []) => {
  const filePath = path.join(DATA_DIR, filename);
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    await writeJsonFile(filename, defaultValue);
    return defaultValue;
  }
};

const writeJsonFile = async (filename, data) => {
  const filePath = path.join(DATA_DIR, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
};

// Database Seeding Helper
const seedDatabase = async () => {
  try {
    console.log('Checking database collections for seeding...');
    
    // Seed Profile
    let p = await ProfileModel.findOne();
    if (!p) {
      const defaultProfile = await readJsonFile('profile.json', {});
      p = new ProfileModel(defaultProfile);
      await p.save();
      console.log('Seeded Profile collection');
    }

    // Seed Projects
    const projectsCount = await ProjectModel.countDocuments();
    if (projectsCount === 0) {
      const fileProjects = await readJsonFile('projects.json', []);
      if (fileProjects.length > 0) {
        await ProjectModel.insertMany(fileProjects);
        console.log('Seeded Projects collection');
      }
    }

    // Seed Achievements
    const achievementsCount = await AchievementModel.countDocuments();
    if (achievementsCount === 0) {
      const fileAchievements = await readJsonFile('achievements.json', []);
      if (fileAchievements.length > 0) {
        await AchievementModel.insertMany(fileAchievements);
        console.log('Seeded Achievements collection');
      }
    }

    // Seed Skills
    const skillsCount = await SkillModel.countDocuments();
    if (skillsCount === 0) {
      const fileSkills = await readJsonFile('skills.json', []);
      if (fileSkills.length > 0) {
        await SkillModel.insertMany(fileSkills);
        console.log('Seeded Skills collection');
      }
    }

    // Seed Education
    const educationCount = await EducationModel.countDocuments();
    if (educationCount === 0) {
      const fileEducation = await readJsonFile('education.json', []);
      if (fileEducation.length > 0) {
        await EducationModel.insertMany(fileEducation);
        console.log('Seeded Education collection');
      }
    }

    // Seed Experience
    const experienceCount = await ExperienceModel.countDocuments();
    if (experienceCount === 0) {
      const fileExperience = await readJsonFile('experience.json', []);
      if (fileExperience.length > 0) {
        await ExperienceModel.insertMany(fileExperience);
        console.log('Seeded Experience collection');
      }
    }

    console.log('Database seeding checks completed successfully!');
  } catch (error) {
    console.error('Error during database seeding:', error);
  }
};

let isConnected = false;

const connectDb = async () => {
  if (isConnected || mongoose.connection.readyState === 1) {
    return;
  }
  
  if (!process.env.MONGODB_URI) {
    return;
  }
  
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGODB_URI);
  isConnected = true;
  console.log('Successfully connected to MongoDB Atlas');
  await seedDatabase();
};

// Express database middleware to ensure connection on Vercel serverless functions
app.use(async (req, res, next) => {
  try {
    await connectDb();
    next();
  } catch (err) {
    console.error('Database connection middleware error:', err);
    next();
  }
});

const isMongoActive = () => !!process.env.MONGODB_URI && mongoose.connection.readyState === 1;

// Admin authentication middleware
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_arnob_portfolio';

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. Token missing.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Access denied. Invalid or expired token.' });
  }
};

// --- AUTH ROUTE ---
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  const envUsername = process.env.ADMIN_USERNAME || 'admin';
  const envPassword = process.env.ADMIN_PASSWORD || 'admin123';

  if (username === envUsername && password === envPassword) {
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ success: true, token });
  }

  return res.status(400).json({ error: 'Invalid username or password' });
});

app.get('/api/admin/verify', authMiddleware, (req, res) => {
  res.json({ valid: true, username: req.admin.username });
});

// --- DYNAMIC PROFILE HELPERS & ENDPOINTS ---
const fetchProfileData = async () => {
  const fileDefault = {
    name: 'Raiyan Rongon Arnob',
    firstName: 'Raiyan Rongon',
    lastName: 'Arnob',
    navbarName: 'Arnob',
    title: 'Creative Designer & Hardware Innovator',
    tagline: 'Enthusiastic Tinkerer',
    bio: 'I am Arnob...',
    aboutHeading: 'About Me',
    aboutText1: 'Biography details here...',
    aboutText2: '',
    aboutHighlights: [
      { icon: 'fa-palette', title: 'Creative Design', color: 'text-brand-light' },
      { icon: 'fa-microchip', title: 'Hardware Dev', color: 'text-pink-500 dark:text-pink-400' },
      { icon: 'fa-users-viewfinder', title: 'Coordination', color: 'text-blue-500 dark:text-blue-400' }
    ],
    avatar: '/image/LinkedIn_HeadShot.jpg',
    coverImage: '/image/Portfolio_cover.jpg',
    email: 'arnob@example.com',
    location: 'Dhaka, Bangladesh',
    socialLinks: {},
    typewriterTexts: [],
    showSections: {
      about: true,
      skills: true,
      projects: true,
      education: true,
      experience: true,
      achievements: true,
      contact: true,
      cv: true
    },
    projectCategories: ['Software', 'Hardware']
  };

  if (isMongoActive()) {
    let p = await ProfileModel.findOne();
    if (!p) {
      const defaultProfile = await readJsonFile('profile.json', fileDefault);
      p = new ProfileModel(defaultProfile);
      await p.save();
    }
    return p;
  }
  return await readJsonFile('profile.json', fileDefault);
};

app.get('/api/profile', async (req, res) => {
  try {
    const profile = await fetchProfileData();
    res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Combined portfolio data endpoint to load page blazingly fast in a single serverless invocation
app.get('/api/portfolio-data', async (req, res) => {
  try {
    const isMongo = isMongoActive();
    const [profile, skills, projects, achievements, education, experience] = await Promise.all([
      fetchProfileData(),
      isMongo ? SkillModel.find() : readJsonFile('skills.json', []),
      isMongo ? ProjectModel.find() : readJsonFile('projects.json', []),
      isMongo ? AchievementModel.find() : readJsonFile('achievements.json', []),
      isMongo ? EducationModel.find() : readJsonFile('education.json', []),
      isMongo ? ExperienceModel.find() : readJsonFile('experience.json', [])
    ]);

    res.json({ profile, skills, projects, achievements, education, experience });
  } catch (error) {
    console.error('Error fetching combined portfolio data:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio data' });
  }
});

app.post('/api/profile', authMiddleware, async (req, res) => {
  try {
    const cleanData = { ...req.body };
    delete cleanData._id;
    delete cleanData.__v;

    if (isMongoActive()) {
      let p = await ProfileModel.findOne();
      if (p) {
        Object.assign(p, cleanData);
        await p.save();
      } else {
        p = new ProfileModel(cleanData);
        await p.save();
      }
    } else {
      await writeJsonFile('profile.json', cleanData);
    }
    res.json({ success: true, message: 'Profile updated successfully!' });
  } catch (error) {
    console.error('Error saving profile:', error);
    res.status(500).json({ error: 'Failed to save profile' });
  }
});

// --- PROJECTS ENDPOINTS ---
app.get('/api/projects', async (req, res) => {
  try {
    if (isMongoActive()) {
      const projects = await ProjectModel.find();
      return res.json(projects);
    }
    const projects = await readJsonFile('projects.json', []);
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

app.post('/api/projects', authMiddleware, async (req, res) => {
  try {
    const cleanData = { ...req.body };
    delete cleanData._id;
    delete cleanData.__v;

    const newProject = {
      id: 'p_' + Date.now(),
      ...cleanData,
    };

    if (isMongoActive()) {
      const p = new ProjectModel(newProject);
      await p.save();
      return res.status(201).json(p);
    }

    const projects = await readJsonFile('projects.json', []);
    projects.push(newProject);
    await writeJsonFile('projects.json', projects);
    res.status(201).json(newProject);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create project' });
  }
});

app.put('/api/projects/:id', authMiddleware, async (req, res) => {
  try {
    const cleanData = { ...req.body };
    delete cleanData._id;
    delete cleanData.__v;

    if (isMongoActive()) {
      const p = await ProjectModel.findOneAndUpdate({ id: req.params.id }, cleanData, { new: true });
      if (!p) return res.status(404).json({ error: 'Project not found' });
      return res.json(p);
    }

    const projects = await readJsonFile('projects.json', []);
    const index = projects.findIndex((p) => p.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Project not found' });
    }
    projects[index] = { ...projects[index], ...cleanData };
    await writeJsonFile('projects.json', projects);
    res.json(projects[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update project' });
  }
});

app.delete('/api/projects/:id', authMiddleware, async (req, res) => {
  try {
    if (isMongoActive()) {
      const result = await ProjectModel.deleteOne({ id: req.params.id });
      if (result.deletedCount === 0) return res.status(404).json({ error: 'Project not found' });
      return res.json({ success: true, message: 'Project deleted' });
    }

    let projects = await readJsonFile('projects.json', []);
    projects = projects.filter((p) => p.id !== req.params.id);
    await writeJsonFile('projects.json', projects);
    res.json({ success: true, message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// --- ACHIEVEMENTS ENDPOINTS ---
app.get('/api/achievements', async (req, res) => {
  try {
    if (isMongoActive()) {
      const achievements = await AchievementModel.find();
      return res.json(achievements);
    }
    const achievements = await readJsonFile('achievements.json', []);
    res.json(achievements);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
});

app.post('/api/achievements', authMiddleware, async (req, res) => {
  try {
    const cleanData = { ...req.body };
    delete cleanData._id;
    delete cleanData.__v;

    const newAchievement = {
      id: 'a_' + Date.now(),
      ...cleanData,
    };

    if (isMongoActive()) {
      const a = new AchievementModel(newAchievement);
      await a.save();
      return res.status(201).json(a);
    }

    const achievements = await readJsonFile('achievements.json', []);
    achievements.push(newAchievement);
    await writeJsonFile('achievements.json', achievements);
    res.status(201).json(newAchievement);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create achievement' });
  }
});

app.put('/api/achievements/:id', authMiddleware, async (req, res) => {
  try {
    const cleanData = { ...req.body };
    delete cleanData._id;
    delete cleanData.__v;

    if (isMongoActive()) {
      const a = await AchievementModel.findOneAndUpdate({ id: req.params.id }, cleanData, { new: true });
      if (!a) return res.status(404).json({ error: 'Achievement not found' });
      return res.json(a);
    }

    const achievements = await readJsonFile('achievements.json', []);
    const index = achievements.findIndex((a) => a.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Achievement not found' });
    }
    achievements[index] = { ...achievements[index], ...cleanData };
    await writeJsonFile('achievements.json', achievements);
    res.json(achievements[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update achievement' });
  }
});

app.delete('/api/achievements/:id', authMiddleware, async (req, res) => {
  try {
    if (isMongoActive()) {
      const result = await AchievementModel.deleteOne({ id: req.params.id });
      if (result.deletedCount === 0) return res.status(404).json({ error: 'Achievement not found' });
      return res.json({ success: true, message: 'Achievement deleted' });
    }

    let achievements = await readJsonFile('achievements.json', []);
    achievements = achievements.filter((a) => a.id !== req.params.id);
    await writeJsonFile('achievements.json', achievements);
    res.json({ success: true, message: 'Achievement deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete achievement' });
  }
});

// --- SKILLS ENDPOINTS ---
app.get('/api/skills', async (req, res) => {
  try {
    if (isMongoActive()) {
      const skills = await SkillModel.find();
      return res.json(skills);
    }
    const skills = await readJsonFile('skills.json', []);
    res.json(skills);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch skills' });
  }
});

app.post('/api/skills', authMiddleware, async (req, res) => {
  try {
    const cleanData = { ...req.body };
    delete cleanData._id;
    delete cleanData.__v;

    const newSkill = {
      id: 's_' + Date.now(),
      ...cleanData,
    };

    if (isMongoActive()) {
      const s = new SkillModel(newSkill);
      await s.save();
      return res.status(201).json(s);
    }

    const skills = await readJsonFile('skills.json', []);
    skills.push(newSkill);
    await writeJsonFile('skills.json', skills);
    res.status(201).json(newSkill);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create skill' });
  }
});

app.put('/api/skills/:id', authMiddleware, async (req, res) => {
  try {
    const cleanData = { ...req.body };
    delete cleanData._id;
    delete cleanData.__v;

    if (isMongoActive()) {
      const s = await SkillModel.findOneAndUpdate({ id: req.params.id }, cleanData, { new: true });
      if (!s) return res.status(404).json({ error: 'Skill not found' });
      return res.json(s);
    }

    const skills = await readJsonFile('skills.json', []);
    const index = skills.findIndex((s) => s.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Skill not found' });
    }
    skills[index] = { ...skills[index], ...cleanData };
    await writeJsonFile('skills.json', skills);
    res.json(skills[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update skill' });
  }
});

app.delete('/api/skills/:id', authMiddleware, async (req, res) => {
  try {
    if (isMongoActive()) {
      const result = await SkillModel.deleteOne({ id: req.params.id });
      if (result.deletedCount === 0) return res.status(404).json({ error: 'Skill not found' });
      return res.json({ success: true, message: 'Skill deleted' });
    }

    let skills = await readJsonFile('skills.json', []);
    skills = skills.filter((s) => s.id !== req.params.id);
    await writeJsonFile('skills.json', skills);
    res.json({ success: true, message: 'Skill deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete skill' });
  }
});

// --- EDUCATION ENDPOINTS ---
app.get('/api/education', async (req, res) => {
  try {
    if (isMongoActive()) {
      const education = await EducationModel.find();
      return res.json(education);
    }
    const education = await readJsonFile('education.json', []);
    res.json(education);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch education' });
  }
});

app.post('/api/education', authMiddleware, async (req, res) => {
  try {
    const cleanData = { ...req.body };
    delete cleanData._id;
    delete cleanData.__v;

    const newEdu = {
      id: 'e_' + Date.now(),
      ...cleanData,
    };

    if (isMongoActive()) {
      const edu = new EducationModel(newEdu);
      await edu.save();
      return res.status(201).json(edu);
    }

    const education = await readJsonFile('education.json', []);
    education.push(newEdu);
    await writeJsonFile('education.json', education);
    res.status(201).json(newEdu);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create education' });
  }
});

app.put('/api/education/:id', authMiddleware, async (req, res) => {
  try {
    const cleanData = { ...req.body };
    delete cleanData._id;
    delete cleanData.__v;

    if (isMongoActive()) {
      const edu = await EducationModel.findOneAndUpdate({ id: req.params.id }, cleanData, { new: true });
      if (!edu) return res.status(404).json({ error: 'Education not found' });
      return res.json(edu);
    }

    const education = await readJsonFile('education.json', []);
    const index = education.findIndex((e) => e.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Education not found' });
    }
    education[index] = { ...education[index], ...cleanData };
    await writeJsonFile('education.json', education);
    res.json(education[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update education' });
  }
});

app.delete('/api/education/:id', authMiddleware, async (req, res) => {
  try {
    if (isMongoActive()) {
      const result = await EducationModel.deleteOne({ id: req.params.id });
      if (result.deletedCount === 0) return res.status(404).json({ error: 'Education not found' });
      return res.json({ success: true, message: 'Education deleted' });
    }

    let education = await readJsonFile('education.json', []);
    education = education.filter((e) => e.id !== req.params.id);
    await writeJsonFile('education.json', education);
    res.json({ success: true, message: 'Education deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete education' });
  }
});

// --- EXPERIENCE ENDPOINTS ---
app.get('/api/experience', async (req, res) => {
  try {
    if (isMongoActive()) {
      const experience = await ExperienceModel.find();
      return res.json(experience);
    }
    const experience = await readJsonFile('experience.json', []);
    res.json(experience);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch experience' });
  }
});

app.post('/api/experience', authMiddleware, async (req, res) => {
  try {
    const cleanData = { ...req.body };
    delete cleanData._id;
    delete cleanData.__v;

    const newExp = {
      id: 'ex_' + Date.now(),
      ...cleanData,
    };

    if (isMongoActive()) {
      const exp = new ExperienceModel(newExp);
      await exp.save();
      return res.status(201).json(exp);
    }

    const experience = await readJsonFile('experience.json', []);
    experience.push(newExp);
    await writeJsonFile('experience.json', experience);
    res.status(201).json(newExp);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create experience' });
  }
});

app.put('/api/experience/:id', authMiddleware, async (req, res) => {
  try {
    const cleanData = { ...req.body };
    delete cleanData._id;
    delete cleanData.__v;

    if (isMongoActive()) {
      const exp = await ExperienceModel.findOneAndUpdate({ id: req.params.id }, cleanData, { new: true });
      if (!exp) return res.status(404).json({ error: 'Experience not found' });
      return res.json(exp);
    }

    const experience = await readJsonFile('experience.json', []);
    const index = experience.findIndex((e) => e.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Experience not found' });
    }
    experience[index] = { ...experience[index], ...cleanData };
    await writeJsonFile('experience.json', experience);
    res.json(experience[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update experience' });
  }
});

app.delete('/api/experience/:id', authMiddleware, async (req, res) => {
  try {
    if (isMongoActive()) {
      const result = await ExperienceModel.deleteOne({ id: req.params.id });
      if (result.deletedCount === 0) return res.status(404).json({ error: 'Experience not found' });
      return res.json({ success: true, message: 'Experience deleted' });
    }

    let experience = await readJsonFile('experience.json', []);
    experience = experience.filter((e) => e.id !== req.params.id);
    await writeJsonFile('experience.json', experience);
    res.json({ success: true, message: 'Experience deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete experience' });
  }
});

// --- MESSAGES / INBOX ENDPOINTS ---
app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'Please provide name, email, subject, and message.' });
  }

  const timestamp = new Date().toISOString();
  const newMessage = {
    id: 'm_' + Date.now(),
    timestamp,
    name,
    email,
    subject,
    message,
    read: false,
  };

  try {
    if (isMongoActive()) {
      const m = new MessageModel(newMessage);
      await m.save();
    } else {
      const messages = await readJsonFile('messages.json', []);
      messages.push(newMessage);
      await writeJsonFile('messages.json', messages);
    }

    // Send email via Nodemailer if SMTP configured
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, RECEIVER_EMAIL } = process.env;
    if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: parseInt(SMTP_PORT || '587'),
        secure: parseInt(SMTP_PORT || '587') === 465,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      });

      const mailOptions = {
        from: `"${name}" <${SMTP_USER}>`,
        to: RECEIVER_EMAIL || SMTP_USER,
        replyTo: email,
        subject: `[Portfolio Contact] ${subject}`,
        text: `Name: ${name}\nEmail: ${email}\nDate: ${timestamp}\n\nMessage:\n${message}`,
        html: `
          <h3>New Message from Portfolio</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Date:</strong> ${timestamp}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-line; background-color: #f3f4f6; padding: 15px; border-radius: 8px;">${message}</p>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log('Email notification sent successfully');
    } else {
      console.log('SMTP credentials not fully configured. Email skipped, message saved in inbox.');
    }

    res.status(200).json({ success: true, message: 'Message sent and recorded successfully!' });
  } catch (error) {
    console.error('Error recording message:', error);
    res.status(500).json({ error: 'Failed to record message' });
  }
});

// Admin Get Messages
app.get('/api/messages', authMiddleware, async (req, res) => {
  try {
    if (isMongoActive()) {
      const messages = await MessageModel.find().sort({ timestamp: -1 });
      return res.json(messages);
    }
    const messages = await readJsonFile('messages.json', []);
    let updated = false;
    messages.forEach((m, index) => {
      if (!m.id) {
        m.id = 'm_' + (Date.parse(m.timestamp) || Date.now()) + '_' + index;
        updated = true;
      }
      if (m.read === undefined) {
        m.read = false;
        updated = true;
      }
    });
    if (updated) {
      await writeJsonFile('messages.json', messages);
    }
    messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Admin Mark Message as Read/Unread
app.put('/api/messages/:id', authMiddleware, async (req, res) => {
  try {
    const isRead = req.body.read !== undefined ? req.body.read : true;

    if (isMongoActive()) {
      const query = { id: req.params.id };
      let m = await MessageModel.findOneAndUpdate(query, { read: isRead }, { new: true });
      if (!m && mongoose.Types.ObjectId.isValid(req.params.id)) {
        m = await MessageModel.findByIdAndUpdate(req.params.id, { read: isRead }, { new: true });
      }
      if (!m) return res.status(404).json({ error: 'Message not found' });
      return res.json(m);
    }

    const messages = await readJsonFile('messages.json', []);
    const index = messages.findIndex((m) => m.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Message not found' });
    }
    messages[index].read = isRead;
    await writeJsonFile('messages.json', messages);
    res.json(messages[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update message status' });
  }
});

// Admin Delete Message
app.delete('/api/messages/:id', authMiddleware, async (req, res) => {
  try {
    if (isMongoActive()) {
      let result = await MessageModel.deleteOne({ id: req.params.id });
      if (result.deletedCount === 0 && mongoose.Types.ObjectId.isValid(req.params.id)) {
        result = await MessageModel.deleteOne({ _id: req.params.id });
      }
      if (result.deletedCount === 0) return res.status(404).json({ error: 'Message not found' });
      return res.json({ success: true, message: 'Message deleted' });
    }

    let messages = await readJsonFile('messages.json', []);
    messages = messages.filter((m) => m.id !== req.params.id);
    await writeJsonFile('messages.json', messages);
    res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// --- IMAGE UPLOAD ENDPOINT ---
app.post('/api/upload', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    // Cloudinary upload
    if (isCloudinaryConfigured) {
      const uploadPromise = () =>
        new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'portfolio_arnob' },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(req.file.buffer);
        });

      const result = await uploadPromise();
      return res.json({
        success: true,
        url: result.secure_url,
      });
    }

    // Fallback Local File storage url
    const relativeUrl = `/uploads/${req.file.filename}`;
    res.json({
      success: true,
      url: relativeUrl,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Image upload failed' });
  }
});

// Serve frontend build static files in production
const frontendDistPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(frontendDistPath));

// Fallback all non-API paths to serve React app in production
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(frontendDistPath, 'index.html'), (err) => {
    if (err) {
      res.status(404).json({ message: 'API Server is running. Frontend build not found.' });
    }
  });
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Backend server running at http://localhost:${PORT}`);
  });
}

export default app;
