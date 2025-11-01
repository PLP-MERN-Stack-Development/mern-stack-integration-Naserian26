// components/CommentForm.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const CommentForm = ({ onCommentSubmit }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onCommentSubmit(content);
      setContent('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <p className="text-gray-600">
          Please <a href="/login" className="text-primary-600 hover:text-primary-500 font-medium">log in</a> to leave a comment.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Leave a Comment</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <textarea
            rows="4"
            className="form-input"
            placeholder="Share your thoughts..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          ></textarea>
        </div>
        <div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Comment'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentForm;