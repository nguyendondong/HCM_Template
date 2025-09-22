# 🚀 Quick Start - Firebase Environment Setup

## Bước 1: Tạo file .env

```bash
# Copy template
cp .env.example .env
```

## Bước 2: Lấy Firebase Config

1. Vào [Firebase Console](https://console.firebase.google.com/)
2. Chọn project của bạn
3. **Project Settings** (⚙️) → **General** tab
4. Scroll xuống **Your apps** → Chọn Web app
5. Copy config từ `firebaseConfig`

## Bước 3: Điền vào .env

```env
# Thay thế values sau bằng config thực từ Firebase
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdefghijklmnop
```

## Bước 4: Kiểm tra setup

```bash
# Check environment variables
yarn check-env

# Nếu OK, start development
yarn dev
```

## 🎯 Example Firebase Config

```javascript
// Từ Firebase Console, copy phần này:
const firebaseConfig = {
  apiKey: "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXX",           // → VITE_FIREBASE_API_KEY
  authDomain: "heritage-journey.firebaseapp.com",        // → VITE_FIREBASE_AUTH_DOMAIN
  projectId: "heritage-journey",                          // → VITE_FIREBASE_PROJECT_ID
  storageBucket: "heritage-journey.appspot.com",         // → VITE_FIREBASE_STORAGE_BUCKET
  messagingSenderId: "123456789012",                      // → VITE_FIREBASE_MESSAGING_SENDER_ID
  appId: "1:123456789012:web:abcdefghijklmnop123456"     // → VITE_FIREBASE_APP_ID
};
```

## ✅ Success Output

```bash
$ yarn check-env

🔍 Checking Firebase Environment Variables...

📋 Required Variables:
   ✅ VITE_FIREBASE_API_KEY: AIzaSyBX***
   ✅ VITE_FIREBASE_AUTH_DOMAIN: heritage***
   ✅ VITE_FIREBASE_PROJECT_ID: heritage***
   ✅ VITE_FIREBASE_STORAGE_BUCKET: heritage***
   ✅ VITE_FIREBASE_MESSAGING_SENDER_ID: 1234567***
   ✅ VITE_FIREBASE_APP_ID: 1:123456***

📋 Optional Variables:
   ⚪ VITE_FIREBASE_DATABASE_URL: Not set (optional)
   ⚪ VITE_FIREBASE_MEASUREMENT_ID: Not set (optional)

📊 Summary:
✅ All required environment variables are set!
🚀 Ready to start development: yarn dev
```

## 🚨 Error Troubleshooting

### "Missing required Firebase environment variables"
```bash
❌ File .env không tồn tại!
📝 Hướng dẫn setup:
   1. cp .env.example .env
   2. Điền Firebase config vào .env
   3. Xem ENV_SETUP.md để biết chi tiết
```

### "PLACEHOLDER values detected"
```bash
⚠️  VITE_FIREBASE_API_KEY: PLACEHOLDER (your-api-key-here)
⚠️  VITE_FIREBASE_PROJECT_ID: PLACEHOLDER (your-project-id)
```
→ Thay thế values placeholder bằng config thực từ Firebase

## 🔒 Security Notes

- ✅ `.env` đã được thêm vào `.gitignore`
- ✅ KHÔNG commit sensitive data
- ✅ Sử dụng `.env.local` cho config riêng tư
- ✅ Production: set env vars trên hosting platform

## 📖 Next Steps

Sau khi setup xong environment variables:

1. **Start development:** `yarn dev`
2. **Setup Firebase project:** Xem `FIREBASE_SETUP.md`
3. **Deploy rules:** `npm run firebase:deploy:rules`
4. **Deploy app:** `npm run firebase:deploy`
