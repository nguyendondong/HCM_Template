// Script to initialize Firebase data for Heritage Journey
// This script seed data for Ho Chi Minh heritage theme

import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Bắt đầu khởi tạo dữ liệu Firebase cho chủ đề "HÀNH TRÌNH THEO DẤU CHÂN BÁC"...');

// For now, this is a placeholder script
// The actual data initialization will be handled by the frontend application
// when it starts up with VITE_AUTO_INITIALIZE_DATA=true

try {
  // Read package.json to verify project structure
  const packagePath = path.join(__dirname, '../package.json');
  const packageContent = JSON.parse(readFileSync(packagePath, 'utf8'));

  console.log(`📦 Project: ${packageContent.name}`);
  console.log('📋 Available data files for Ho Chi Minh theme:');

  // List available data files
  const dataFiles = [
    'heritage-spots-ho-chi-minh.json',
    'ho-chi-minh-quizzes.json',
    'ho-chi-minh-content.json',
    'ho-chi-minh-vr-content.json',
    'ho-chi-minh-learning-modules.json'
  ];

  dataFiles.forEach(file => {
    try {
      const filePath = path.join(__dirname, '../data/seed/', file);
      const data = JSON.parse(readFileSync(filePath, 'utf8'));
      console.log(`   ✅ ${file} - ${Object.keys(data).length || data.length || 'Ready'} items`);
    } catch (err) {
      console.log(`   ❌ ${file} - Not found`);
    }
  });

  console.log('\n💡 To initialize data:');
  console.log('   1. Start development server: yarn dev');
  console.log('   2. Or use development mode: yarn data:init:dev');
  console.log('   3. The app will auto-initialize Firebase data on first run');

  console.log('\n🇻🇳 Heritage theme: Uncle Ho\'s Revolutionary Journey');
  console.log('   - Kim Liên (Birthplace)');
  console.log('   - Pác Bó (Revolutionary base)');
  console.log('   - Bến Nhà Rồng (Departure point)');

  console.log('\n✅ Data verification complete!');

} catch (error) {
  console.error('❌ Error during data initialization check:', error.message);
  process.exit(1);
}
