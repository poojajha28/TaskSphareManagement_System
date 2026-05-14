# TaskSphere - Task Management System

A **Task management system** where users can create tasks, assign them to team members, and track progress with a leaderboard for top performers.

---

## 🎯 What Does This Project Do?

This is a **web application** that helps teams manage their work:

1. **Admin** creates tasks and assigns them to users
2. **Users** complete tasks before the deadline
3. **Leaderboard** shows top performers by tasks completed

---

## ✨ Main Features

### 1. **Role-Based Access Control (Admin/Member)**

> **How roles work:**  
> When a new user signs up, the `role` column in the **users** table is set to `user` by default.  
> To make someone an **Admin**, you need to manually update the `role` column to `admin` in the database.  
> ```sql
> UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
> ```

#### **Regular User (Member)**
- Can **only view their own assigned tasks** and their personal progress
- Can see **their own deadlines, task status, and due dates**
- Can update the status of their assigned tasks (To Do → In Progress → Review → Done)
- Cannot see other team members' tasks or progress
- Cannot create or assign tasks

#### **Admin User**
- Can **view all tasks** across all team members
- Can see **everyone's progress, deadlines, and due dates**
- Can **create new tasks** with title, description, priority, and deadline
- Can **assign tasks** to any team member
- Can access the **Admin Users panel** to manage team members
- Has full visibility into the entire project management system

### 2. **Task Management**
- Create tasks with title, description, priority (low/medium/high)
- Set deadline and estimated hours
- Track status: To Do → In Progress → Review → Done
- **Overdue warnings** if task is late

### 3. **Leaderboard** 🥇
- See top 10 performers
- Ranked by tasks completed
- Motivates healthy competition

---

## 🛠 Technologies Used

### Frontend (What User Sees):
- **React.js** - For building user interface
- **Tailwind CSS** - For styling and design
- **React Router** - For page navigation

### Backend (Server Side):
- **Node.js + Express** - For creating API
- **MySQL** - For storing data
- **JWT** - For secure login
- **bcrypt** - For password encryption

---

## 📊 Database Tables

The system uses **3 main tables**:

1. **users** - Stores user information (name, email, password, tasks_completed)
2. **tasks** - Stores all tasks (title, description, deadline, assigned user)
3. **projects** - Stores projects information

---