import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Trophy,
  Users,
  Clock,
  Star,
  ChevronRight,
  Target,
  BookOpen,
  Compass,
  Zap,
  Gamepad2,
  Award,
  Medal,
  Crown
} from 'lucide-react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface MiniGame {
  id: string;
  title: string;
  description: string;
  gameType: string;
  difficulty: string;
  estimatedTime: string;
  players: number;
  maxScore: number;
  icon: string;
  color: string;
  category: string;
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  order: number;
}

const MiniGameSection: React.FC = () => {
  const [featuredGames, setFeaturedGames] = useState<MiniGame[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: any } = {
      Target,
      Trophy,
      Zap,
      BookOpen,
      Compass,
      Clock,
      Play,
      Star,
      Gamepad2,
      Award,
      Medal,
      Crown
    };
    return icons[iconName] || Target;
  };

  // Mock achievements data
  const achievements = [
    { title: 'Tổng lượt chơi', count: '15.2K', description: 'Người dùng tham gia', icon: 'Users' },
    { title: 'Điểm cao nhất', count: '98.5%', description: 'Độ chính xác trung bình', icon: 'Target' },
    { title: 'Thành tích mở khóa', count: '847', description: 'Huy hiệu đã đạt được', icon: 'Award' }
  ];

  // Mock leaderboard data
  const leaderboard = [
    { rank: 1, name: 'Nguyễn Văn A', score: 2850, badge: '🥇' },
    { rank: 2, name: 'Trần Thị B', score: 2720, badge: '🥈' },
    { rank: 3, name: 'Lê Văn C', score: 2640, badge: '🥉' },
    { rank: 4, name: 'Phạm Thị D', score: 2580, badge: '🏅' },
    { rank: 5, name: 'Hoàng Văn E', score: 2520, badge: '🏅' }
  ];

  useEffect(() => {
    fetchMiniGames();
  }, []);

  const fetchMiniGames = async () => {
    try {
      setLoading(true);
      const gamesQuery = query(
        collection(db, 'mini-games'),
        where('isActive', '==', true),
        where('isFeatured', '==', true),
        orderBy('order', 'asc')
      );

      const querySnapshot = await getDocs(gamesQuery);
      const gamesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MiniGame[];

      setFeaturedGames(gamesData);
    } catch (error) {
      console.error('Error fetching featured mini games:', error);
      // Fallback to showing basic content if Firebase fails
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'dễ':
        return 'bg-green-100 text-green-800';
      case 'trung bình':
        return 'bg-yellow-100 text-yellow-800';
      case 'khó':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePlayGame = (gameId: string) => {
    // Navigate to mini games page with specific game
    window.location.href = `/mini-games?game=${gameId}`;
  };

  if (loading) {
    return (
      <section id="mini-games" className="py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải trò chơi...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="mini-games" className="py-20 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Trò chơi tương tác
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Khám phá lịch sử Việt Nam qua những trò chơi giáo dục thú vị và bổ ích
          </p>
        </motion.div>

        {/* Featured Games */}
        {featuredGames.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-16"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              🌟 Trò chơi nổi bật
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredGames.slice(0, 3).map((game, index) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="group"
                >
                  <div className={`relative p-6 bg-gradient-to-br ${game.color} rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2`}>
                    <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                          {React.createElement(getIconComponent(game.icon), {
                            className: "w-6 h-6 text-white"
                          })}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(game.difficulty)}`}>
                          {game.difficulty}
                        </span>
                      </div>

                      <h4 className="text-xl font-bold text-white mb-3">
                        {game.title}
                      </h4>
                      <p className="text-white/90 text-sm mb-4 line-clamp-2">
                        {game.description}
                      </p>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4 text-white/80 text-xs">
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {game.estimatedTime}
                          </span>
                          <span className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {game.players?.toLocaleString() || 0}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handlePlayGame(game.id)}
                        className="w-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center group"
                      >
                        <Play className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                        Chơi ngay
                        <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* "Xem tất cả" button linking to mini-games page */}
        <div className="text-center mb-16">
          <button
            onClick={() => navigate('/mini-games')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-8 rounded-xl transition-all duration-300 inline-flex items-center shadow-lg hover:shadow-xl"
          >
            <Gamepad2 className="w-5 h-5 mr-2" />
            Xem tất cả trò chơi
            <ChevronRight className="w-4 h-4 ml-2" />
          </button>
        </div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Thành tích người chơi
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {achievements.map((achievement, index) => {
              const IconComponent = getIconComponent(achievement.icon);

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                    <IconComponent className="w-8 h-8 text-yellow-600" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">{achievement.title}</h4>
                  <p className="text-3xl font-bold text-red-600 mb-2">{achievement.count}</p>
                  <p className="text-gray-500 text-sm">{achievement.description}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Leaderboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-white rounded-2xl p-8 shadow-lg mb-16"
        >
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Bảng xếp hạng tuần này
          </h3>

          <div className="space-y-4">
            {leaderboard.map((player, index) => (
              <motion.div
                key={player.rank}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="flex items-center space-x-4">
                  <span className="text-2xl">{player.badge}</span>
                  <div>
                    <div className="font-medium text-gray-900">#{player.rank} {player.name}</div>
                    <div className="text-sm text-gray-500">Điểm: {player.score}</div>
                  </div>
                </div>
                <Trophy className="w-5 h-5 text-yellow-500" />
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-6">
            <button className="px-6 py-3 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-500 transition-colors duration-200 font-medium">
              Xem bảng xếp hạng đầy đủ
            </button>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Khám phá thêm nhiều trò chơi thú vị
            </h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Tham gia cộng đồng người chơi và khám phá lịch sử Việt Nam qua những trải nghiệm tương tác độc đáo
            </p>
            <button className="bg-white text-blue-600 font-bold py-3 px-8 rounded-xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105">
              Xem tất cả trò chơi
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MiniGameSection;
