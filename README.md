# TaskSphere — Team Task Management System
A web application where teams can create projects, assign tasks, and track progress. Like a simple version of Trello/Asana.

---

## Features
### 1. User Authentication
- Signup with Name, Email, Password (choose role: Admin or Member)
- Secure login using JWT tokens

### 2. Project Management
- Create projects — creator automatically becomes Admin
- Admin can add/remove members
- Members can view their assigned projects

### 3. Task Management
- Create tasks with Title, Description, Due Date, Priority (Low/Medium/High)
- Assign tasks to users
- Update status: To Do → In Progress → Done

### 4. Dashboard
- Total tasks
- Tasks by status (To Do, In Progress, Done)
- Tasks per user (Admin only)
- Overdue tasks

### 5. Role-Based Access
- **Admin:** Can manage all tasks and users
- **Member:** Can view and update only their assigned tasks

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Tailwind CSS, Vite |
| Backend | Node.js, Express.js |
| Database | MySQL |
| Auth | JWT + bcrypt |
| Deployment | Railway |

---

## Database Design

4 tables with proper relationships (Foreign Keys):

```
Users ──────────── Tasks         (One-to-Many: assigned_to)
Users ──────────── Projects      (One-to-Many: created_by)
Users ◄──────────► Projects      (Many-to-Many: via project_members table)
Projects ────────── Tasks        (One-to-Many: project_id)
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/projects` | Get projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id/members` | Get members |
| POST | `/api/projects/:id/members` | Add member |
| DELETE | `/api/projects/:id/members/:userId` | Remove member |
| GET | `/api/tasks` | Get tasks |
| POST | `/api/tasks` | Create task |
| PATCH | `/api/tasks/:id` | Update task status |
| GET | `/api/tasks/dashboard-stats` | Dashboard stats |
| GET | `/api/tasks/overdue` | Overdue tasks |

---

## Deployment — Railway

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Create Railway Project
1. Go to [railway.app](https://railway.app) → Login with GitHub
2. Click **"New Project"** → **"Empty Project"**

### Step 3: Add MySQL
1. Click **"+ New"** → **"Database"** → **"MySQL"**
2. Go to MySQL service → **"Data"** tab → run `Backend/config/schema.sql`

### Step 4: Deploy Backend
1. Click **"+ New"** → **"GitHub Repo"** → Select your repo
2. Set Root Directory: **`Backend`**
3. Add these environment variables:

4. Go to **Settings** → **Networking** → **Generate Domain**
5. Copy the Backend URL

### Step 5: Deploy Frontend
1. Click **"+ New"** → **"GitHub Repo"** → Same repo
2. Set Root Directory: **`Frontend`**
3. Add environment variable:
4. Go to **Settings** → **Networking** → **Generate Domain**
