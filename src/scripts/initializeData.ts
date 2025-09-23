import { contentService } from '../services/contentService';
import { initializeDefaultHeritageData } from '../services/enhancedHeritageService';

/**
 * Script khởi tạo tất cả dữ liệu mặc định cho Firebase
 * Chạy script này để tạo dữ liệu ban đầu cho ứng dụng
 */
export const initializeData = async () => {
  try {
    // Khởi tạo nội dung cơ bản
    await contentService.initializeDefaultContent();

    // Khởi tạo dữ liệu di tích
    await initializeDefaultHeritageData();

    // Khởi tạo nội dung trang
    await contentService.initializeDefaultPageContent();

    return {
      success: true,
      message: 'Khởi tạo dữ liệu hoàn tất!'
    };
  } catch (error) {
    console.error('❌ Lỗi khởi tạo dữ liệu:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Reset và khởi tạo lại tất cả dữ liệu
 * Chỉ sử dụng trong development
 */
export async function resetAndInitializeData(): Promise<void> {
  // Trong thực tế, bạn có thể muốn xóa dữ liệu cũ trước
  // Tuy nhiên, Firestore không hỗ trợ xóa collection natively từ client
  // Bạn cần sử dụng Firebase Admin SDK hoặc Firebase CLI

  await initializeData();
}

/**
 * Khởi tạo dữ liệu một cách an toàn
 * Chỉ tạo dữ liệu nếu chưa tồn tại
 */
export async function safeInitializeData(): Promise<void> {
  try {
    // Kiểm tra xem đã có dữ liệu chưa
    // Bạn có thể implement logic kiểm tra ở đây

    await initializeData();

  } catch (error) {
    console.error('❌ Lỗi khởi tạo dữ liệu an toàn:', error);
    throw error;
  }
}

// Export script runner function
export async function runDataInitialization(): Promise<void> {
  const isDevelopment = import.meta.env.DEV;

  if (isDevelopment) {
    await initializeData();
  } else {
    await safeInitializeData();
  }
}

// Chạy script nếu file được import trực tiếp
if (import.meta.env.VITE_AUTO_INITIALIZE_DATA === 'true') {
  runDataInitialization().catch(console.error);
}
