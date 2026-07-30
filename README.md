# Full-Stack Developer Portfolio

A modern, responsive personal portfolio built with a **MERN architecture** (React with Vite frontend and Node.js with Express backend).

## Source Attribution

> [!NOTE]
> All information and portfolio data in this project are adapted from the original portfolio site hosted at [https://sarafat.pages.dev/](https://sarafat.pages.dev/), which was originally built using HTML, CSS (Tailwind), and vanilla JavaScript.

---

## Tech Stack

- **Frontend**: React (Vite), Tailwind CSS (v4), VanillaTilt, FontAwesome.
- **Backend**: Node.js, Express, Cors, Body-Parser, Nodemailer (SMTP contact form processing).
- **Deployment**: Deployed concurrently on Vercel (client) and Render (server).

---

## Project Structure

```text
portfolio--mern/
├── client/          # Frontend React Application (Vite)
├── server/          # Backend Express REST API Server
└── package.json     # Root configuration for monorepo development
```

---

## Local Development Setup

To run both the frontend and backend servers concurrently on your local machine:

1. **Install Root dependencies**:
   ```bash
   npm install
   ```

2. **Install Client and Server dependencies**:
   ```bash
   npm install --prefix client
   npm install --prefix server
   ```

3. **Configure Environment Variables**:
   - Create a `client/.env` file with:
     ```env
     VITE_API_URL=http://localhost:5000
     ```
   - Create a `server/.env` file with:
     ```env
     PORT=5000
     CORS_ORIGIN=http://localhost:5173
     ```

4. **Launch Dev Servers**:
   Run the following command at the root of the project to start both development servers concurrently:
   ```bash
   npm run dev
   ```

   - **Frontend**: [http://localhost:5173/](http://localhost:5173/)
   - **Backend**: [http://localhost:5000/](http://localhost:5000/)
