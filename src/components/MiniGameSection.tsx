import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { useMiniGamesSection } from '../contexts/ContentContext';

// Helper function to get icon from icon name
const getIcon = (iconName: string): React.ComponentType<{ className?: string }> => {
  const Icon = (LucideIcons as any)[iconName];
  return Icon || LucideIcons.Circle;
};

const MiniGameSection: React.FC = () => {
  const { content, isLoading, games, achievements, leaderboard } = useMiniGamesSection();

  if (isLoading) {
    return (
      <section id="mini-game" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="animate-pulse">Đang tải...</div>
        </div>
      </section>
    );
  }

  if (!content) {
    return null;
  }

  return (
    <section id="mini-game" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {content.title}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {content.description}
          </p>
        </motion.div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {games.slice(0, 3).map((game, index) => {
            const IconComponent = getIcon(game.icon);

            return (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className={`h-32 bg-gradient-to-r ${game.color} relative`}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <IconComponent className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
                    {game.difficulty}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{game.title}</h3>
                  <p className="text-gray-600 mb-4 text-sm">{game.description}</p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <LucideIcons.Gamepad2 size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-500">{game.players.toLocaleString()} người chơi</span>
                    </div>
                  </div>

                  <Link
                    to="/mini-games"
                    className="block w-full px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 font-medium text-center"
                  >
                    Chơi ngay
                  </Link>
                </div>
              </motion.div>
            );
          })}
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
              const IconComponent = getIcon(achievement.icon);

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
          className="bg-white rounded-2xl p-8 shadow-lg"
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
                <LucideIcons.Trophy className="w-5 h-5 text-yellow-500" />
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-6">
            <button className="px-6 py-3 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-500 transition-colors duration-200 font-medium">
              Xem bảng xếp hạng đầy đủ
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MiniGameSection;
