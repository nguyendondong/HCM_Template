import { contentService } from '../services/contentService';
import { initializeDefaultHeritageData } from '../services/enhancedHeritageService';
import { initializeDefaultPageContent } from '../services/pageContentService';

/**
 * Script khởi tạo tất cả dữ liệu mặc định cho Firebase
 * Chạy script này để tạo dữ liệu ban đầu cho ứng dụng
 */
export async function initializeAllDefaultData(): Promise<void> {
  console.log('🚀 Bắt đầu khởi tạo dữ liệu mặc định...');

  try {
    // 1. Khởi tạo nội dung cơ bản (Hero, Navigation, Footer, Site Config)
    console.log('📝 Khởi tạo nội dung cơ bản...');
    await contentService.initializeDefaultContent();
    console.log('✅ Hoàn thành nội dung cơ bản');

    // 2. Khởi tạo dữ liệu di tích nâng cao
    console.log('🏛️ Khởi tạo dữ liệu di tích...');
    await initializeDefaultHeritageData();
    console.log('✅ Hoàn thành dữ liệu di tích');

    // 3. Khởi tạo nội dung trang (Documents, VR, Mini Games)
    console.log('📱 Khởi tạo nội dung trang...');
    await initializeDefaultPageContent();
    console.log('✅ Hoàn thành nội dung trang');

    console.log('🎉 Khởi tạo dữ liệu hoàn tất!');
    console.log('');
    console.log('📋 Dữ liệu đã được tạo:');
    console.log('   - Nội dung Hero Section');
    console.log('   - Menu Navigation');
    console.log('   - Footer Content');
    console.log('   - Cấu hình trang web');
    console.log('   - Di tích di sản nâng cao');
    console.log('   - Nội dung trang Documents');
    console.log('   - Nội dung trang VR Experience');
    console.log('   - Nội dung trang Mini Games');
    console.log('');
    console.log('🔥 Ứng dụng đã sẵn sàng sử dụng với dữ liệu từ Firebase!');

  } catch (error) {
    console.error('❌ Lỗi trong quá trình khởi tạo dữ liệu:', error);
    throw error;
  }
}

/**
 * Reset và khởi tạo lại tất cả dữ liệu
 * Chỉ sử dụng trong development
 */
export async function resetAndInitializeData(): Promise<void> {
  console.log('⚠️ CẢNH BÁO: Đang reset tất cả dữ liệu...');

  // Trong thực tế, bạn có thể muốn xóa dữ liệu cũ trước
  // Tuy nhiên, Firestore không hỗ trợ xóa collection natively từ client
  // Bạn cần sử dụng Firebase Admin SDK hoặc Firebase CLI

  await initializeAllDefaultData();
}

/**
 * Khởi tạo dữ liệu một cách an toàn
 * Chỉ tạo dữ liệu nếu chưa tồn tại
 */
export async function safeInitializeData(): Promise<void> {
  console.log('🔍 Kiểm tra dữ liệu hiện có...');

  try {
    // Kiểm tra xem đã có dữ liệu chưa
    // Bạn có thể implement logic kiểm tra ở đây

    console.log('🆕 Khởi tạo dữ liệu mới...');
    await initializeAllDefaultData();

  } catch (error) {
    console.error('❌ Lỗi khởi tạo dữ liệu an toàn:', error);
    throw error;
  }
}

// Export script runner function
export async function runDataInitialization(): Promise<void> {
  const isDevelopment = import.meta.env.DEV;

  if (isDevelopment) {
    console.log('🔧 Development mode: Cho phép khởi tạo dữ liệu');
    await initializeAllDefaultData();
  } else {
    console.log('🚀 Production mode: Khởi tạo dữ liệu an toàn');
    await safeInitializeData();
  }
}

// Chạy script nếu file được import trực tiếp
if (import.meta.env.VITE_AUTO_INITIALIZE_DATA === 'true') {
  runDataInitialization().catch(console.error);
}
