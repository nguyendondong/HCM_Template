# Firebase Setup Instructions

## Bước 1: Tạo Firebase Project

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" hoặc "Create a project"
3. Nhập tên project: `heritage-journey-app`
4. Tắt Google Analytics (không cần thiết cho Spark plan)
5. Click "Create project"

## Bước 2: Setup Firebase Authentication

1. Trong Firebase Console, vào **Authentication**
2. Click **Get started**
3. Vào tab **Sign-in method**
4. Enable các provider:
   - **Email/Password**: Click Enable → Save
   - **Google**: Click Enable → Chọn Project support email → Save

## Bước 3: Setup Firestore Database

1. Vào **Firestore Database**
2. Click **Create database**
3. Chọn **Start in test mode** (sẽ config security rules sau)
4. Chọn location gần nhất (asia-southeast1 cho VN)
5. Click **Done**

## Bước 4: Setup Firebase Storage

1. Vào **Storage**
2. Click **Get started**
3. Chọn **Start in test mode**
4. Chọn cùng location với Firestore
5. Click **Done**

## Bước 5: Setup Firebase Hosting

1. Vào **Hosting**
2. Click **Get started**
3. Follow các bước setup (sẽ dùng Firebase CLI)

## Bước 6: Lấy Firebase Config

1. Vào **Project Settings** (icon gear)
2. Scroll xuống **Your apps**
3. Click **Web app icon** (</>)
4. Nhập app name: `heritage-journey-web`
5. **KHÔNG** check "Also set up Firebase Hosting"
6. Click **Register app**
7. Copy **firebaseConfig** object

## Bước 7: Cập nhật Firebase Config trong Code

Mở file `src/lib/firebase.ts` và thay thế config:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "heritage-journey-app.firebaseapp.com",
  projectId: "heritage-journey-app",
  storageBucket: "heritage-journey-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-actual-app-id"
};
```

## Bước 8: Install Firebase CLI và Deploy

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init

# Select:
# - Firestore
# - Storage
# - Hosting

# Deploy Security Rules
firebase deploy --only firestore:rules,storage

# Build và deploy app
npm run firebase:deploy
```

## Bước 9: Setup Security Rules (Production)

Sau khi test xong, cập nhật security rules:

### Firestore Rules (firestore.rules)
File này đã được tạo sẵn với rules bảo mật phù hợp.

### Storage Rules (storage.rules)
File này đã được tạo sẵn với rules bảo mật phù hợp.

## Bước 10: Test Setup

1. **Test Authentication:**
   ```bash
   npm run dev
   ```
   - Thử đăng ký/đăng nhập
   - Thử đăng nhập Google

2. **Test Firestore:**
   - Check Firebase Console xem có user document được tạo không

3. **Test Storage:**
   - Thử upload ảnh trong app
   - Check Firebase Console xem file có được upload không

## Bước 11: Initialize Heritage Data

Sau khi setup xong, chạy script để tạo dữ liệu heritage spots:

```typescript
// Trong browser console hoặc tạo script riêng
import { initializeHeritageSpots } from './services/heritageService';
import { heritageSpots } from './data/heritageSpots';

// Convert local data to Firebase format
const firebaseSpots = heritageSpots.map(spot => ({
  name: spot.name,
  description: spot.description,
  coordinates: spot.coordinates,
  side: spot.side
}));

await initializeHeritageSpots(firebaseSpots);
```

## Monitoring và Maintenance

### Daily Checks
- Firebase Usage dashboard
- Error logs trong Console
- User feedback

### Weekly Reviews
- Storage usage vs quota
- Firestore reads/writes count
- Performance metrics

### Monthly Tasks
- Backup critical data
- Review security rules
- Update dependencies

## Troubleshooting

### Common Issues

1. **"Firebase config not found"**
   - Check firebase.ts config values
   - Ensure all keys are correct

2. **"Permission denied" errors**
   - Check security rules
   - Ensure user is authenticated

3. **"Storage upload failed"**
   - Check file size (max 5MB images, 10MB docs)
   - Check file type restrictions
   - Check storage rules

4. **"Quota exceeded"**
   - Monitor Firebase usage dashboard
   - Implement caching
   - Optimize queries

### Debug Commands

```bash
# Check Firebase project
firebase projects:list

# Test security rules locally
firebase emulators:start

# View detailed logs
firebase functions:log

# Check current deployment
firebase hosting:sites:list
```

## Cost Optimization (Spark Plan)

### Limits to Watch
- **Firestore**: 50K reads, 20K writes/day
- **Storage**: 1GB total, 10GB transfer/month
- **Hosting**: 10GB transfer/month

### Best Practices
1. Cache data aggressively
2. Use pagination for lists
3. Optimize images before upload
4. Implement lazy loading
5. Monitor usage regularly

Với setup này, bạn sẽ có một Firebase backend hoàn chỉnh cho Heritage Journey app!
