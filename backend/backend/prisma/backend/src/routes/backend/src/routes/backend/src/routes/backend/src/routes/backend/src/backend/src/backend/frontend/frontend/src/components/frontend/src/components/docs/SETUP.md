# Setup Guide - College Event Portal

## Prerequisites

You need to install these first:

- **Node.js 18+** - Download from https://nodejs.org
- **PostgreSQL 13+** - Download from https://www.postgresql.org
- A code editor like **VS Code** - Download from https://code.visualstudio.com

## Backend Setup

### Step 1: Go to Backend Folder

Open your terminal/command prompt and type:

\`\`\`bash
cd backend
\`\`\`

### Step 2: Install Dependencies

\`\`\`bash
npm install
\`\`\`

(This downloads all necessary libraries - takes 2-5 minutes)

### Step 3: Create .env File

Create a new file called `.env` in the `backend` folder with:

\`\`\`
DATABASE_URL="postgresql://user:password@localhost:5432/college_event_portal"
JWT_SECRET="your-super-secret-key-12345"
PORT=5000
NODE_ENV="development"
\`\`\`

Replace `user` and `password` with your PostgreSQL credentials.

### Step 4: Setup Database

\`\`\`bash
npm run prisma:migrate
npm run seed
\`\`\`

### Step 5: Start Server

\`\`\`bash
npm run dev
\`\`\`

You should see:
\`\`\`
✅ Server running on http://localhost:5000
\`\`\`

---

## Frontend Setup

### Step 1: Go to Frontend Folder

Open a **NEW terminal** window and type:

\`\`\`bash
cd frontend
\`\`\`

### Step 2: Install Dependencies

\`\`\`bash
npm install
\`\`\`

### Step 3: Create .env.local File

Create a new file called `.env.local` in the `frontend` folder with:

\`\`\`
VITE_API_URL=http://localhost:5000
\`\`\`

### Step 4: Start Frontend

\`\`\`bash
npm run dev
\`\`\`

You should see:
\`\`\`
Local:   http://localhost:5173
\`\`\`

---

## Test It Out

1. Open **http://localhost:5173** in your browser
2. Login with:
   - Email: `admin@college.edu`
   - Password: `password123`
3. You should see the dashboard!

---

## Troubleshooting

**Problem:** "npm command not found"
- Solution: Install Node.js from https://nodejs.org

**Problem:** "Port 5000 already in use"
- Solution: Change PORT in .env to 5001 or 5002

**Problem:** Database connection error
- Solution: Check your DATABASE_URL in .env file

---
