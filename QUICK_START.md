# 🚀 HCM Heritage Template - Quick Start Guide

## 📋 Prerequisites

```bash
# Kiểm tra requirements
node --version  # v18+ required for Vite + Firebase
yarn --version  # v1.22+ recommended
git --version   # Latest version
```

## 🔥 Firebase Project Setup

### 1. Tạo Firebase Project

1. Vào [Firebase Console](https://console.firebase.google.com/)
2. **Create a project** → Đặt tên "HCM Heritage Template"
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

### 1. Clone và Setup Project

```bash
# Clone project
git clone <repository-url>
cd HCM_Template

# Install dependencies
yarn install

# Setup environment
cp .env.example .env
```

### 2. Get Firebase Config

1. **Project Settings** (⚙️) → **General** tab
2. **Your apps** → **Add app** → **Web** (</>)
3. App nickname: "HCM Heritage Web"
4. ✅ **Also set up Firebase Hosting**
5. Copy `firebaseConfig` object

### 3. Configure .env File

```env
# ===========================================
# 🔥 FIREBASE CONFIGURATION - DEVELOPMENT
# ===========================================
# For emulator development, these can be dummy values
# but they MUST be present for Firebase SDK to initialize

VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=hcmtemplate.firebaseapp.com
VITE_DATABASE_URL=https://hcmtemplate-default-rtdb.asia-southeast1.firebasedatabase.app
VITE_FIREBASE_PROJECT_ID=hcmtemplate
VITE_FIREBASE_STORAGE_BUCKET=hcmtemplate.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:your-app-id
VITE_MEASUREMENT_ID=G-YOUR-MEASUREMENT-ID

# ===========================================
# ⚙️  ENVIRONMENT SETTINGS - DEVELOPMENT
# ===========================================

VITE_USE_EMULATORS=true
VITE_ENV=development

# ===========================================
# 🔧 EMULATOR CONFIGURATION
# ===========================================

VITE_EMULATOR_HOST=127.0.0.1
VITE_FIRESTORE_EMULATOR_PORT=8084
VITE_AUTH_EMULATOR_PORT=9099
VITE_STORAGE_EMULATOR_PORT=9199

# ===========================================
# 👨‍💼 ADMIN SETTINGS
# ===========================================

VITE_ADMIN_SESSION_EXPIRE_DAYS=3

# ===========================================
# 🔧 FIREBASE SERVICE ACCOUNT
# ===========================================

GOOGLE_APPLICATION_CREDENTIALS=./hcmtemplate.json
```

**⚠️ Important**: Ngay cả khi dùng emulator, bạn vẫn cần điền đầy đủ Firebase config keys để tránh lỗi `invalid-api-key`.

## 🛠️ Development Workflow

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
# Seed refined data vào emulator (safe)
yarn data:seed

# Hoặc seed specific collection
yarn seed heritage-spots
yarn seed vr-experiences
yarn seed mini-games
yarn seed documents

# View seeded data at: http://127.0.0.1:4004/firestore
```

### 4. Start Development Server

```bash
# Start development server (emulator mode)
yarn dev

# Hoặc start với production Firebase (không emulator)
yarn dev:prod

# Server will start at http://localhost:5173
```

## 📊 Data Management System

### Available Scripts

| Command | Purpose | Environment | Safety |
|---------|---------|-------------|---------|
| `yarn check-env` | Verify Firebase config | All | ✅ Safe |
| `yarn data:seed` | Seed refined data to emulator | Emulator | ✅ Safe |
| `yarn data:seed:prod` | Seed data to production | Production | ⚠️ **Dangerous** |
| `yarn data:seed:prod:safe` | Seed with manual confirm | Production | ⚠️ **Requires --confirm** |
| `yarn seed [collection]` | Seed specific collection | Emulator | ✅ Safe |
| `yarn seed:prod [collection]` | Seed specific to production | Production | ⚠️ **Dangerous** |

### Available Data Collections

Sau khi seed data, Firestore sẽ chứa:

```
🔥 Firestore Collections:
├── heritage-spots/         # Di tích lịch sử HCM
├── vr-content/            # Trải nghiệm VR
├── documents/             # Tài liệu lịch sử
├── mini-games/            # Mini games tương tác
├── landing-page-content/  # Nội dung trang chủ
└── configuration/         # Cấu hình hệ thống
```

### Seed Data Files

```
/data/seed/
├── heritage-spots-refined.json      # Các di tích HCM
├── vr-content-refined.json         # Nội dung VR experiences
├── documents-refined.json          # Tài liệu lịch sử
├── mini-games-refined.json         # Game content
├── landing-page-content.json       # Homepage content
├── seed-configuration-refined.json # System config
└── README.md                       # Hướng dẫn seed data
```

## 🚀 Production Deployment

### Chuẩn bị Production

1. **Tạo .env.production:**
```env
# ===========================================
# 🔥 FIREBASE CONFIGURATION - PRODUCTION
# ===========================================

VITE_FIREBASE_API_KEY=your_production_api_key
VITE_FIREBASE_AUTH_DOMAIN=hcmtemplate.firebaseapp.com
VITE_DATABASE_URL=https://hcmtemplate-default-rtdb.asia-southeast1.firebasedatabase.app
VITE_FIREBASE_PROJECT_ID=hcmtemplate
VITE_FIREBASE_STORAGE_BUCKET=hcmtemplate.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_MEASUREMENT_ID=your_measurement_id

# ===========================================
# ⚙️  ENVIRONMENT SETTINGS - PRODUCTION
# ===========================================

VITE_USE_EMULATORS=false
VITE_ENV=production

# ===========================================
# 👨‍💼 ADMIN SETTINGS
# ===========================================

VITE_ADMIN_SESSION_EXPIRE_DAYS=3
```

2. **Deploy Firestore Rules:**
```bash
yarn firebase:deploy:rules
```

3. **Seed Production Data (Cẩn thận!):**
```bash
# Cần service account key và --confirm flag
yarn data:seed:prod --confirm

# Hoặc manual confirmation
yarn data:seed:prod:safe --confirm
```

### Deploy Application

```bash
# Safe deploy chỉ hosting (không ảnh hưởng database)
yarn firebase:deploy:safe

# Hoặc sử dụng script an toàn
./scripts/safe-deploy.sh

# Deploy full (hosting + rules)
yarn firebase:deploy

# Deploy riêng hosting
yarn firebase:deploy:hosting
```

## 🛠️ Development Commands

### Firebase Commands

```bash
# Firebase login
yarn firebase:login

# Start emulators with UI
yarn firebase:emulators:ui

# Deploy hosting only (safe)
yarn firebase:deploy:safe

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
yarn build:prod

# Development server (emulator mode)
yarn dev

# Development server (production mode)
yarn dev:prod

# Preview build
yarn preview
```

## 🔒 Security & Production Notes

### Firestore Security Rules

Development rules (hiện tại trong `firestore.rules`):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // DEVELOPMENT/EMULATOR MODE ONLY - Allow all operations
    // TODO: Replace with proper security rules before production deployment
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

Production rules (được tạo trong `firestore.rules.production`):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // PRODUCTION RULES - More restrictive

    // Heritage Spots - Public read, admin write
    match /heritage-spots/{document} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }

    // VR Content - Public read, admin write
    match /vr-content/{document} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }

    // Documents - Public read, admin write
    match /documents/{document} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

**⚠️ Quan trọng:** Trước khi deploy production, copy `firestore.rules.production` thành `firestore.rules`!

### Production Safety

1. **Service Account**: File `hcmtemplate.json` cần thiết cho production seeding
2. **Environment Files**:
   - `.env` - Development với emulators
   - `.env.production` - Production config
3. **Backup**: Luôn backup data trước khi seed production
4. **Testing**: Luôn test với emulator trước
5. **Safe Deploy**: Sử dụng `./scripts/safe-deploy.sh` để deploy an toàn

## 🚨 Troubleshooting

### Common Issues

#### "Firebase: Error (auth/invalid-api-key)"
```bash
# Lỗi này xảy ra khi thiếu Firebase config keys trong .env
# Ngay cả khi dùng emulator, vẫn cần đầy đủ config keys

# Kiểm tra .env file có đầy đủ:
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
# ... các keys khác

# Khởi động lại development server
yarn dev
```

#### "Firebase not initialized"
```bash
# Check environment variables
yarn check-env

# Đảm bảo Firebase emulators đang chạy
yarn firebase:emulators:ui
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

# Hoặc seed specific collection
yarn seed heritage-spots
```

#### "Build errors"
```bash
# Clear và reinstall
rm -rf node_modules yarn.lock
yarn install

# Clear Vite cache
yarn dev --force
```

#### "Deploy overwriting database"
```bash
# Sử dụng safe deploy script
./scripts/safe-deploy.sh

# Hoặc deploy hosting only
yarn firebase:deploy:safe

# Kiểm tra environment trước deploy
cat .env | grep VITE_USE_EMULATORS
```

## 📖 Next Steps

Sau khi setup thành công:

1. ✅ **Explore App**: Khám phá các collection đã được seed
2. ✅ **Customize Content**: Thêm heritage spots mới trong Firestore
3. ✅ **Test Features**: VR experiences, documents, mini games
4. ✅ **Add Authentication**: Implement user login system
5. ✅ **Deploy Production**: Push to Firebase Hosting

## 🆘 Support

- **Firebase Console**: [console.firebase.google.com](https://console.firebase.google.com)
- **Emulator UI**: [127.0.0.1:4004](http://127.0.0.1:4004) (khi chạy emulators)
- **Project Documentation**: Xem các file `.md` trong project
- **Environment Setup**: Kiểm tra `.env.example` và `.env.production`

## 📁 Project Structure

```
HCM_Template/
├── src/
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── services/          # Firebase services
│   ├── contexts/          # React contexts
│   ├── lib/               # Firebase config
│   └── types/             # TypeScript types
├── data/seed/             # Seed data files
├── scripts/               # Build & deployment scripts
├── .env.example           # Environment template
├── .env.production        # Production config
├── firebase.json          # Firebase configuration
├── firestore.rules        # Development rules
├── firestore.rules.production  # Production rules
└── QUICK_START.md         # This guide
```

## 🔧 Scripts Overview

| Script | Purpose | Environment |
|---------|---------|-------------|
| `yarn dev` | Development server với emulators | Development |
| `yarn dev:prod` | Development server với production Firebase | Production |
| `yarn build:prod` | Build cho production | Production |
| `yarn data:seed` | Seed data vào emulator | Development |
| `yarn firebase:emulators:ui` | Start emulators với UI | Development |
| `yarn firebase:deploy:safe` | Deploy hosting an toàn | Production |
| `./scripts/safe-deploy.sh` | Deploy script với confirmation | Production |
| `yarn check-env` | Kiểm tra environment variables | All |
