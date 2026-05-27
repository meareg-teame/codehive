import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

// Check if Firebase credentials are available
const hasFirebaseConfig = 
  process.env.FIREBASE_PROJECT_ID && 
  process.env.FIREBASE_CLIENT_EMAIL && 
  process.env.FIREBASE_PRIVATE_KEY;

let adminInstance = null;

if (hasFirebaseConfig) {
  const firebaseConfig = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  try {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(firebaseConfig),
      });
      console.log('✅ Firebase Admin initialized successfully');
    }
    adminInstance = admin;
  } catch (error) {
    console.warn('⚠️  Firebase Admin initialization failed:', error.message);
    console.log('   Running without Firebase authentication (JWT only)');
  }
} else {
  console.log('ℹ️  Firebase configuration not found');
  console.log('   Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY');
  console.log('   Running without Firebase authentication (JWT only)');
}

// Export a mock admin if Firebase is not available
export default adminInstance || {
  auth: () => ({
    verifyIdToken: async () => {
      throw new Error('Firebase not configured. Using JWT authentication only.');
    }
  })
};
