
const sampleUsers = [
    { email: 'jha202001@gmail.com', password: 'demo123', displayName: 'Abhishek jha' },
    { email: 'jhapooja123@gmail.com', password: 'demo123', displayName: 'Pooja Jha' },
    { email: 's123@gmail.com', password: 'demo123', displayName: 'Suradshan Kumar' },
    { email: 'vk123@gmail.com', password: 'demo123', displayName: 'Vivek Jha' },
    { email: 'jd123@gmail.com', password: 'demo123', displayName: 'Jd' }
];

// Run this function in browser console
async function createSampleUsers() {
    console.log('🚀 Starting user creation...');
    
    const { auth, db } = window.firebaseApp;
    const { createUserWithEmailAndPassword } = window.firebaseAuth;
    const { setDoc, doc, Timestamp } = window.firebaseFirestore;
    
    for (const userData of sampleUsers) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
            const user = userCredential.user;
            
            await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                email: userData.email,
                displayName: userData.displayName,
                rewardPoints: Math.floor(Math.random() * 500) + 100,
                rating: (Math.random() * 2 + 3).toFixed(1),
                tasksCompleted: Math.floor(Math.random() * 30) + 5,
                projectsCompleted: Math.floor(Math.random() * 5) + 1,
                createdAt: Timestamp.now(),
                avatar: null
            });
            
            console.log(`✅ Created user: ${userData.displayName} (${userData.email})`);
            
        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                console.log(`⚠️  User already exists: ${userData.email}`);
            } else {
                console.error(`❌ Error creating user ${userData.email}:`, error.message);
            }
        }
    }
    
    console.log('🎉 User creation completed!');
}

// Call the function
createSampleUsers();