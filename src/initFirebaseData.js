import { db, auth } from './firebase';
import { collection, addDoc, setDoc, doc, Timestamp } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";

// Sample users, projects, tasks, rewards (same as your previous code)
const sampleUsers = [
    { email: 'demo@tasksphere.com', password: 'demo123', displayName: 'Demo User', rewardPoints: 450, rating: 4.2, tasksCompleted: 25, projectsCompleted: 3 },
    { email: 'john@tasksphere.com', password: 'john123', displayName: 'John Smith', rewardPoints: 320, rating: 3.8, tasksCompleted: 18, projectsCompleted: 2 },
    { email: 'sarah@tasksphere.com', password: 'sarah123', displayName: 'Sarah Johnson', rewardPoints: 680, rating: 4.7, tasksCompleted: 35, projectsCompleted: 5 },
    { email: 'mike@tasksphere.com', password: 'mike123', displayName: 'Mike Davis', rewardPoints: 210, rating: 3.2, tasksCompleted: 12, projectsCompleted: 1 },
];

async function initializeFirebaseData() {

    try {
        const createdUsers = [];

        // 1️⃣ Users
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
                console.log(`✅ Created user: ${userData.displayName} (${userData.email})`);

            } catch (error) {
                if (error.code === 'auth/email-already-in-use') {
                    console.log(`⚠️  User already exists: ${userData.email}`);
                } else {
                    console.error(`❌ Error creating user ${userData.email}:`, error.message);
                }
            }
        }

        // 2️⃣ Projects
        const createdProjects = [];
        for (const projectData of sampleProjects) {
            try {
                const docRef = await addDoc(collection(db, 'projects'), {
                    ...projectData,
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
                console.log(`✅ Created project: ${projectData.name}`);
            } catch (err) {
                console.error(`❌ Error creating project ${projectData.name}:`, err.message);
            }
        }

        // 3️⃣ Tasks
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
            } catch (err) {
                console.error(`❌ Error creating task ${taskData.title}:`, err.message);
            }
        }

        // 4️⃣ Rewards
        const sampleRewards = [
            { userId: createdUsers[0]?.uid, rewardId: 'coffee', rewardName: 'Coffee Voucher', cost: 50, status: 'fulfilled' },
            { userId: createdUsers[2]?.uid, rewardId: 'flexible-hours', rewardName: 'Flexible Hours (1 Day)', cost: 100, status: 'pending' }
        ];

        for (const reward of sampleRewards) {
            if (reward.userId) {
                try {
                    await addDoc(collection(db, 'claimedRewards'), { ...reward, claimedAt: Timestamp.now() });
                    console.log(`✅ Created claimed reward: ${reward.rewardName}`);
                } catch (err) {
                    console.error(`❌ Error creating claimed reward:`, err.message);
                }
            }
        }

        console.log('\n🎉 Firebase data initialization completed!');
    } catch (error) {
        console.error('❌ Error initializing Firebase data:', error);
    }
}
initializeFirebaseData();
