# 🔥 Fix Firebase Authentication Configuration Error

## Error: `Firebase: Error (auth/configuration-not-found)`

This error means Firebase Authentication is not enabled in your Firebase project console.

## ✅ Step-by-Step Solution:

### Step 1: Login to Firebase CLI
```bash
firebase login
```
If you get any errors, run:
```bash
firebase logout
firebase login
```

### Step 2: Set Firebase Project
```bash
firebase use taskspheremanagement
```

### Step 3: Enable Firebase Authentication in Console

**CRITICAL**: You must do this in Firebase Console:

1. Go to: https://console.firebase.google.com/project/taskspheremanagement
2. Click on **Authentication** in the left sidebar
3. Click **Get started** (if you haven't set it up yet)
4. Go to **Sign-in method** tab
5. Click on **Email/Password**
6. Toggle **Enable** switch to ON
7. Click **Save**

### Step 4: Enable Firestore Database

1. Still in Firebase Console, click **Firestore Database**
2. Click **Create database**
3. Select **Start in test mode** (for development)
4. Choose your region (closest to your location)
5. Click **Done**

### Step 5: Deploy Firebase Configuration
```bash
firebase deploy --only firestore
```

### Step 6: Test the Fix
```bash
npm run dev
```

## 🔧 Alternative: Manual Firebase Console Setup

If CLI doesn't work, manually enable these services:

### Enable Authentication:
1. **Firebase Console** → **Authentication** → **Sign-in method**
2. **Email/Password** → **Enable** → **Save**

### Enable Firestore:
1. **Firebase Console** → **Firestore Database** → **Create database**
2. **Test mode** → **Next** → **Done**

### Verify Project Settings:
1. **Project Settings** (gear icon)
2. **General** tab
3. **Your apps** section
4. Verify the config matches your `firebase.js` file

## 🚨 If Still Getting Errors:

### Check Firebase Config
Make sure your `src/firebase.js` has the correct project ID:

```javascript
const firebaseConfig = {
  projectId: "taskspheremanagement", // Must match exactly
  // ... other config
};
```

### Verify Firebase Project
```bash
firebase projects:list
firebase use --add
# Select: taskspheremanagement
```

### Clear Browser Cache
- Clear browser cache and cookies
- Try incognito/private browsing mode

## 📞 Quick Test

After enabling Authentication, try creating a test user:

1. Go to **Firebase Console** → **Authentication** → **Users**
2. Click **Add user**
3. Add: `test@example.com` / `test123`
4. Try logging in with these credentials

## ✅ Success Indicators

You'll know it's working when:
- No more `auth/configuration-not-found` errors
- You can see the login form
- Registration/login actually works
- Users appear in Firebase Console → Authentication → Users

---

**Most Important**: Enable Email/Password authentication in Firebase Console first!