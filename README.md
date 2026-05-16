# TaskSphere — Team Task Management System

A web app where teams can manage projects, assign tasks, and track progress — like a simple Trello/Asana.

🔗 **Live:** (https://fortunate-sparkle-production.up.railway.app)

---

## How It Works (Simple Flow)

### Step 1: Sign Up & Login
```
User visits the app
    ↓
Chooses "Sign Up" or "Login"
    ↓
Enters Name, Email, Password
    ↓
Selects Role → Admin or Member
    ↓
Gets logged in → Redirected to Dashboard
```

### Step 2: Admin Creates a Project
```
Admin clicks "Projects" in sidebar
    ↓
Clicks "New Project"
    ↓
Fills Project Name, Description, Priority, Due Date
    ↓
Project is created → Admin is automatically added as project owner
    ↓
Admin can add team members to the project
```

### Step 3: Admin Creates Tasks
```
Admin clicks "Tasks" in sidebar
    ↓
Clicks "Create Task"
    ↓
Fills Title, Description, Priority, Due Date
    ↓
Selects a Project to link the task
    ↓
Assigns the task to a team member
    ↓
Task appears in Kanban board under "To Do"
```

### Step 4: Members Work on Tasks
```
Member logs in → sees only THEIR assigned tasks
    ↓
Opens a task → changes status
    ↓
To Do → In Progress → Done
    ↓
When marked "Done" → completion count goes up
    ↓
Progress reflects in Dashboard pie charts
```

### Step 5: Dashboard — Track Everything
```
Dashboard shows:
    ├── Stats Cards → Total, To Do, In Progress, Done, Overdue
    ├── Pie Charts → Per-project task breakdown
    ├── Tasks Per User → Who is doing what (Admin only)
    ├── Recent Tasks → Latest 5 tasks
    ├── Overdue Alerts → Tasks past due date
    └── Quick Actions → Shortcuts to create tasks/view projects
```

---

## Who Can Do What?

| Action | Admin | Member |
|--------|:-----:|:------:|
| Create projects | ✅ | ❌ |
| Create tasks | ✅ | ❌ |
| View all tasks | ✅ | ❌ |
| View own tasks | ✅ | ✅ |
| Update task status | ✅ (any) | ✅ (own only) |
| Add/remove project members | ✅ | ❌ |
| See all users' stats | ✅ | ❌ |
| View leaderboard | ✅ | ✅ |
| Manage users | ✅ | ❌ |

---

## App Pages

| Page | What It Does |
|------|-------------|
| **Landing Page** | Welcome page with Sign Up / Login buttons |
| **Dashboard** | Stats cards, project pie charts, recent tasks, overdue alerts |
| **Projects** | List of all projects, create new, manage members |
| **Tasks** | Kanban board — To Do, In Progress, Done columns |
| **Leaderboard** | Ranking of users by tasks completed |
| **Admin → Users** | View and manage all registered users |

---

## Navigation

- **Left Sidebar** (collapsible) with links to all pages
- **Notification Bell** — shows overdue task alerts
- **User Profile** — displays name and role badge
- **Mobile Responsive** — sidebar becomes a slide-out drawer on small screens

---

## Tech Stack

| What | Technology |
|------|-----------|
| Frontend | React, Tailwind CSS, Vite |
| Backend | Node.js, Express.js |
| Database | MySQL |
| Authentication | JWT tokens + bcrypt password hashing |
| Icons | Lucide React |
| Notifications | React Hot Toast |
| Deployment | Railway (Frontend + Backend + MySQL) |

---

## Project Structure

```
TaskSphareManagement_System/
│
├── Backend/                         # Node.js API Server
│   ├── controllers/                 # Handle incoming requests
│   │   ├── authController.js        # Login, Signup, Get Profile
│   │   ├── projectController.js     # Create project, Manage members
│   │   ├── taskController.js        # Create task, Update status, Stats
│   │   └── userController.js        # Get users, Leaderboard
│   ├── services/                    # Business logic + Database queries
│   │   ├── projectService.js
│   │   └── taskService.js
│   ├── routes/                      # API route definitions
│   ├── middleware/                   # Auth check, Input validation
│   ├── config/database.js           # MySQL connection
│   ├── server.js                    # Express app entry point
│   └── package.json
│
├── Frontend/                        # React App
│   ├── src/
│   │   ├── components/              # Reusable UI pieces
│   │   │   ├── Sidebar.jsx          # Left navigation bar
│   │   │   ├── PieChart.jsx         # Donut chart (SVG)
│   │   │   ├── TaskCard.jsx         # Task display with status update
│   │   │   ├── ProjectCard.jsx      # Project display card
│   │   │   ├── Modal.jsx            # Pop-up dialog
│   │   │   └── Button.jsx           # Styled button
│   │   ├── pages/                   # Full page views
│   │   │   ├── Dashboard.jsx        # Main dashboard
│   │   │   ├── Projects.jsx         # Project management
│   │   │   ├── Tasks.jsx            # Kanban task board
│   │   │   ├── Leaderboard.jsx      # User rankings
│   │   │   ├── AdminUsers.jsx       # User management
│   │   │   ├── LandingPage.jsx      # Public welcome page
│   │   │   ├── Login.jsx            # Login form
│   │   │   └── Signup.jsx           # Registration form
│   │   ├── context/AuthContext.jsx  # Login state management
│   │   ├── config/api.js            # API call helper functions
│   │   ├── App.jsx                  # App layout + routing
│   │   └── index.css                # Global styles
│   └── package.json
│
└── README.md
```

---

## Database Tables

```
┌─────────┐       ┌──────────┐       ┌──────────────────┐
│  Users  │──────▶│  Tasks   │◀──────│    Projects      │
│         │       │          │       │                  │
│ id      │       │ id       │       │ id               │
│ name    │       │ title    │       │ name             │
│ email   │       │ status   │       │ description      │
│ password│       │ priority │       │ priority         │
│ role    │       │ due_date │       │ due_date         │
│         │       │ assigned │       │ created_by → User│
└────┬────┘       │ project  │       └──────────────────┘
     │            └──────────┘                │
     │                                        │
     └──────────┐                ┌────────────┘
                ▼                ▼
        ┌──────────────────────────┐
        │    project_members       │
        │                          │
        │  user_id → Users         │
        │  project_id → Projects   │
        │  role (admin/member)     │
        └──────────────────────────┘
```

---

## API Endpoints

### Auth (Public)
| Method | Endpoint | What It Does |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create new account |
| POST | `/api/auth/login` | Login and get token |
| GET | `/api/auth/me` | Get logged-in user's profile |

### Projects (Login Required)
| Method | Endpoint | What It Does |
|--------|----------|-------------|
| GET | `/api/projects` | Get projects list |
| POST | `/api/projects` | Create new project (Admin only) |
| GET | `/api/projects/:id/members` | Get project members |
| POST | `/api/projects/:id/members` | Add member to project |
| DELETE | `/api/projects/:id/members/:userId` | Remove member |

### Tasks (Login Required)
| Method | Endpoint | What It Does |
|--------|----------|-------------|
| GET | `/api/tasks` | Get tasks (all for Admin, own for Member) |
| POST | `/api/tasks` | Create task (Admin only) |
| PATCH | `/api/tasks/:id` | Update task status |
| GET | `/api/tasks/overdue` | Get overdue tasks |
| GET | `/api/tasks/dashboard-stats` | Get dashboard numbers |
| GET | `/api/tasks/project-wise-stats` | Get per-project pie chart data |

### Users (Login Required)
| Method | Endpoint | What It Does |
|--------|----------|-------------|
| GET | `/api/users` | Get all users |
| GET | `/api/leaderboard` | Get rankings by tasks completed |

---

## Deployment Flow

### How It's Deployed (Simple View)
```
GitHub Repository
    ↓
    ├── Backend (Node.js) → Deployed on Railway
    │       ↓
    │       Connected to MySQL Database (also on Railway)
    │       ↓
    │       Backend API ready
    │
    ├── Frontend (React) → Deployed on Railway
    │       ↓
    │       Connects to Backend via environment variable
    │       ↓
    │       Live URL: https://fortunate-sparkle-production.up.railway.app
    │
    └── MySQL Database → Hosted on Railway
            ↓
            Stores all users, projects, tasks, and members data
```

### Railway Setup Steps
```
1. Login to railway.app with GitHub
2. Create New Project → Empty Project
3. Add MySQL Database → Run schema SQL in Data tab
4. Add GitHub Repo (Backend) → Root Directory: Backend
5. Set Backend environment variables:
   → DB_HOST, DB_USER, DB_PASSWORD, DB_NAME (from MySQL service)
   → JWT_SECRET (any secure string)
   → FRONTEND_URL (frontend Railway URL)
6. Add GitHub Repo (Frontend) → Root Directory: Frontend
7. Set Frontend environment variable:
   → VITE_API_URL = Backend Railway URL + /api
8. Generate domains for both services in Settings → Networking
```

---

## Author

**Pooja Jha** — [@poojajha28](https://github.com/poojajha28)
