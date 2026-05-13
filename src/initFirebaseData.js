import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, setDoc, doc, Timestamp } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBmCKnwEH2gEGvO0OJnAiBBryUK0GZCXXk",
  authDomain: "taskspheremanagement.firebaseapp.com",
  projectId: "taskspheremanagement",
  storageBucket: "taskspheremanagement.firebasestorage.app",
  messagingSenderId: "706878795439",
  appId: "1:706878795439:web:dcadcad5f9184bbcbd2e5a",
  measurementId: "G-H6RWWZQL20"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Sample users data
const sampleUsers = [
  {
    email: 'demo@tasksphere.com',
    password: 'demo123',
    displayName: 'Demo User',
    rewardPoints: 450,
    rating: 4.2,
    tasksCompleted: 25,
    projectsCompleted: 3
  },
  {
    email: 'john@tasksphere.com',
    password: 'john123',
    displayName: 'John Smith',
    rewardPoints: 320,
    rating: 3.8,
    tasksCompleted: 18,
    projectsCompleted: 2
  },
  {
    email: 'sarah@tasksphere.com',
    password: 'sarah123',
    displayName: 'Sarah Johnson',
    rewardPoints: 680,
    rating: 4.7,
    tasksCompleted: 35,
    projectsCompleted: 5
  },
  {
    email: 'mike@tasksphere.com',
    password: 'mike123',
    displayName: 'Mike Davis',
    rewardPoints: 210,
    rating: 3.2,
    tasksCompleted: 12,
    projectsCompleted: 1
  }
];

// Sample projects data
const sampleProjects = [
  {
    name: 'TaskSphere Mobile App',
    description: 'Develop a mobile application for TaskSphere task management',
    status: 'active',
    priority: 'high',
    estimatedHours: 200,
    totalTasks: 15,
    completedTasks: 8,
    dueDate: Timestamp.fromDate(new Date('2025-12-15'))
  },
  {
    name: 'Website Redesign',
    description: 'Complete redesign of the company website with modern UI/UX',
    status: 'planning',
    priority: 'medium',
    estimatedHours: 120,
    totalTasks: 10,
    completedTasks: 2,
    dueDate: Timestamp.fromDate(new Date('2025-11-30'))
  },
  {
    name: 'API Integration',
    description: 'Integrate third-party APIs for enhanced functionality',
    status: 'active',
    priority: 'high',
    estimatedHours: 80,
    totalTasks: 8,
    completedTasks: 5,
    dueDate: Timestamp.fromDate(new Date('2025-11-15'))
  }
];

// Sample tasks data
const sampleTasks = [
  {
    title: 'Design user authentication flow',
    description: 'Create wireframes and mockups for the login and signup process',
    priority: 'high',
    status: 'done',
    estimatedHours: 8,
    dueDate: Timestamp.fromDate(new Date('2025-10-25')),
    completedAt: Timestamp.fromDate(new Date('2025-10-24'))
  },
  {
    title: 'Implement task creation API',
    description: 'Build REST API endpoints for creating and managing tasks',
    priority: 'high',
    status: 'in-progress',
    estimatedHours: 12,
    dueDate: Timestamp.fromDate(new Date('2025-10-30'))
  },
  {
    title: 'Set up CI/CD pipeline',
    description: 'Configure automated testing and deployment pipeline',
    priority: 'medium',
    status: 'todo',
    estimatedHours: 6,
    dueDate: Timestamp.fromDate(new Date('2025-11-05'))
  },
  {
    title: 'Write user documentation',
    description: 'Create comprehensive user guide and documentation',
    priority: 'low',
    status: 'todo',
    estimatedHours: 4,
    dueDate: Timestamp.fromDate(new Date('2025-11-10'))
  },
  {
    title: 'Implement reward system',
    description: 'Build the points and rewards functionality',
    priority: 'high',
    status: 'review',
    estimatedHours: 10,
    dueDate: Timestamp.fromDate(new Date('2025-10-28'))
  }
];

async function initializeFirebaseData() {
  console.log('🚀 Starting Firebase data initialization...\n');
  
  try {
    // Step 1: Create sample users
    console.log('👥 Creating sample users...');
    const createdUsers = [];
    
    for (const userData of sampleUsers) {
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth, 
          userData.email, 
          userData.password
        );
        
        const user = userCredential.user;
        
        // Create user profile in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: userData.email,
          displayName: userData.displayName,
          rewardPoints: userData.rewardPoints,
          rating: userData.rating,
          tasksCompleted: userData.tasksCompleted,
          projectsCompleted: userData.projectsCompleted,
          createdAt: Timestamp.now(),
          avatar: null
        });
        
        createdUsers.push({ ...userData, uid: user.uid });
        console.log(`✅ Created user: ${userData.displayName} (${userData.email})`);
        
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          console.log(`⚠️  User already exists: ${userData.email}`);
        } else {
          console.error(`❌ Error creating user ${userData.email}:`, error.message);
        }
      }
    }
    
    // Step 2: Create sample projects
    console.log('\n📁 Creating sample projects...');
    const createdProjects = [];
    
    for (const projectData of sampleProjects) {
      try {
        const docRef = await addDoc(collection(db, 'projects'), {
          ...projectData,
          createdBy: createdUsers[0]?.uid || 'demo-user',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          teamMembers: createdUsers.slice(0, 3).map(user => ({
            uid: user.uid,
            name: user.displayName,
            role: user === createdUsers[0] ? 'owner' : 'member'
          }))
        });
        
        createdProjects.push({ id: docRef.id, ...projectData });
        console.log(`✅ Created project: ${projectData.name}`);
        
      } catch (error) {
        console.error(`❌ Error creating project ${projectData.name}:`, error.message);
      }
    }
    
    // Step 3: Create sample tasks
    console.log('\n✅ Creating sample tasks...');
    
    for (let i = 0; i < sampleTasks.length; i++) {
      const taskData = sampleTasks[i];
      const assignedUser = createdUsers[i % createdUsers.length];
      
      try {
        await addDoc(collection(db, 'tasks'), {
          ...taskData,
          createdBy: createdUsers[0]?.uid || 'demo-user',
          assignedTo: assignedUser?.uid || 'demo-user',
          assignedToName: assignedUser?.displayName || 'Demo User',
          projectId: createdProjects[i % createdProjects.length]?.id || null,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
        
        console.log(`✅ Created task: ${taskData.title}`);
        
      } catch (error) {
        console.error(`❌ Error creating task ${taskData.title}:`, error.message);
      }
    }
    
    // Step 4: Create sample claimed rewards
    console.log('\n🎁 Creating sample claimed rewards...');
    
    const sampleRewards = [
      {
        userId: createdUsers[0]?.uid,
        rewardId: 'coffee',
        rewardName: 'Coffee Voucher',
        cost: 50,
        status: 'fulfilled'
      },
      {
        userId: createdUsers[2]?.uid,
        rewardId: 'flexible-hours',
        rewardName: 'Flexible Hours (1 Day)',
        cost: 100,
        status: 'pending'
      }
    ];
    
    for (const reward of sampleRewards) {
      if (reward.userId) {
        try {
          await addDoc(collection(db, 'claimedRewards'), {
            ...reward,
            claimedAt: Timestamp.now()
          });
          
          console.log(`✅ Created claimed reward: ${reward.rewardName}`);
          
        } catch (error) {
          console.error(`❌ Error creating claimed reward:`, error.message);
        }
      }
    }
    
    console.log('\n🎉 Firebase data initialization completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   • Users created: ${createdUsers.length}`);
    console.log(`   • Projects created: ${createdProjects.length}`);
    console.log(`   • Tasks created: ${sampleTasks.length}`);
    console.log(`   • Claimed rewards: ${sampleRewards.length}`);
    
    console.log('\n🔐 Login credentials:');
    sampleUsers.forEach(user => {
      console.log(`   • ${user.email} / ${user.password}`);
    });
    
  } catch (error) {
    console.error('❌ Error initializing Firebase data:', error);
  }
}

// Run the initialization
initializeFirebaseData();