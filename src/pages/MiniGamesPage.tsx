import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Trophy, Target, Zap, CheckCircle, XCircle, RotateCcw } from 'lucide-react';

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

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
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    currentQuestion: 0,
    score: 0,
    answers: [],
    timeLeft: 30,
    isCompleted: false,
    isPlaying: false
  });

  const handleBackToHome = () => {
    // Store the target section (mini-game for Mini Games)
    sessionStorage.setItem('targetSection', 'mini-game');
    navigate('/');
  };

  const miniGames = [
    {
      id: 'quiz-history',
      title: 'Quiz kiến thức lịch sử',
      description: 'Trả lời các câu hỏi về cuộc đời và sự nghiệp của Chủ tịch Hồ Chí Minh',
      difficulty: 'Trung bình',
      timeLimit: '30s/câu',
      totalQuestions: 10,
      icon: Trophy,
      color: 'from-green-500 to-green-600',
      questions: [
        {
          id: 1,
          question: 'Chủ tịch Hồ Chí Minh sinh ngày nào?',
          options: ['19/5/1890', '19/5/1891', '20/5/1890', '18/5/1890'],
          correct: 0,
          explanation: 'Chủ tịch Hồ Chí Minh sinh ngày 19 tháng 5 năm 1890 tại làng Sen, xã Kim Liên, huyện Nam Đàn, tỉnh Nghệ An.'
        },
        {
          id: 2,
          question: 'Tên thật của Chủ tịch Hồ Chí Minh là gì?',
          options: ['Nguyễn Ái Quốc', 'Nguyễn Sinh Cung', 'Nguyễn Tất Thành', 'Lý Thụy'],
          correct: 1,
          explanation: 'Tên thật của Chủ tịch Hồ Chí Minh là Nguyễn Sinh Cung. Người còn có nhiều tên khác như Nguyễn Tất Thành, Nguyễn Ái Quốc...'
        },
        {
          id: 3,
          question: 'Tuyên ngôn độc lập được đọc vào ngày nào?',
          options: ['2/9/1945', '30/4/1975', '19/8/1945', '1/5/1945'],
          correct: 0,
          explanation: 'Tuyên ngôn độc lập được Chủ tịch Hồ Chí Minh đọc tại Quảng trường Ba Đình, Hà Nội vào ngày 2/9/1945.'
        }
      ]
    },
    {
      id: 'journey-path',
      title: 'Hành trình tìm đường cứu nước',
      description: 'Khám phá các địa điểm Bác Hồ đã đi qua trong hành trình 30 năm tìm đường cứu nước',
      difficulty: 'Dễ',
      timeLimit: 'Không giới hạn',
      totalQuestions: 8,
      icon: Target,
      color: 'from-blue-500 to-blue-600',
      questions: [
        {
          id: 1,
          question: 'Năm 1911, Nguyễn Tất Thành ra đi tìm đường cứu nước từ cảng nào?',
          options: ['Cảng Sài Gòn', 'Cảng Hải Phòng', 'Cảng Đà Nẵng', 'Cảng Nhà Rồng'],
          correct: 3,
          explanation: 'Năm 1911, chàng thanh niên Nguyễn Tất Thành lên tàu Amiral Latouche Tréville tại Cảng Nhà Rồng (nay là Bảo tàng Hồ Chí Minh) để ra đi tìm đường cứu nước.'
        }
      ]
    },
    {
      id: 'puzzle-heritage',
      title: 'Ghép hình di tích',
      description: 'Ghép các mảnh hình để tạo thành những di tích lịch sử quan trọng',
      difficulty: 'Khó',
      timeLimit: '5 phút',
      totalQuestions: 5,
      icon: Zap,
      color: 'from-purple-500 to-purple-600',
      questions: [
        {
          id: 1,
          question: 'Hãy sắp xếp các di tích theo thứ tự thời gian Bác Hồ đến thăm:',
          options: ['Kim Liên → Pác Bó → Hà Nội → Tân Trào', 'Pác Bó → Tân Trào → Hà Nội → Kim Liên', 'Kim Liên → Hà Nội → Pác Bó → Tân Trào', 'Tân Trào → Pác Bó → Hà Nội → Kim Liên'],
          correct: 2,
          explanation: 'Thứ tự thời gian: Kim Liên (nơi sinh), Hà Nội (hoạt động cách mạng), Pác Bó (trở về), Tân Trào (thủ đô khu giải phóng).'
        }
      ]
    }
  ];

  // Timer effect
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

  const startGame = (gameId: string) => {
    setSelectedGame(gameId);
    setGameState({
      currentQuestion: 0,
      score: 0,
      answers: [],
      timeLeft: 30,
      isCompleted: false,
      isPlaying: true
    });
  };

  const handleNextQuestion = (prevState: GameState, selectedAnswer: number): GameState => {
    const game = miniGames.find(g => g.id === selectedGame);
    if (!game) return prevState;

    const currentQ = game.questions[prevState.currentQuestion];
    const isCorrect = selectedAnswer === currentQ.correct;
    const newScore = isCorrect ? prevState.score + 1 : prevState.score;
    const newAnswers = [...prevState.answers, selectedAnswer];

    if (prevState.currentQuestion + 1 >= game.questions.length) {
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
    return miniGames.find(game => game.id === selectedGame);
  };

  const getScorePercentage = () => {
    const game = getCurrentGame();
    if (!game) return 0;
    return Math.round((gameState.score / game.questions.length) * 100);
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
    if (!game) return null;

    const currentQuestion = game.questions[gameState.currentQuestion];

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="container mx-auto px-6 py-8">
          {/* Game Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => setSelectedGame(null)}
              className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Thoát game</span>
            </button>

            <div className="flex items-center space-x-6 text-white">
              <div className="text-center">
                <div className="text-2xl font-bold">{gameState.currentQuestion + 1}/{game.questions.length}</div>
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
              style={{ width: `${((gameState.currentQuestion + 1) / game.questions.length) * 100}%` }}
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
              {currentQuestion.options.map((option, index) => (
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
    if (!game) return null;

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
                <div className="text-2xl font-bold text-purple-600">{game.questions.length}</div>
                <div className="text-sm text-gray-600">Tổng câu hỏi</div>
              </div>
            </div>

            {/* Answer Review */}
            <div className="space-y-4 mb-8">
              <h3 className="text-lg font-bold text-gray-900">Kết quả chi tiết:</h3>
              {game.questions.map((q, index) => {
                const userAnswer = gameState.answers[index];
                const isCorrect = userAnswer === q.correct;

                return (
                  <div key={q.id} className={`p-3 rounded-lg border-2 ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Câu {index + 1}</span>
                      {isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    {!isCorrect && (
                      <p className="text-xs text-gray-600 mt-1">
                        Đáp án đúng: {q.options[q.correct]}
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
                <RotateCcw className="w-5 h-5" />
                <span>Chơi lại</span>
              </button>
              <button
                onClick={() => setSelectedGame(null)}
                className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 font-medium"
              >
                Chọn game khác
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
            <button
              onClick={handleBackToHome}
              className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Quay về trang chủ
            </button>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Mini Games giáo dục
            </h1>
            <p className="text-xl text-gray-200 max-w-3xl">
              Học lịch sử một cách vui vẻ và hấp dẫn thông qua các trò chơi tương tác,
              giúp củng cố kiến thức và tạo động lực học tập.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Games Grid */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {miniGames.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
            >
              <div className={`h-32 bg-gradient-to-r ${game.color} relative`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <game.icon className="w-12 h-12 text-white" />
                </div>
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
                  {game.difficulty}
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">{game.title}</h3>
                <p className="text-gray-600 mb-4 text-sm">{game.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Thời gian:</span>
                    <span className="font-medium text-gray-700">{game.timeLimit}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Số câu hỏi:</span>
                    <span className="font-medium text-gray-700">{game.totalQuestions}</span>
                  </div>
                </div>

                <button
                  onClick={() => startGame(game.id)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 font-medium"
                >
                  <Play className="w-4 h-4" />
                  <span>Bắt đầu chơi</span>
                </button>
              </div>
            </motion.div>
          ))}
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
            {[
              { rank: 1, name: 'Nguyễn Văn A', score: '2,450', badge: '🥇' },
              { rank: 2, name: 'Trần Thị B', score: '2,380', badge: '🥈' },
              { rank: 3, name: 'Lê Văn C', score: '2,290', badge: '🥉' },
              { rank: 4, name: 'Phạm Thị D', score: '2,150', badge: '🏅' },
              { rank: 5, name: 'Hoàng Văn E', score: '2,100', badge: '🏅' }
            ].map((player, index) => (
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
                <Trophy className="w-5 h-5 text-yellow-500" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MiniGamesPage;
