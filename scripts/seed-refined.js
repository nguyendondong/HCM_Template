#!/usr/bin/env node

// Enhanced Firebase Admin SDK script to seed refined Ho Chi Minh heritage data
// Supports both emulator and production environments
// Run: yarn data:seed (emulator) or yarn data:seed:prod (production)

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

console.log('🌱 Heritage Journey - Refined Data Seeder');
console.log('==========================================');

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

    // Check multiple locations for service account key
    const possiblePaths = [
      join(projectRoot, 'firebase-service-account.json'),
      join(projectRoot, process.env.GOOGLE_APPLICATION_CREDENTIALS || ''),
      join(projectRoot, 'serviceAccountKey.json'),
      join(projectRoot, 'credentials.json')
    ].filter(path => path && !path.endsWith('/'));

    let serviceAccountFound = false;

    for (const serviceAccountPath of possiblePaths) {
      try {
        const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
        config = {
          credential: admin.credential.cert(serviceAccount),
          projectId: process.env.VITE_FIREBASE_PROJECT_ID
        };
        console.log(`✅ Using service account: ${serviceAccountPath.split('/').pop()}`);
        serviceAccountFound = true;
        break;
      } catch (error) {
        // Continue to next path
      }
    }

    if (!serviceAccountFound) {
      console.log('⚠️  Service account file not found in any of these locations:');
      possiblePaths.forEach(path => console.log(`   - ${path}`));
      console.log('⚠️  Attempting Application Default Credentials...');
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

/**
 * Clear all documents from a collection
 */
async function clearCollection(db, collectionName) {
  console.log(`🗑️ Clearing collection: ${collectionName}`);

  try {
    const snapshot = await db.collection(collectionName).get();
    const batch = db.batch();

    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    if (!snapshot.empty) {
      await batch.commit();
      console.log(`✅ Cleared ${snapshot.docs.length} documents from ${collectionName}`);
    } else {
      console.log(`📭 Collection ${collectionName} is already empty`);
    }
  } catch (error) {
    console.error(`❌ Error clearing collection ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Seed a single collection with validation and batching
 */
async function seedCollection(db, collectionName, data, options = {}) {
  const startTime = Date.now();
  const result = {
    collectionName,
    totalRecords: data.length,
    successCount: 0,
    errorCount: 0,
    errors: [],
    duration: 0
  };

  try {
    console.log(`📂 Seeding collection: ${collectionName} (${data.length} documents)`);

    // Clear existing data if requested
    if (options.clearExisting) {
      await clearCollection(db, collectionName);
    }

    // Validate data if requested
    if (options.validateData) {
      console.log(`🔍 Validating data for ${collectionName}...`);
      // Add validation logic here if needed
    }

    const batchSize = options.batchSize || 25;
    const batches = [];

    // Create batches
    for (let i = 0; i < data.length; i += batchSize) {
      batches.push(data.slice(i, i + batchSize));
    }

    console.log(`   Processing ${batches.length} batches...`);

    // Process each batch
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = db.batch();
      const batchData = batches[batchIndex];

      console.log(`   Batch ${batchIndex + 1}/${batches.length} (${batchData.length} documents)...`);

      for (const item of batchData) {
        try {
          // Ensure document has required fields
          const documentData = {
            ...item,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            seedVersion: '2.0.0',
            seedTimestamp: new Date().toISOString()
          };

          const docRef = db.collection(collectionName).doc(item.id || db.collection(collectionName).doc().id);
          batch.set(docRef, documentData);

        } catch (error) {
          result.errorCount++;
          const errorMessage = `Document ${item.id || 'unknown'}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          result.errors.push(errorMessage);
          console.error(`     ❌ Error preparing document:`, error);
        }
      }

      try {
        await batch.commit();
        result.successCount += batchData.length - (result.errorCount - (batchIndex * batchSize));
        console.log(`     ✅ Batch ${batchIndex + 1} committed successfully`);
      } catch (error) {
        result.errorCount += batchData.length;
        const errorMessage = `Batch ${batchIndex + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        result.errors.push(errorMessage);
        console.error(`     ❌ Error committing batch:`, error);
      }

      // Small delay between batches
      if (batchIndex < batches.length - 1) {
        const delay = TARGET_ENV === 'production' ? 200 : 100;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    result.duration = Date.now() - startTime;

    if (result.errorCount === 0) {
      console.log(`✅ Successfully seeded ${result.successCount} documents to ${collectionName} (${result.duration}ms)`);
    } else {
      console.log(`⚠️ Seeded ${result.successCount}/${result.totalRecords} documents to ${collectionName} (${result.errorCount} errors, ${result.duration}ms)`);
    }

    return result;

  } catch (error) {
    result.duration = Date.now() - startTime;
    result.errorCount = result.totalRecords;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    result.errors.push(`Collection error: ${errorMessage}`);
    console.error(`❌ Failed to seed collection ${collectionName}:`, error);
    return result;
  }
}

/**
 * Seed a single document
 */
async function seedDocument(db, collectionName, documentId, data, displayName) {
  const startTime = Date.now();
  const result = {
    collectionName,
    totalRecords: 1,
    successCount: 0,
    errorCount: 0,
    errors: [],
    duration: 0
  };

  try {
    const documentData = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      seedVersion: '2.0.0',
      seedTimestamp: new Date().toISOString()
    };

    await db.collection(collectionName).doc(documentId).set(documentData);
    result.successCount = 1;
    result.duration = Date.now() - startTime;

    console.log(`   ✅ Seeded document: ${displayName || documentId} (${result.duration}ms)`);
    return result;

  } catch (error) {
    result.errorCount = 1;
    result.duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    result.errors.push(errorMessage);
    console.error(`   ❌ Error seeding document ${displayName || documentId}:`, error);
    return result;
  }
}

/**
 * Initialize all refined seed data
 */
async function initializeRefinedSeedData(db, options = {}) {
  const startTime = Date.now();
  let totalSuccess = 0;
  let totalFailed = 0;

  console.log('🌱 Starting refined seed data initialization...');
  console.log('📊 Configuration:', {
    clearExisting: options.clearExisting || false,
    batchSize: options.batchSize || 25,
    validateData: options.validateData || true
  });

  const results = [];

  try {
    console.log('\n📁 Loading refined data from JSON files...\n');

    // Import refined seed data
    const landingPageContent = loadJSONData('landing-page-content.json');
    const heritageSpots = loadJSONData('heritage-spots-refined.json');
    const documentsData = loadJSONData('documents-refined.json');
    const miniGames = loadJSONData('mini-games-refined.json');
    const vrContent = loadJSONData('vr-content-refined.json');
    const seedConfig = loadJSONData('seed-configuration-refined.json');

    // 1. Seed site configuration
    console.log('📝 Seeding site configuration...');
    if (seedConfig && seedConfig.collections) {
      const siteConfigData = seedConfig.collections.find((c) => c.name === 'siteConfig')?.staticData;
      if (siteConfigData) {
        const siteConfigResult = await seedDocument(db, 'siteConfig', 'main', siteConfigData, 'Site Configuration');
        results.push(siteConfigResult);
        totalSuccess += siteConfigResult.successCount;
        totalFailed += siteConfigResult.errorCount;
      }
    }

    // 2. Seed navigation content
    console.log('\n🧭 Seeding navigation content...');
    if (seedConfig && seedConfig.collections) {
      const navData = seedConfig.collections.find((c) => c.name === 'navigationContent')?.staticData;
      if (navData) {
        const navResult = await seedDocument(db, 'navigationContent', 'main-navigation', navData, 'Navigation Content');
        results.push(navResult);
        totalSuccess += navResult.successCount;
        totalFailed += navResult.errorCount;
      }
    }

    // 3. Seed footer content
    console.log('\n🦶 Seeding footer content...');
    if (seedConfig && seedConfig.collections) {
      const footerData = seedConfig.collections.find((c) => c.name === 'footerContent')?.staticData;
      if (footerData) {
        const footerResult = await seedDocument(db, 'footerContent', 'main-footer', footerData, 'Footer Content');
        results.push(footerResult);
        totalSuccess += footerResult.successCount;
        totalFailed += footerResult.errorCount;
      }
    }

    // 4. Seed landing page content and hero content
    console.log('\n🏠 Seeding landing page content...');
    if (landingPageContent) {
      // Extract and seed hero content separately
      if (landingPageContent.heroSection) {
        console.log('   📺 Seeding hero content...');
        const heroData = {
          ...landingPageContent.heroSection,
          actionButton: landingPageContent.heroSection.actionButton || {
            text: "Khám phá ngay",
            targetSection: "introduction"
          },
          backgroundElements: landingPageContent.heroSection.backgroundElements || {
            enableFlags: true,
            enableStars: true,
            enableDecorations: true
          },
          isActive: true
        };

        const heroResult = await seedDocument(db, 'heroContent', 'main-hero', heroData, 'Hero Content');
        results.push(heroResult);
        totalSuccess += heroResult.successCount;
        totalFailed += heroResult.errorCount;
      }

      // Extract and seed introduction content separately
      if (landingPageContent.introductionSection) {
        console.log('   📖 Seeding introduction content...');
        const introData = {
          ...landingPageContent.introductionSection,
          features: landingPageContent.introductionSection.highlights || [], // Map highlights to features
          biography: {
            title: "Cuộc đời và sự nghiệp",
            content: [
              "Sinh ngày 19 tháng 5 năm 1890 tại làng Sen, xã Kim Liên, huyện Nam Đàn, tỉnh Nghệ An. Chủ tịch Hồ Chí Minh là biểu tượng của tinh thần bất khuất, ý chí kiên cường và tình yêu vô bờ bến dành cho Tổ quốc.",
              "Từ chàng thanh niên Nguyễn Tất Thành ra đi tìm đường cứu nước, đến vị lãnh tụ vĩ đại dẫn dắt dân tộc Việt Nam giành độc lập, thống nhất đất nước."
            ]
          },
          videoPath: landingPageContent.introductionSection.videoPath || 'Video/testvideo.mp4',
          isActive: true
        };

        const introResult = await seedDocument(db, 'introductionContent', 'main-intro', introData, 'Introduction Content');
        results.push(introResult);
        totalSuccess += introResult.successCount;
        totalFailed += introResult.errorCount;
      }

      // Seed the rest of landing page content
      const landingPageResult = await seedDocument(db, 'pageContent', 'landing-page', landingPageContent, 'Landing Page Content');
      results.push(landingPageResult);
      totalSuccess += landingPageResult.successCount;
      totalFailed += landingPageResult.errorCount;
    }    // 5. Seed heritage spots
    if (!options.excludeCollections?.includes('heritage-spots') && heritageSpots) {
      console.log('\n🏛️ Seeding heritage spots...');
      const heritageResult = await seedCollection(db, 'heritage-spots', heritageSpots, {
        clearExisting: options.clearExisting,
        batchSize: options.batchSize,
        validateData: options.validateData
      });
      results.push(heritageResult);
      totalSuccess += heritageResult.successCount;
      totalFailed += heritageResult.errorCount;
    }

    // 6. Seed document categories and documents
    if (!options.excludeCollections?.includes('documents') && documentsData) {
      if (documentsData.categories) {
        console.log('\n📚 Seeding document categories...');
        const categoriesResult = await seedCollection(db, 'document-categories', documentsData.categories, {
          clearExisting: options.clearExisting,
          batchSize: options.batchSize,
          validateData: options.validateData
        });
        results.push(categoriesResult);
        totalSuccess += categoriesResult.successCount;
        totalFailed += categoriesResult.errorCount;
      }

      if (documentsData.documents) {
        console.log('\n📄 Seeding documents...');
        const documentsResult = await seedCollection(db, 'documents', documentsData.documents, {
          clearExisting: options.clearExisting,
          batchSize: options.batchSize,
          validateData: options.validateData
        });
        results.push(documentsResult);
        totalSuccess += documentsResult.successCount;
        totalFailed += documentsResult.errorCount;
      }
    }

    // 7. Seed mini games
    if (!options.excludeCollections?.includes('mini-games') && miniGames) {
      console.log('\n🎮 Seeding mini games...');

      // Convert mini games data format
      // Handle both array format and object with games property
      const gamesArray = Array.isArray(miniGames) ? miniGames : (miniGames.games || []);

      const convertedGames = gamesArray.map((game, index) => {
        // Map old format to new format
        const difficultyMap = {
          'easy': 'Dễ',
          'medium': 'Trung bình',
          'hard': 'Khó'
        };

        const iconMap = {
          'timeline_quiz': 'Clock',
          'multiple_choice_quiz': 'Target',
          'jigsaw_puzzle': 'Zap',
          'matching_game': 'Target',
          'exploration_game': 'Compass',
          'sorting_game': 'Trophy'
        };

        const colorMap = {
          'timeline_quiz': 'from-blue-500 to-purple-600',
          'multiple_choice_quiz': 'from-green-500 to-blue-600',
          'jigsaw_puzzle': 'from-purple-500 to-pink-600',
          'matching_game': 'from-red-500 to-orange-600',
          'exploration_game': 'from-yellow-500 to-red-600',
          'sorting_game': 'from-indigo-500 to-purple-600'
        };

        return {
          id: game.id,
          title: game.title,
          description: game.description,
          gameType: game.gameType,
          difficulty: difficultyMap[game.difficulty] || game.difficulty || 'Dễ',
          estimatedTime: game.estimatedTime,
          category: game.category || 'history',
          icon: iconMap[game.gameType] || game.icon || 'Target',
          color: colorMap[game.gameType] || game.color || 'from-blue-500 to-purple-600',
          tags: game.tags || [],
          players: game.players || 0,
          maxScore: game.maxScore,
          isActive: true,
          isFeatured: index < 3, // Make first 3 games featured
          order: index + 1,
          gameData: game.gameData,
          rewards: game.rewards || { points: 10, badges: [], unlocks: [] },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      });

      const gamesResult = await seedCollection(db, 'mini-games', convertedGames, {
        clearExisting: options.clearExisting,
        batchSize: options.batchSize,
        validateData: options.validateData
      });
      results.push(gamesResult);
      totalSuccess += gamesResult.successCount;
      totalFailed += gamesResult.errorCount;
    }

    // 8. Seed VR content
    if (!options.excludeCollections?.includes('vr-content') && vrContent) {
      if (vrContent.vrExperiences) {
        console.log('\n🥽 Seeding VR experiences...');
        const vrExperiencesResult = await seedCollection(db, 'vr-experiences', vrContent.vrExperiences, {
          clearExisting: options.clearExisting,
          batchSize: options.batchSize,
          validateData: options.validateData
        });
        results.push(vrExperiencesResult);
        totalSuccess += vrExperiencesResult.successCount;
        totalFailed += vrExperiencesResult.errorCount;
      }

      if (vrContent.vrCollections) {
        console.log('\n📦 Seeding VR collections...');
        const vrCollectionsResult = await seedCollection(db, 'vr-collections', vrContent.vrCollections, {
          clearExisting: options.clearExisting,
          batchSize: options.batchSize,
          validateData: options.validateData
        });
        results.push(vrCollectionsResult);
        totalSuccess += vrCollectionsResult.successCount;
        totalFailed += vrCollectionsResult.errorCount;
      }

      if (vrContent.vrSettings) {
        console.log('\n⚙️ Seeding VR settings...');
        const vrSettingsResult = await seedDocument(db, 'app-settings', 'vr-settings', vrContent.vrSettings, 'VR Settings');
        results.push(vrSettingsResult);
        totalSuccess += vrSettingsResult.successCount;
        totalFailed += vrSettingsResult.errorCount;
      }
    }

    // Calculate summary
    const summary = {
      totalCollections: results.length,
      totalRecords: results.reduce((sum, result) => sum + result.totalRecords, 0),
      successfulRecords: totalSuccess,
      failedRecords: totalFailed,
      collections: results,
      totalDuration: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };

    // Print summary
    console.log('\n🎉 Refined seed data initialization completed!');
    console.log('📊 Summary:');
    console.log(`   Collections processed: ${summary.totalCollections}`);
    console.log(`   Total documents: ${summary.totalRecords}`);
    console.log(`   Successful: ${summary.successfulRecords}`);
    console.log(`   Failed: ${summary.failedRecords}`);
    console.log(`   Success rate: ${summary.totalRecords > 0 ? ((summary.successfulRecords / summary.totalRecords) * 100).toFixed(1) : 0}%`);
    console.log(`   Total duration: ${summary.totalDuration}ms`);
    console.log(`🎯 Environment: ${TARGET_ENV === 'production' || FORCE_PRODUCTION ? 'PRODUCTION' : 'EMULATOR'}`);

    // Print detailed results
    console.log('\n📋 Detailed Results:');
    results.forEach(result => {
      const status = result.errorCount === 0 ? '✅' : result.errorCount < result.totalRecords ? '⚠️' : '❌';
      console.log(`   ${status} ${result.collectionName}: ${result.successCount}/${result.totalRecords} (${result.duration}ms)`);

      if (result.errors.length > 0) {
        result.errors.slice(0, 3).forEach(error => {
          console.log(`      ❌ ${error}`);
        });
        if (result.errors.length > 3) {
          console.log(`      ... and ${result.errors.length - 3} more errors`);
        }
      }
    });

    if (TARGET_ENV !== 'production' && !FORCE_PRODUCTION) {
      console.log('\n🌐 View data at: http://127.0.0.1:4004/firestore');
    }

    console.log('\n📱 Collections created:');
    console.log('   • siteConfig (Cấu hình trang web)');
    console.log('   • navigationContent (Menu điều hướng)');
    console.log('   • footerContent (Nội dung footer)');
    console.log('   • pageContent (Nội dung trang)');
    console.log('   • heritage-spots (Di tích lịch sử)');
    console.log('   • document-categories (Danh mục tài liệu)');
    console.log('   • documents (Tài liệu lịch sử)');
    console.log('   • mini-games (Trò chơi giáo dục)');
    console.log('   • vr-experiences (Trải nghiệm VR)');
    console.log('   • vr-collections (Bộ sưu tập VR)');
    console.log('   • app-settings (Cài đặt ứng dụng)');

    console.log('\n🚀 Application is ready with refined seed data!');

    return summary;

  } catch (error) {
    console.error('❌ Error during refined seed data initialization:', error);
    throw error;
  }
}

async function seedData() {
  try {
    // Confirm production seeding if needed
    await confirmProductionSeeding();

    // Initialize Firebase
    const db = initializeFirebaseAdmin();

    // Parse command line arguments
    const args = process.argv.slice(2);
    const isProduction = args.includes('--production') || args.includes('--prod');
    const isConfirmed = args.includes('--confirm');
    const isSafe = args.includes('--safe');

    if (isProduction) {
      console.log('🔥 PRODUCTION MODE');
      if (!isConfirmed && !isSafe) {
        console.log('❌ Production seeding requires --confirm or --safe flag');
        console.log('   yarn data:seed:prod --confirm  (clear existing data)');
        console.log('   yarn data:seed:prod:safe        (safe mode, no clearing)');
        process.exit(1);
      }

      if (isSafe) {
        await initializeRefinedSeedData(db, {
          clearExisting: false,
          batchSize: 10,
          validateData: true
        });
      } else {
        await initializeRefinedSeedData(db, {
          clearExisting: true,
          batchSize: 10,
          validateData: true
        });
      }
    } else {
      console.log('🧪 EMULATOR MODE');
      await initializeRefinedSeedData(db, {
        clearExisting: true,
        batchSize: 25,
        validateData: true
      });
    }

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
    process.exit(0);
  }
}

// Run the seeding process
seedData();
