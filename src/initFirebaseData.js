import { db, auth } from './firebase';
import { collection, addDoc, setDoc, doc, Timestamp } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";

// Professional Sample Data for TaskSphere Management System
const sampleUsers = [
    { email: 'demo.user@tasksphere.com', password: 'secure123', displayName: 'Demo User', rewardPoints: 450, rating: 4.2, tasksCompleted: 25, projectsCompleted: 3 },
    { email: 'project.manager@tasksphere.com', password: 'secure123', displayName: 'Project Manager', rewardPoints: 680, rating: 4.7, tasksCompleted: 35, projectsCompleted: 5 },
    { email: 'team.lead@tasksphere.com', password: 'secure123', displayName: 'Team Lead', rewardPoints: 320, rating: 3.8, tasksCompleted: 18, projectsCompleted: 2 },
    { email: 'developer@tasksphere.com', password: 'secure123', displayName: 'Developer', rewardPoints: 210, rating: 3.2, tasksCompleted: 12, projectsCompleted: 1 },
];

const sampleProjects = [
    {
        name: 'Website Redesign',
        description: 'Complete website redesign with modern UI/UX',
        status: 'active',
        priority: 'high',
        dueDate: new Date('2025-12-31'),
        totalTasks: 8,
        completedTasks: 3
    },
    {
        name: 'Mobile App Development',
        description: 'Cross-platform mobile application development',
        status: 'planning',
        priority: 'medium',
        dueDate: new Date('2026-03-15'),
        totalTasks: 12,
        completedTasks: 0
    },
    {
        name: 'Database Optimization',
        description: 'Optimize database performance and queries',
        status: 'active',
        priority: 'high',
        dueDate: new Date('2025-11-30'),
        totalTasks: 5,
        completedTasks: 2
    }
];

const sampleTasks = [
    {
        title: 'Design Homepage Layout',
        description: 'Create wireframes and mockups for the new homepage',
        priority: 'high',
        status: 'done',
        estimatedHours: 8,
        dueDate: new Date('2025-10-25')
    },
    {
        title: 'Implement User Authentication',
        description: 'Set up Firebase authentication system',
        priority: 'high',
        status: 'in-progress',
        estimatedHours: 12,
        dueDate: new Date('2025-10-30')
    },
    {
        title: 'Create API Documentation',
        description: 'Document all API endpoints and usage',
        priority: 'medium',
        status: 'todo',
        estimatedHours: 6,
        dueDate: new Date('2025-11-05')
    },
    {
        title: 'Setup Database Schema',
        description: 'Design and implement database structure',
        priority: 'high',
        status: 'done',
        estimatedHours: 10,
        dueDate: new Date('2025-10-20')
    },
    {
        title: 'Write Unit Tests',
        description: 'Create comprehensive unit tests for all modules',
        priority: 'medium',
        status: 'review',
        estimatedHours: 15,
        dueDate: new Date('2025-11-10')
    }
];

// Professional Demo Data Initialization Function
async function initializeTaskSphereData() {
    console.log('🚀 Initializing TaskSphere Demo Data...\n');

    try {
        const createdUsers = [];

        // Create Professional Demo Users
        console.log('👥 Creating users...');
        for (const userData of sampleUsers) {
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
                const user = userCredential.user;

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
                console.log(`   ✅ ${userData.displayName}`);

            } catch (error) {
                if (error.code === 'auth/email-already-in-use') {
                    console.log(`   ⚠️  ${userData.displayName} (already exists)`);
                } else {
                    console.error(`   ❌ Error creating ${userData.displayName}:`, error.message);
                }
            }
        }

        // Create Sample Projects
        console.log('\n📂 Creating projects...');
        const createdProjects = [];
        for (const projectData of sampleProjects) {
            try {
                const docRef = await addDoc(collection(db, 'projects'), {
                    ...projectData,
                    dueDate: Timestamp.fromDate(projectData.dueDate),
                    createdBy: createdUsers[0]?.uid || 'demo-user',
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now(),
                    teamMembers: createdUsers.slice(0, 3).map((user, idx) => ({
                        uid: user.uid,
                        name: user.displayName,
                        role: idx === 0 ? 'owner' : 'member'
                    }))
                });
                createdProjects.push({ id: docRef.id, ...projectData });
                console.log(`   ✅ ${projectData.name}`);
            } catch (err) {
                console.error(`   ❌ Error creating ${projectData.name}:`, err.message);
            }
        }

        // Create Sample Tasks
        console.log('\n📋 Creating tasks...');
        for (let i = 0; i < sampleTasks.length; i++) {
            const taskData = sampleTasks[i];
            const assignedUser = createdUsers[i % createdUsers.length];
            try {
                await addDoc(collection(db, 'tasks'), {
                    ...taskData,
                    dueDate: Timestamp.fromDate(taskData.dueDate),
                    createdBy: createdUsers[0]?.uid,
                    assignedTo: assignedUser?.uid,
                    assignedToName: assignedUser?.displayName,
                    projectId: createdProjects[i % createdProjects.length]?.id || null,
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now()
                });
                console.log(`   ✅ ${taskData.title}`);
            } catch (err) {
                console.error(`   ❌ Error creating ${taskData.title}:`, err.message);
            }
        }

        // Create Sample Claimed Rewards
        console.log('\n🎁 Creating sample rewards...');
        const sampleRewards = [
            { userId: createdUsers[0]?.uid, rewardId: 'coffee', rewardName: 'Coffee Voucher', cost: 50, status: 'fulfilled' },
            { userId: createdUsers[1]?.uid, rewardId: 'flexible-hours', rewardName: 'Flexible Hours', cost: 100, status: 'pending' }
        ];

        for (const reward of sampleRewards) {
            if (reward.userId) {
                try {
                    await addDoc(collection(db, 'claimedRewards'), { 
                        ...reward, 
                        claimedAt: Timestamp.now() 
                    });
                    console.log(`   ✅ ${reward.rewardName}`);
                } catch (err) {
                    console.error(`   ❌ Error creating ${reward.rewardName}:`, err.message);
                }
            }
        }

        console.log('\n🎉 TaskSphere Demo Data Successfully Initialized!');
        console.log('\n📊 Summary:');
        console.log(`   👥 Users: ${createdUsers.length}`);
        console.log(`   📂 Projects: ${createdProjects.length}`);
        console.log(`   📋 Tasks: ${sampleTasks.length}`);
        console.log(`   🎁 Rewards: ${sampleRewards.length}`);
        
    } catch (error) {
        console.error('❌ Error initializing TaskSphere data:', error);
    }
}

// Initialize demo data when script runs
initializeTaskSphereData();
