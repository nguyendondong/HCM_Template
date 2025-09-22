#!/usr/bin/env node

/**
 * Script kiểm tra Firebase environment variables
 * Usage: node scripts/check-env.js
 */

import fs from 'fs';
import path from 'path';

const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
];

const optionalEnvVars = [
  'VITE_FIREBASE_DATABASE_URL',
  'VITE_FIREBASE_MEASUREMENT_ID'
];

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ File .env không tồn tại!');
  console.log('📝 Hướng dẫn setup:');
  console.log('   1. cp .env.example .env');
  console.log('   2. Điền Firebase config vào .env');
  console.log('   3. Xem ENV_SETUP.md để biết chi tiết\n');
  process.exit(1);
}

// Read .env file
const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
const envVars = {};

envLines.forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

// Check required variables
let hasErrors = false;
const missingVars = [];
const emptyVars = [];

requiredEnvVars.forEach(varName => {
  if (!envVars[varName]) {
    missingVars.push(varName);
    hasErrors = true;
  } else if (envVars[varName] === 'your-api-key-here' ||
             envVars[varName].includes('your-') ||
             envVars[varName].length < 10) {
    emptyVars.push(varName);
    hasErrors = true;
  }
});

// Check optional variables
optionalEnvVars.forEach(varName => {
  if (envVars[varName]) {
  }
});

// Summary
if (hasErrors) {
  if (missingVars.length > 0) {
    console.log(`\n🔧 Missing variables (${missingVars.length}):`);
    missingVars.forEach(varName => {
      console.log(`   - ${varName}`);
    });
  }

  if (emptyVars.length > 0) {
    console.log(`\n🔧 Variables with placeholder values (${emptyVars.length}):`);
    emptyVars.forEach(varName => {
      console.log(`   - ${varName}: "${envVars[varName]}"`);
    });
  }

  console.log('\n📖 Next steps:');
  console.log('   1. Vào Firebase Console: https://console.firebase.google.com/');
  console.log('   2. Chọn project → Project Settings');
  console.log('   3. Copy Firebase config values');
  console.log('   4. Update .env file');
  console.log('   5. Run: npm run check-env');

  process.exit(1);
}
