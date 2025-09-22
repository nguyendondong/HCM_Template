# 🔥 Firebase Dynamic Data Migration Guide

Hướng dẫn chi tiết về việc chuyển đổi từ hard-coded data sang Firebase dynamic data cho Heritage Journey App.

## 📋 Tổng quan

Dự án đã được chuyển đổi hoàn toàn từ hard-coded data sang dynamic data với Firebase Firestore. Tất cả nội dung trong ứng dụng giờ đây được quản lý thông qua Firebase và có thể cập nhật real-time.

## 🗂️ Cấu trúc Dữ liệu Mới

### 1. Content Management Collections

#### `heroContent`
- **Mục đích**: Quản lý nội dung Hero Section
- **Schema**: `HeroContent`
- **Bao gồm**: title, subtitle, description, stats, actionButton, backgroundElements

#### `navigationContent`
- **Mục đích**: Quản lý menu navigation
- **Schema**: `NavigationContent`
- **Bao gồm**: logo, menuItems, mobileMenuEnabled

#### `footerContent`
- **Mục đích**: Quản lý nội dung footer
- **Schema**: `FooterContent`
- **Bao gồm**: quote, description, actionButton, copyright, socialLinks

#### `siteConfig`
- **Mục đích**: Cấu hình tổng thể website
- **Schema**: `SiteConfig`
- **Bao gồm**: siteName, features toggles, SEO settings, contact info

### 2. Page Content Collections

#### `documentsContent`
- **Mục đích**: Nội dung trang Documents
- **Schema**: `DocumentsContent`
- **Bao gồm**: categories, featuredDocument

#### `vrContent`
- **Mục đích**: Nội dung trang VR Experience
- **Schema**: `VRContent`
- **Bao gồm**: features, experiences, benefits

#### `miniGameContent`
- **Mục đích**: Nội dung trang Mini Games
- **Schema**: `MiniGameContent`
- **Bao gồm**: games, achievements, leaderboard

### 3. Enhanced Heritage Collections

#### `enhancedHeritageSpots`
- **Mục đích**: Thông tin chi tiết về di tích
- **Schema**: `EnhancedHeritageSpot`
- **Bao gồm**: visitingInfo, images, videos, audioGuides, vrExperience, timeline, quizzes

#### `quizzes`
- **Mục đích**: Câu hỏi quiz giáo dục
- **Schema**: `Quiz`
- **Bao gồm**: questions, categories, difficulty levels

#### `userProgress`
- **Mục đích**: Theo dõi tiến độ học tập của user
- **Schema**: `UserProgress`
- **Bao gồm**: heritageSpots visited, quiz scores, achievements, points

#### `heritageComments`
- **Mục đích**: Bình luận và đánh giá của user
- **Schema**: `HeritageComment`
- **Bao gồm**: ratings, comments, replies, helpful votes

## 🛠️ Services được tạo

### 1. Content Management Services

#### `contentService.ts`
```typescript
// Quản lý nội dung cơ bản
- getHeroContent()
- getNavigationContent()
- getFooterContent()
- getSiteConfig()
- subscribeToContent() // Real-time updates
```

#### `pageContentService.ts`
```typescript
// Quản lý nội dung trang
- getDocumentsContent()
- getVRContent()
- getMiniGameContent()
- subscribeToPageContent() // Real-time updates
```

#### `enhancedHeritageService.ts`
```typescript
// Quản lý di tích nâng cao
- getAllHeritageSpots()
- getFeaturedHeritageSpots()
- searchHeritageSpots()
- getHeritageSpotById()
```

### 2. Context Providers

#### `ContentContext.tsx`
- Quản lý state cho nội dung cơ bản
- Real-time subscriptions
- Specialized hooks: `useHeroContent()`, `useNavigation()`, `useSiteConfig()`

#### `PageContentContext.tsx`
- Quản lý state cho nội dung trang
- Real-time subscriptions
- Specialized hooks: `useDocumentsContent()`, `useVRContent()`, `useMiniGameContent()`

## 🚀 Cách sử dụng

### 1. Khởi tạo dữ liệu

#### Tự động (Development):
```bash
yarn data:init:dev
```

#### Thủ công:
```bash
yarn data:init
```

#### Trong code:
```typescript
import { initializeAllDefaultData } from './scripts/initializeData';

// Khởi tạo tất cả dữ liệu mặc định
await initializeAllDefaultData();
```

### 2. Sử dụng trong Components

#### Hero Section:
```typescript
import { useHeroContent } from '../contexts/ContentContext';

const HeroSection = () => {
  const { content, isLoading, refresh } = useHeroContent();

  if (isLoading) return <Loading />;
  if (!content) return <EmptyState />;

  return (
    <div>
      <h1>{content.title}</h1>
      <p>{content.subtitle}</p>
      {content.stats.map(stat => (
        <div key={stat.label}>
          <span>{stat.number}</span>
          <span>{stat.label}</span>
        </div>
      ))}
    </div>
  );
};
```

#### Navigation:
```typescript
import { useNavigation } from '../contexts/ContentContext';

const Navbar = () => {
  const { content, getActiveMenuItems } = useNavigation();
  const menuItems = getActiveMenuItems();

  return (
    <nav>
      <div>{content?.logo.text}</div>
      <ul>
        {menuItems.map(item => (
          <li key={item.id}>
            <a href={item.href}>{item.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
};
```

#### Documents Page:
```typescript
import { useDocumentsContent } from '../contexts/PageContentContext';

const DocumentsPage = () => {
  const { content, categories, featuredDocument } = useDocumentsContent();

  return (
    <div>
      <h1>{content?.title}</h1>
      <p>{content?.description}</p>

      {categories.map(category => (
        <div key={category.id}>
          <h3>{category.title}</h3>
          <p>{category.description}</p>
          {category.items.map(item => (
            <span key={item}>{item}</span>
          ))}
        </div>
      ))}

      {featuredDocument && (
        <div>
          <h2>{featuredDocument.title}</h2>
          <blockquote>{featuredDocument.quote}</blockquote>
        </div>
      )}
    </div>
  );
};
```

### 3. Real-time Updates

Tất cả content được cập nhật real-time khi có thay đổi trên Firebase:

```typescript
// Component tự động re-render khi data thay đổi
const MyComponent = () => {
  const { content } = useHeroContent(); // Tự động cập nhật

  return <div>{content?.title}</div>;
};
```

### 4. Admin Panel

#### Data Initialization Panel:
```typescript
import DataInitializationPanel from '../components/admin/DataInitializationPanel';

const AdminDashboard = () => {
  return (
    <div>
      <DataInitializationPanel />
    </div>
  );
};
```

## 🔧 Configuration

### Environment Variables (.env)

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_FIREBASE_MEASUREMENT_ID=G-ABCDEF

# Auto initialize data on dev startup
VITE_AUTO_INITIALIZE_DATA=true
```

### Firebase Security Rules

#### Firestore Rules (firestore.rules):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read access for content
    match /{collection}/{document} {
      allow read: if true;
      allow write: if request.auth != null &&
        request.auth.token.admin == true;
    }

    // User progress - users can only access their own data
    match /userProgress/{userId} {
      allow read, write: if request.auth != null &&
        request.auth.uid == userId;
    }

    // Comments - authenticated users can create/edit their own
    match /heritageComments/{commentId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth != null &&
        request.auth.uid == resource.data.userId;
    }
  }
}
```

## 📊 Migration Benefits

### ✅ Đã đạt được:

1. **Dynamic Content Management**
   - Tất cả nội dung có thể cập nhật từ Firebase
   - Real-time updates không cần reload trang
   - Structured data với TypeScript schemas

2. **Scalable Architecture**
   - Modular service design
   - Context-based state management
   - Specialized hooks cho từng loại content

3. **Enhanced User Experience**
   - Quiz system với progress tracking
   - Comment và rating system
   - User achievement tracking
   - Leaderboard functionality

4. **Admin Features**
   - Data initialization panel
   - Content management through Firebase Console
   - Analytics tracking capabilities

5. **SEO & Performance**
   - Server-side data fetching ready
   - Optimized loading states
   - Error handling và fallbacks

### 🔄 Real-time Features:

- Content updates ngay lập tức khi admin thay đổi
- User progress sync across devices
- Live leaderboard updates
- Real-time comment notifications

## 🎯 Next Steps

### Có thể mở rộng:

1. **Advanced Search**
   - Implement Algolia cho full-text search
   - Advanced filtering và faceted search

2. **Multilingual Support**
   - i18n với dynamic content
   - Language-specific content management

3. **Advanced Analytics**
   - User behavior tracking
   - Content performance metrics
   - A/B testing capabilities

4. **Enhanced User Features**
   - Social sharing
   - Bookmarks và favorites
   - Personal learning paths

5. **Mobile App Support**
   - React Native với cùng Firebase backend
   - Offline support với local caching

## 🏗️ File Structure

```
src/
├── types/
│   ├── content.ts              # Schema definitions
│   ├── heritage.ts             # Heritage types
│   └── firebase.ts             # Firebase types
├── services/
│   ├── contentService.ts       # Basic content management
│   ├── pageContentService.ts   # Page-specific content
│   ├── enhancedHeritageService.ts # Heritage spots
│   ├── authService.ts          # Authentication
│   └── storageService.ts       # File uploads
├── contexts/
│   ├── ContentContext.tsx      # Content state management
│   ├── PageContentContext.tsx  # Page content state
│   └── AuthContext.tsx         # Authentication state
├── components/
│   ├── admin/
│   │   └── DataInitializationPanel.tsx
│   ├── auth/
│   │   └── AuthForms.tsx
│   └── [other components]
├── scripts/
│   └── initializeData.ts       # Data initialization
└── lib/
    └── firebase.ts             # Firebase configuration
```

## 📚 API Reference

### Content Management

```typescript
// Get current active content
const heroContent = await contentService.getHeroContent();
const navContent = await contentService.getNavigationContent();

// Update content (admin only)
await contentService.updateHeroContent(id, {
  title: "New Title",
  subtitle: "New Subtitle"
});

// Subscribe to real-time updates
const unsubscribe = contentService.subscribeToHeroContent((content) => {
  setHeroContent(content);
});
```

### Heritage Management

```typescript
// Get all heritage spots
const spots = await enhancedHeritageService.getAllHeritageSpots();

// Get featured spots
const featured = await enhancedHeritageService.getFeaturedHeritageSpots(6);

// Search spots
const results = await enhancedHeritageService.searchHeritageSpots("Kim Liên");

// Get spot details
const spot = await enhancedHeritageService.getHeritageSpotById(id);
```

### User Progress

```typescript
// Get user progress
const progress = await userProgressService.getUserProgress(userId);

// Record quiz score
await userProgressService.recordQuizScore(userId, quizId, score);

// Get leaderboard
const leaderboard = await userProgressService.getLeaderboard(10);
```

---

🎉 **Chúc mừng!** Ứng dụng Heritage Journey đã được chuyển đổi hoàn toàn sang Firebase dynamic data với architecture mở rộng và maintainable!
