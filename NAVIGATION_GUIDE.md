# Smart Navigation System

Hệ thống navigation thông minh cho các trang detail với nút back tự động.

## 🎯 Tổng quan

Hệ thống mới hỗ trợ navigation thông minh cho các trang có cả list view và detail view:

- **VR Experience**: `/vr-experience` (list) và `/vr-experience/:id` (detail)
- **Mini Games**: `/mini-games` (list) và `/mini-games/:id` (detail)
- **Documents**: `/documents` (list) và `/documents/:id` (detail)
- **Heritage**: `/heritage/:id` (detail - đã có từ trước)

## 🔧 Cách hoạt động

### useSmartNavigation Hook

```typescript
const { isDetailView, goBack, goToDetail } = useSmartNavigation({
  listPath: '/vr-experience',
  targetSection: 'vr-technology'
});
```

**Parameters:**
- `listPath`: Đường dẫn của trang list
- `targetSection`: Section sẽ được scroll tới khi về home (optional)

**Returns:**
- `isDetailView`: `true` nếu đang ở detail route (có ID param)
- `goBack()`: Function quay về trang trước đó
- `goToDetail(id)`: Function navigate đến detail route với ID

### Logic Back Navigation

1. **Từ detail view**: Quay về list page
2. **Từ list view**: Quay về home page với target section
3. **Trong game/experience player**: Đóng player, ở lại trang hiện tại

## 📱 Ví dụ sử dụng

### VR Experience Page

```typescript
const VRExperiencePage: React.FC = () => {
  const { id: routeId } = useParams<{ id: string }>();
  const { isDetailView, goBack, goToDetail } = useSmartNavigation({
    listPath: '/vr-experience',
    targetSection: 'vr-technology'
  });

  // Auto-select experience if ID in URL
  const [selectedExperience, setSelectedExperience] = useState<string | null>(routeId || null);

  // Back button logic
  const handleBack = () => {
    if (isDetailView) {
      goBack(); // Go to /vr-experience
    } else {
      setSelectedExperience(null); // Close player
    }
  };

  // Start experience button
  const startExperience = (id: string) => {
    if (isDetailView) {
      setSelectedExperience(id); // Direct play
    } else {
      goToDetail(id); // Navigate to /vr-experience/id
    }
  };
};
```

### Mini Games Page

Similar pattern với game selection và gameplay.

### Documents Page

Similar pattern với category selection và document viewing.

## 🎮 User Flow Examples

### VR Experience Flow

1. **Home Page** → Click "Trải nghiệm VR" → **`/vr-experience`** (list view)
2. **List View** → Click "Bắt đầu trải nghiệm" → **`/vr-experience/kim-lien-vr`** (detail view)
3. **Detail View** → Video player opens automatically
4. **Video Player** → Click "Quay lại" → **`/vr-experience`** (back to list)
5. **List View** → Click "Quay về trang chủ" → **`/`** (home with scroll to VR section)

### Mini Games Flow

1. **Home Page** → Click "Chơi ngay" → **`/mini-games`** (list view)
2. **List View** → Click "Bắt đầu chơi" → **`/mini-games/quiz-history`** (detail view)
3. **Detail View** → Game starts automatically
4. **In Game** → Click "Thoát game" → **`/mini-games`** (back to list)
5. **Game Completed** → Click "Chọn game khác" → Stay on list or go back based on view

### Documents Flow

1. **Home Page** → Click "Xem tài liệu" → **`/documents`** (list view)
2. **List View** → Click category → **`/documents/declarations`** (detail view)
3. **Detail View** → Shows documents in category
4. **Detail View** → Click "Quay về danh sách" → **`/documents`** (back to list)

## 🔗 URL Structure

### Supported Routes

```
/ (home)
├── /heritage/:id (heritage detail)
├── /vr-experience (VR list)
│   └── /vr-experience/:id (VR detail)
├── /mini-games (games list)
│   └── /mini-games/:id (game detail)
└── /documents (docs list)
    └── /documents/:id (category detail)
```

### URL Examples

- `/vr-experience/kim-lien-vr` - Kim Liên VR experience
- `/vr-experience/ba-dinh-vr` - Ba Đình VR experience
- `/mini-games/quiz-history` - History quiz game
- `/mini-games/journey-path` - Journey path game
- `/documents/declarations` - Declarations category
- `/documents/photos` - Photos category

## ✨ Features

### Smart Back Button

- **Contextual text**: "Quay về danh sách" vs "Quay về trang chủ" vs "Thoát game"
- **Smart routing**: Always knows where to go back
- **State preservation**: Maintains selection when appropriate

### URL-based State

- **Direct links**: Share `/vr-experience/kim-lien-vr` directly
- **Browser back/forward**: Works perfectly
- **Refresh support**: State restored from URL

### Scroll to Section

- **Target sections**: Auto-scroll to relevant section on home page
- **Session storage**: Remembers scroll target between pages

## 🚀 Future Enhancements

- [ ] Breadcrumb navigation
- [ ] Deep linking with query params for filters
- [ ] Previous/next navigation in detail views
- [ ] Search-based routing
- [ ] Multi-level detail routing (e.g., `/documents/category/document-id`)

## 🐛 Troubleshooting

### Common Issues

1. **Back button not working**: Check `useSmartNavigation` hook setup
2. **URL not updating**: Ensure `goToDetail()` is used instead of state-only updates
3. **Wrong back destination**: Verify `listPath` parameter in hook
4. **Missing scroll to section**: Check `targetSection` parameter

### Debug Tips

```typescript
// Add logging to see navigation state
console.log('isDetailView:', isDetailView);
console.log('Current route ID:', routeId);
console.log('Selected item:', selectedItem);
```
