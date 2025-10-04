// Check Firestore data structure and content
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc, connectFirestoreEmulator } from 'firebase/firestore';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Firebase config using environment variables
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "fake-api-key",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "localhost",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "hcmtemplate",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "localhost",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.VITE_FIREBASE_APP_ID || "fake-app-id"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Connect to Firestore emulator if using emulators
const useEmulators = process.env.VITE_USE_EMULATORS === 'true';
const emulatorHost = process.env.VITE_EMULATOR_HOST || '127.0.0.1';
const firestorePort = process.env.VITE_FIRESTORE_EMULATOR_PORT || '8084';

if (useEmulators) {
  try {
    connectFirestoreEmulator(db, emulatorHost, parseInt(firestorePort));
    console.log(`🔗 Connected to Firestore Emulator at ${emulatorHost}:${firestorePort}\n`);
  } catch (error) {
    console.log('ℹ️ Emulator connection already established or failed:', error.message);
  }
} else {
  console.log('🌐 Using production Firestore\n');
}

async function checkFirestoreData() {
  console.log('🔍 Checking Firestore data structure...\n');

  try {
    // Check all collections
    const collections = [
      'heroContent',
      'introductionContent',
      'documentsContent',
      'vrContent',
      'miniGameContent',
      'navigationContent',
      'footerContent',
      'siteConfig',
      'heritage-spots',
      'heritageSpots',
      'vr-features',
      'vr-experiences',
      'mini-games',
      'documents',
      'document-categories'
    ];

    for (const collectionName of collections) {
      console.log(`📁 Collection: ${collectionName}`);
      try {
        const snapshot = await getDocs(collection(db, collectionName));
        console.log(`   📊 Documents count: ${snapshot.size}`);

        if (snapshot.size > 0) {
          const firstDoc = snapshot.docs[0];
          console.log(`   🔑 First document ID: ${firstDoc.id}`);
          console.log(`   📄 Sample data:`, JSON.stringify(firstDoc.data(), null, 2).substring(0, 500) + '...');
        }
        console.log('');
      } catch (error) {
        console.log(`   ❌ Error accessing collection: ${error.message}\n`);
      }
    }

    // Check specific vrContent document
    console.log('🎯 Checking vrContent specifically...');
    try {
      const vrSnapshot = await getDocs(collection(db, 'vrContent'));
      if (vrSnapshot.size > 0) {
        vrSnapshot.docs.forEach(doc => {
          console.log(`VR Content Doc ID: ${doc.id}`);
          console.log('VR Content Data:', JSON.stringify(doc.data(), null, 2));
        });
      }
    } catch (error) {
      console.log('Error checking vrContent:', error.message);
    }

    // Check landing page content
    console.log('\n🎯 Checking landing page content in vrTechnologySection...');
    try {
      const vrSnapshot = await getDocs(collection(db, 'vrContent'));
      vrSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.vrTechnologySection) {
          console.log('Found vrTechnologySection:', JSON.stringify(data.vrTechnologySection, null, 2));
        }
        if (data.experiences) {
          console.log('Found experiences:', JSON.stringify(data.experiences, null, 2));
        }
      });
    } catch (error) {
      console.log('Error checking landing page content:', error.message);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkFirestoreData().then(() => {
  console.log('✅ Data check completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});
