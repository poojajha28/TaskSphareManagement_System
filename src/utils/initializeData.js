import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, Timestamp } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

// Your Firebase config (replace with actual values)
const firebaseConfig = {
  // Your config here
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Sample data for initialization
const sampleUsers = [
  {
    email: "demo@tasksphere.com",
    password: "demo123",
    displayName: "Demo User",
    rewardPoints: 150,
    rating: 3,
    tasksCompleted: 25
  },
  {
    email: "john@tasksphere.com", 
    password: "john123",
    displayName: "John Smith",
    rewardPoints: 320,
    rating: 4,
    tasksCompleted: 45
  },
  {
    email: "sarah@tasksphere.com",
    password: "sarah123", 
    displayName: "Sarah Johnson",
    rewardPoints: 280,
    rating: 4,
    tasksCompleted: 38
  }
];

const sampleProjects = [
  {
    name: "TaskSphere Development",
    description: "Main project for developing the TaskSphere management system",
    status: "active",
    priority: "high",
    dueDate: Timestamp.fromDate(new Date("2025-12-31")),
    estimatedHours: 500,
    totalTasks: 15,
    completedTasks: 8
  },
  {
    name: "Marketing Website",
    description: "Create a marketing website for TaskSphere",
    status: "planning",
    priority: "medium", 
    dueDate: Timestamp.fromDate(new Date("2025-11-30")),
    estimatedHours: 200,
    totalTasks: 8,
    completedTasks: 2
  }
];

const sampleTasks = [
  {
    title: "Design User Dashboard",
    description: "Create a comprehensive dashboard for users to view their tasks and progress",
    status: "done",
    priority: "high",
    estimatedHours: 8,
    dueDate: Timestamp.fromDate(new Date("2025-10-25")),
    completedAt: Timestamp.fromDate(new Date("2025-10-20"))
  },
  {
    title: "Implement Reward System",
    description: "Build the reward point calculation and redemption system",
    status: "in-progress",
    priority: "high",
    estimatedHours: 12,
    dueDate: Timestamp.fromDate(new Date("2025-10-30"))
  },
  {
    title: "Create Landing Page",
    description: "Design and develop the marketing landing page",
    status: "todo",
    priority: "medium",
    estimatedHours: 6,
    dueDate: Timestamp.fromDate(new Date("2025-11-05"))
  },
  {
    title: "User Testing",
    description: "Conduct user testing sessions and gather feedback",
    status: "review",
    priority: "medium", 
    estimatedHours: 4,
    dueDate: Timestamp.fromDate(new Date("2025-11-10"))
  }
];

// Function to initialize sample data
export async function initializeSampleData() {
  try {
    console.log("Initializing sample data...");
    
    // Create sample users
    for (const userData of sampleUsers) {
      try {
        const { user } = await createUserWithEmailAndPassword(
          auth, 
          userData.email, 
          userData.password
        );
        
        // Add user profile to Firestore
        await addDoc(collection(db, "users"), {
          uid: user.uid,
          email: userData.email,
          displayName: userData.displayName,
          rewardPoints: userData.rewardPoints,
          rating: userData.rating,
          tasksCompleted: userData.tasksCompleted,
          projectsCompleted: 0,
          createdAt: Timestamp.now(),
          avatar: null
        });
        
        console.log(`Created user: ${userData.displayName}`);
      } catch (error) {
        console.log(`User ${userData.email} might already exist`);
      }
    }
    
    // Add sample projects
    for (const project of sampleProjects) {
      await addDoc(collection(db, "projects"), {
        ...project,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        teamMembers: []
      });
      console.log(`Created project: ${project.name}`);
    }
    
    // Add sample tasks
    for (const task of sampleTasks) {
      await addDoc(collection(db, "tasks"), {
        ...task,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        assignedTo: null,
        assignedToName: null,
        createdBy: null
      });
      console.log(`Created task: ${task.title}`);
    }
    
    console.log("✅ Sample data initialization completed!");
    
  } catch (error) {
    console.error("❌ Error initializing sample data:", error);
  }
}

// Uncomment the line below to run the initialization
// initializeSampleData();