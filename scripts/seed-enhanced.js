// Enhanced Firebase Admin SDK script to seed comprehensive Ho Chi Minh heritage data
// Supports both emulator and production environments
// Run: yarn data:seed:dev (emulator) or yarn data:seed:prod (production)

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = dirname(__dirname);

// Environment configuration
const TARGET_ENV = process.env.SEED_TARGET || 'emulator'; // 'emulator' or 'production'
const FORCE_PRODUCTION = process.argv.includes('--production') || process.argv.includes('--prod');

console.log('🌟 Ho Chi Minh Heritage Data Seeder');
console.log('=====================================');

// Initialize Firebase Admin based on environment
function initializeFirebaseAdmin() {
  let config = {};

  if (FORCE_PRODUCTION || TARGET_ENV === 'production') {
    console.log('🔥 PRODUCTION MODE - Seeding to live Firebase project');
    console.log('⚠️  WARNING: This will modify your production database!');

    // Production configuration
    if (!process.env.VITE_FIREBASE_PROJECT_ID) {
      console.error('❌ VITE_FIREBASE_PROJECT_ID is required for production seeding');
      process.exit(1);
    }

    // Check if service account key is available
    const serviceAccountPath = join(projectRoot, 'firebase-service-account.json');
    try {
      const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
      config = {
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.VITE_FIREBASE_PROJECT_ID
      };
      console.log(`✅ Using service account for project: ${process.env.VITE_FIREBASE_PROJECT_ID}`);
    } catch (error) {
      console.log('⚠️  Service account file not found, attempting Application Default Credentials...');
      config = {
        projectId: process.env.VITE_FIREBASE_PROJECT_ID
      };
    }
  } else {
    console.log('🧪 EMULATOR MODE - Seeding to local Firebase emulator');
    console.log('💡 Safe testing environment');

    // Emulator configuration - use real project ID
    config = {
      projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'hcmtemplate'
    };

    // Configure for emulator
    process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8084';
  }

  admin.initializeApp(config);
  return admin.firestore();
}

// Confirm production seeding
async function confirmProductionSeeding() {
  if (FORCE_PRODUCTION || TARGET_ENV === 'production') {
    console.log('\n🚨 PRODUCTION SEEDING CONFIRMATION');
    console.log('==================================');
    console.log('You are about to seed data to your PRODUCTION Firebase project.');
    console.log('This action will:');
    console.log('- Add new documents to your production Firestore');
    console.log('- Overwrite existing documents with the same IDs');
    console.log('- Use real Firebase resources and quota');
    console.log('');

    // In a real scenario, you might want to add an interactive prompt
    // For now, we'll require explicit confirmation via command line
    if (!process.argv.includes('--confirm')) {
      console.log('❌ Production seeding requires explicit confirmation.');
      console.log('Add --confirm flag to proceed: yarn data:seed:prod --confirm');
      process.exit(1);
    }

    console.log('✅ Production seeding confirmed');
  }
}

// Function to load JSON data
function loadJSONData(filename) {
  try {
    const filePath = join(projectRoot, 'data', 'seed', filename);
    const fileContent = readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`❌ Error loading ${filename}:`, error.message);
    return null;
  }
}

// Function to seed a collection with better error handling
async function seedCollection(db, collectionName, data, idField = 'id') {
  if (!data || !Array.isArray(data)) {
    console.log(`⚠️  No data or invalid data for ${collectionName}`);
    return { success: 0, failed: 0 };
  }

  console.log(`📂 Seeding ${collectionName} collection (${data.length} items)...`);

  let successCount = 0;
  let failedCount = 0;

  for (const item of data) {
    try {
      const docId = item[idField];
      if (!docId) {
        console.log(`⚠️  Skipping item without ${idField} in ${collectionName}`);
        failedCount++;
        continue;
      }

      await db.collection(collectionName).doc(docId).set(item);
      console.log(`   ✅ Added ${item.name || item.title || docId}`);
      successCount++;

      // Delay to avoid rate limiting (especially important for production)
      const delay = TARGET_ENV === 'production' ? 200 : 100;
      await new Promise(resolve => setTimeout(resolve, delay));
    } catch (error) {
      console.error(`   ❌ Error adding item to ${collectionName}:`, error.message);
      failedCount++;
    }
  }

  return { success: successCount, failed: failedCount };
}

// Function to seed a single document
async function seedDocument(db, collection, docId, data, displayName) {
  try {
    await db.collection(collection).doc(docId).set(data);
    console.log(`   ✅ Added ${displayName || docId}`);
    return { success: 1, failed: 0 };
  } catch (error) {
    console.error(`   ❌ Error adding ${displayName || docId}:`, error.message);
    return { success: 0, failed: 1 };
  }
}

async function seedData() {
  let totalSuccess = 0;
  let totalFailed = 0;

  try {
    // Confirm production seeding if needed
    await confirmProductionSeeding();

    // Initialize Firebase
    const db = initializeFirebaseAdmin();

    console.log('\n📁 Loading data from JSON files...\n');

    // Load all data files
    const heritageSpots = loadJSONData('heritage-spots-ho-chi-minh.json');
    const quizzes = loadJSONData('ho-chi-minh-quizzes.json');
    const content = loadJSONData('ho-chi-minh-content.json');
    const learningModules = loadJSONData('ho-chi-minh-learning-modules.json');
    const vrContent = loadJSONData('ho-chi-minh-vr-content.json');

    // Seed Heritage Spots
    if (heritageSpots) {
      const result = await seedCollection(db, 'heritage-spots', heritageSpots);
      totalSuccess += result.success;
      totalFailed += result.failed;
    }

    console.log('');

    // Seed Quizzes
    if (quizzes) {
      const result = await seedCollection(db, 'quizzes', quizzes);
      totalSuccess += result.success;
      totalFailed += result.failed;
    }

    console.log('');

    // Seed Content (structured differently)
    if (content) {
      console.log('📂 Seeding content collection...');

      const contentSections = [
        { id: 'hero-content', data: content.heroContent, name: content.heroContent?.title || 'Hero Content' },
        { id: 'navigation-content', data: content.navigationContent, name: 'Navigation Content' },
        { id: 'footer-content', data: content.footerContent, name: 'Footer Content' },
        { id: 'site-config', data: content.siteConfig, name: content.siteConfig?.siteName || 'Site Config' }
      ];

      for (const section of contentSections) {
        if (section.data) {
          const result = await seedDocument(db, 'content', section.id, section.data, section.name);
          totalSuccess += result.success;
          totalFailed += result.failed;

          const delay = TARGET_ENV === 'production' ? 200 : 100;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    console.log('');

    // Seed Learning Modules (structured differently)
    if (learningModules) {
      console.log('📂 Seeding learning-modules collection...');

      // Seed individual modules
      if (learningModules.learningModules && Array.isArray(learningModules.learningModules)) {
        const result = await seedCollection(db, 'learning-modules', learningModules.learningModules);
        totalSuccess += result.success;
        totalFailed += result.failed;
      }

      // Seed learning paths
      if (learningModules.learningPaths && Array.isArray(learningModules.learningPaths)) {
        const result = await seedCollection(db, 'learning-paths', learningModules.learningPaths);
        totalSuccess += result.success;
        totalFailed += result.failed;
      }

      // Seed module settings
      if (learningModules.moduleSettings) {
        const result = await seedDocument(db, 'app-settings', 'learning-modules', learningModules.moduleSettings, 'Learning Module Settings');
        totalSuccess += result.success;
        totalFailed += result.failed;
      }
    }

    console.log('');

    // Seed VR Content (structured differently)
    if (vrContent) {
      console.log('📂 Seeding vr-content collection...');

      // Seed VR experiences
      if (vrContent.vrExperiences && Array.isArray(vrContent.vrExperiences)) {
        const result = await seedCollection(db, 'vr-experiences', vrContent.vrExperiences);
        totalSuccess += result.success;
        totalFailed += result.failed;
      }

      // Seed VR collections
      if (vrContent.vrCollections && Array.isArray(vrContent.vrCollections)) {
        const result = await seedCollection(db, 'vr-collections', vrContent.vrCollections);
        totalSuccess += result.success;
        totalFailed += result.failed;
      }

      // Seed VR settings
      if (vrContent.vrSettings) {
        const result = await seedDocument(db, 'app-settings', 'vr-settings', vrContent.vrSettings, 'VR Settings');
        totalSuccess += result.success;
        totalFailed += result.failed;
      }
    }

    console.log('');

    // Add additional demo data
    console.log('📂 Seeding additional demo data...');

    // User progress example
    const userProgress = {
      userId: 'demo-user-1',
      visitedSpots: ['kim-lien-heritage-site'],
      completedQuizzes: [],
      totalPoints: 0,
      achievements: [],
      lastActivity: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    const userResult = await seedDocument(db, 'user-progress', 'demo-user-1', userProgress, 'Demo User Progress');
    totalSuccess += userResult.success;
    totalFailed += userResult.failed;

    // App settings
    const appSettings = {
      version: '1.0.0',
      maintenanceMode: false,
      featuredSpots: [
        'kim-lien-heritage-site',
        'pac-bo-heritage-site',
        'ben-nha-rong-ho-chi-minh-museum'
      ],
      announcements: [
        {
          id: 'welcome',
          title: 'Chào mừng đến với Hành trình theo dấu chân Bác',
          message: 'Khám phá cuộc đời và sự nghiệp vĩ đại của Chủ tịch Hồ Chí Minh',
          type: 'info',
          isActive: true,
          createdAt: new Date().toISOString()
        }
      ],
      updatedAt: new Date().toISOString()
    };

    const settingsResult = await seedDocument(db, 'app-settings', 'main', appSettings, 'App Settings');
    totalSuccess += settingsResult.success;
    totalFailed += settingsResult.failed;

    // Final summary
    console.log('\n🎉 Seeding completed!');
    console.log('====================');
    console.log(`✅ Successfully seeded: ${totalSuccess} items`);
    if (totalFailed > 0) {
      console.log(`❌ Failed to seed: ${totalFailed} items`);
    }
    console.log(`🎯 Environment: ${TARGET_ENV === 'production' || FORCE_PRODUCTION ? 'PRODUCTION' : 'EMULATOR'}`);

    if (TARGET_ENV !== 'production' && !FORCE_PRODUCTION) {
      console.log('🌐 View data at: http://127.0.0.1:4004/firestore');
    }

    console.log('📱 Collections created:');
    console.log('   • heritage-spots (Di tích lịch sử)');
    console.log('   • quizzes (Câu hỏi trắc nghiệm)');
    console.log('   • content (Nội dung giáo dục)');
    console.log('   • learning-modules (Module học tập)');
    console.log('   • learning-paths (Lộ trình học tập)');
    console.log('   • vr-experiences (Trải nghiệm VR)');
    console.log('   • vr-collections (Bộ sưu tập VR)');
    console.log('   • user-progress (Tiến độ người dùng)');
    console.log('   • app-settings (Cài đặt ứng dụng)');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    console.error('Stack trace:', error.stack);

    if (error.code === 'permission-denied') {
      console.log('\n💡 Troubleshooting tips:');
      console.log('1. Check Firebase Security Rules');
      console.log('2. Verify authentication credentials');
      console.log('3. Ensure project ID is correct');
    }
  } finally {
    console.log('\n👋 Exiting...');
    process.exit(totalFailed > 0 ? 1 : 0);
  }
}

// Run the seeding process
seedData();
