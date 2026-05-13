# 🚀 TaskSphere Management System

A professional task management application with gamification features, built with modern web technologies.

## 🎯 Project Overview

TaskSphere is a comprehensive project and task management system designed for teams and organizations. It combines traditional task management with gamification elements to boost productivity and engagement.

## ✨ Key Features

### 🔐 Authentication & User Management
- Secure Firebase Authentication
- User profiles with performance tracking
- Role-based access control

### 📋 Task Management
- Kanban-style task boards (To Do, In Progress, Review, Done)
- Task assignment and delegation
- Priority levels and due dates
- Real-time status updates

### 🏗️ Project Collaboration
- Multi-user project creation
- Team member management
- Project progress tracking
- Collaborative workspaces

### 🎮 Gamification System
- Reward points for task completion
- User ratings and performance metrics
- Leaderboard with competitive ranking
- Redeemable rewards store

### 📊 Analytics & Reporting
- Personal dashboards with statistics
- Task completion analytics
- Team performance insights
- Progress visualization

## 🛠️ Technology Stack

### Frontend
- **React 19.1.1** - Modern UI library with latest features
- **Tailwind CSS 4.1.14** - Utility-first CSS framework
- **React Router DOM** - Client-side routing
- **Lucide React** - Beautiful icons

### Backend & Database
- **Firebase Authentication** - Secure user management
- **Firestore Database** - NoSQL real-time database
- **Firebase Storage** - File storage solution
- **Firebase Analytics** - Usage tracking

### Development Tools
- **Vite 7.1.10** - Fast build tool and dev server
- **ESLint** - Code quality and consistency
- **React Hot Toast** - Elegant notifications

## 🚀 Quick Start

### Prerequisites
- Node.js (v20.19+ or v22.12+)
- npm or yarn package manager
- Firebase project setup

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Abhishekjha20/TaskSphareManagement_System.git
   cd TaskSphareManagement_System
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication, Firestore, and Storage
   - Copy your config to `.env` file (see `.env.example`)

4. **Run the application**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Open http://localhost:5174 in your browser
   - Create an account or use demo credentials

## 📱 Application Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button.jsx      # Custom button component
│   ├── Modal.jsx       # Modal dialogs
│   ├── TaskCard.jsx    # Individual task display
│   └── UserCard.jsx    # User profile cards
├── pages/              # Main application pages
│   ├── Dashboard.jsx   # User dashboard
│   ├── Tasks.jsx       # Task management
│   ├── Projects.jsx    # Project overview
│   ├── Leaderboard.jsx # Rankings and competition
│   └── Rewards.jsx     # Rewards store
├── context/            # React context providers
│   └── AuthContext.jsx # Authentication state
└── utils/              # Utility functions
    └── reward.js       # Reward calculation logic
```

## 🎮 Demo Features

### Sample Users
- **Demo User** - demo.user@tasksphere.com
- **Project Manager** - project.manager@tasksphere.com
- **Team Lead** - team.lead@tasksphere.com
- **Developer** - developer@tasksphere.com

### Demo Projects
- Website Redesign
- Mobile App Development  
- Database Optimization

### Reward System
- Coffee Voucher (50 points)
- Team Lunch (200 points)
- Flexible Hours (100 points)
- Half Day Off (300 points)
- Training Course (500 points)

## 🏆 Academic Project Highlights

### Technical Implementation
- **Modern React Patterns** - Hooks, Context API, Custom components
- **Firebase Integration** - Real-time database, authentication, security rules
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **State Management** - Context API for global state
- **Error Handling** - Comprehensive error boundaries and validation

### Software Engineering Principles
- **Component-Based Architecture** - Modular and reusable code
- **Separation of Concerns** - Clear division between UI and business logic
- **Real-time Data Flow** - Live updates across all connected clients
- **Security Best Practices** - Proper authentication and authorization
- **User Experience Focus** - Intuitive interface and smooth interactions

## 🎯 Project Objectives Achieved

✅ **Full-Stack Development** - Complete web application with backend integration  
✅ **Real-time Functionality** - Live updates and collaborative features  
✅ **User Authentication** - Secure login and user management  
✅ **Database Design** - Structured data modeling with relationships  
✅ **Modern UI/UX** - Professional and responsive interface  
✅ **Gamification** - Engaging reward system and competition  

## 📈 Future Enhancements

- Mobile application (React Native)
- Advanced analytics and reporting
- Integration with external tools (Slack, Jira)
- AI-powered task recommendations
- Calendar integration
- File attachments and comments

## 👨‍💻 Developer

**Abhishek Jha**  
Computer Science Student  
Passionate about modern web development and user experience design

---

*This project demonstrates proficiency in modern web development technologies, real-time applications, and user-centered design principles.*
