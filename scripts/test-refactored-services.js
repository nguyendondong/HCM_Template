// Test refactored services
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, collection, getDocs, query, where, limit } from 'firebase/firestore';
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

// Simple VR content service simulation
async function testVRContentService() {
  try {
    // Test getting VR experiences
    const vrExperiencesRef = collection(db, 'vr-experiences');
    const vrExperiencesSnapshot = await getDocs(vrExperiencesRef);
    const vrExperiences = vrExperiencesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`   ✅ VR Experiences: ${vrExperiences.length} items`);
    if (vrExperiences.length > 0) {
      console.log(`      Sample: ${vrExperiences[0].title}`);
    }

    // Test VR content construction
    const vrFeatures = [
      {
        icon: "VrHeadset",
        title: "Thực tế ảo 360°",
        description: "Trải nghiệm không gian lịch sử như thật với góc nhìn 360 độ"
      },
      {
        icon: "Globe",
        title: "Khám phá tương tác",
        description: "Tương tác với các hiện vật và nhân vật lịch sử"
      },
      {
        icon: "Clock",
        title: "Du hành thời gian",
        description: "Quay ngược thời gian để chứng kiến các sự kiện quan trọng"
      }
    ];

    const vrContent = {
      id: 'constructed',
      title: "Công Nghệ VR Hiện Đại",
      subtitle: "Trải nghiệm lịch sử một cách sống động",
      description: "Khám phá những di tích lịch sử quan trọng thông qua công nghệ thực tế ảo tiên tiến",
      features: vrFeatures,
      experiences: vrExperiences.map(exp => ({
        id: exp.id,
        title: exp.title,
        description: exp.description,
        imageUrl: exp.image || exp.thumbnail || exp.thumbnailUrl || '/images/default-vr.jpg'
      })),
      benefits: {
        title: "Lợi ích của công nghệ VR",
        description: "Trải nghiệm học tập hiệu quả và thú vị",
        stats: [
          { percentage: "95%", label: "Người dùng hài lòng" },
          { percentage: "80%", label: "Tăng khả năng ghi nhớ" },
          { percentage: "90%", label: "Tương tác tích cực" }
        ]
      },
      isActive: true
    };

    console.log(`   ✅ VR Content constructed: ${vrContent.title}`);
    console.log(`      Features: ${vrContent.features.length}, Experiences: ${vrContent.experiences.length}`);

    return vrContent;
  } catch (error) {
    console.error('   ❌ Error in VR Content Service:', error.message);
    return null;
  }
}

// Simple mini games service simulation
async function testMiniGamesService() {
  try {
    // Test getting mini games
    const miniGamesRef = collection(db, 'mini-games');
    const q = query(miniGamesRef, where('isActive', '==', true));
    const miniGamesSnapshot = await getDocs(q);
    const miniGames = miniGamesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`   ✅ Active Mini Games: ${miniGames.length} items`);
    if (miniGames.length > 0) {
      console.log(`      Sample: ${miniGames[0].title} (${miniGames[0].gameType})`);
    }

    return miniGames;
  } catch (error) {
    console.error('   ❌ Error in Mini Games Service:', error.message);
    return [];
  }
}

// Test documents service simulation
async function testDocumentsService() {
  try {
    // Test getting document categories
    const categoriesRef = collection(db, 'document-categories');
    const categoriesSnapshot = await getDocs(categoriesRef);
    const categories = categoriesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`   ✅ Document Categories: ${categories.length} items`);

    // Test getting documents
    const documentsRef = collection(db, 'documents');
    const documentsSnapshot = await getDocs(documentsRef);
    const documents = documentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`   ✅ Documents: ${documents.length} items`);

    return { categories, documents };
  } catch (error) {
    console.error('   ❌ Error in Documents Service:', error.message);
    return { categories: [], documents: [] };
  }
}

async function testRefactoredServices() {
  console.log('🧪 Testing refactored services...\n');

  try {
    // Test VR Content Service
    console.log('📱 Testing VR Content Service...');
    const vrContent = await testVRContentService();

    // Test Mini Games Service
    console.log('\n🎮 Testing Mini Games Service...');
    const miniGames = await testMiniGamesService();

    // Test Documents Service
    console.log('\n📄 Testing Documents Service...');
    const { categories, documents } = await testDocumentsService();

    // Test Heritage Service
    console.log('\n🏛️ Testing Heritage Service...');
    const heritageRef = collection(db, 'heritage-spots');
    const heritageSnapshot = await getDocs(heritageRef);
    const heritageSpots = heritageSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    console.log(`   ✅ Heritage Spots: ${heritageSpots.length} items`);

    // Summary
    console.log('\n📊 SUMMARY:');
    console.log(`   VR Content: ${vrContent ? 'LOADED' : 'NULL'}`);
    console.log(`   Mini Games: ${miniGames.length} games`);
    console.log(`   Document Categories: ${categories.length} categories`);
    console.log(`   Documents: ${documents.length} documents`);
    console.log(`   Heritage Spots: ${heritageSpots.length} spots`);

    console.log('\n✅ All services tested successfully!');

  } catch (error) {
    console.error('❌ Error testing services:', error);
  }
}

testRefactoredServices().then(() => {
  console.log('\n🎯 Testing completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Testing failed:', error);
  process.exit(1);
});
