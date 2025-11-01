// pages/PostDetail.jsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePosts } from '../context/PostContext';
import { useAuth } from '../context/AuthContext';
import Comment from '../components/Comment';
import CommentForm from '../components/CommentForm';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';

const PostDetail = () => {
  const { id } = useParams();
  const { post, loading, getPost, addComment } = usePosts();
  const { user } = useAuth();
  const [comments, setComments] = useState([]);

  useEffect(() => {
    getPost(id);
  }, [id]);

  useEffect(() => {
    if (post) {
      setComments(post.comments || []);
    }
  }, [post]);

  const handleCommentAdded = (newComment) => {
    setComments([...comments, newComment]);
  };

  const handleCommentSubmit = async (content) => {
    try {
      await addComment(id, { content });
      toast.success('Comment added successfully');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add comment');
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!post) {
    return (
      <div className="container py-12 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Post not found</h2>
        <p className="text-gray-600 mb-6">The post you're looking for doesn't exist.</p>
        <Link to="/" className="btn btn-primary">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <article className="max-w-4xl mx-auto">
        {/* Post Header */}
        <header className="mb-8">
          <div className="mb-4">
            <span 
              className="inline-block px-3 py-1 text-sm font-semibold rounded-full text-white"
              style={{ backgroundColor: post.category?.color || '#6366f1' }}
            >
              {post.category?.name}
            </span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
            <span>By {post.author?.name}</span>
            <span>{formatDate(post.createdAt)}</span>
            {post.updatedAt !== post.createdAt && (
              <span className="italic">Updated {formatDate(post.updatedAt)}</span>
            )}
            <span>{post.viewCount} views</span>
          </div>
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag, index) => (
                <span key={index} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Featured Image */}
        {post.featuredImage && (
          <div className="mb-8">
            <img 
              src={`/uploads/${post.featuredImage}`} 
              alt={post.title} 
              className="w-full rounded-lg shadow-md"
            />
          </div>
        )}

        {/* Post Content */}
        <div 
          className="prose prose-lg max-w-none mb-8"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Post Actions */}
        <div className="mb-12">
          {user && (user.id === post.author._id || user.role === 'admin') && (
            <Link to={`/edit-post/${post._id}`} className="btn btn-secondary">
              Edit Post
            </Link>
          )}
        </div>

        {/* Comments Section */}
        <section className="border-t pt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Comments ({comments.length})
          </h2>
          
          <CommentForm onCommentSubmit={handleCommentSubmit} />
          
          {comments.length > 0 ? (
            <div className="space-y-6 mt-8">
              {comments.map((comment, index) => (
                <Comment key={index} comment={comment} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No comments yet. Be the first to comment!</p>
            </div>
          )}
        </section>
      </article>
    </div>
  );
};

export default PostDetail;