#!/usr/bin/env node

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import { createInterface } from 'readline';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = dirname(__dirname);

// Collection mapping
const COLLECTIONS = {
  'mini-games': {
    file: 'mini-games-refined.json',
    key: 'miniGames',
    collection: 'mini-games'
  },
  'heritage-spots': {
    file: 'heritage-spots-refined.json',
    key: 'heritageSpots',
    collection: 'heritage-spots'
  },
  'documents': {
    file: 'documents-refined.json',
    key: 'documents',
    collection: 'documents'
  },
  'document-categories': {
    file: 'documents-refined.json',
    key: 'categories',
    collection: 'document-categories'
  },
  'vr-experiences': {
    file: 'vr-content-refined.json',
    key: 'vrExperiences',
    collection: 'vr-experiences'
  },
  'vr-featured': {
    file: 'vr-content-refined.json',
    key: 'vrFeatured',
    collection: 'vr-featured'
  },
  'site-config': {
    file: 'landing-page-content.json',
    key: 'heroSection',
    collection: 'heroContent'
  },
  'navigation': {
    file: 'navigation.json',
    key: null,
    collection: 'navigation'
  },
  'footer': {
    file: 'footer.json',
    key: null,
    collection: 'footer'
  }
};

function initializeFirebaseAdmin() {
  const isEmulator = process.env.SEED_TARGET === 'emulator';

  if (isEmulator) {
    console.log('🔧 Using Firebase Emulator');
    process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8084';
  } else {
    console.log('🌐 Using Firebase Production');
  }

  if (!admin.apps.length) {
    if (isEmulator) {
      admin.initializeApp({
        projectId: 'hcmtemplate'
      });
    } else {
      const serviceAccountPath = join(projectRoot, 'hcmtemplate.json');

      try {
        const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: serviceAccount.project_id
        });
      } catch (error) {
        console.error('❌ Error loading service account key:');
        console.error('   Make sure hcmtemplate.json exists in project root');
        process.exit(1);
      }
    }
  }

  return admin.firestore();
}

async function confirmProductionSeed(collectionName) {
  const isProduction = process.env.SEED_TARGET === 'production';

  if (!isProduction) return true;

  console.log('⚠️  WARNING: You are about to seed data to PRODUCTION Firebase!');
  console.log(`📊 Collection: ${collectionName}`);
  console.log(`🌐 Project: hcmtemplate (PRODUCTION)`);
  console.log('');

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('Are you sure you want to continue? (yes/no): ', (answer) => {
      rl.close();
      if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
        console.log('✅ Proceeding with production seed...');
        resolve(true);
      } else {
        console.log('❌ Seed cancelled');
        resolve(false);
      }
    });
  });
}

async function seedSingleCollection(collectionName) {
  const isProduction = process.env.SEED_TARGET === 'production';

  console.log(`🎯 Seeding collection: ${collectionName}`);
  console.log(`🌍 Environment: ${isProduction ? 'PRODUCTION' : 'EMULATOR'}`);

  const config = COLLECTIONS[collectionName];
  if (!config) {
    console.error(`❌ Unknown collection: ${collectionName}`);
    console.log('Available collections:', Object.keys(COLLECTIONS).join(', '));
    process.exit(1);
  }

  // Confirm for production
  if (isProduction) {
    const confirmed = await confirmProductionSeed(collectionName);
    if (!confirmed) {
      process.exit(0);
    }
  }

  const db = initializeFirebaseAdmin();

  try {
    // Load data
    const dataPath = join(projectRoot, 'data', 'seed', config.file);
    const data = JSON.parse(readFileSync(dataPath, 'utf8'));

    let items;
    if (Array.isArray(data)) {
      items = data;
    } else if (config.key) {
      items = data[config.key];
    } else {
      items = [data]; // Single document
    }

    if (!items || !Array.isArray(items)) {
      console.error(`❌ No ${config.key || 'data'} found in ${config.file}`);
      process.exit(1);
    }

    // Clear existing collection
    console.log(`🗑️ Clearing existing ${config.collection} collection...`);
    const collectionRef = db.collection(config.collection);
    const snapshot = await collectionRef.get();

    if (snapshot.size > 0) {
      const batch = db.batch();
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log(`   Deleted ${snapshot.size} existing documents`);
    }

    // Add new documents
    console.log(`📝 Adding ${items.length} documents to ${config.collection}...`);

    const addBatch = db.batch();
    items.forEach(item => {
      const docId = item.id || item.title || collectionRef.doc().id;
      const docRef = collectionRef.doc(docId);
      addBatch.set(docRef, {
        ...item,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    await addBatch.commit();

    console.log(`✅ Successfully seeded ${items.length} documents to ${config.collection}`);

    if (isProduction) {
      console.log('🌐 Production database updated successfully!');
    }

  } catch (error) {
    console.error(`❌ Error seeding ${collectionName}:`, error);
    process.exit(1);
  }
}

// Main execution
async function main() {
  const collectionName = process.argv[2];

  if (!collectionName) {
    console.log('❌ Please specify a collection name');
    console.log('Usage:');
    console.log('  yarn seed <collection-name>          # Seed to emulator');
    console.log('  yarn seed:prod <collection-name>     # Seed to production');
    console.log('');
    console.log('Available collections:');
    Object.keys(COLLECTIONS).forEach(name => {
      console.log(`  • ${name}`);
    });
    process.exit(1);
  }

  await seedSingleCollection(collectionName);
  process.exit(0);
}

main().catch(console.error);
