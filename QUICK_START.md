# 🚀 Heritage Journey - Complete Setup Guide

## 📋 Prerequisites

```bash
# Kiểm tra requirements
node --version  # v20+ required for Firebase
yarn --version  # v1.22+ recommended
git --version   # Latest version
```

## 🔥 Firebase Project Setup

### 1. Tạo Firebase Project

1. Vào [Firebase Console](https://console.firebase.google.com/)
2. **Create a project** → Đặt tên "Heritage Journey Ho Chi Minh"
3. Enable Google Analytics (recommended)
4. Chọn **Default Account for Firebase**

### 2. Cấu hình Firebase Services

#### Authentication
```bash
# Vào Authentication → Sign-in method
✅ Enable Email/Password
✅ Enable Google (optional)
✅ Enable Anonymous (for guests)
```

#### Firestore Database
```bash
# Vào Firestore Database → Create database
✅ Start in test mode (for development)
✅ Choose location: asia-southeast1 (Singapore)
```

#### Storage
```bash
# Vào Storage → Get started
✅ Start in test mode
✅ Use same location as Firestore
```

#### Hosting (Optional)
```bash
# Vào Hosting → Get started
✅ Setup domain for production deploy
```

## 🎯 Environment Configuration

### 1. Setup Project

```bash
# Clone project nếu chưa có
git clone <repository-url>
cd HCM_Template

# Ensure Node.js >= 20.0.0 (required for Firebase)
node --version
# If not v20+, use nvm to switch: nvm use 20

# Install dependencies
yarn install

# Setup environment
cp .env.example .env
```

### 2. Get Firebase Config

1. **Project Settings** (⚙️) → **General** tab
2. **Your apps** → **Add app** → **Web** (</>)
3. App nickname: "Heritage Journey Web"
4. ✅ **Also set up Firebase Hosting**
5. Copy `firebaseConfig` object

### 3. Configure .env File

```env
# Thay thế values này bằng config từ Firebase Console
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=heritage-journey-xxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=heritage-journey-xxxx
VITE_FIREBASE_STORAGE_BUCKET=heritage-journey-xxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdefghijklmnop

# Development settings (sử dụng emulators)
VITE_USE_EMULATORS=true

# Optional: Analytics
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

## � Development Workflow

### 1. Verify Environment Setup

```bash
# Kiểm tra environment variables
yarn check-env
```

### 2. Start Firebase Emulators

```bash
# Start Firebase emulators (Auth, Firestore, Storage)
yarn firebase:emulators

# Hoặc start với UI dashboard
yarn firebase:emulators:ui
```

### 3. Seed Development Data

```bash
# Seed Ho Chi Minh heritage data vào emulator (safe)
yarn data:seed

# View seeded data at: http://127.0.0.1:4004/firestore
```

### 4. Start Development Server

```bash
# Start development server (emulator mode)
yarn dev

# Hoặc start với auto-initialization
yarn data:init:dev

# Server will start at http://localhost:5173
```

## 📊 Data Management System

### Available Scripts

| Command | Purpose | Environment | Safety |
|---------|---------|-------------|---------|
| `yarn check-env` | Verify Firebase config | All | ✅ Safe |
| `yarn data:seed` | Seed data to emulator | Emulator | ✅ Safe |
| `yarn data:seed:prod` | Seed data to production | Production | ⚠️ **Dangerous** |
| `yarn data:seed:prod:safe` | Seed with manual confirm | Production | ⚠️ **Requires --confirm** |

### Ho Chi Minh Heritage Data Collections

Sau khi seed data, Firestore sẽ chứa:

```
🔥 Firestore Collections:
├── heritage-spots/         # 3 di tích chính của Bác Hồ
│   ├── kim-lien-heritage-site
│   ├── pac-bo-heritage-site
│   └── ben-nha-rong-ho-chi-minh-museum
├── quizzes/               # 3 bộ câu hỏi trắc nghiệm
├── content/               # Nội dung giao diện
│   ├── hero-content
│   ├── navigation-content
│   ├── footer-content
│   └── site-config
├── learning-modules/      # 3 module học tập về cuộc đời Bác
├── learning-paths/        # Lộ trình học tập
├── vr-experiences/        # 3 trải nghiệm VR
├── vr-collections/        # Bộ sưu tập VR
├── user-progress/         # Demo user progress
└── app-settings/          # Cài đặt ứng dụng
```

### Sample Heritage Spot Data Format

```json
{
  "id": "kim-lien-heritage-site",
  "name": "Khu di tích Kim Liên - Quê hương Chủ tịch Hồ Chí Minh",
  "description": "Khu di tích quê hương Chủ tịch Hồ Chí Minh tại Kim Liên...",
  "location": {
    "province": "Nghệ An",
    "address": "Xã Kim Liên, huyện Nam Đàn, tỉnh Nghệ An",
    "coordinates": { "lat": 19.0583, "lng": 105.6342 }
  },
  "mapPosition": { "x": 25, "y": 30 },
  "side": "left",
  "historicalSignificance": "Nơi sinh và lớn lên của Chủ tịch Hồ Chí Minh",
  "period": "1890-1911",
  "images": ["/images/kim-lien-main.jpg"],
  "vrTourUrl": "/vr/kim-lien-tour",
  "isActive": true,
  "difficulty": 1,
  "estimatedDuration": 60,
  "tags": ["quê hương", "sinh thành", "tuổi thơ"]
}
```

## 🚀 Production Deployment

### Chuẩn bị Production

1. **Cập nhật .env cho production:**
```env
VITE_USE_EMULATORS=false
# Các config khác giữ nguyên
```

2. **Deploy Firestore Rules:**
```bash
yarn firebase:deploy:rules
```

3. **Seed Production Data (Cẩn thận!):**
```bash
# Cần service account key và --confirm flag
yarn data:seed:prod

# Hoặc manual confirmation
yarn data:seed:prod:safe --confirm
```

### Deploy Application

```bash
# Build production
yarn build

# Deploy to Firebase Hosting
yarn firebase:deploy

# Hoặc deploy riêng hosting
yarn firebase:deploy:hosting
```

## 🛠️ Development Commands

### Firebase Commands

```bash
# Firebase login
yarn firebase:login

# Start emulators with UI
yarn firebase:emulators:ui

# Deploy hosting only
yarn firebase:deploy:hosting

# Deploy security rules
yarn firebase:deploy:rules

# Serve locally
yarn firebase:serve
```

### Build Commands

```bash
# Development build (with emulators)
yarn build:emulators

# Production build
yarn build

# Development server (emulator mode)
yarn dev

# Development server (production mode)
yarn dev:prod

# Preview build
yarn preview
```

## 🔒 Security & Production Notes

### Firestore Security Rules

Hiện tại rules cho phép write trong development:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;
      allow write: if true; // TEMPORARY: for development
    }
  }
}
```

**⚠️ Quan trọng:** Cần update rules secure hơn cho production!

### Production Safety

1. **Service Account**: Cần `firebase-service-account.json` cho production seeding
2. **Backup**: Luôn backup data trước khi seed production
3. **Testing**: Luôn test với emulator trước
4. **Rules**: Update Firestore rules về secure trước khi deploy

## 🚨 Troubleshooting

### Common Issues

#### "Firebase not initialized"
```bash
# Check environment variables
yarn check-env

# Đảm bảo Firebase emulators đang chạy
yarn firebase:emulators
```

#### "Permission denied" errors
```bash
# Cho development với emulator
# Rules đã được cấu hình để allow write

# Cho production
yarn firebase:deploy:rules
```

#### "No data showing"
```bash
# Re-seed emulator data
yarn data:seed

# Check Firebase emulator UI
# http://127.0.0.1:4004/firestore
```

#### "Build errors"
```bash
# Clear và reinstall
rm -rf node_modules yarn.lock
yarn install

# Clear Vite cache
yarn dev --force
```

## 📖 Next Steps

Sau khi setup thành công:

1. ✅ **Explore App**: Xem 3 di tích Hồ Chí Minh đã được seed
2. ✅ **Customize Content**: Thêm di tích mới trong Firestore
3. ✅ **Test Features**: Quiz, VR experiences, learning modules
4. ✅ **Add Authentication**: Implement user login
5. ✅ **Deploy Production**: Push to Firebase Hosting

## 🆘 Support

- **Firebase Console**: [console.firebase.google.com](https://console.firebase.google.com)
- **Emulator UI**: [127.0.0.1:4004](http://127.0.0.1:4004) (khi chạy emulators)
- **Production Guide**: Xem `PRODUCTION_SEEDING_GUIDE.md`
- **Environment Setup**: Xem `SINGLE_ENV_SETUP.md`

### Data Seeding Options

#### Option 1: Automated Sample Data (Recommended)
```bash
# Seeds complete sample data including:
# - Hero content, Navigation, Footer
# - 10 heritage spots with rich content
# - Sample quizzes and learning modules
# - User progress templates

yarn seed:sample-data
```

#### Option 2: Import from CSV/JSON Files
```bash
# Prepare your data files in /data/seed/ folder
yarn import:heritage-spots
yarn import:content-data
yarn import:quiz-data
```

#### Option 3: Manual Admin Panel
```bash
# Start development
yarn dev

# Navigate to /admin (requires authentication)
# Use the Data Initialization Panel
```

## 📁 Sample Data Structure

```
/data/seed/
├── heritage-spots.json      # Heritage locations data
├── hero-content.json       # Homepage hero content
├── navigation.json         # Menu structure
├── footer-content.json     # Footer links & info
├── quizzes.json           # Quiz questions & answers
├── vr-content.json        # VR experience data
├── mini-games.json        # Game content & scoring
└── user-sample.json       # Sample user data
```

### Sample Heritage Spot Data Format

```json
{
  "id": "saigon-opera-house",
  "name": "Nhà hát Thành phố Hồ Chí Minh",
  "description": "Công trình kiến trúc Pháp cổ điển...",
  "location": {
    "latitude": 10.7769,
    "longitude": 106.7009,
    "address": "7 Lam Sơn, Quận 1, TP.HCM"
  },
  "mapPosition": { "x": 45, "y": 60 },
  "side": "left",
  "mediaGallery": [
    {
      "type": "image",
      "url": "/images/opera-house-main.jpg",
      "title": "Mặt tiền chính",
      "description": "Kiến trúc Pháp cổ điển"
    }
  ],
  "historicalPeriods": [
    {
      "name": "Thời Pháp thuộc",
      "startYear": 1897,
      "endYear": 1954,
      "description": "Xây dựng theo phong cách Opera Paris"
    }
  ],
  "vrContent": {
    "has360View": true,
    "virtualTourUrl": "/vr/opera-house-tour",
    "interactionPoints": [
      {
        "name": "Sảnh chính",
        "coordinates": { "x": 0.5, "y": 0.3 },
        "description": "Sảnh tiếp tân với kiến trúc tân cổ điển"
      }
    ]
  },
  "difficulty": 2,
  "tags": ["kiến trúc", "pháp", "nhà hát", "lịch sử"],
  "accessibility": {
    "wheelchairAccessible": true,
    "hasAudioGuide": true,
    "hasSignLanguage": false
  },
  "isActive": true
}
```

## 🚀 Development Workflow

### 1. Start Development Server

```bash
# Check environment variables
yarn check-env

# Start development server (with auto-initialization)
yarn dev

# Server will start at http://localhost:5173
```

### 2. Initialize Sample Data (First Time)

```bash
# Development mode - creates sample data
yarn init:dev

# Production mode - minimal data only
yarn init:prod
```

### 3. Development Commands

```bash
# Start with clean data
yarn dev:clean

# Start with sample data
yarn dev:sample

# Check Firebase connection
yarn firebase:test

# Deploy security rules
yarn firebase:deploy:rules

# Build for production
yarn build

# Preview production build
yarn preview
```

## 🛠️ Admin Panel Access

### First-time Admin Setup

1. **Start development**: `yarn dev`
2. **Navigate to**: `http://localhost:5173/admin`
3. **Sign in** with Google or Email
4. **Set admin privileges** (automatically set for first user)

### Admin Panel Features

| Feature | Description | Access |
|---------|-------------|---------|
| **Content Management** | Edit hero, navigation, footer content | `/admin/content` |
| **Heritage Spots** | Manage heritage locations & details | `/admin/heritage` |
| **Data Initialization** | Setup fresh environments | `/admin/data-init` |
| **Analytics Dashboard** | Monitor site performance | `/admin/analytics` |
| **User Management** | Handle user accounts & permissions | `/admin/users` |

## � Database Collections Overview

After initialization, your Firestore will contain:

```
🔥 Firestore Collections:
├── heroContent/          # Homepage hero section content
├── navigationContent/    # Menu structure & branding
├── footerContent/       # Footer links & contact info
├── siteConfig/          # Global site configuration
├── documentsContent/    # Document management
├── vrContent/           # VR experience data
├── miniGameContent/     # Game content & scoring
├── enhancedHeritageSpots/ # Heritage locations (enhanced)
├── quizzes/             # Interactive quizzes
├── userProgress/        # User learning progress
├── heritageComments/    # User comments & ratings
├── learningModules/     # Structured learning content
├── siteAnalytics/       # Site performance metrics
├── spotAnalytics/       # Heritage spot analytics
└── systemNotifications/ # System alerts & messages
```

## 🚨 Troubleshooting

### Common Issues

#### "Firebase not initialized"
```bash
# Check environment variables
yarn check-env

# Verify Firebase config in console
# Make sure all VITE_FIREBASE_* variables are set
```

#### "Permission denied" errors
```bash
# Deploy security rules
yarn firebase:deploy:rules

# Or initialize with test rules
yarn firebase:init:rules
```

#### "No data showing"
```bash
# Re-initialize data
yarn init:data

# Check Firebase console for data
# Verify collections exist and contain documents
```

#### "Build errors"
```bash
# Clear node modules and reinstall
rm -rf node_modules yarn.lock
yarn install

# Clear Vite cache
yarn dev -- --force
```

## 🔒 Security Configuration

### Firestore Security Rules
```javascript
// Auto-deployed with yarn firebase:deploy:rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read for content, admin write
    match /{collection}/{document} {
      allow read: if isPublicCollection(collection);
      allow write: if isAdmin();
    }

    // User-specific collections
    match /userProgress/{userId} {
      allow read, write: if isOwner(userId) || isAdmin();
    }
  }
}
```

### Storage Security Rules
```javascript
// Auto-deployed with security rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /heritage-spots/{allPaths=**} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
```

## 🚀 Deployment

### Development Deployment
```bash
# Build and deploy to Firebase Hosting
yarn build
yarn firebase:deploy

# Deploy specific components
yarn firebase:deploy:hosting
yarn firebase:deploy:rules
yarn firebase:deploy:functions
```

### Production Deployment
```bash
# Set production environment
export VITE_ENVIRONMENT=production

# Build optimized bundle
yarn build:prod

# Deploy to production
yarn deploy:prod
```

## 📖 Next Steps

After successful setup:

1. ✅ **Explore Admin Panel**: Configure content and heritage spots
2. ✅ **Customize Design**: Modify components in `/src/components/`
3. ✅ **Add Content**: Use data seeding system for your heritage data
4. ✅ **Setup Analytics**: Configure Google Analytics integration
5. ✅ **Deploy**: Push to production with Firebase Hosting

## 🆘 Support

- **Documentation**: See `/docs/` folder for detailed guides
- **Issues**: Check GitHub Issues for common problems
- **Firebase Docs**: [Firebase Documentation](https://firebase.google.com/docs)
- **React Docs**: [React Documentation](https://react.dev)
