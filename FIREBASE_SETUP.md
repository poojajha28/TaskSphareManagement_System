# 🔥 Firebase Setup Guide for TaskSphere Management System

## Prerequisites

### 1. Node.js Version
- **Current Issue**: You're using Node.js 21.7.3
- **Required**: Node.js 20.19+ or 22.12+
- **Solution**: Update Node.js to version 22.12+ from [nodejs.org](https://nodejs.org/)

### 2. Install Firebase CLI
```bash
npm install -g firebase-tools
```

## 🚀 Complete Firebase Setup Steps

### Step 1: Firebase Project Setup (Already Done ✅)
- Project ID: `taskspheremanagement`
- All Firebase services are configured in your project

### Step 2: Enable Firebase Services

#### A. Authentication
1. Go to [Firebase Console](https://console.firebase.google.com/project/taskspheremanagement)
2. Navigate to **Authentication** → **Sign-in method**
3. Enable **Email/Password** authentication
4. Click **Save**

#### B. Firestore Database
1. Go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (for development)
4. Select your region (closest to your users)
5. Click **Done**

#### C. Storage (Optional - for file uploads)
1. Go to **Storage**
2. Click **Get started**
3. Accept security rules
4. Choose same region as Firestore

### Step 3: Deploy Firebase Configuration

#### Login to Firebase
```bash
firebase login
```

#### Initialize Firebase Project (if not done)
```bash
firebase init
```
Select:
- [x] Firestore
- [x] Hosting
- [x] Storage

#### Deploy Firestore Rules and Indexes
```bash
npm run deploy:firestore
```

### Step 4: Initialize Sample Data
```bash
npm run init-firebase
```

This will create:
- 4 sample users with different reward points and ratings
- 3 sample projects
- 5 sample tasks
- 2 sample claimed rewards

### Step 5: Run the Application
```bash
npm run dev
```

## 🔐 Demo Login Credentials

After running the init script, you can login with:

| Email | Password | Role | Points | Rating |
|-------|----------|------|--------|--------|
| demo@tasksphere.com | demo123 | Demo User | 450 | 4.2/5 |
| john@tasksphere.com | john123 | Team Member | 320 | 3.8/5 |
| sarah@tasksphere.com | sarah123 | Top Performer | 680 | 4.7/5 |
| mike@tasksphere.com | mike123 | New User | 210 | 3.2/5 |

## 📊 Firebase Collections Structure

### Users Collection (`/users/{userId}`)
```javascript
{
  uid: "user-id",
  email: "user@example.com",
  displayName: "User Name",
  rewardPoints: 450,
  rating: 4.2,
  tasksCompleted: 25,
  projectsCompleted: 3,
  createdAt: Timestamp,
  avatar: null
}
```

### Tasks Collection (`/tasks/{taskId}`)
```javascript
{
  title: "Task Title",
  description: "Task Description",
  priority: "high|medium|low",
  status: "todo|in-progress|review|done",
  estimatedHours: 8,
  dueDate: Timestamp,
  createdBy: "user-id",
  assignedTo: "user-id",
  assignedToName: "User Name",
  projectId: "project-id",
  createdAt: Timestamp,
  updatedAt: Timestamp,
  completedAt: Timestamp // when status = done
}
```

### Projects Collection (`/projects/{projectId}`)
```javascript
{
  name: "Project Name",
  description: "Project Description",
  status: "planning|active|on-hold|completed",
  priority: "high|medium|low",
  estimatedHours: 200,
  totalTasks: 15,
  completedTasks: 8,
  dueDate: Timestamp,
  createdBy: "user-id",
  teamMembers: [
    { uid: "user-id", name: "User Name", role: "owner|member" }
  ],
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Claimed Rewards Collection (`/claimedRewards/{rewardId}`)
```javascript
{
  userId: "user-id",
  rewardId: "coffee",
  rewardName: "Coffee Voucher",
  cost: 50,
  claimedAt: Timestamp,
  status: "pending|fulfilled"
}
```

## 🔒 Security Rules

Your Firestore security rules ensure:
- Users can only edit their own profiles
- Users can read other users for team features
- Tasks can be updated by creators or assignees
- Projects can be updated by creators or team members
- Claimed rewards are private to each user

## 🚀 Deployment Commands

### Build and Deploy Everything
```bash
npm run deploy
```

### Deploy Only Hosting
```bash
npm run deploy:hosting
```

### Deploy Only Firestore Rules
```bash
npm run deploy:firestore
```

### Test with Firebase Emulators (Local Development)
```bash
npm run firebase:emulators
```

## 🎯 Features Available

### ✅ Authentication
- User registration and login
- Protected routes
- User profile management

### ✅ Task Management
- Kanban board (To Do, In Progress, Review, Done)
- Task creation, assignment, and updates
- Priority levels and due dates
- Real-time synchronization

### ✅ Reward System
- Automatic points for task completion
- Point calculation based on priority and timing
- Rewards store with multiple categories
- Point redemption system

### ✅ Leaderboard
- Rankings by points, rating, and tasks completed
- Top performers display
- User progress tracking

### ✅ Project Management
- Project creation and team management
- Progress tracking
- Team collaboration features

## 🔧 Troubleshooting

### Common Issues:

1. **Node.js Version Error**
   - Update to Node.js 22.12+ or 20.19+

2. **Firebase Login Issues**
   - Run `firebase logout` then `firebase login`

3. **Firestore Permission Denied**
   - Make sure you're logged in
   - Check that security rules are deployed

4. **Port Already in Use**
   - Vite will automatically use next available port
   - Or specify port: `npm run dev -- --port 3000`

## 📈 Next Steps

1. **Update Node.js** to compatible version
2. **Enable Firebase Authentication** in console
3. **Create Firestore database** in console
4. **Run the init script** to populate data
5. **Start developing** your TaskSphere app!

Your TaskSphere Management System is now ready for development with a complete Firebase backend! 🎉