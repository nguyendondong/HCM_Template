import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, addDoc, updateDoc, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../../lib/firebase';
import {
  Gamepad2,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Search,
  Upload,
  Play,
  Trophy,
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon
} from 'lucide-react';

interface MiniGame {
  id: string;
  spotId: string;
  title: string;
  description: string;
  type: 'memory' | 'quiz' | 'puzzle' | 'matching' | 'trivia';
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit?: number; // in seconds
  maxScore: number;
  gameData: any; // Game-specific configuration
  thumbnailUrl?: string;
  instructionsUrl?: string;
  isActive: boolean;
  playCount: number;
  averageScore: number;
  createdAt: any;
  updatedAt: any;
}

interface MiniGamesManagerProps {}

const MiniGamesManager: React.FC<MiniGamesManagerProps> = () => {
  const [miniGames, setMiniGames] = useState<MiniGame[]>([]);
  const [heritageSpots, setHeritageSpots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGame, setEditingGame] = useState<MiniGame | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState<Partial<MiniGame>>({
    spotId: '',
    title: '',
    description: '',
    type: 'memory',
    difficulty: 'easy',
    timeLimit: 300,
    maxScore: 100,
    gameData: {},
    thumbnailUrl: '',
    instructionsUrl: '',
    isActive: true,
    playCount: 0,
    averageScore: 0
  });

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  useEffect(() => {
    fetchMiniGames();
    fetchHeritageSpots();
  }, []);

  const fetchMiniGames = async () => {
    try {
      setLoading(true);
      const gamesQuery = query(collection(db, 'miniGames'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(gamesQuery);
      const gamesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MiniGame[];
      setMiniGames(gamesData);
    } catch (error) {
      console.error('Error fetching mini games:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHeritageSpots = async () => {
    try {
      const spotsQuery = query(collection(db, 'heritageSpots'), orderBy('name'));
      const querySnapshot = await getDocs(spotsQuery);
      const spotsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setHeritageSpots(spotsData);
    } catch (error) {
      console.error('Error fetching heritage spots:', error);
    }
  };

  const uploadFile = async (file: File, path: string): Promise<string> => {
    const fileRef = ref(storage, path);
    await uploadBytes(fileRef, file);
    return getDownloadURL(fileRef);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let updatedFormData = { ...formData };

      // Upload thumbnail
      if (thumbnailFile) {
        const thumbnailPath = `minigame-thumbnails/${Date.now()}-${thumbnailFile.name}`;
        updatedFormData.thumbnailUrl = await uploadFile(thumbnailFile, thumbnailPath);
      }

      // Set default game data based on type
      if (!updatedFormData.gameData || Object.keys(updatedFormData.gameData).length === 0) {
        updatedFormData.gameData = getDefaultGameData(formData.type || 'memory');
      }

      const gameData = {
        ...updatedFormData,
        updatedAt: new Date()
      };

      if (editingGame) {
        await updateDoc(doc(db, 'miniGames', editingGame.id), gameData);
      } else {
        await addDoc(collection(db, 'miniGames'), {
          ...gameData,
          createdAt: new Date()
        });
      }

      await fetchMiniGames();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving mini game:', error);
    } finally {
      setUploading(false);
    }
  };

  const getDefaultGameData = (type: string) => {
    switch (type) {
      case 'memory':
        return {
          cards: [],
          pairs: 6,
          theme: 'heritage'
        };
      case 'quiz':
        return {
          questions: [],
          options: 4,
          randomOrder: true
        };
      case 'puzzle':
        return {
          pieces: 9,
          imageUrl: '',
          difficulty: 'medium'
        };
      case 'matching':
        return {
          items: [],
          pairs: 5,
          theme: 'heritage'
        };
      case 'trivia':
        return {
          questions: [],
          categories: ['history', 'culture', 'architecture'],
          pointsPerQuestion: 10
        };
      default:
        return {};
    }
  };

  const handleEdit = (game: MiniGame) => {
    setEditingGame(game);
    setFormData(game);
    setShowModal(true);
  };

  const handleDelete = async (gameId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa mini game này?')) {
      try {
        await deleteDoc(doc(db, 'miniGames', gameId));
        await fetchMiniGames();
      } catch (error) {
        console.error('Error deleting mini game:', error);
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingGame(null);
    setFormData({
      spotId: '',
      title: '',
      description: '',
      type: 'memory',
      difficulty: 'easy',
      timeLimit: 300,
      maxScore: 100,
      gameData: {},
      thumbnailUrl: '',
      instructionsUrl: '',
      isActive: true,
      playCount: 0,
      averageScore: 0
    });
    setThumbnailFile(null);
  };

  const getSpotName = (spotId: string) => {
    const spot = heritageSpots.find(s => s.id === spotId);
    return spot ? spot.name : 'Không xác định';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'memory':
        return Target;
      case 'quiz':
        return Trophy;
      case 'puzzle':
        return ImageIcon;
      case 'matching':
        return Target;
      case 'trivia':
        return Trophy;
      default:
        return Gamepad2;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'memory':
        return 'Trí nhớ';
      case 'quiz':
        return 'Đố vui';
      case 'puzzle':
        return 'Ghép hình';
      case 'matching':
        return 'Ghép đôi';
      case 'trivia':
        return 'Kiến thức';
      default:
        return type;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'Dễ';
      case 'medium':
        return 'Trung bình';
      case 'hard':
        return 'Khó';
      default:
        return difficulty;
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds) return 'Không giới hạn';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredGames = miniGames.filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         game.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getSpotName(game.spotId).toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'all' || game.type === typeFilter;
    const matchesDifficulty = difficultyFilter === 'all' || game.difficulty === difficultyFilter;

    return matchesSearch && matchesType && matchesDifficulty;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Đang tải mini games...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Mini Games</h1>
          <p className="text-gray-600 mt-1">Tổng cộng {miniGames.length} mini games</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Tạo Game Mới
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm mini games..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả loại</option>
              <option value="memory">Trí nhớ</option>
              <option value="quiz">Đố vui</option>
              <option value="puzzle">Ghép hình</option>
              <option value="matching">Ghép đôi</option>
              <option value="trivia">Kiến thức</option>
            </select>

            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả độ khó</option>
              <option value="easy">Dễ</option>
              <option value="medium">Trung bình</option>
              <option value="hard">Khó</option>
            </select>
          </div>
        </div>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGames.map((game) => {
          const TypeIcon = getTypeIcon(game.type);

          return (
            <div key={game.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
              {/* Thumbnail */}
              <div className="aspect-video bg-gray-100 relative">
                {game.thumbnailUrl ? (
                  <img
                    src={game.thumbnailUrl}
                    alt={game.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <TypeIcon className="h-12 w-12 text-gray-400" />
                  </div>
                )}

                {/* Type badge */}
                <div className="absolute top-2 left-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <TypeIcon size={12} className="mr-1" />
                    {getTypeLabel(game.type)}
                  </span>
                </div>

                {/* Difficulty badge */}
                <div className="absolute top-2 right-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(game.difficulty)}`}>
                    {getDifficultyLabel(game.difficulty)}
                  </span>
                </div>

                {/* Time limit */}
                {game.timeLimit && (
                  <div className="absolute bottom-2 right-2">
                    <span className="bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs flex items-center">
                      <Clock size={12} className="mr-1" />
                      {formatTime(game.timeLimit)}
                    </span>
                  </div>
                )}
              </div>

              {/* Game Info */}
              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-1">{game.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{game.description}</p>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                  <span>{getSpotName(game.spotId)}</span>
                  <div className="flex items-center space-x-2">
                    <span className="flex items-center">
                      <Play size={12} className="mr-1" />
                      {game.playCount}
                    </span>
                    <span className="flex items-center">
                      <Trophy size={12} className="mr-1" />
                      {game.averageScore.toFixed(0)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    game.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {game.isActive ? (
                      <CheckCircle size={12} className="mr-1" />
                    ) : (
                      <AlertCircle size={12} className="mr-1" />
                    )}
                    {game.isActive ? 'Hoạt động' : 'Tạm dừng'}
                  </span>

                  <span className="text-sm text-gray-500">
                    Max: {game.maxScore} điểm
                  </span>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => {/* TODO: Open game preview */}}
                    className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                  >
                    <Play size={16} className="mr-1" />
                    Chơi thử
                  </button>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(game)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(game.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredGames.length === 0 && (
        <div className="text-center py-12">
          <Gamepad2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có mini game nào</h3>
          <p className="mt-1 text-sm text-gray-500">Bắt đầu bằng cách tạo mini game đầu tiên.</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingGame ? 'Chỉnh sửa Mini Game' : 'Tạo Mini Game Mới'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa điểm
                  </label>
                  <select
                    value={formData.spotId}
                    onChange={(e) => setFormData(prev => ({ ...prev, spotId: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Chọn Địa điểm </option>
                    {heritageSpots.map(spot => (
                      <option key={spot.id} value={spot.id}>{spot.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loại game
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="memory">Trí nhớ</option>
                    <option value="quiz">Đố vui</option>
                    <option value="puzzle">Ghép hình</option>
                    <option value="matching">Ghép đôi</option>
                    <option value="trivia">Kiến thức</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Độ khó
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as any }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="easy">Dễ</option>
                    <option value="medium">Trung bình</option>
                    <option value="hard">Khó</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thời gian (giây)
                  </label>
                  <input
                    type="number"
                    value={formData.timeLimit}
                    onChange={(e) => setFormData(prev => ({ ...prev, timeLimit: Number(e.target.value) }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Điểm tối đa
                  </label>
                  <input
                    type="number"
                    value={formData.maxScore}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxScore: Number(e.target.value) }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiêu đề
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thumbnail
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {formData.thumbnailUrl && (
                  <p className="text-xs text-gray-500 mt-1">Đã có thumbnail hiện tại</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cấu hình game (JSON)
                </label>
                <textarea
                  value={JSON.stringify(formData.gameData, null, 2)}
                  onChange={(e) => {
                    try {
                      const gameData = JSON.parse(e.target.value);
                      setFormData(prev => ({ ...prev, gameData }));
                    } catch (error) {
                      // Invalid JSON, keep the text for user to fix
                    }
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  rows={8}
                  placeholder="Cấu hình game dạng JSON..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Cấu hình chi tiết cho game (câu hỏi, hình ảnh, v.v.)
                </p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  Kích hoạt mini game
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  disabled={uploading}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 flex items-center disabled:opacity-50"
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <Upload size={16} className="mr-2 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save size={16} className="mr-2" />
                      {editingGame ? 'Cập nhật' : 'Tạo Game'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MiniGamesManager;
