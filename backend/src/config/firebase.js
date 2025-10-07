const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: '../.env' });


let db = null;

// Check if service account file exists
let serviceAccountPath = path.join(__dirname, '..', '..', 'runner-18abe-firebase-adminsdk-fbsvc-eee2faafd9.json');
//let serviceAccountPath = path.join(__dirname, '..', '..', 'portal-ff4e8-firebase-adminsdk-fbsvc-377993b1c8.json');
console.log(serviceAccountPath);
//portal-ff4e8-firebase-adminsdk-fbsvc-377993b1c8

// Also check environment variable path
const envServiceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH;
if (envServiceAccountPath) {
  const resolvedPath = path.resolve(envServiceAccountPath);
  if (fs.existsSync(resolvedPath)) {
    serviceAccountPath = resolvedPath;
  }
}

try {
  if (fs.existsSync(serviceAccountPath)) {
    // Initialize with service account file
    const serviceAccount = require(serviceAccountPath);
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    
    db = admin.firestore();
    console.log('Firebase Admin SDK initialized with service account file');
  } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
    // Initialize with environment variables
    const serviceAccount = {
      type: process.env.FIREBASE_TYPE,
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      clientId: process.env.FIREBASE_CLIENT_ID,
      authUri: process.env.FIREBASE_AUTH_URI,
      tokenUri: process.env.FIREBASE_TOKEN_URI,
      authProviderX509CertUrl: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
      clientX509CertUrl: process.env.FIREBASE_CLIENT_X509_CERT_URL
    };
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    
    db = admin.firestore();
    console.log('Firebase Admin SDK initialized with environment variables');
  } else {
    console.warn('Firebase Admin SDK not initialized - missing credentials');
    console.log('Service account file exists:', fs.existsSync(serviceAccountPath));
    console.log('FIREBASE_PROJECT_ID set:', !!process.env.FIREBASE_PROJECT_ID);
  }
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
}

module.exports = {
  admin,
  db
};