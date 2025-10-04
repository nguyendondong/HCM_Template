import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { useMiniGamesSection } from '../contexts/ContentContext';
import { useSmartNavigation } from '../hooks/useSmartNavigation';

// Helper function to get icon from icon name
const getIcon = (iconName: string): React.ComponentType<{ className?: string }> => {
  const Icon = (LucideIcons as any)[iconName];
  return Icon || LucideIcons.Circle;
};

interface GameState {
  currentQuestion: number;
  score: number;
  answers: number[];
  timeLeft: number;
  isCompleted: boolean;
  isPlaying: boolean;
}

const MiniGamesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { id: routeId } = useParams<{ id: string }>();
  const { isDetailView, goBack, goToDetail } = useSmartNavigation({
    listPath: '/mini-games',
    targetSection: 'mini-game'
  });

  const { content, isLoading, games, leaderboard } = useMiniGamesSection();

  // Filter and view state
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || 'all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>(searchParams.get('difficulty') || 'all');
  const [sortBy, setSortBy] = useState<string>(searchParams.get('sort') || 'newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(
    (searchParams.get('view') as 'grid' | 'list') || 'grid'
  );

  // Game state
  const [selectedGame, setSelectedGame] = useState<string | null>(routeId || null);
  const [gameState, setGameState] = useState<GameState>({
    currentQuestion: 0,
    score: 0,
    answers: [],
    timeLeft: 30,
    isCompleted: false,
    isPlaying: false
  });

  // Extract unique categories from games
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(games.map(game => game.category))];
    return uniqueCategories;
  }, [games]);

  // Extract unique difficulties
  const difficulties = useMemo(() => {
    const uniqueDifficulties = [...new Set(games.map(game => game.difficulty))];
    return uniqueDifficulties;
  }, [games]);

  // Update selected game when route changes
  useEffect(() => {
    if (routeId) {
      setSelectedGame(routeId);
    }
  }, [routeId]);

  // Sync URL params with state
  useEffect(() => {
    const params: Record<string, string> = {};
    if (searchQuery) params.search = searchQuery;
    if (selectedCategory !== 'all') params.category = selectedCategory;
    if (selectedDifficulty !== 'all') params.difficulty = selectedDifficulty;
    if (sortBy !== 'newest') params.sort = sortBy;
    if (viewMode !== 'grid') params.view = viewMode;

    setSearchParams(params, { replace: true });
  }, [searchQuery, selectedCategory, selectedDifficulty, sortBy, viewMode, setSearchParams]);

  // Filter games based on current filters
  const filteredGames = useMemo(() => {
    return games.filter(game => {
      // Search filter
      const matchesSearch = searchQuery
        ? game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          game.description.toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      // Category filter
      const matchesCategory = selectedCategory === 'all' || game.category === selectedCategory;

      // Difficulty filter
      const matchesDifficulty = selectedDifficulty === 'all' || game.difficulty === selectedDifficulty;

      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [games, searchQuery, selectedCategory, selectedDifficulty]);

  // Sort filtered games
  const sortedGames = useMemo(() => {
    const sorted = [...filteredGames];

    switch (sortBy) {
      case 'a-z':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case 'z-a':
        return sorted.sort((a, b) => b.title.localeCompare(a.title));
      case 'easiest':
        return sorted.sort((a, b) => {
          const difficultyMap: Record<string, number> = {
            'Dễ': 1,
            'Trung bình': 2,
            'Khó': 3
          };
          return (difficultyMap[a.difficulty] || 0) - (difficultyMap[b.difficulty] || 0);
        });
      case 'hardest':
        return sorted.sort((a, b) => {
          const difficultyMap: Record<string, number> = {
            'Dễ': 1,
            'Trung bình': 2,
            'Khó': 3
          };
          return (difficultyMap[b.difficulty] || 0) - (difficultyMap[a.difficulty] || 0);
        });
      case 'newest':
      default:
        // Assuming games are already sorted by newest in the data
        return sorted;
    }
  }, [filteredGames, sortBy]);

  // Handle filter changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleDifficultyChange = (difficulty: string) => {
    setSelectedDifficulty(difficulty);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
  };

  // Timer effect - MUST be called before any early returns
  useEffect(() => {
    if (!gameState.isPlaying || gameState.isCompleted || gameState.timeLeft <= 0) return;

    const timer = setInterval(() => {
      setGameState(prev => {
        if (prev.timeLeft <= 1) {
          // Time's up - auto move to next question
          return handleNextQuestion(prev, -1); // -1 indicates timeout
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.isPlaying, gameState.currentQuestion, gameState.timeLeft, gameState.isCompleted]);

  const handleBack = () => {
    if (isDetailView && !selectedGame) {
      // If in detail route but no game selected, go back to list
      goBack();
    } else if (selectedGame) {
      // If game is selected, close game and stay on current page
      setSelectedGame(null);
      setGameState({
        currentQuestion: 0,
        score: 0,
        answers: [],
        timeLeft: 30,
        isCompleted: false,
        isPlaying: false
      });
    } else {
      // Default back navigation
      goBack();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-6 text-center">
          <div className="animate-pulse">Đang tải...</div>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-6 text-center">
          <div>Không thể tải dữ liệu mini games</div>
        </div>
      </div>
    );
  }

  const startGame = (gameId: string) => {
    if (isDetailView) {
      // If already in detail view, just set the selected game
      setSelectedGame(gameId);
      setGameState({
        currentQuestion: 0,
        score: 0,
        answers: [],
        timeLeft: 30,
        isCompleted: false,
        isPlaying: true
      });
    } else {
      // Navigate to detail route
      goToDetail(gameId);
    }
  };

  const handleNextQuestion = (prevState: GameState, selectedAnswer: number): GameState => {
    const game = games.find(g => g.id === selectedGame);
    if (!game || !game.gameData.questions) return prevState;

    const currentQ = game.gameData.questions[prevState.currentQuestion];
    const isCorrect = selectedAnswer === currentQ.correctAnswer;
    const newScore = isCorrect ? prevState.score + 1 : prevState.score;
    const newAnswers = [...prevState.answers, selectedAnswer];

    if (prevState.currentQuestion + 1 >= game.gameData.questions.length) {
      // Game completed
      return {
        ...prevState,
        score: newScore,
        answers: newAnswers,
        isCompleted: true,
        isPlaying: false
      };
    } else {
      // Next question
      return {
        ...prevState,
        currentQuestion: prevState.currentQuestion + 1,
        score: newScore,
        answers: newAnswers,
        timeLeft: 30
      };
    }
  };

  const handleAnswer = (selectedAnswer: number) => {
    setGameState(prev => handleNextQuestion(prev, selectedAnswer));
  };

  const restartGame = () => {
    setGameState({
      currentQuestion: 0,
      score: 0,
      answers: [],
      timeLeft: 30,
      isCompleted: false,
      isPlaying: true
    });
  };

  const getCurrentGame = () => {
    return games.find(game => game.id === selectedGame);
  };

  const getScorePercentage = () => {
    const game = getCurrentGame();
    if (!game || !game.gameData.questions) return 0;
    return Math.round((gameState.score / game.gameData.questions.length) * 100);
  };

  const getScoreMessage = () => {
    const percentage = getScorePercentage();
    if (percentage >= 80) return { text: 'Xuất sắc!', color: 'text-green-600', emoji: '🏆' };
    if (percentage >= 60) return { text: 'Tốt!', color: 'text-blue-600', emoji: '🎉' };
    if (percentage >= 40) return { text: 'Khá tốt!', color: 'text-yellow-600', emoji: '👍' };
    return { text: 'Cần cố gắng thêm!', color: 'text-red-600', emoji: '💪' };
  };

  // Game playing view
  if (selectedGame && gameState.isPlaying && !gameState.isCompleted) {
    const game = getCurrentGame();
    if (!game || !game.gameData.questions) return null;

    const currentQuestion = game.gameData.questions[gameState.currentQuestion];

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="container mx-auto px-6 py-8">
          {/* Game Header */}
          <div className="flex items-center justify-between mb-8 pt-16">
            <div></div> {/* Empty space to balance layout */}

            <div className="flex items-center space-x-6 text-white">
              <div className="text-center">
                <div className="text-2xl font-bold">{gameState.currentQuestion + 1}/{game.gameData.questions.length}</div>
                <div className="text-sm opacity-80">Câu hỏi</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{gameState.score}</div>
                <div className="text-sm opacity-80">Điểm</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${gameState.timeLeft <= 10 ? 'text-red-400 animate-pulse' : ''}`}>
                  {gameState.timeLeft}s
                </div>
                <div className="text-sm opacity-80">Thời gian</div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/20 rounded-full h-2 mb-8">
            <div
              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((gameState.currentQuestion + 1) / game.gameData.questions.length) * 100}%` }}
            ></div>
          </div>

          {/* Question */}
          <motion.div
            key={gameState.currentQuestion}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl p-8 shadow-2xl max-w-4xl mx-auto"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              {currentQuestion.question}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentQuestion.options.map((option: string, index: number) => (
                <motion.button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-4 text-left bg-gray-50 hover:bg-blue-50 border-2 border-gray-200 hover:border-blue-300 rounded-xl transition-all duration-200 font-medium"
                >
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full mr-3 text-sm font-bold">
                    {String.fromCharCode(65 + index)}
                  </span>
                  {option}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Game completed view
  if (selectedGame && gameState.isCompleted) {
    const game = getCurrentGame();
    if (!game || !game.gameData.questions) return null;

    const scoreMessage = getScoreMessage();

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-800 via-blue-800 to-purple-800">
        <div className="container mx-auto px-6 py-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="bg-white rounded-2xl p-8 shadow-2xl max-w-2xl mx-auto text-center"
          >
            <div className="text-6xl mb-4">{scoreMessage.emoji}</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Hoàn thành!</h2>
            <p className={`text-xl font-semibold mb-6 ${scoreMessage.color}`}>
              {scoreMessage.text}
            </p>

            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{gameState.score}</div>
                <div className="text-sm text-gray-600">Câu đúng</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{getScorePercentage()}%</div>
                <div className="text-sm text-gray-600">Tỷ lệ đúng</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{game.gameData.questions.length}</div>
                <div className="text-sm text-gray-600">Tổng câu hỏi</div>
              </div>
            </div>

            {/* Answer Review */}
            <div className="space-y-4 mb-8">
              <h3 className="text-lg font-bold text-gray-900">Kết quả chi tiết:</h3>
              {game.gameData.questions.map((q: any, index: number) => {
                const userAnswer = gameState.answers[index];
                const isCorrect = userAnswer === q.correctAnswer;

                return (
                  <div key={q.id} className={`p-3 rounded-lg border-2 ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Câu {index + 1}</span>
                      {isCorrect ? (
                        <LucideIcons.CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <LucideIcons.XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    {!isCorrect && (
                      <p className="text-xs text-gray-600 mt-1">
                        Đáp án đúng: {q.options[q.correctAnswer]}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex space-x-4">
              <button
                onClick={restartGame}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
              >
                <LucideIcons.RotateCcw className="w-5 h-5" />
                <span>Chơi lại</span>
              </button>
              <button
                onClick={handleBack}
                className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 font-medium"
              >
                {isDetailView ? 'Quay về danh sách' : 'Chọn game khác'}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Main games selection view
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-800 to-red-900 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* <button
              onClick={handleBack}
              className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors duration-200"
            >
              <LucideIcons.ArrowLeft className="w-5 h-5 mr-2" />
              Quay về trang chủ
            </button> */}

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {content.title}
            </h1>
            <p className="text-xl text-gray-200 max-w-3xl">
              {content.description}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search Bar */}
            <div className="relative w-full lg:w-1/3">
              <LucideIcons.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm trò chơi..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleCategoryChange('all')}
                  className={`px-4 py-2 text-sm rounded-full ${
                    selectedCategory === 'all'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Tất cả
                </button>
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={`px-4 py-2 text-sm rounded-full ${
                      selectedCategory === category
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* View Mode Switch */}
              <div className="flex items-center gap-2 border rounded-lg p-1 self-start">
                <button
                  onClick={() => handleViewModeChange('grid')}
                  className={`p-2 rounded ${
                    viewMode === 'grid'
                      ? 'bg-red-600 text-white'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <LucideIcons.LayoutGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleViewModeChange('list')}
                  className={`p-2 rounded ${
                    viewMode === 'list'
                      ? 'bg-red-600 text-white'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <LucideIcons.List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 gap-4">
            {/* Difficulty Filter */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-500 self-center mr-2">Độ khó:</span>
              <button
                onClick={() => handleDifficultyChange('all')}
                className={`px-4 py-1.5 text-sm rounded-full ${
                  selectedDifficulty === 'all'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tất cả
              </button>
              {difficulties.map(difficulty => (
                <button
                  key={difficulty}
                  onClick={() => handleDifficultyChange(difficulty)}
                  className={`px-4 py-1.5 text-sm rounded-full ${
                    selectedDifficulty === difficulty
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {difficulty}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="text-sm font-medium text-gray-500">
                Sắp xếp theo:
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={handleSortChange}
                className="bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
              >
                <option value="newest">Mới nhất</option>
                <option value="a-z">A-Z</option>
                <option value="z-a">Z-A</option>
                <option value="easiest">Dễ đến khó</option>
                <option value="hardest">Khó đến dễ</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Games Display */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        {filteredGames.length === 0 ? (
          <div className="text-center py-16">
            <LucideIcons.SearchX className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Không tìm thấy trò chơi</h3>
            <p className="text-gray-500">
              Không tìm thấy trò chơi phù hợp với điều kiện tìm kiếm của bạn. Vui lòng thử lại với các bộ lọc khác.
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedGames.map((game, index) => {
              const IconComponent = getIcon(game.icon);

              return (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
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
                    <p className="text-gray-600 mb-4 text-sm line-clamp-3">{game.description}</p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Thời gian:</span>
                        <span className="font-medium text-gray-700">{game.estimatedTime}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Số câu hỏi:</span>
                        <span className="font-medium text-gray-700">{game.gameData.questions?.length || 0}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Danh mục:</span>
                        <span className="font-medium text-gray-700">{game.category}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => startGame(game.id)}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 font-medium"
                    >
                      <LucideIcons.Play className="w-4 h-4" />
                      <span>Bắt đầu chơi</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* List view */
          <div className="flex flex-col gap-4">
            {sortedGames.map((game, index) => {
              const IconComponent = getIcon(game.icon);

              return (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row">
                    <div className={`w-full md:w-48 h-48 md:h-auto bg-gradient-to-r ${game.color} relative flex-shrink-0`}>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <IconComponent className="w-16 h-16 text-white" />
                      </div>
                      <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
                        {game.difficulty}
                      </div>
                    </div>

                    <div className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between w-full">
                      <div className="mb-4 md:mb-0 md:pr-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{game.title}</h3>
                        <p className="text-gray-600 mb-3 line-clamp-2">{game.description}</p>

                        <div className="flex flex-wrap gap-3">
                          <div className="flex items-center text-sm text-gray-500">
                            <LucideIcons.Clock className="w-4 h-4 mr-1" />
                            <span>{game.estimatedTime}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <LucideIcons.HelpCircle className="w-4 h-4 mr-1" />
                            <span>{game.gameData.questions?.length || 0} câu hỏi</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <LucideIcons.Tag className="w-4 h-4 mr-1" />
                            <span>{game.category}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => startGame(game.id)}
                        className="flex-shrink-0 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 font-medium"
                      >
                        <LucideIcons.Play className="w-4 h-4" />
                        <span>Bắt đầu chơi</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

        {/* Leaderboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 bg-white rounded-2xl p-8 shadow-lg"
        >
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Bảng xếp hạng tuần này
          </h2>

          <div className="space-y-4">
            {leaderboard.map((player, index) => (
              <motion.div
                key={player.rank}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
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
        </motion.div>
      </div>
    );
};

export default MiniGamesPage;
