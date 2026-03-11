import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Initialize Firestore with long polling to bypass potential WebSocket restrictions
export const db = initializeFirestore(app, 
  { experimentalForceLongPolling: true }, 
  firebaseConfig.firestoreDatabaseId || undefined
);

export const storage = getStorage(app);

// CRITICAL CONSTRAINT: Validate Connection to Firestore
async function testConnection() {
  console.log("Testing Firestore connection to database:", firebaseConfig.firestoreDatabaseId || "(default)");
  try {
    // Attempt to fetch from server with a longer timeout
    const testDoc = doc(db, '_connection_test_', 'init');
    const promise = getDocFromServer(testDoc);
    
    // 10 second timeout for the test
    const timeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Connection test timed out after 10s")), 10000)
    );

    await Promise.race([promise, timeout]);
    console.log("Firestore connection verified successfully.");
  } catch (error: any) {
    console.warn("Firestore connection test warning:", error.message, error);
    
    // Check for common connectivity issues
    const isConnectivityError = 
      error.message.includes('offline') || 
      error.message.includes('Could not reach') || 
      error.message.includes('timed out') ||
      error.code === 'unavailable' ||
      error.code === 'deadline-exceeded';

    if (isConnectivityError) {
      console.error("CRITICAL: Firestore is unreachable. This may be due to a configuration mismatch, network restrictions, or the database still being provisioned.");
    } else if (error.code === 'permission-denied') {
      console.log("Firestore is reachable, but access was denied (this is expected if not logged in).");
    } else {
      console.error("Firestore test failed with unexpected error:", error.code, error.message);
    }
  }
}

testConnection();

export default app;
