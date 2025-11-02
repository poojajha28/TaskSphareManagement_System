# TaskSphere - Task Management System

A **Jira-like task management system** where users can create tasks, assign them to team members, and earn rewards for completing tasks on time.

---

## 🎯 What Does This Project Do?

This is a **web application** that helps teams manage their work:

1. **Admin** creates tasks and assigns them to users
2. **Users** complete tasks before the deadline
3. **System** automatically gives rewards and ratings
4. **Leaderboard** shows top performers

**Example**: If you complete a high-priority 8-hour task on time, you earn **75 points** and your rating increases! 🎉

---

## ✨ Main Features

### 1. **Two Types of Users**
- **Admin**: Can create tasks, assign to anyone, view all tasks
- **Regular User**: Can only see their assigned tasks and complete them

### 2. **Task Management**
- Create tasks with title, description, priority (low/medium/high)
- Set deadline and estimated hours
- Track status: To Do → In Progress → Review → Done
- **Overdue warnings** if task is late

### 3. **Reward System** 🏆
Users earn points when completing tasks:
- Base points: **10**
- Priority bonus: Low (1x), Medium (1.5x), High (2x)
- Hours bonus: **+5 points** for every 2 hours
- **On-time bonus: +15 points** (if completed before deadline)

### 4. **Rating System** ⭐
- Complete 10 tasks → Rating becomes 2/5
- Complete 20 tasks → Rating becomes 3/5
- Maximum rating: **5/5**

### 5. **Leaderboard** 🥇
- See top 10 performers
- Filter by: Points, Rating, or Tasks Completed
- Motivates healthy competition

### 6. **Rewards Store** 🎁
Redeem earned points for rewards like:
- Coffee voucher (50 points)
- Team lunch (200 points)
- Half-day off (300 points)
- Online training (500 points)

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

The system uses **4 main tables**:

1. **users** - Stores user information (name, email, password, points, rating)
2. **tasks** - Stores all tasks (title, description, deadline, assigned user)
3. **projects** - Stores projects information
4. **claimed_rewards** - Stores which rewards users have claimed

---