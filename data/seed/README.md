# Heritage Journey - Refined Seed Data

## 📋 Tổng quan

Thư mục này chứa dữ liệu seed đã được refactor hoàn toàn để phù hợp với cấu trúc landing page và các component của ứng dụng Heritage Journey - Hành Trình Theo Dấu Chân Bác.

## 🚀 Phiên bản 2.0 (Refined)

### 📁 Cấu trúc file mới

```
data/seed/
├── landing-page-content.json          # Nội dung tất cả section trên landing page
├── heritage-spots-refined.json        # 8 di tích lịch sử quan trọng
├── documents-refined.json              # 8 tài liệu + 4 danh mục
├── mini-games-refined.json             # 6 trò chơi giáo dục
├── vr-content-refined.json             # 6 trải nghiệm VR + 2 bộ sưu tập
├── seed-configuration-refined.json     # Cấu hình seed và metadata
└── index.ts                           # Export tất cả seed data
```

### 🎯 Nội dung chi tiết

#### 1. Landing Page Content (`landing-page-content.json`)
- **Hero Section**: Title, subtitle, description, stats, action button
- **Introduction Section**: Highlights, video path, call to action
- **Documents Section**: Categories, items, call to action
- **VR Technology Section**: Features, experiences, call to action
- **Mini Game Section**: Games list, achievements, call to action

#### 2. Heritage Spots (`heritage-spots-refined.json`)
- **8 di tích lịch sử**: Kim Liên, Pác Bó, Bến Nhà Rồng, Ba Đình, Phủ Chủ tịch, Tân Trào, Việt Bắc, Ao Sen
- **Thông tin đầy đủ**: Location, map position, significance, visit info, media, highlights
- **Tương thích với MapSection**: Map coordinates, side positioning, interactive elements

#### 3. Documents (`documents-refined.json`)
- **4 danh mục**: Văn bản lịch sử, Hình ảnh, Video tư liệu, Ghi âm
- **8 tài liệu**: Tuyên ngôn độc lập, Di chúc, ảnh Paris, video Ba Đình, etc.
- **Metadata đầy đủ**: File info, download count, view count, tags

#### 4. Mini Games (`mini-games-refined.json`)
- **6 trò chơi**: Timeline quiz, knowledge quiz, puzzle, quotes matching, museum exploration, chronology sorting
- **Game mechanics**: Difficulty, time, scoring, rewards, badges
- **Educational value**: Learning objectives, interactive elements

#### 5. VR Content (`vr-content-refined.json`)
- **6 trải nghiệm VR**: Kim Liên, Pác Bó, Ba Đình 1945, Phủ Chủ tịch, Bến Nhà Rồng, Tân Trào
- **2 bộ sưu tập**: Life journey, Revolutionary sites
- **Technical specs**: Device support, quality settings, interactive elements

## 🛠️ Cách sử dụng

### 1. Khởi tạo dữ liệu qua Admin Panel
```typescript
// Truy cập: /admin → Data Initialization Panel
// Click "Khởi tạo Dữ liệu" hoặc "Reset Dữ liệu"
```

### 2. Khởi tạo dữ liệu bằng code
```typescript
import { initializeRefinedSeedData, quickSeedRefined } from '../../scripts/seedRefined';

// Khởi tạo an toàn (không xóa dữ liệu cũ)
await initializeRefinedSeedData({
  clearExisting: false,
  batchSize: 25,
  validateData: true
});

// Reset hoàn toàn (cho development)
await quickSeedRefined();
```

### 3. Import dữ liệu trong component
```typescript
import {
  landingPageContent,
  heritageSpots,
  documentsData,
  miniGames,
  vrContent
} from '../../data/seed';
```

## 📊 Thống kê dữ liệu

| Collection | Documents | Description |
|------------|-----------|-------------|
| Landing Page Content | 1 | Tất cả section trên landing page |
| Heritage Spots | 8 | Di tích lịch sử quan trọng |
| Document Categories | 4 | Danh mục tài liệu |
| Documents | 8 | Tài liệu lịch sử |
| Mini Games | 6 | Trò chơi giáo dục |
| VR Experiences | 6 | Trải nghiệm thực tế ảo |
| VR Collections | 2 | Bộ sưu tập VR |
| **Tổng cộng** | **35** | **Tất cả nội dung** |

## 🔄 So sánh với phiên bản cũ

### Phiên bản 1.0 (Legacy)
- ❌ Dữ liệu phân tán, không đồng bộ
- ❌ Cấu trúc không phù hợp với component
- ❌ Thiếu metadata và validation
- ❌ Khó bảo trì và mở rộng

### Phiên bản 2.0 (Refined)
- ✅ Dữ liệu tập trung, có cấu trúc
- ✅ Hoàn toàn phù hợp với landing page
- ✅ Metadata đầy đủ, validation tốt
- ✅ Dễ bảo trì và mở rộng
- ✅ Hỗ trợ TypeScript
- ✅ Documentation đầy đủ

## 🎨 Tính năng nổi bật

### 1. Landing Page Integration
- Hero Section với stats động
- Introduction với video và highlights
- Documents với categories và preview
- VR Technology với features và experiences
- Mini Games với achievements và rewards

### 2. Heritage Spots Enhancement
- Map positioning chính xác
- Interactive elements
- Virtual tour links
- Visit information
- Media galleries

### 3. Rich Document Management
- Hierarchical categories
- Full metadata
- Download tracking
- Search optimization
- File management

### 4. Educational Gaming
- Diverse game types
- Progress tracking
- Achievement system
- Learning objectives
- Difficulty progression

### 5. Immersive VR Experiences
- Multi-device support
- Quality adaptation
- Interactive elements
- Collection management
- Performance optimization

## 🚨 Migration Notes

### Từ phiên bản cũ sang mới:
1. **Backup dữ liệu cũ** trước khi migrate
2. **Chạy script reset** để xóa dữ liệu cũ
3. **Khởi tạo dữ liệu mới** bằng refined seed
4. **Test các component** để đảm bảo hoạt động đúng
5. **Update các service** nếu cần thiết

### Breaking changes:
- Structure của hero content đã thay đổi
- Heritage spots có thêm nhiều field mới
- Documents được tổ chức theo categories
- VR content được phân chia thành experiences và collections

## 📞 Hỗ trợ

Nếu có vấn đề khi sử dụng refined seed data:

1. **Kiểm tra console** để xem lỗi chi tiết
2. **Xem Firebase** để kiểm tra dữ liệu đã được seed chưa
3. **Chạy validation** để đảm bảo data integrity
4. **Contact team** để được hỗ trợ

---

*Tài liệu này được cập nhật theo phiên bản 2.0.0 - Ngày 23/09/2025*
