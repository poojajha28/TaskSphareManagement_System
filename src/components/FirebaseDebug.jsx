import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut 
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  setDoc, 
  doc, 
  getDocs, 
  Timestamp 
} from 'firebase/firestore';

function FirebaseDebug() {
  const [output, setOutput] = useState([]);
  const [loading, setLoading] = useState(false);

  const log = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setOutput(prev => [...prev, { 
      message, 
      type, 
      timestamp 
    }]);
  };

  const clearLogs = () => setOutput([]);

  const testFirebaseConfig = async () => {
    log('🔥 Testing Firebase Configuration...', 'info');
    
    try {
      // Test 1: Check Firebase app initialization
      log(`✅ Firebase app initialized successfully`, 'success');
      log(`📍 Project ID: ${auth.app.options.projectId}`, 'info');
      log(`📍 Auth Domain: ${auth.app.options.authDomain}`, 'info');
      
      // Test 2: Check auth instance
      log(`✅ Auth instance created: ${auth ? 'Yes' : 'No'}`, 'success');
      log(`👤 Current user: ${auth.currentUser ? auth.currentUser.email : 'Not signed in'}`, 'info');
      
      // Test 3: Check Firestore instance  
      log(`✅ Firestore instance created: ${db ? 'Yes' : 'No'}`, 'success');
      
    } catch (error) {
      log(`❌ Firebase config error: ${error.message}`, 'error');
      log(`❌ Error code: ${error.code}`, 'error');
    }
  };

  const testAuthentication = async () => {
    log('🔐 Testing Authentication...', 'info');
    setLoading(true);
    
    try {
      // Test creating a test user
      const testEmail = `test-${Date.now()}@example.com`;
      const testPassword = 'test123456';
      
      log(`📝 Creating test user: ${testEmail}`, 'info');
      
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        testEmail, 
        testPassword
      );
      
      log(`✅ User created successfully: ${userCredential.user.uid}`, 'success');
      log(`📧 Email: ${userCredential.user.email}`, 'info');
      
      // Test signing out
      await signOut(auth);
      log(`✅ User signed out successfully`, 'success');
      
      // Test signing in
      log(`🔑 Signing in with test user...`, 'info');
      const signInResult = await signInWithEmailAndPassword(
        auth, 
        testEmail, 
        testPassword
      );
      
      log(`✅ Sign in successful: ${signInResult.user.uid}`, 'success');
      
    } catch (error) {
      log(`❌ Auth error: ${error.message}`, 'error');
      log(`❌ Error code: ${error.code}`, 'error');
      log(`❌ Full error:`, 'error');
      log(JSON.stringify(error, null, 2), 'error');
    } finally {
      setLoading(false);
    }
  };

  const testFirestoreRead = async () => {
    log('📖 Testing Firestore Read...', 'info');
    setLoading(true);
    
    try {
      const tasksRef = collection(db, 'tasks');
      log(`📍 Attempting to read from 'tasks' collection...`, 'info');
      
      const snapshot = await getDocs(tasksRef);
      log(`✅ Read successful! Found ${snapshot.size} documents`, 'success');
      
      snapshot.forEach((doc) => {
        log(`📄 Document ID: ${doc.id}`, 'info');
      });
      
    } catch (error) {
      log(`❌ Firestore read error: ${error.message}`, 'error');
      log(`❌ Error code: ${error.code}`, 'error');
      log(`❌ Full error:`, 'error');
      log(JSON.stringify(error, null, 2), 'error');
    } finally {
      setLoading(false);
    }
  };

  const testFirestoreWrite = async () => {
    log('📝 Testing Firestore Write...', 'info');
    setLoading(true);
    
    try {
      // Test 1: Simple document write
      const testData = {
        message: 'Debug test document',
        timestamp: Timestamp.now(),
        testId: `test-${Date.now()}`,
        user: auth.currentUser ? auth.currentUser.uid : 'anonymous'
      };
      
      log(`📍 Writing test document to 'debug' collection...`, 'info');
      log(`📄 Data: ${JSON.stringify(testData, null, 2)}`, 'info');
      
      const docRef = await addDoc(collection(db, 'debug'), testData);
      log(`✅ Document written successfully with ID: ${docRef.id}`, 'success');
      
      // Test 2: Set document with specific ID
      const specificDocRef = doc(db, 'debug', `test-${Date.now()}`);
      await setDoc(specificDocRef, {
        ...testData,
        method: 'setDoc'
      });
      
      log(`✅ Document set successfully with specific ID: ${specificDocRef.id}`, 'success');
      
    } catch (error) {
      log(`❌ Firestore write error: ${error.message}`, 'error');
      log(`❌ Error code: ${error.code}`, 'error');
      log(`❌ Full error:`, 'error');
      log(JSON.stringify(error, null, 2), 'error');
      
      // Additional debugging info
      if (error.code) {
        log(`🔍 Error analysis:`, 'info');
        switch (error.code) {
          case 'permission-denied':
            log(`- This is a Firestore security rules issue`, 'warning');
            log(`- Check your firestore.rules file`, 'warning');
            break;
          case 'unauthenticated':
            log(`- User is not authenticated`, 'warning');
            log(`- Run authentication test first`, 'warning');
            break;
          case 'unavailable':
            log(`- Firestore service is temporarily unavailable`, 'warning');
            break;
          default:
            log(`- Unknown error code: ${error.code}`, 'warning');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const testTaskCreation = async () => {
    log('📋 Testing Task Creation (Real App Flow)...', 'info');
    setLoading(true);
    
    try {
      if (!auth.currentUser) {
        log(`❌ No authenticated user. Run authentication test first.`, 'error');
        return;
      }

      const taskData = {
        title: 'Debug Test Task',
        description: 'This is a test task created by the debug component',
        priority: 'medium',
        status: 'todo',
        estimatedHours: 2,
        createdBy: auth.currentUser.uid,
        assignedTo: auth.currentUser.uid,
        assignedToName: auth.currentUser.email,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      log(`📍 Creating task with real app data structure...`, 'info');
      log(`📄 Task data: ${JSON.stringify(taskData, null, 2)}`, 'info');
      
      const docRef = await addDoc(collection(db, 'tasks'), taskData);
      log(`✅ Task created successfully with ID: ${docRef.id}`, 'success');
      
    } catch (error) {
      log(`❌ Task creation error: ${error.message}`, 'error');
      log(`❌ Error code: ${error.code}`, 'error');
      log(`❌ Full error:`, 'error');
      log(JSON.stringify(error, null, 2), 'error');
    } finally {
      setLoading(false);
    }
  };

  const runAllTests = async () => {
    clearLogs();
    log('🚀 Running all Firebase tests...', 'info');
    
    await testFirebaseConfig();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testAuthentication();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testFirestoreRead();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testFirestoreWrite();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testTaskCreation();
    
    log('🏁 All tests completed!', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Firebase Debug Console</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <button
          onClick={testFirebaseConfig}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Test Config
        </button>
        
        <button
          onClick={testAuthentication}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          Test Auth
        </button>
        
        <button
          onClick={testFirestoreRead}
          disabled={loading}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
        >
          Test Read
        </button>
        
        <button
          onClick={testFirestoreWrite}
          disabled={loading}
          className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
        >
          Test Write
        </button>
        
        <button
          onClick={testTaskCreation}
          disabled={loading}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
          Test Task
        </button>
        
        <button
          onClick={runAllTests}
          disabled={loading}
          className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 disabled:opacity-50"
        >
          Run All
        </button>
      </div>
      
      <div className="flex gap-4 mb-4">
        <button
          onClick={clearLogs}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Clear Logs
        </button>
        
        {loading && (
          <div className="flex items-center text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            Running test...
          </div>
        )}
      </div>
      
      <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-96 overflow-y-auto font-mono text-sm">
        {output.length === 0 ? (
          <div className="text-gray-500">Click a test button to start debugging...</div>
        ) : (
          output.map((log, index) => (
            <div
              key={index}
              className={`mb-1 ${
                log.type === 'error' ? 'text-red-400' :
                log.type === 'success' ? 'text-green-400' :
                log.type === 'warning' ? 'text-yellow-400' :
                'text-blue-300'
              }`}
            >
              <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default FirebaseDebug;