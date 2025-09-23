import React, { useState } from 'react';
import { Eye, EyeOff, Gamepad2, Trophy, Users } from 'lucide-react';

interface MiniGame {
  id: string;
  title: string;
  description: string;
  difficulty: 'Dễ' | 'Trung bình' | 'Khó';
  playerCount: string;
  icon: string;
  color: string;
  gameUrl?: string;
}

interface Achievement {
  icon: string;
  title: string;
  count: string;
  description?: string;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: string;
  badge: string;
}

interface MiniGameContent {
  id?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  games?: MiniGame[];
  achievements?: Achievement[];
  leaderboard?: LeaderboardEntry[];
  gameCategories?: Array<{
    id: string;
    name: string;
    description?: string;
    icon?: string;
  }>;
  rewards?: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    pointsRequired: number;
  }>;
}

interface MiniGameEditorProps {
  formData: MiniGameContent;
  setFormData: (data: any) => void;
}

const MiniGameEditor: React.FC<MiniGameEditorProps> = ({ formData, setFormData }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'games' | 'achievements' | 'leaderboard'>('general');

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGameChange = (index: number, field: string, value: any) => {
    const newGames = [...(formData.games || [])];
    newGames[index] = { ...newGames[index], [field]: value };
    setFormData((prev: any) => ({
      ...prev,
      games: newGames
    }));
  };

  const addGame = () => {
    const newGame: MiniGame = {
      id: Date.now().toString(),
      title: '',
      description: '',
      difficulty: 'Trung bình',
      playerCount: '1',
      icon: '🎮',
      color: 'from-blue-500 to-purple-600',
      gameUrl: ''
    };
    const newGames = [...(formData.games || []), newGame];
    setFormData((prev: any) => ({
      ...prev,
      games: newGames
    }));
  };

  const removeGame = (index: number) => {
    const newGames = formData.games?.filter((_: any, i: number) => i !== index) || [];
    setFormData((prev: any) => ({
      ...prev,
      games: newGames
    }));
  };

  const handleAchievementChange = (index: number, field: string, value: any) => {
    const newAchievements = [...(formData.achievements || [])];
    newAchievements[index] = { ...newAchievements[index], [field]: value };
    setFormData((prev: any) => ({
      ...prev,
      achievements: newAchievements
    }));
  };

  const addAchievement = () => {
    const newAchievement: Achievement = {
      icon: '🏆',
      title: '',
      count: '0',
      description: ''
    };
    const newAchievements = [...(formData.achievements || []), newAchievement];
    setFormData((prev: any) => ({
      ...prev,
      achievements: newAchievements
    }));
  };

  const removeAchievement = (index: number) => {
    const newAchievements = formData.achievements?.filter((_: any, i: number) => i !== index) || [];
    setFormData((prev: any) => ({
      ...prev,
      achievements: newAchievements
    }));
  };

  const handleLeaderboardChange = (index: number, field: string, value: any) => {
    const newLeaderboard = [...(formData.leaderboard || [])];
    newLeaderboard[index] = { ...newLeaderboard[index], [field]: value };
    setFormData((prev: any) => ({
      ...prev,
      leaderboard: newLeaderboard
    }));
  };

  const addLeaderboardEntry = () => {
    const newEntry: LeaderboardEntry = {
      rank: (formData.leaderboard?.length || 0) + 1,
      name: '',
      score: '0',
      badge: '🥉'
    };
    const newLeaderboard = [...(formData.leaderboard || []), newEntry];
    setFormData((prev: any) => ({
      ...prev,
      leaderboard: newLeaderboard
    }));
  };

  const removeLeaderboardEntry = (index: number) => {
    const newLeaderboard = formData.leaderboard?.filter((_: any, i: number) => i !== index) || [];
    // Renumber ranks
    newLeaderboard.forEach((entry: any, i: number) => {
      entry.rank = i + 1;
    });
    setFormData((prev: any) => ({
      ...prev,
      leaderboard: newLeaderboard
    }));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Dễ':
        return 'bg-green-100 text-green-800';
      case 'Trung bình':
        return 'bg-yellow-100 text-yellow-800';
      case 'Khó':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Preview Toggle */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          {showPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
          {showPreview ? 'Ẩn Preview' : 'Xem Preview'}
        </button>
      </div>

      {showPreview ? (
        // Preview Mode
        <div className="bg-gray-50 p-6 rounded-lg border">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{formData.title || 'Mini Games'}</h1>
              <h2 className="text-xl text-gray-600 mb-4">{formData.subtitle || 'Trò chơi học tập'}</h2>
              <p className="text-lg text-gray-700">{formData.description || 'Học lịch sử qua các trò chơi thú vị'}</p>
            </div>

            {/* Games */}
            {formData.games && formData.games.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Trò chơi ({formData.games.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {formData.games.map((game: MiniGame, index: number) => (
                    <div key={index} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                      <div className={`h-32 bg-gradient-to-br ${game.color} flex items-center justify-center`}>
                        <div className="text-6xl">{game.icon}</div>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-bold text-gray-900">{game.title}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(game.difficulty)}`}>
                            {game.difficulty}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-4">{game.description}</p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            <span>{game.playerCount} người chơi</span>
                          </div>
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            Chơi ngay
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Achievements */}
            {formData.achievements && formData.achievements.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Thành tích</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {formData.achievements.map((achievement: Achievement, index: number) => (
                    <div key={index} className="bg-white p-6 rounded-lg shadow text-center">
                      <div className="text-3xl mb-2">{achievement.icon}</div>
                      <div className="text-2xl font-bold text-gray-900 mb-1">{achievement.count}</div>
                      <div className="text-sm font-medium text-gray-700 mb-1">{achievement.title}</div>
                      {achievement.description && (
                        <div className="text-xs text-gray-500">{achievement.description}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Leaderboard */}
            {formData.leaderboard && formData.leaderboard.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Bảng xếp hạng</h2>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hạng</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người chơi</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Điểm</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Huy hiệu</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {formData.leaderboard.map((entry: LeaderboardEntry, index: number) => (
                          <tr key={index} className={index < 3 ? 'bg-yellow-50' : ''}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              #{entry.rank}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {entry.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {entry.score}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className="text-xl">{entry.badge}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Edit Mode
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                type="button"
                onClick={() => setActiveTab('general')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'general'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Thông tin chung
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('games')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'games'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Trò chơi ({formData.games?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('achievements')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'achievements'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Thành tích ({formData.achievements?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('leaderboard')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'leaderboard'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Bảng xếp hạng ({formData.leaderboard?.length || 0})
              </button>
            </nav>
          </div>

          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề trang</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mini Games về Chủ tịch Hồ Chí Minh"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề phụ</label>
                <input
                  type="text"
                  value={formData.subtitle || ''}
                  onChange={(e) => handleInputChange('subtitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Trò chơi học tập"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả trang</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Khám phá cuộc đời và sự nghiệp của Chủ tịch Hồ Chí Minh qua các trò chơi học tập thú vị và bổ ích"
                />
              </div>
            </div>
          )}

          {/* Games Tab */}
          {activeTab === 'games' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Quản lý trò chơi</h3>
                <button
                  type="button"
                  onClick={addGame}
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                >
                  Thêm trò chơi
                </button>
              </div>

              {formData.games?.map((game: MiniGame, index: number) => (
                <div key={index} className="border border-gray-200 rounded-md p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Tên trò chơi</label>
                      <input
                        type="text"
                        value={game.title || ''}
                        onChange={(e) => handleGameChange(index, 'title', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Câu đố về Bác Hồ"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Độ khó</label>
                      <select
                        value={game.difficulty || 'Trung bình'}
                        onChange={(e) => handleGameChange(index, 'difficulty', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="Dễ">Dễ</option>
                        <option value="Trung bình">Trung bình</option>
                        <option value="Khó">Khó</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-xs text-gray-500 mb-1">Mô tả trò chơi</label>
                    <textarea
                      value={game.description || ''}
                      onChange={(e) => handleGameChange(index, 'description', e.target.value)}
                      rows={2}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="Trả lời các câu hỏi về cuộc đời và sự nghiệp của Chủ tịch Hồ Chí Minh"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Icon/Emoji</label>
                      <input
                        type="text"
                        value={game.icon || ''}
                        onChange={(e) => handleGameChange(index, 'icon', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="🎮"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Số người chơi</label>
                      <input
                        type="text"
                        value={game.playerCount || ''}
                        onChange={(e) => handleGameChange(index, 'playerCount', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="1-4"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Màu gradient</label>
                      <select
                        value={game.color || 'from-blue-500 to-purple-600'}
                        onChange={(e) => handleGameChange(index, 'color', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="from-blue-500 to-purple-600">Xanh - Tím</option>
                        <option value="from-green-400 to-blue-600">Xanh lá - Xanh dương</option>
                        <option value="from-purple-500 to-pink-600">Tím - Hồng</option>
                        <option value="from-yellow-400 to-orange-600">Vàng - Cam</option>
                        <option value="from-red-500 to-pink-600">Đỏ - Hồng</option>
                        <option value="from-indigo-500 to-purple-600">Chàm - Tím</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-xs text-gray-500 mb-1">URL trò chơi</label>
                    <input
                      type="url"
                      value={game.gameUrl || ''}
                      onChange={(e) => handleGameChange(index, 'gameUrl', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="https://example.com/game.html"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeGame(index)}
                      className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                    >
                      Xóa trò chơi
                    </button>
                  </div>
                </div>
              ))}

              {(!formData.games || formData.games.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <Gamepad2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Chưa có trò chơi nào. Thêm trò chơi đầu tiên để bắt đầu.</p>
                </div>
              )}
            </div>
          )}

          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Quản lý thành tích</h3>
                <button
                  type="button"
                  onClick={addAchievement}
                  className="px-4 py-2 bg-yellow-600 text-white text-sm rounded-md hover:bg-yellow-700"
                >
                  Thêm thành tích
                </button>
              </div>

              {formData.achievements?.map((achievement: Achievement, index: number) => (
                <div key={index} className="border border-gray-200 rounded-md p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Icon/Emoji</label>
                      <input
                        type="text"
                        value={achievement.icon || ''}
                        onChange={(e) => handleAchievementChange(index, 'icon', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="🏆"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Tiêu đề</label>
                      <input
                        type="text"
                        value={achievement.title || ''}
                        onChange={(e) => handleAchievementChange(index, 'title', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Người chơi hoàn thành"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Số đếm</label>
                      <input
                        type="text"
                        value={achievement.count || ''}
                        onChange={(e) => handleAchievementChange(index, 'count', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="1,234"
                      />
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => removeAchievement(index)}
                        className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 self-end"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Mô tả (tùy chọn)</label>
                    <input
                      type="text"
                      value={achievement.description || ''}
                      onChange={(e) => handleAchievementChange(index, 'description', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="Số người đã hoàn thành tất cả trò chơi"
                    />
                  </div>
                </div>
              ))}

              {(!formData.achievements || formData.achievements.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Chưa có thành tích nào. Thêm thành tích đầu tiên để khuyến khích người chơi.</p>
                </div>
              )}
            </div>
          )}

          {/* Leaderboard Tab */}
          {activeTab === 'leaderboard' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Quản lý bảng xếp hạng</h3>
                <button
                  type="button"
                  onClick={addLeaderboardEntry}
                  className="px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700"
                >
                  Thêm người chơi
                </button>
              </div>

              {formData.leaderboard?.map((entry: LeaderboardEntry, index: number) => (
                <div key={index} className="border border-gray-200 rounded-md p-4">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Hạng</label>
                      <input
                        type="number"
                        value={entry.rank || index + 1}
                        onChange={(e) => handleLeaderboardChange(index, 'rank', parseInt(e.target.value) || index + 1)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Tên người chơi</label>
                      <input
                        type="text"
                        value={entry.name || ''}
                        onChange={(e) => handleLeaderboardChange(index, 'name', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Nguyễn Văn A"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Điểm số</label>
                      <input
                        type="text"
                        value={entry.score || ''}
                        onChange={(e) => handleLeaderboardChange(index, 'score', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="9,850"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Huy hiệu</label>
                      <select
                        value={entry.badge || '🥉'}
                        onChange={(e) => handleLeaderboardChange(index, 'badge', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="🥇">🥇 Vàng</option>
                        <option value="🥈">🥈 Bạc</option>
                        <option value="🥉">🥉 Đồng</option>
                        <option value="🏆">🏆 Cúp</option>
                        <option value="⭐">⭐ Sao</option>
                        <option value="🎖️">🎖️ Huy chương</option>
                      </select>
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => removeLeaderboardEntry(index)}
                        className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 self-end w-full"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {(!formData.leaderboard || formData.leaderboard.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Chưa có dữ liệu bảng xếp hạng. Thêm người chơi đầu tiên.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MiniGameEditor;
