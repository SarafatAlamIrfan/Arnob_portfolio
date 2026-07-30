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
ensureDirectories();

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
// In memory storage if uploading to Cloudinary, else disk storage
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
    // If file doesn't exist, create it with default value
    await writeJsonFile(filename, defaultValue);
    return defaultValue;
  }
};

const writeJsonFile = async (filename, data) => {
  const filePath = path.join(DATA_DIR, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
};

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

// Verify token route (to auto login in front-end)
app.get('/api/admin/verify', authMiddleware, (req, res) => {
  res.json({ valid: true, username: req.admin.username });
});

// --- DYNAMIC PROFILE ENDPOINTS ---
app.get('/api/profile', async (req, res) => {
  const profile = await readJsonFile('profile.json', {
    name: 'Arnob',
    title: 'Creative Designer & Hardware Innovator',
    tagline: 'Enthusiastic Tinkerer',
    bio: 'I am Arnob...',
    avatar: '/image/LinkedIn_HeadShot.jpg',
    coverImage: '/image/Portfolio_cover.jpg',
    email: 'arnob@example.com',
    location: 'Dhaka, Bangladesh',
    socialLinks: {},
    typewriterTexts: [],
  });
  res.json(profile);
});

app.post('/api/profile', authMiddleware, async (req, res) => {
  try {
    await writeJsonFile('profile.json', req.body);
    res.json({ success: true, message: 'Profile updated successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save profile' });
  }
});

// --- PROJECTS CRUD ---
app.get('/api/projects', async (req, res) => {
  const projects = await readJsonFile('projects.json', []);
  res.json(projects);
});

app.post('/api/projects', authMiddleware, async (req, res) => {
  try {
    const projects = await readJsonFile('projects.json', []);
    const newProject = {
      id: 'p_' + Date.now(),
      ...req.body,
    };
    projects.push(newProject);
    await writeJsonFile('projects.json', projects);
    res.status(201).json(newProject);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create project' });
  }
});

app.put('/api/projects/:id', authMiddleware, async (req, res) => {
  try {
    const projects = await readJsonFile('projects.json', []);
    const index = projects.findIndex((p) => p.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Project not found' });
    }
    projects[index] = { ...projects[index], ...req.body };
    await writeJsonFile('projects.json', projects);
    res.json(projects[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update project' });
  }
});

app.delete('/api/projects/:id', authMiddleware, async (req, res) => {
  try {
    let projects = await readJsonFile('projects.json', []);
    projects = projects.filter((p) => p.id !== req.params.id);
    await writeJsonFile('projects.json', projects);
    res.json({ success: true, message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// --- ACHIEVEMENTS CRUD ---
app.get('/api/achievements', async (req, res) => {
  const achievements = await readJsonFile('achievements.json', []);
  res.json(achievements);
});

app.post('/api/achievements', authMiddleware, async (req, res) => {
  try {
    const achievements = await readJsonFile('achievements.json', []);
    const newAchievement = {
      id: 'a_' + Date.now(),
      ...req.body,
    };
    achievements.push(newAchievement);
    await writeJsonFile('achievements.json', achievements);
    res.status(201).json(newAchievement);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create achievement' });
  }
});

app.put('/api/achievements/:id', authMiddleware, async (req, res) => {
  try {
    const achievements = await readJsonFile('achievements.json', []);
    const index = achievements.findIndex((a) => a.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Achievement not found' });
    }
    achievements[index] = { ...achievements[index], ...req.body };
    await writeJsonFile('achievements.json', achievements);
    res.json(achievements[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update achievement' });
  }
});

app.delete('/api/achievements/:id', authMiddleware, async (req, res) => {
  try {
    let achievements = await readJsonFile('achievements.json', []);
    achievements = achievements.filter((a) => a.id !== req.params.id);
    await writeJsonFile('achievements.json', achievements);
    res.json({ success: true, message: 'Achievement deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete achievement' });
  }
});

// --- SKILLS CRUD ---
app.get('/api/skills', async (req, res) => {
  const skills = await readJsonFile('skills.json', []);
  res.json(skills);
});

app.post('/api/skills', authMiddleware, async (req, res) => {
  try {
    const skills = await readJsonFile('skills.json', []);
    const newSkill = {
      id: 's_' + Date.now(),
      ...req.body,
    };
    skills.push(newSkill);
    await writeJsonFile('skills.json', skills);
    res.status(201).json(newSkill);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create skill' });
  }
});

app.put('/api/skills/:id', authMiddleware, async (req, res) => {
  try {
    const skills = await readJsonFile('skills.json', []);
    const index = skills.findIndex((s) => s.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Skill not found' });
    }
    skills[index] = { ...skills[index], ...req.body };
    await writeJsonFile('skills.json', skills);
    res.json(skills[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update skill' });
  }
});

app.delete('/api/skills/:id', authMiddleware, async (req, res) => {
  try {
    let skills = await readJsonFile('skills.json', []);
    skills = skills.filter((s) => s.id !== req.params.id);
    await writeJsonFile('skills.json', skills);
    res.json({ success: true, message: 'Skill deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete skill' });
  }
});

// --- EDUCATION CRUD ---
app.get('/api/education', async (req, res) => {
  const education = await readJsonFile('education.json', []);
  res.json(education);
});

app.post('/api/education', authMiddleware, async (req, res) => {
  try {
    const education = await readJsonFile('education.json', []);
    const newEdu = {
      id: 'e_' + Date.now(),
      ...req.body,
    };
    education.push(newEdu);
    await writeJsonFile('education.json', education);
    res.status(201).json(newEdu);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create education' });
  }
});

app.put('/api/education/:id', authMiddleware, async (req, res) => {
  try {
    const education = await readJsonFile('education.json', []);
    const index = education.findIndex((e) => e.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Education not found' });
    }
    education[index] = { ...education[index], ...req.body };
    await writeJsonFile('education.json', education);
    res.json(education[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update education' });
  }
});

app.delete('/api/education/:id', authMiddleware, async (req, res) => {
  try {
    let education = await readJsonFile('education.json', []);
    education = education.filter((e) => e.id !== req.params.id);
    await writeJsonFile('education.json', education);
    res.json({ success: true, message: 'Education deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete education' });
  }
});

// --- EXPERIENCE CRUD ---
app.get('/api/experience', async (req, res) => {
  const experience = await readJsonFile('experience.json', []);
  res.json(experience);
});

app.post('/api/experience', authMiddleware, async (req, res) => {
  try {
    const experience = await readJsonFile('experience.json', []);
    const newExp = {
      id: 'ex_' + Date.now(),
      ...req.body,
    };
    experience.push(newExp);
    await writeJsonFile('experience.json', experience);
    res.status(201).json(newExp);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create experience' });
  }
});

app.put('/api/experience/:id', authMiddleware, async (req, res) => {
  try {
    const experience = await readJsonFile('experience.json', []);
    const index = experience.findIndex((e) => e.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Experience not found' });
    }
    experience[index] = { ...experience[index], ...req.body };
    await writeJsonFile('experience.json', experience);
    res.json(experience[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update experience' });
  }
});

app.delete('/api/experience/:id', authMiddleware, async (req, res) => {
  try {
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
    const messages = await readJsonFile('messages.json', []);
    messages.push(newMessage);
    await writeJsonFile('messages.json', messages);

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
  const messages = await readJsonFile('messages.json', []);
  // Sort latest first
  messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  res.json(messages);
});

// Admin Mark Message as Read/Unread
app.put('/api/messages/:id', authMiddleware, async (req, res) => {
  try {
    const messages = await readJsonFile('messages.json', []);
    const index = messages.findIndex((m) => m.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Message not found' });
    }
    messages[index].read = req.body.read !== undefined ? req.body.read : true;
    await writeJsonFile('messages.json', messages);
    res.json(messages[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update message status' });
  }
});

// Admin Delete Message
app.delete('/api/messages/:id', authMiddleware, async (req, res) => {
  try {
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

app.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`);
});
