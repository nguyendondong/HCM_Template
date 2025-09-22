import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
// Note: Import Firebase config from your project
// import { db } from '../lib/firebase';

// Import seed data
import heritageSpots from './seed/heritage-spots-ho-chi-minh.json';
import documentsHcm from './seed/documents-ho-chi-minh.json';
import documents from './seed/documents.json';
import documentCategories from './seed/document-categories.json';
import miniGames from './seed/mini-games-ho-chi-minh.json';
import overviewStats from './seed/overview-stats-ho-chi-minh.json';
import learningModulesData from './seed/ho-chi-minh-learning-modules.json';
import quizzesData from './seed/ho-chi-minh-quizzes.json';
import vrContentData from './seed/ho-chi-minh-vr-content.json';
import siteContent from './seed/ho-chi-minh-content.json';
import seedConfiguration from './seed/seed-configuration.json';

// Extract arrays from complex JSON structures
const learningModules = learningModulesData.learningModules || [];
const quizzes = Array.isArray(quizzesData) ? quizzesData : [];
const vrContent = vrContentData.vrExperiences || [];

// Types for seed data
export interface SeedDataCollection {
  name: string;
  data: any[];
  description: string;
}

export interface SeedResult {
  collectionName: string;
  totalRecords: number;
  successCount: number;
  errorCount: number;
  errors: string[];
  duration: number;
}

export interface SeedSummary {
  totalCollections: number;
  totalRecords: number;
  successfulRecords: number;
  failedRecords: number;
  collections: SeedResult[];
  totalDuration: number;
  timestamp: string;
}

/**
 * All seed data collections
 */
// Import dữ liệu danh mục tài liệu
import documentCategories from './seed/document-categories.json';
import documents from './seed/documents.json';

export const seedCollections: SeedDataCollection[] = [
  {
    name: 'heritage-spots',
    data: heritageSpots,
    description: 'Khu di tích lịch sử gắn liền với Chủ tịch Hồ Chí Minh'
  },
  {
    name: 'document-categories',
    data: documentCategories,
    description: 'Danh mục tài liệu về Chủ tịch Hồ Chí Minh'
  },
  {
    name: 'documents',
    data: documents,
    description: 'Tài liệu, văn bản và hiện vật liên quan đến Chủ tịch Hồ Chí Minh'
  },
  {
    name: 'document-categories',
    data: documentCategories,
    description: 'Danh mục các loại tài liệu về Chủ tịch Hồ Chí Minh'
  },
  {
    name: 'mini-games',
    data: miniGames,
    description: 'Các trò chơi tương tác và câu hỏi kiểm tra kiến thức'
  },
  {
    name: 'overview-stats',
    data: overviewStats,
    description: 'Thống kê tổng quan và dữ liệu phân tích về di sản Hồ Chí Minh'
  },
  {
    name: 'learning-modules',
    data: learningModules,
    description: 'Các module học tập và nội dung giáo dục'
  },
  {
    name: 'quizzes',
    data: quizzes,
    description: 'Hệ thống câu hỏi và bài kiểm tra kiến thức chi tiết'
  },
  {
    name: 'vr-content',
    data: vrContent,
    description: 'Nội dung thực tế ảo và trải nghiệm 360 độ'
  },
  {
    name: 'site-content',
    data: [siteContent],
    description: 'Nội dung tĩnh của website'
  }
];

/**
 * Seed a single collection to Firestore
 * Note: This function requires Firebase to be configured
 */
export async function seedCollection(
  collectionName: string,
  data: any[],
  db: any, // Firebase Firestore instance
  options: {
    clearExisting?: boolean;
    batchSize?: number;
  } = {}
): Promise<SeedResult> {
  const startTime = Date.now();
  const result: SeedResult = {
    collectionName,
    totalRecords: data.length,
    successCount: 0,
    errorCount: 0,
    errors: [],
    duration: 0
  };

  try {
    // Clear existing data if requested
    if (options.clearExisting) {
      console.log(`🗑️ Clearing existing data from ${collectionName}...`);
      const querySnapshot = await getDocs(collection(db, collectionName));
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      console.log(`✅ Cleared ${querySnapshot.docs.length} existing records from ${collectionName}`);
    }

    // Process data in batches
    const batchSize = options.batchSize || 50;
    const batches = [];

    for (let i = 0; i < data.length; i += batchSize) {
      batches.push(data.slice(i, i + batchSize));
    }

    console.log(`📦 Seeding ${collectionName} in ${batches.length} batches...`);

    // Process each batch
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(`   Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} records)...`);

      const batchPromises = batch.map(async (item, itemIndex) => {
        try {
          const globalIndex = batchIndex * batchSize + itemIndex;

          // Ensure each document has required fields
          const documentData = {
            ...item,
            createdAt: item.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            seedVersion: '1.0.0',
            seedTimestamp: new Date().toISOString()
          };

          await addDoc(collection(db, collectionName), documentData);
          result.successCount++;

          if ((globalIndex + 1) % 10 === 0) {
            console.log(`     ✅ Seeded ${globalIndex + 1}/${data.length} records...`);
          }
        } catch (error) {
          result.errorCount++;
          const errorMessage = `Record ${itemIndex}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          result.errors.push(errorMessage);
          console.error(`     ❌ Error seeding record ${itemIndex}:`, error);
        }
      });

      await Promise.all(batchPromises);

      // Small delay between batches to avoid rate limiting
      if (batchIndex < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    result.duration = Date.now() - startTime;

    if (result.errorCount === 0) {
      console.log(`✅ Successfully seeded ${result.successCount} records to ${collectionName} in ${result.duration}ms`);
    } else {
      console.log(`⚠️ Seeded ${result.successCount}/${result.totalRecords} records to ${collectionName} (${result.errorCount} errors) in ${result.duration}ms`);
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
 * Seed all collections to Firestore
 */
export async function seedAllCollections(
  db: any, // Firebase Firestore instance
  options: {
    clearExisting?: boolean;
    batchSize?: number;
    includeCollections?: string[];
    excludeCollections?: string[];
  } = {}
): Promise<SeedSummary> {
  const startTime = Date.now();

  console.log('🌱 Starting complete database seeding...');
  console.log(`📊 Configuration:`, {
    clearExisting: options.clearExisting || false,
    batchSize: options.batchSize || 50,
    includeCollections: options.includeCollections || 'all',
    excludeCollections: options.excludeCollections || 'none'
  });

  // Filter collections based on options
  let collectionsToSeed = seedCollections;

  if (options.includeCollections && options.includeCollections.length > 0) {
    collectionsToSeed = collectionsToSeed.filter(col =>
      options.includeCollections!.includes(col.name)
    );
  }

  if (options.excludeCollections && options.excludeCollections.length > 0) {
    collectionsToSeed = collectionsToSeed.filter(col =>
      !options.excludeCollections!.includes(col.name)
    );
  }

  console.log(`📦 Seeding ${collectionsToSeed.length} collections:`,
    collectionsToSeed.map(col => `${col.name} (${col.data.length} records)`));

  const results: SeedResult[] = [];

  // Seed each collection
  for (const seedCollectionData of collectionsToSeed) {
    console.log(`\n🔄 Processing collection: ${seedCollectionData.name}`);
    console.log(`   Description: ${seedCollectionData.description}`);

    const result = await seedCollection(
      seedCollectionData.name,
      seedCollectionData.data,
      db,
      options
    );

    results.push(result);
  }

  // Calculate summary
  const summary: SeedSummary = {
    totalCollections: collectionsToSeed.length,
    totalRecords: results.reduce((sum, result) => sum + result.totalRecords, 0),
    successfulRecords: results.reduce((sum, result) => sum + result.successCount, 0),
    failedRecords: results.reduce((sum, result) => sum + result.errorCount, 0),
    collections: results,
    totalDuration: Date.now() - startTime,
    timestamp: new Date().toISOString()
  };

  // Print summary
  console.log('\n🏁 Seeding completed!');
  console.log('📊 Summary:');
  console.log(`   Collections processed: ${summary.totalCollections}`);
  console.log(`   Total records: ${summary.totalRecords}`);
  console.log(`   Successful: ${summary.successfulRecords}`);
  console.log(`   Failed: ${summary.failedRecords}`);
  console.log(`   Success rate: ${((summary.successfulRecords / summary.totalRecords) * 100).toFixed(1)}%`);
  console.log(`   Total duration: ${summary.totalDuration}ms`);

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

  return summary;
}

/**
 * Verify seeded data by checking record counts
 */
export async function verifySeedData(db: any): Promise<{[key: string]: number}> {
  console.log('🔍 Verifying seeded data...');

  const counts: {[key: string]: number} = {};

  for (const seedCollectionData of seedCollections) {
    try {
      const querySnapshot = await getDocs(collection(db, seedCollectionData.name));
      counts[seedCollectionData.name] = querySnapshot.docs.length;
      console.log(`   ${seedCollectionData.name}: ${counts[seedCollectionData.name]} records`);
    } catch (error) {
      console.error(`   ❌ Error checking ${seedCollectionData.name}:`, error);
      counts[seedCollectionData.name] = -1;
    }
  }

  return counts;
}

/**
 * Get seed configuration information
 */
export function getSeedConfiguration() {
  return {
    collections: seedConfiguration,
    totalCollections: seedCollections.length,
    collectionsInfo: seedCollections.map(col => ({
      name: col.name,
      recordCount: col.data.length,
      description: col.description
    }))
  };
}

/**
 * Quick seed function for development
 */
export async function quickSeed(db: any, collectionNames?: string[]) {
  console.log('⚡ Quick seeding for development...');

  const options = {
    clearExisting: true,
    batchSize: 25,
    includeCollections: collectionNames
  };

  return await seedAllCollections(db, options);
}

// Export individual seed data for direct usage
export {
  heritageSpots,
  documents,
  documentsHcm,
  documentCategories,
  miniGames,
  overviewStats,
  learningModules,
  quizzes,
  vrContent,
  siteContent,
  seedConfiguration
};
