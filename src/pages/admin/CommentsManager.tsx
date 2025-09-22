import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Comment } from '../../types/firebase';
import {
  MessageSquare,
  User,
  Star,
  Trash2,
  Eye,
  EyeOff,
  Check,
  X,
  Search,
  Clock
} from 'lucide-react';

interface CommentsManagerProps {}

const CommentsManager: React.FC<CommentsManagerProps> = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('all');

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const commentsQuery = query(collection(db, 'comments'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(commentsQuery);
      const commentsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Comment[];
      setComments(commentsData);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bình luận này?')) {
      try {
        await deleteDoc(doc(db, 'comments', commentId));
        await fetchComments();
      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    }
  };

  const handleApproveComment = async (commentId: string) => {
    try {
      await updateDoc(doc(db, 'comments', commentId), {
        approved: true,
        moderatedAt: new Date(),
        updatedAt: new Date()
      });
      await fetchComments();
    } catch (error) {
      console.error('Error approving comment:', error);
    }
  };

  const handleRejectComment = async (commentId: string) => {
    try {
      await updateDoc(doc(db, 'comments', commentId), {
        approved: false,
        moderatedAt: new Date(),
        updatedAt: new Date()
      });
      await fetchComments();
    } catch (error) {
      console.error('Error rejecting comment:', error);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Không xác định';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        className={i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
      />
    ));
  };

  const getCommentStatus = (comment: any) => {
    if (comment.approved === undefined) return 'pending';
    return comment.approved ? 'approved' : 'rejected';
  };

  const filteredComments = comments.filter(comment => {
    const matchesSearch = comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comment.userName.toLowerCase().includes(searchTerm.toLowerCase());

    const status = getCommentStatus(comment);
    const matchesStatus = statusFilter === 'all' || status === statusFilter;

    const matchesRating = ratingFilter === 'all' || comment.rating.toString() === ratingFilter;

    return matchesSearch && matchesStatus && matchesRating;
  });

  const getStatusStats = () => {
    const pending = comments.filter(c => getCommentStatus(c) === 'pending').length;
    const approved = comments.filter(c => getCommentStatus(c) === 'approved').length;
    const rejected = comments.filter(c => getCommentStatus(c) === 'rejected').length;
    return { pending, approved, rejected };
  };

  const stats = getStatusStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Đang tải bình luận...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Bình luận</h1>
          <p className="text-gray-600 mt-1">Tổng cộng {comments.length} bình luận</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
              <p className="text-yellow-600 text-sm">Chờ duyệt</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <Check className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-green-900">{stats.approved}</p>
              <p className="text-green-600 text-sm">Đã duyệt</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <X className="h-8 w-8 text-red-600" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-red-900">{stats.rejected}</p>
              <p className="text-red-600 text-sm">Từ chối</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <MessageSquare className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-blue-900">{comments.length}</p>
              <p className="text-blue-600 text-sm">Tổng cộng</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm bình luận hoặc tên người dùng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ duyệt</option>
              <option value="approved">Đã duyệt</option>
              <option value="rejected">Từ chối</option>
            </select>

            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả đánh giá</option>
              <option value="5">5 sao</option>
              <option value="4">4 sao</option>
              <option value="3">3 sao</option>
              <option value="2">2 sao</option>
              <option value="1">1 sao</option>
            </select>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {filteredComments.map((comment) => {
          const status = getCommentStatus(comment);

          return (
            <div key={comment.id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {comment.userAvatar ? (
                      <img
                        className="h-10 w-10 rounded-full"
                        src={comment.userAvatar}
                        alt={comment.userName}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Comment Content */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-sm font-medium text-gray-900">{comment.userName}</h3>
                      <div className="flex items-center space-x-1">
                        {renderStars(comment.rating)}
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>

                    <p className="text-gray-700 mb-3">{comment.content}</p>

                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Di sản: {comment.spotId}</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        status === 'approved' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {status === 'pending' && <Clock size={12} className="mr-1" />}
                        {status === 'approved' && <Check size={12} className="mr-1" />}
                        {status === 'rejected' && <X size={12} className="mr-1" />}
                        {status === 'pending' ? 'Chờ duyệt' :
                         status === 'approved' ? 'Đã duyệt' : 'Từ chối'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  {status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApproveComment(comment.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                        title="Duyệt bình luận"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => handleRejectComment(comment.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Từ chối bình luận"
                      >
                        <X size={16} />
                      </button>
                    </>
                  )}

                  {status === 'approved' && (
                    <button
                      onClick={() => handleRejectComment(comment.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Ẩn bình luận"
                    >
                      <EyeOff size={16} />
                    </button>
                  )}

                  {status === 'rejected' && (
                    <button
                      onClick={() => handleApproveComment(comment.id)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                      title="Hiển thị lại"
                    >
                      <Eye size={16} />
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    title="Xóa bình luận"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredComments.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Không tìm thấy bình luận</h3>
          <p className="mt-1 text-sm text-gray-500">Không có bình luận nào phù hợp với bộ lọc hiện tại.</p>
        </div>
      )}
    </div>
  );
};

export default CommentsManager;
