// components/Comment.jsx
import React from 'react';

// components/Comment.jsx
const Comment = ({ comment }) => {
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          {comment.user?.avatar ? (
            <img 
              src={comment.user.avatar} 
              alt={comment.user.name} 
              className="h-10 w-10 rounded-full"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-gray-600 font-medium">
                {comment.user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">
              {comment.user?.name}
            </h4>
            <span className="text-sm text-gray-500">
              {formatDate(comment.createdAt)}
            </span>
          </div>
          <p className="mt-2 text-gray-700">{comment.content}</p>
        </div>
      </div>
    </div>
  );
};

export default Comment;