import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  limit,
  Timestamp,
  writeBatch,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  DocumentsContent,
  VRContent,
  MiniGameContent
} from '../types/content';

// ===== DOCUMENTS SERVICE =====

class DocumentsService {
  private collectionName = 'documentsContent';

  // Get active documents content
  async getDocumentsContent(): Promise<DocumentsContent | null> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('isActive', '==', true),
        limit(1)
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;

      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as DocumentsContent;
    } catch (error) {
      console.error('Error fetching documents content:', error);
      throw error;
    }
  }

  // Update documents content
  async updateDocumentsContent(id: string, data: Partial<DocumentsContent>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating documents content:', error);
      throw error;
    }
  }

  // Create documents content
  async createDocumentsContent(data: Omit<DocumentsContent, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating documents content:', error);
      throw error;
    }
  }

  // Subscribe to documents content changes
  subscribeToDocumentsContent(callback: (content: DocumentsContent | null) => void): () => void {
    const q = query(
      collection(db, this.collectionName),
      where('isActive', '==', true),
      limit(1)
    );

    return onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        callback(null);
        return;
      }

      const doc = snapshot.docs[0];
      const content = { id: doc.id, ...doc.data() } as DocumentsContent;
      callback(content);
    }, (error) => {
      console.error('Error in documents content subscription:', error);
      callback(null);
    });
  }
}

// ===== VR CONTENT SERVICE =====

class VRContentService {
  private collectionName = 'vrContent';

  // Get active VR content
  async getVRContent(): Promise<VRContent | null> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('isActive', '==', true),
        limit(1)
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;

      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as VRContent;
    } catch (error) {
      console.error('Error fetching VR content:', error);
      throw error;
    }
  }

  // Update VR content
  async updateVRContent(id: string, data: Partial<VRContent>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating VR content:', error);
      throw error;
    }
  }

  // Create VR content
  async createVRContent(data: Omit<VRContent, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating VR content:', error);
      throw error;
    }
  }

  // Subscribe to VR content changes
  subscribeToVRContent(callback: (content: VRContent | null) => void): () => void {
    const q = query(
      collection(db, this.collectionName),
      where('isActive', '==', true),
      limit(1)
    );

    return onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        callback(null);
        return;
      }

      const doc = snapshot.docs[0];
      const content = { id: doc.id, ...doc.data() } as VRContent;
      callback(content);
    }, (error) => {
      console.error('Error in VR content subscription:', error);
      callback(null);
    });
  }
}

// ===== MINI GAME CONTENT SERVICE =====

class MiniGameContentService {
  private collectionName = 'miniGameContent';

  // Get active mini game content
  async getMiniGameContent(): Promise<MiniGameContent | null> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('isActive', '==', true),
        limit(1)
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;

      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as MiniGameContent;
    } catch (error) {
      console.error('Error fetching mini game content:', error);
      throw error;
    }
  }

  // Update mini game content
  async updateMiniGameContent(id: string, data: Partial<MiniGameContent>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating mini game content:', error);
      throw error;
    }
  }

  // Create mini game content
  async createMiniGameContent(data: Omit<MiniGameContent, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating mini game content:', error);
      throw error;
    }
  }

  // Subscribe to mini game content changes
  subscribeToMiniGameContent(callback: (content: MiniGameContent | null) => void): () => void {
    const q = query(
      collection(db, this.collectionName),
      where('isActive', '==', true),
      limit(1)
    );

    return onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        callback(null);
        return;
      }

      const doc = snapshot.docs[0];
      const content = { id: doc.id, ...doc.data() } as MiniGameContent;
      callback(content);
    }, (error) => {
      console.error('Error in mini game content subscription:', error);
      callback(null);
    });
  }
}

// ===== INITIALIZE DEFAULT CONTENT =====

export async function initializeDefaultPageContent(): Promise<void> {
  try {
    const batch = writeBatch(db);

    // Default Documents Content
    const defaultDocumentsContent = {
      title: "Tư liệu về Chủ tịch Hồ Chí Minh",
      subtitle: "Kho tàng tư liệu quý giá",
      description: "Kho tàng tư liệu quý giá về cuộc đời và sự nghiệp của vị lãnh tụ vĩ đại, bao gồm văn bản, hình ảnh và video lịch sử được sưu tập và bảo quản cẩn thận.",
      categories: [
        {
          id: 'declarations',
          icon: 'FileText',
          title: 'Tuyên ngôn và Văn kiện',
          description: 'Các văn bản chính thức quan trọng nhất',
          items: [
            'Tuyên ngôn độc lập 2/9/1945',
            'Di chúc của Chủ tịch Hồ Chí Minh',
            'Lời kêu gọi toàn quốc kháng chiến'
          ]
        },
        {
          id: 'writings',
          icon: 'BookOpen',
          title: 'Tác phẩm và Bài viết',
          description: 'Những bài viết, tác phẩm của Chủ tịch Hồ Chí Minh',
          items: [
            'Đường Kách mệnh',
            'Nhật ký trong tù'
          ]
        },
        {
          id: 'photos',
          icon: 'Image',
          title: 'Hình ảnh lịch sử',
          description: 'Bộ sưu tập ảnh quý hiếm về cuộc đời Bác',
          items: [
            'Ảnh thời trẻ ở Paris',
            'Ảnh trong chiến khu Việt Bắc'
          ]
        },
        {
          id: 'videos',
          icon: 'Video',
          title: 'Video tư liệu',
          description: 'Những thước phim quý giá ghi lại hoạt động của Bác',
          items: [
            'Đọc Tuyên ngôn độc lập',
            'Gặp gỡ đại biểu các dân tộc'
          ]
        }
      ],
      featuredDocument: {
        title: "Tài liệu nổi bật: Tuyên ngôn độc lập 2/9/1945",
        quote: "Tất cả mọi người đều sinh ra có quyền bình đẳng. Tạo hóa cho họ những quyền không ai có thể xâm phạm được; trong những quyền ấy, có quyền được sống, quyền tự do và quyền mưu cầu hạnh phúc.",
        description: "Văn kiện lịch sử quan trọng nhất, được UNESCO công nhận là Di sản tài liệu thế giới"
      },
      isActive: true
    };

    const documentsRef = doc(collection(db, 'documentsContent'));
    batch.set(documentsRef, {
      ...defaultDocumentsContent,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    // Default VR Content
    const defaultVRContent = {
      title: "Trải nghiệm VR",
      subtitle: "Công nghệ thực tế ảo tiên tiến",
      description: "Hãy đắm chìm trong lịch sử thông qua công nghệ thực tế ảo tiên tiến, trải nghiệm những khoảnh khắc lịch sử như đang thực sự có mặt tại đó.",
      features: [
        {
          icon: "Glasses",
          title: "Thực tế ảo 360°",
          description: "Trải nghiệm hoàn toàn immersive với góc nhìn 360 độ"
        },
        {
          icon: "Headphones",
          title: "Âm thanh 3D",
          description: "Âm thanh vòm chất lượng cao tái tạo không gian thực"
        },
        {
          icon: "Hand",
          title: "Tương tác thực tế",
          description: "Tương tác với các đối tượng và nhân vật trong môi trường VR"
        }
      ],
      experiences: [
        {
          id: 'kim-lien-vr',
          title: 'Thăm quan Kim Liên VR',
          description: 'Khám phá quê hương Bác Hồ trong môi trường thực tế ảo hoàn toàn immersive',
          imageUrl: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=600&h=400&fit=crop'
        },
        {
          id: 'ba-dinh-vr',
          title: 'Chứng kiến Tuyên ngôn độc lập',
          description: 'Tham dự lễ đọc Tuyên ngôn độc lập tại Quảng trường Ba Đình ngày 2/9/1945',
          imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=400&fit=crop'
        }
      ],
      benefits: {
        title: "Lợi ích của VR",
        description: "Công nghệ VR mang lại trải nghiệm học tập vượt trội",
        stats: [
          { percentage: "95%", label: "Tăng khả năng ghi nhớ" },
          { percentage: "87%", label: "Cải thiện sự tập trung" },
          { percentage: "92%", label: "Nâng cao hứng thú học tập" }
        ]
      },
      isActive: true
    };

    const vrRef = doc(collection(db, 'vrContent'));
    batch.set(vrRef, {
      ...defaultVRContent,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    // Default Mini Game Content
    const defaultMiniGameContent = {
      title: "Mini Games giáo dục",
      subtitle: "Học lịch sử qua trò chơi",
      description: "Học lịch sử một cách vui vẻ và hấp dẫn thông qua các trò chơi tương tác, giúp củng cố kiến thức và tạo động lực học tập.",
      games: [
        {
          id: 'quiz-history',
          title: 'Quiz kiến thức lịch sử',
          description: 'Trả lời các câu hỏi về cuộc đời và sự nghiệp của Chủ tịch Hồ Chí Minh',
          difficulty: 'Trung bình' as const,
          playerCount: '1 người chơi',
          icon: 'Trophy',
          color: 'from-green-500 to-green-600'
        },
        {
          id: 'journey-path',
          title: 'Hành trình tìm đường cứu nước',
          description: 'Khám phá các địa điểm Bác Hồ đã đi qua trong hành trình 30 năm tìm đường cứu nước',
          difficulty: 'Dễ' as const,
          playerCount: '1 người chơi',
          icon: 'Target',
          color: 'from-blue-500 to-blue-600'
        },
        {
          id: 'puzzle-heritage',
          title: 'Ghép hình di tích',
          description: 'Ghép các mảnh hình để tạo thành những di tích lịch sử quan trọng',
          difficulty: 'Khó' as const,
          playerCount: '1 người chơi',
          icon: 'Zap',
          color: 'from-purple-500 to-purple-600'
        }
      ],
      achievements: [
        {
          icon: 'Trophy',
          title: 'Thành tựu đạt được',
          count: '2,450',
          description: 'Tổng số điểm tích lũy'
        },
        {
          icon: 'Star',
          title: 'Quiz hoàn thành',
          count: '156',
          description: 'Số quiz đã hoàn thành'
        },
        {
          icon: 'Target',
          title: 'Cấp độ hiện tại',
          count: '12',
          description: 'Level cao nhất đạt được'
        }
      ],
      leaderboard: [
        { rank: 1, name: 'Nguyễn Văn A', score: '2,450', badge: '🥇' },
        { rank: 2, name: 'Trần Thị B', score: '2,380', badge: '🥈' },
        { rank: 3, name: 'Lê Văn C', score: '2,290', badge: '🥉' },
        { rank: 4, name: 'Phạm Thị D', score: '2,150', badge: '🏅' },
        { rank: 5, name: 'Hoàng Văn E', score: '2,100', badge: '🏅' }
      ],
      isActive: true
    };

    const miniGameRef = doc(collection(db, 'miniGameContent'));
    batch.set(miniGameRef, {
      ...defaultMiniGameContent,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    await batch.commit();
    console.log('Default page content initialized successfully');
  } catch (error) {
    console.error('Error initializing default page content:', error);
    throw error;
  }
}

// Export services
export const documentsService = new DocumentsService();
export const vrContentService = new VRContentService();
export const miniGameContentService = new MiniGameContentService();
