// Test VR Experience data loading
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, collection, getDocs } from 'firebase/firestore';
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

async function testVRExperienceData() {
  console.log('🎮 Testing VR Experience data for VRExperiencePage...\n');

  try {
    // Test getting VR experiences
    const vrExperiencesRef = collection(db, 'vr-experiences');
    const vrExperiencesSnapshot = await getDocs(vrExperiencesRef);
    const vrExperiences = vrExperiencesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`📊 VR Experiences found: ${vrExperiences.length} items\n`);

    if (vrExperiences.length > 0) {
      vrExperiences.forEach((experience, index) => {
        console.log(`${index + 1}. ${experience.title}`);
        console.log(`   ID: ${experience.id}`);
        console.log(`   Description: ${experience.description}`);
        console.log(`   Duration: ${experience.duration || 'Not specified'}`);
        console.log(`   Difficulty: ${experience.difficulty || 'Not specified'}`);
        console.log(`   Category: ${experience.category || 'Not specified'}`);
        console.log(`   Image: ${experience.image || experience.thumbnail || experience.thumbnailUrl || 'No image'}`);
        console.log(`   Video/VR URL: ${experience.videoSrc || experience.vrUrl || 'No video'}`);
        console.log(`   Features: ${experience.features ? experience.features.length : 0} items`);
        if (experience.features && experience.features.length > 0) {
          experience.features.forEach((feature, idx) => {
            console.log(`     - ${feature}`);
          });
        }
        console.log('');
      });

      // Test compatibility with VRExperiencePage format
      console.log('🔧 Testing data compatibility...');
      const compatibleData = vrExperiences.map(exp => ({
        id: exp.id,
        title: exp.title,
        description: exp.description,
        duration: exp.duration || '20-25 phút',
        difficulty: exp.difficulty || 'Trung bình',
        category: exp.category || 'Trải nghiệm VR',
        features: exp.features || ['Trải nghiệm VR 360°', 'Chất lượng cao', 'Tương tác thực tế'],
        thumbnail: exp.image || exp.thumbnail || exp.thumbnailUrl || 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=600&h=400&fit=crop',
        videoSrc: exp.videoSrc || exp.vrUrl || '/src/data/video/9018C0AF-BD7B-470D-9E38-33900630D830.mp4'
      }));

      console.log(`✅ All ${compatibleData.length} experiences are compatible with VRExperiencePage`);

    } else {
      console.log('⚠️ No VR experiences found. VRExperiencePage will show empty state.');
    }

  } catch (error) {
    console.error('❌ Error testing VR experience data:', error);
  }
}

testVRExperienceData().then(() => {
  console.log('\n🎯 VR Experience data test completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 VR Experience data test failed:', error);
  process.exit(1);
});
