# Environment Variables Setup

## Tạo file .env

1. **Copy file example:**
   ```bash
   cp .env.example .env
   ```

2. **Lấy Firebase Config từ Firebase Console:**
   - Vào [Firebase Console](https://console.firebase.google.com/)
   - Chọn project của bạn
   - Vào **Project Settings** (icon gear)
   - Scroll xuống **Your apps**
   - Click vào Web app đã tạo
   - Copy các giá trị từ `firebaseConfig`

3. **Cập nhật file .env:**
   ```env
   VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
   VITE_FIREBASE_APP_ID=1:123456789012:web:abcdefghijklmnop
   ```

## Mapping Firebase Config → Environment Variables

| Firebase Config | Environment Variable | Ví dụ |
|----------------|---------------------|-------|
| `apiKey` | `VITE_FIREBASE_API_KEY` | `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` |
| `authDomain` | `VITE_FIREBASE_AUTH_DOMAIN` | `heritage-journey.firebaseapp.com` |
| `projectId` | `VITE_FIREBASE_PROJECT_ID` | `heritage-journey` |
| `storageBucket` | `VITE_FIREBASE_STORAGE_BUCKET` | `heritage-journey.appspot.com` |
| `messagingSenderId` | `VITE_FIREBASE_MESSAGING_SENDER_ID` | `123456789012` |
| `appId` | `VITE_FIREBASE_APP_ID` | `1:123456789012:web:abcdefghijklmnop` |

## Lưu ý quan trọng

### 🔒 Bảo mật
- **KHÔNG BAO GIỜ** commit file `.env` lên Git
- File `.env` đã được thêm vào `.gitignore`
- Chỉ chia sẻ thông tin này qua kênh bảo mật

### 🔧 Development vs Production
- **Development**: Sử dụng file `.env.local` cho config riêng
- **Production**: Set environment variables trên hosting platform
- **Testing**: Sử dụng Firebase Emulators với config test

### 🚀 Deployment
Khi deploy lên các platform, set environment variables:

#### Vercel
```bash
vercel env add VITE_FIREBASE_API_KEY
vercel env add VITE_FIREBASE_AUTH_DOMAIN
# ... thêm tất cả variables
```

#### Netlify
- Vào Site settings → Environment variables
- Add từng variable một

#### Firebase Hosting
```bash
# Không cần set env vars, Firebase Hosting tự động detect
firebase deploy
```

## Validation

Khi start app, hệ thống sẽ tự động kiểm tra:
- ✅ Tất cả required environment variables có tồn tại
- ❌ Throw error nếu thiếu variable nào
- 📝 Log chi tiết variable nào bị thiếu

## Testing

```bash
# Check environment variables
npm run dev

# Nếu thiếu variables, sẽ thấy error:
# Missing required Firebase environment variables: VITE_FIREBASE_API_KEY, ...
```

## Troubleshooting

### Error: "Missing required Firebase environment variables"
1. Kiểm tra file `.env` có tồn tại không
2. Kiểm tra tên variables có đúng prefix `VITE_` không
3. Restart dev server sau khi sửa `.env`

### Error: "Firebase config invalid"
1. Kiểm tra values trong `.env` có đúng không
2. Copy lại từ Firebase Console
3. Kiểm tra không có space thừa trong values

### Environment variables không load
1. Restart Vite dev server: `npm run dev`
2. Check file `.env` có nằm ở root project không
3. Ensure variables có prefix `VITE_`
