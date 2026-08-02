# Arnob Portfolio - Full-Stack MERN Application

A premium, responsive developer portfolio and dynamic content management system built with the **MERN** architecture (**MongoDB**, **Express.js**, **React with Vite**, and **Node.js**).

---

## 🚀 Key Features

* **Dynamic Admin Panel (`/admin`)**: A fully secured, responsive control panel to update all sections (About, Projects, Experience, Education, Skills, Achievements, and Messages) in real-time.
* **Granular Visibility Switches**: Turn individual homepage sections or the PDF CV download button on/off dynamically from the dashboard.
* **Granular Name Fields**: Separate fields for **First Name**, **Last Name**, and **Navbar Brand Name** to control name presentation across the website.
* **Robust Database Fallback**: Fail-safe connection handler that gracefully switches to local JSON storage (`server/data/`) if the MongoDB Atlas connection encounters DNS lookup or network errors.
* **Asset Uploads (Cloudinary)**: Standardized file uploads that save directly to Cloudinary in production, falling back to local disk storage if credentials are not configured.
* **Inbox Message Center**: Mark messages as read, delete, and view contact form submissions instantly in the admin messages tab.

---

## 🛠️ Tech Stack

* **Frontend**: React (Vite), Tailwind CSS (v4), VanillaTilt, FontAwesome.
* **Backend**: Node.js, Express.js, JWT Authentication, Multer.
* **Database**: MongoDB (Mongoose) with a local JSON file fallback.
* **Cloud Storage**: Cloudinary API for media assets.
* **Email Services**: Nodemailer (SMTP processing).

---

## 📁 Project Structure

```text
Arnob_Portfolio/
├── client/              # Frontend React Application (Vite)
│   ├── src/             # Source files (components, page layers, assets)
│   └── index.html       # HTML entry point
├── server/              # Backend Express API Server
│   ├── data/            # Local JSON database files (fallback storage)
│   ├── public/          # Public assets & uploads
│   └── index.js         # Entrypoint containing API routes & connection configurations
├── vercel.json          # Vercel routing configuration
└── package.json         # Root monorepo configuration
```

---

## 💻 Local Development Setup

To run both the frontend and backend servers concurrently:

### 1. Install Dependencies
Run this at the root of the project to install root, client, and server dependencies automatically:
```bash
npm install && npm run install-all
```

### 2. Configure Environment Variables
* **Backend (`server/.env`)**:
  ```env
  PORT=5000
  CORS_ORIGIN=http://localhost:5173
  JWT_SECRET=your_jwt_secret_here
  ADMIN_USERNAME=admin
  ADMIN_PASSWORD=admin_password_here

  # MongoDB Atlas URI (falls back to local JSON if omitted/offline)
  MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/dbname

  # Cloudinary config (falls back to local folder if omitted)
  CLOUDINARY_CLOUD_NAME=your_cloud_name
  CLOUDINARY_API_KEY=your_api_key
  CLOUDINARY_API_SECRET=your_api_secret

  # SMTP Mail configs
  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=587
  SMTP_USER=your_email@gmail.com
  SMTP_PASS=your_app_password
  RECEIVER_EMAIL=your_inbox@gmail.com
  ```
* **Frontend (`client/.env`)**:
  ```env
  VITE_API_URL=http://localhost:5000
  ```

### 3. Launch Development Servers
Start the Vite frontend and Express backend concurrently:
```bash
npm run dev
```
* **Frontend Link**: [http://localhost:5173/](http://localhost:5173/)
* **Backend Link**: [http://localhost:5000/](http://localhost:5000/)

---

## ☁️ Production Deployment (Vercel)

The codebase is fully optimized for **Vercel Serverless Functions**.

### Environment Variables
Configure the following keys in your **Vercel Project Settings > Environment Variables**:
1. `MONGODB_URI`: Your MongoDB Atlas URI.
2. `JWT_SECRET`: A secure string for admin JWT tokens.
3. `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Media storage tokens.
4. `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `RECEIVER_EMAIL`: Contact mail SMTP parameters.

*Note: Since the serverless environment has a read-only filesystem, the portfolio will automatically block local file operations and prompt you if the database connection goes offline.*
