import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Firebase configuration từ environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Environment detection - Auto-determine from VITE_USE_EMULATORS
const useEmulators = import.meta.env.VITE_USE_EMULATORS === 'true';
const environment = useEmulators ? 'development' : 'production';

// Console logging để biết environment hiện tại
if (import.meta.env.MODE === 'development') {
console.log('🔧 Firebase Environment Info:');
console.log('📍 Environment:', environment);
console.log('🔄 Use Emulators:', useEmulators);
console.log('🏗️ Project ID:', firebaseConfig.projectId);
console.log('📦 Storage Bucket:', firebaseConfig.storageBucket);
}

// Emulator connection (chỉ khi VITE_USE_EMULATORS=true)
if (useEmulators) {
  const emulatorHost = import.meta.env.VITE_EMULATOR_HOST || '127.0.0.1';
  const firestorePort = import.meta.env.VITE_FIRESTORE_EMULATOR_PORT || '8084';
  const authPort = import.meta.env.VITE_AUTH_EMULATOR_PORT || '9099';
  const storagePort = import.meta.env.VITE_STORAGE_EMULATOR_PORT || '9199';

  console.log('🚀 Connecting to Firebase Emulators:');
  console.log(`   📊 Firestore: ${emulatorHost}:${firestorePort}`);
  console.log(`   🔐 Auth: ${emulatorHost}:${authPort}`);
  console.log(`   📁 Storage: ${emulatorHost}:${storagePort}`);

  // Connect to emulators (chỉ connect một lần)
  try {
    // Check if already connected để tránh reconnect error
    if (!(db as any)._settings?.host?.includes(emulatorHost)) {
      connectFirestoreEmulator(db, emulatorHost, parseInt(firestorePort));
    }

    if (!(auth as any)._config?.emulator) {
      connectAuthEmulator(auth, `http://${emulatorHost}:${authPort}`, { disableWarnings: true });
    }

    // Storage emulator connection - check differently
    const storageHost = (storage as any)._location?.host;
    if (!storageHost || !storageHost.includes(emulatorHost)) {
      connectStorageEmulator(storage, emulatorHost, parseInt(storagePort));
      console.log(`📁 Storage connected to emulator: ${emulatorHost}:${storagePort}`);
    }

    console.log('✅ Successfully connected to Firebase Emulators');
  } catch (error) {
    console.warn('⚠️ Error connecting to emulators (might already be connected):', error);
    console.log('Error details:', error);
  }
} else {
  console.log('🌐 Using Firebase Production services');
}

export default app;
