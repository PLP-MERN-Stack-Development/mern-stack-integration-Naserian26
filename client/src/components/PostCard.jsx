// components/PostCard.jsx
import { Link } from 'react-router-dom';

const PostCard = ({ post }) => {
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="card hover:shadow-lg transition-shadow duration-300">
      {post.featuredImage && (
        <div className="h-48 overflow-hidden">
          <img 
            src={`/uploads/${post.featuredImage}`} 
            alt={post.title} 
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <div className="p-6">
        <div className="mb-3">
          <span 
            className="inline-block px-3 py-1 text-xs font-semibold rounded-full text-white"
            style={{ backgroundColor: post.category?.color || '#6366f1' }}
          >
            {post.category?.name}
          </span>
        </div>
        <h3 className="text-xl font-semibold mb-2">
          <Link to={`/posts/${post._id}`} className="text-gray-900 hover:text-primary-600 transition-colors">
            {post.title}
          </Link>
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-3">
          {post.excerpt || post.content.substring(0, 150) + '...'}
        </p>
        <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
          <span>By {post.author?.name}</span>
          <span>{formatDate(post.createdAt)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">{post.viewCount} views</span>
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {post.tags.slice(0, 2).map((tag, index) => (
                <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  #{tag}
                </span>
              ))}
              {post.tags.length > 2 && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  +{post.tags.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostCard;