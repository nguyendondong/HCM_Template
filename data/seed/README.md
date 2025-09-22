# Dữ liệu Seed cho Di sản Hồ Chí Minh

## Tổng quan

Thư mục `data/seed` chứa tất cả dữ liệu mẫu đã được tổng hợp và tích hợp từ nhiều nguồn khác nhau để tạo thành một bộ dữ liệu hoàn chỉnh về di sản Chủ tịch Hồ Chí Minh.

## Cấu trúc dữ liệu

### 1. Heritage Spots (heritage-spots-ho-chi-minh.json)
**8 khu di tích chính:**
- Kim Liên - Quê hương Chủ tịch Hồ Chí Minh
- Pác Bó - Cội nguồn cách mạng Việt Nam
- Bến Nhà Rồng - Bảo tàng Hồ Chí Minh
- Khu di tích Hà Nội
- Tân Trào - Thủ đô Khu giải phóng
- Khu di tích Huế
- Bảo tàng Hồ Chí Minh Cần Thơ
- Khu lưu niệm Cô Tô

**Dữ liệu bao gồm:**
- Thông tin cơ bản (tên, mô tả, vị trí)
- Tọa độ bản đồ và vị trí hiển thị
- Thư viện media (ảnh, video)
- Các giai đoạn lịch sử
- Nội dung VR/360°
- Thông tin tham quan
- Mức độ tương tác

### 2. Documents (documents-ho-chi-minh.json)
**8 danh mục tài liệu:**
- Tuổi thơ và gia đình
- Thời kỳ học tập
- Hành trình ra nước ngoài
- Hoạt động cách mạng
- Tác phẩm văn học
- Thư từ cá nhân
- Thời kỳ lãnh đạo Nhà nước
- Quan hệ quốc tế

**Mỗi danh mục chứa:**
- Thông tin tổng quan
- Danh sách tài liệu chi tiết
- Loại tài liệu (giấy tờ, ảnh, video, v.v.)
- Link tải xuống và thumbnail
- Mức độ quan trọng

### 3. Mini Games (mini-games-ho-chi-minh.json)
**5 loại trò chơi:**
- Quiz kiến thức cơ bản
- Quiz kiến thức nâng cao
- Khám phá di tích tương tác
- Trò chơi ghép từ
- Sắp xếp thời gian

**Tính năng:**
- Nhiều loại câu hỏi (trắc nghiệm, điền từ, vị trí bản đồ)
- Hệ thống điểm số và thành tích
- Độ khó đa dạng
- Giới hạn thời gian

### 4. Overview Stats (overview-stats-ho-chi-minh.json)
**5 nhóm thống kê:**
- Thống kê tổng quan
- Dòng thời gian lịch sử
- Phân bố địa lý di tích
- Tác động cách mạng
- Công tác bảo tồn di sản

### 5. Learning Modules (ho-chi-minh-learning-modules.json)
**6 module học tập:**
- Tiểu sử Chủ tịch Hồ Chí Minh
- Hành trình cách mạng
- Tư tưởng Hồ Chí Minh
- Phong cách lãnh đạo
- Tác động văn hóa
- Sự công nhận quốc tế

### 6. Quizzes (ho-chi-minh-quizzes.json)
**4 bộ câu hỏi chuyên sâu:**
- Hành trình cuộc đời
- Các sự kiện lịch sử
- Thành tựu cách mạng
- Triết lý và tư tưởng

### 7. VR Content (ho-chi-minh-vr-content.json)
**4 trải nghiệm VR:**
- Tour di tích ảo
- Tái hiện lịch sử
- Trải nghiệm immersive
- Dòng thời gian tương tác

### 8. Site Content (ho-chi-minh-content.json)
**Nội dung tĩnh website:**
- Hero section
- Navigation menu
- Footer
- Metadata

## Cách sử dụng

### 1. Import trực tiếp
```typescript
import heritageSpots from './data/seed/heritage-spots-ho-chi-minh.json';
import documents from './data/seed/documents-ho-chi-minh.json';
// ... các file khác
```

### 2. Sử dụng Seed Function
```typescript
import { seedAllCollections, quickSeed } from './data/seedFirestore';
import { db } from './lib/firebase';

// Seed tất cả collections
await seedAllCollections(db, {
  clearExisting: true,
  batchSize: 50
});

// Quick seed cho development
await quickSeed(db, ['heritage-spots', 'documents']);
```

### 3. Seed từng collection
```typescript
import { seedCollection } from './data/seedFirestore';
import heritageSpots from './data/seed/heritage-spots-ho-chi-minh.json';

await seedCollection('heritage-spots', heritageSpots, db, {
  clearExisting: true
});
```

## Cấu hình Seed

File `seed-configuration.json` chứa thông tin về:
- Tên collection trong Firestore
- File nguồn dữ liệu
- Số lượng bản ghi
- Cấu trúc dữ liệu
- Các category và timeline

## Tính năng nổi bật

### 1. Dữ liệu hoàn chỉnh
- Tích hợp từ `heritageSpots.ts`, `seedData.ts` và các file seed hiện có
- Bảo tồn metadata phong phú và nội dung giáo dục
- Cấu trúc nhất quán và có tổ chức

### 2. Hệ thống Seeding thông minh
- Xử lý theo batch để tránh rate limiting
- Xóa dữ liệu cũ tùy chọn
- Theo dõi lỗi và báo cáo chi tiết
- Hỗ trợ seed từng collection hoặc toàn bộ

### 3. Tính linh hoạt
- Có thể include/exclude collections cụ thể
- Cấu hình batch size
- Kiểm tra dữ liệu sau khi seed
- Hỗ trợ development và production

### 4. Nội dung đa dạng
- Văn bản tiếng Việt phong phú
- Metadata chi tiết cho từng mục
- Hệ thống tag và categorization
- Nội dung VR và tương tác

## Lưu ý khi sử dụng

1. **Firebase Configuration**: Cần cấu hình Firebase trước khi sử dụng seed functions
2. **Permissions**: Đảm bảo có quyền ghi vào Firestore
3. **Rate Limiting**: Sử dụng batch size phù hợp để tránh giới hạn
4. **Development vs Production**: Sử dụng `quickSeed` cho development, `seedAllCollections` cho production

## Thống kê

- **Tổng số collections**: 8
- **Tổng số bản ghi**: 50+
- **Kích thước**: ~200KB (compressed)
- **Ngôn ngữ**: Tiếng Việt chính, một số nội dung đa ngôn ngữ
- **Cập nhật**: 2024-01-01

## Đóng góp

Khi thêm dữ liệu mới:
1. Tuân thủ cấu trúc hiện tại
2. Bao gồm metadata đầy đủ
3. Cập nhật `seed-configuration.json`
4. Test seed functions
5. Cập nhật documentation
