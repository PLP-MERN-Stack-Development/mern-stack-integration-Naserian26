import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePosts } from '../context/PostContext';
import { useAuth } from '../context/AuthContext';
import { uploadService } from "../services/api";
import { toast } from 'react-toastify';

const EditPost = () => {
  const { id } = useParams();
  const { post, loading, getPost, updatePost, getCategories } = usePosts();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    tags: '',
    featuredImage: '',
    isPublished: false,
  });
  
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        await getPost(id);
        const categoriesData = await getCategories();
        setCategories(categoriesData);
      } catch (error) {
        toast.error('Failed to load post data');
        navigate('/');
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    if (post) {
      // Check if user is the author or admin
      if (user && (user.id === post.author._id || user.role === 'admin')) {
        setFormData({
          title: post.title,
          content: post.content,
          excerpt: post.excerpt || '',
          category: post.category._id,
          tags: post.tags ? post.tags.join(', ') : '',
          featuredImage: post.featuredImage || '',
          isPublished: post.isPublished
        });
      } else {
        toast.error('You are not authorized to edit this post');
        navigate('/');
      }
    }
  }, [post, user]);

  const { title, content, excerpt, category, tags, featuredImage, isPublished } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onCheckboxChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.checked });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match('image.*')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    setImageUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await uploadService.uploadImage(formData);
      setFormData(prev => ({
        ...prev,
        featuredImage: response.data
      }));
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.error || 'Failed to upload image');
      setImagePreview('');
      // Reset file input
      e.target.value = '';
    } finally {
      setImageUploading(false);
    }
  };

  const onSubmit = async e => {
    e.preventDefault();
    
    if (!title || !content || !category) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    
    try {
      const postData = {
        title,
        content,
        excerpt,
        category,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
        featuredImage,
        isPublished
      };
      
      await updatePost(id, postData);
      toast.success('Post updated successfully');
      navigate(`/posts/${id}`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update post');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container py-12 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Post not found</h2>
        <p className="text-gray-600 mb-6">The post you're looking for doesn't exist.</p>
        <button onClick={() => navigate(-1)} className="btn btn-primary">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Post</h1>
        
        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="form-label">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={title}
              onChange={onChange}
              className="form-input"
              required
            />
          </div>
          
          <div>
            <label htmlFor="excerpt" className="form-label">Excerpt</label>
            <textarea
              id="excerpt"
              name="excerpt"
              value={excerpt}
              onChange={onChange}
              rows="3"
              className="form-input"
              placeholder="Brief description of your post"
            ></textarea>
          </div>
          
          <div>
            <label htmlFor="content" className="form-label">Content *</label>
            <textarea
              id="content"
              name="content"
              value={content}
              onChange={onChange}
              rows="15"
              className="form-input"
              required
            ></textarea>
          </div>
          
          <div>
            <label htmlFor="category" className="form-label">Category *</label>
            <select
              id="category"
              name="category"
              value={category}
              onChange={onChange}
              className="form-input"
              required
            >
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="tags" className="form-label">Tags (comma separated)</label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={tags}
              onChange={onChange}
              className="form-input"
              placeholder="e.g. technology, web development, javascript"
            />
          </div>
          
          <div>
            <label htmlFor="featuredImage" className="form-label">Featured Image</label>
            <input
              type="file"
              id="featuredImage"
              name="featuredImage"
              onChange={handleImageUpload}
              accept="image/*"
              className="form-input"
              disabled={imageUploading}
            />
            {imageUploading && (
              <p className="mt-2 text-sm text-gray-500">Uploading image...</p>
            )}
            
            {/* Image Preview */}
            {(imagePreview || featuredImage) && (
              <div className="mt-4">
                <img 
                  src={imagePreview || `http://localhost:5000/uploads/${featuredImage}`} 
                  alt="Featured" 
                  className="h-48 w-full object-cover rounded-md"
                />
              </div>
            )}
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPublished"
              name="isPublished"
              checked={isPublished}
              onChange={onCheckboxChange}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-700">
              Publish post
            </label>
          </div>
          
          <div className="flex space-x-4">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || imageUploading}
            >
              {submitting ? 'Updating...' : 'Update Post'}
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate(-1)}
              disabled={submitting || imageUploading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPost;