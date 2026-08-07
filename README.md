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

## ☁️ Production Deployment (Vercel & MongoDB Atlas)

The codebase is fully optimized for **Vercel Serverless Functions**. Follow these step-by-step phases to deploy it successfully:

### Phase 1: Create a Free MongoDB Atlas Database
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and register a free account.
2. Create a new project, click **Build a Database**, and select the **M0 (Free)** sandbox tier.
3. Choose a cloud provider and region nearest to you, then click **Create**.
4. **Set Security Credentials**: Create a database user and copy down the **Username** and **Password**.
5. **Configure Network Access**:
   * In the left sidebar under *Security*, click **Network Access**.
   * Click **Add IP Address**, then click **Allow Access from Anywhere** (which adds `0.0.0.0/0`). This is essential because Vercel's serverless functions rotate IP addresses dynamically and will otherwise be blocked from connecting to your database. Click **Confirm**.
6. **Get Your Connection String**:
   * Go to *Database* in the sidebar and click **Connect** next to your cluster.
   * Select **Drivers** (Node.js).
   * Copy the connection string and replace `<username>` and `<password>` with your database user credentials.

### Phase 2: Deploy to Vercel
1. Upload your codebase to your private or public GitHub repository.
2. Log in to [Vercel](https://vercel.com) using your GitHub account.
3. Click **Add New > Project**, find your repository in the list, and click **Import**.
4. Keep the **Build and Output Settings** at their default Vite/Node.js presets.
5. Expand the **Environment Variables** section and configure these key-value pairs:
   * `MONGODB_URI`: *Your MongoDB Atlas connection string.*
   * `JWT_SECRET`: *A secure random string of characters for admin session tokens.*
   * `ADMIN_USERNAME`: *The admin panel login username.*
   * `ADMIN_PASSWORD`: *The admin panel login password.*
   * `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: *(Optional) For media storage uploads.*
   * `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `RECEIVER_EMAIL`: *(Optional) For email notifications.*
6. Click **Deploy**. Vercel will build the frontend and host your API routes on serverless middleware.

*Note: Since the serverless environment has a read-only filesystem, local file database operations are blocked on Vercel, and configuring MONGODB_URI is required for production data editing.*
