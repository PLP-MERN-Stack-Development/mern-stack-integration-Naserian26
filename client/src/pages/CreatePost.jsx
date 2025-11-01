import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePosts } from '../context/PostContext';
import { uploadService } from "../services/api";
import { toast } from 'react-toastify';

const CreatePost = () => {
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
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  
  const { createPost, getCategories } = usePosts();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log('Fetching categories...'); // Debug log
        const response = await getCategories();
        console.log('Categories fetched:', response); // Debug log
        
        // Handle different response formats
        const categoriesData = response.data || response;
        console.log('Categories data:', categoriesData); // Debug log
        
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        
        // Set default category if available
        if (categoriesData && categoriesData.length > 0) {
          setFormData(prev => ({ 
            ...prev, 
            category: categoriesData[0]._id 
          }));
        }
      } catch (error) {
        console.error('Failed to load categories:', error);
        toast.error('Failed to load categories');
      }
    };

    fetchCategories();
  }, []);

  // Add this to debug categories from context
  const { categories: contextCategories } = usePosts();
  useEffect(() => {
    console.log('Categories from context:', contextCategories);
    if (contextCategories && contextCategories.length > 0) {
      setCategories(contextCategories);
      if (!formData.category) {
        setFormData(prev => ({ 
          ...prev, 
          category: contextCategories[0]._id 
        }));
      }
    }
  }, [contextCategories]);

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
    
    console.log('Form data before submission:', formData); // Debug log
    
    if (!title || !content || !category) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    
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
      
      console.log('Post data to be sent:', postData); // Debug log
      
      const response = await createPost(postData);
      console.log('Create post response:', response); // Debug log
      
      toast.success('Post created successfully');
      navigate('/');
    } catch (error) {
      console.error('Create post error:', error);
      console.error('Error response:', error.response?.data); // Debug log
      
      // Show more specific error message
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to create post';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Post</h1>
        
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
            {categories.length === 0 && (
              <p className="mt-2 text-sm text-red-600">
                No categories available. Please create a category first.
              </p>
            )}
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
              Publish immediately
            </label>
          </div>
          
          <div className="flex space-x-4">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || imageUploading || categories.length === 0}
            >
              {loading ? 'Creating...' : 'Create Post'}
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate(-1)}
              disabled={loading || imageUploading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;