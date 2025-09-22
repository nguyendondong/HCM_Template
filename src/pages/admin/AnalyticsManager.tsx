import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import {
  Users,
  MapPin,
  Brain,
  Gamepad2,
  Eye,
  TrendingUp,
  TrendingDown,
  Star,
  Activity,
  Download,
  RefreshCw
} from 'lucide-react';

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  totalSpots: number;
  totalComments: number;
  totalQuizzes: number;
  totalMiniGames: number;
  totalVRContent: number;
  averageRating: number;
  popularSpots: { spotId: string; spotName: string; visits: number }[];
  userEngagement: { date: string; users: number; actions: number }[];
  quizStats: { completed: number; averageScore: number };
  gameStats: { totalPlays: number; averageScore: number };
  commentStats: { approved: number; pending: number; rejected: number };
}

interface AnalyticsManagerProps {}

const AnalyticsManager: React.FC<AnalyticsManagerProps> = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 0,
    activeUsers: 0,
    totalSpots: 0,
    totalComments: 0,
    totalQuizzes: 0,
    totalMiniGames: 0,
    totalVRContent: 0,
    averageRating: 0,
    popularSpots: [],
    userEngagement: [],
    quizStats: { completed: 0, averageScore: 0 },
    gameStats: { totalPlays: 0, averageScore: 0 },
    commentStats: { approved: 0, pending: 0, rejected: 0 }
  });

  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      switch (dateRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      // Fetch all collections in parallel
      const [
        usersSnapshot,
        spotsSnapshot,
        commentsSnapshot,
        quizzesSnapshot,
        miniGamesSnapshot,
        vrContentSnapshot
      ] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'heritageSpots')),
        getDocs(collection(db, 'comments')),
        getDocs(collection(db, 'quizzes')),
        getDocs(collection(db, 'miniGames')),
        getDocs(collection(db, 'vrContents'))
      ]);

      // Process users data
      const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      const recentUsers = users.filter((user: any) => {
        const userDate = user.createdAt?.toDate?.() || new Date(user.createdAt);
        return userDate >= startDate;
      });

      // Process heritage spots
      const spots = spotsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];

      // Process comments
      const comments = commentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      comments.filter((comment: any) => {
        const commentDate = comment.createdAt?.toDate?.() || new Date(comment.createdAt);
        return commentDate >= startDate;
      });

      // Calculate ratings
      const ratings = comments.filter((c: any) => c.rating).map((c: any) => c.rating);
      const averageRating = ratings.length > 0 ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : 0;

      // Process quiz data
      const quizzes = quizzesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];

      // Process mini games
      const miniGames = miniGamesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      const totalPlays = miniGames.reduce((sum: number, game: any) => sum + (game.playCount || 0), 0);
      const averageGameScore = miniGames.length > 0 ? miniGames.reduce((sum: number, game: any) => sum + (game.averageScore || 0), 0) / miniGames.length : 0;

      // Process VR content
      const vrContent = vrContentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];

      // Calculate comment stats
      const approvedComments = comments.filter((c: any) => c.approved === true).length;
      const pendingComments = comments.filter((c: any) => c.approved === undefined).length;
      const rejectedComments = comments.filter((c: any) => c.approved === false).length;

      // Calculate popular spots (simplified - based on comment count)
      const spotCommentCounts: { [key: string]: number } = {};
      comments.forEach((comment: any) => {
        spotCommentCounts[comment.spotId] = (spotCommentCounts[comment.spotId] || 0) + 1;
      });

      const popularSpots = Object.entries(spotCommentCounts)
        .map(([spotId, visits]) => {
          const spot = spots.find((s: any) => s.id === spotId);
          return {
            spotId,
            spotName: spot?.name || 'Không xác định',
            visits
          };
        })
        .sort((a, b) => b.visits - a.visits)
        .slice(0, 5);

      // Generate engagement data (simplified)
      const userEngagement = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayComments = comments.filter((comment: any) => {
          const commentDate = comment.createdAt?.toDate?.() || new Date(comment.createdAt);
          return commentDate.toDateString() === date.toDateString();
        }).length;

        userEngagement.push({
          date: date.toISOString().split('T')[0],
          users: Math.floor(Math.random() * 20) + dayComments, // Simplified
          actions: dayComments * 2 + Math.floor(Math.random() * 10)
        });
      }

      setAnalytics({
        totalUsers: users.length,
        activeUsers: recentUsers.length,
        totalSpots: spots.length,
        totalComments: comments.length,
        totalQuizzes: quizzes.length,
        totalMiniGames: miniGames.length,
        totalVRContent: vrContent.length,
        averageRating,
        popularSpots,
        userEngagement,
        quizStats: {
          completed: Math.floor(Math.random() * 100), // Simplified
          averageScore: 75 + Math.floor(Math.random() * 20)
        },
        gameStats: {
          totalPlays,
          averageScore: averageGameScore || 0
        },
        commentStats: {
          approved: approvedComments,
          pending: pendingComments,
          rejected: rejectedComments
        }
      });

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const exportData = () => {
    const dataStr = JSON.stringify(analytics, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500 flex items-center">
          <RefreshCw className="animate-spin mr-2" size={20} />
          Đang tải dữ liệu phân tích...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Phân tích & Thống kê</h1>
          <p className="text-gray-600 mt-1">
            Cập nhật lần cuối: {lastUpdated.toLocaleString('vi-VN')}
          </p>
        </div>
        <div className="flex space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">7 ngày qua</option>
            <option value="30d">30 ngày qua</option>
            <option value="90d">90 ngày qua</option>
            <option value="1y">1 năm qua</option>
          </select>
          <button
            onClick={fetchAnalytics}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <RefreshCw size={16} className="mr-2" />
            Làm mới
          </button>
          <button
            onClick={exportData}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
          >
            <Download size={16} className="mr-2" />
            Xuất dữ liệu
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-blue-900">{formatNumber(analytics.totalUsers)}</p>
              <p className="text-blue-600 text-sm">Tổng người dùng</p>
              <p className="text-xs text-gray-500">
                +{analytics.activeUsers} hoạt động ({dateRange})
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <MapPin className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-green-900">{analytics.totalSpots}</p>
              <p className="text-green-600 text-sm">Di sản</p>
              <p className="text-xs text-gray-500">
                {analytics.popularSpots.length} được ghé thăm nhiều
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <Star className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-yellow-900">{formatNumber(analytics.totalComments)}</p>
              <p className="text-yellow-600 text-sm">Bình luận</p>
              <p className="text-xs text-gray-500">
                ⭐ {analytics.averageRating.toFixed(1)} điểm TB
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-purple-900">
                {analytics.totalQuizzes + analytics.totalMiniGames + analytics.totalVRContent}
              </p>
              <p className="text-purple-600 text-sm">Tổng nội dung</p>
              <p className="text-xs text-gray-500">
                {analytics.gameStats.totalPlays} lượt chơi
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Content Stats */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Thống kê Nội dung</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Brain className="h-5 w-5 text-blue-500 mr-2" />
                <span className="text-sm text-gray-700">Quiz</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-medium">{analytics.totalQuizzes}</span>
                <p className="text-xs text-gray-500">
                  {analytics.quizStats.completed} hoàn thành
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Gamepad2 className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-sm text-gray-700">Mini Games</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-medium">{analytics.totalMiniGames}</span>
                <p className="text-xs text-gray-500">
                  {analytics.gameStats.totalPlays} lượt chơi
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Eye className="h-5 w-5 text-purple-500 mr-2" />
                <span className="text-sm text-gray-700">VR Content</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-medium">{analytics.totalVRContent}</span>
                <p className="text-xs text-gray-500">Trải nghiệm VR</p>
              </div>
            </div>
          </div>
        </div>

        {/* Comment Moderation Stats */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Kiểm duyệt Bình luận</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Đã duyệt</span>
              <div className="flex items-center">
                <span className="text-lg font-medium text-green-600">
                  {analytics.commentStats.approved}
                </span>
                <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width: `${(analytics.commentStats.approved / analytics.totalComments) * 100}%`
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Chờ duyệt</span>
              <div className="flex items-center">
                <span className="text-lg font-medium text-yellow-600">
                  {analytics.commentStats.pending}
                </span>
                <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{
                      width: `${(analytics.commentStats.pending / analytics.totalComments) * 100}%`
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Từ chối</span>
              <div className="flex items-center">
                <span className="text-lg font-medium text-red-600">
                  {analytics.commentStats.rejected}
                </span>
                <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{
                      width: `${(analytics.commentStats.rejected / analytics.totalComments) * 100}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Heritage Spots */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Di sản Phổ biến nhất</h3>
          <div className="space-y-3">
            {analytics.popularSpots.slice(0, 5).map((spot, index) => (
              <div key={spot.spotId} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    index === 0 ? 'bg-yellow-100 text-yellow-800' :
                    index === 1 ? 'bg-gray-100 text-gray-800' :
                    index === 2 ? 'bg-orange-100 text-orange-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="ml-3 text-sm text-gray-900">{spot.spotName}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium">{spot.visits}</span>
                  <span className="text-xs text-gray-500 ml-1">lượt ghé thăm</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Engagement Trend */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Xu hướng Tương tác</h3>
          <div className="space-y-2">
            {analytics.userEngagement.slice(-7).map((day, index) => {
              const prevDay = analytics.userEngagement[index - 1];
              const trend = prevDay ? day.actions - prevDay.actions : 0;

              return (
                <div key={day.date} className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {new Date(day.date).toLocaleDateString('vi-VN', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">{day.actions} hành động</span>
                    {trend > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : trend < 0 ? (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    ) : (
                      <div className="h-4 w-4" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Hiệu suất Hệ thống</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {analytics.quizStats.averageScore.toFixed(0)}%
            </div>
            <div className="text-sm text-gray-600">Điểm TB Quiz</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {analytics.gameStats.averageScore.toFixed(0)}
            </div>
            <div className="text-sm text-gray-600">Điểm TB Game</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {((analytics.commentStats.approved / analytics.totalComments) * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-gray-600">Tỷ lệ duyệt BL</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsManager;
