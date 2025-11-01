import { createContext, useContext, useReducer, useEffect } from 'react';
import { postService, categoryService } from '../services/api';

// Initial state
const initialState = {
  posts: [],
  post: null,
  categories: [],
  loading: false,
  error: null,
  pagination: null,
};

// Create context
const PostContext = createContext(initialState);

// Reducer
const postReducer = (state, action) => {
  switch (action.type) {
    case 'GET_POSTS_SUCCESS':
      return {
        ...state,
        posts: action.payload.data,
        pagination: action.payload.pagination,
        loading: false,
      };
    case 'GET_POST_SUCCESS':
      return {
        ...state,
        post: action.payload,
        loading: false,
      };
    case 'GET_CATEGORIES_SUCCESS':
      return {
        ...state,
        categories: action.payload.data || action.payload,
        loading: false,
      };
    case 'CREATE_POST_SUCCESS':
      return {
        ...state,
        posts: [action.payload, ...state.posts],
        loading: false,
      };
    case 'UPDATE_POST_SUCCESS':
      return {
        ...state,
        posts: state.posts.map(post =>
          post._id === action.payload._id ? action.payload : post
        ),
        post: state.post?._id === action.payload._id ? action.payload : state.post,
        loading: false,
      };
    case 'DELETE_POST_SUCCESS':
      return {
        ...state,
        posts: state.posts.filter(post => post._id !== action.payload),
        loading: false,
      };
    case 'ADD_COMMENT_SUCCESS':
      return {
        ...state,
        post: action.payload,
        loading: false,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: true,
      };
    case 'POST_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case 'CLEAR_ERRORS':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Provider component
export const PostProvider = ({ children }) => {
  const [state, dispatch] = useReducer(postReducer, initialState);

  // Get categories
  const getCategories = async () => {
    try {
      dispatch({ type: 'SET_LOADING' });
      const response = await categoryService.getAllCategories();
      console.log('Categories response:', response); // Debug log
      
      // Handle different response formats
      const categoriesData = response.data || response;
      console.log('Parsed categories data:', categoriesData); // Debug log
      
      dispatch({
        type: 'GET_CATEGORIES_SUCCESS',
        payload: categoriesData,
      });
      return response;
    } catch (err) {
      console.error('Error fetching categories:', err);
      dispatch({
        type: 'POST_ERROR',
        payload: err.response?.data?.error || 'Failed to fetch categories',
      });
      throw err;
    }
  };

  // Get posts
  const getPosts = async (page = 1, limit = 10, category = null) => {
    try {
      dispatch({ type: 'SET_LOADING' });
      const response = await postService.getAllPosts(page, limit, category);
      dispatch({
        type: 'GET_POSTS_SUCCESS',
        payload: response,
      });
      return response;
    } catch (err) {
      dispatch({
        type: 'POST_ERROR',
        payload: err.response?.data?.error || 'Failed to fetch posts',
      });
      throw err;
    }
  };

  // Get post
  const getPost = async (id) => {
    try {
      dispatch({ type: 'SET_LOADING' });
      const response = await postService.getPost(id);
      dispatch({
        type: 'GET_POST_SUCCESS',
        payload: response.data,
      });
      return response;
    } catch (err) {
      dispatch({
        type: 'POST_ERROR',
        payload: err.response?.data?.error || 'Failed to fetch post',
      });
      throw err;
    }
  };

  // Create post
  const createPost = async (postData) => {
    try {
      dispatch({ type: 'SET_LOADING' });
      const response = await postService.createPost(postData);
      dispatch({
        type: 'CREATE_POST_SUCCESS',
        payload: response.data,
      });
      return response;
    } catch (err) {
      dispatch({
        type: 'POST_ERROR',
        payload: err.response?.data?.error || 'Failed to create post',
      });
      throw err;
    }
  };

  // Update post
  const updatePost = async (id, postData) => {
    try {
      dispatch({ type: 'SET_LOADING' });
      const response = await postService.updatePost(id, postData);
      dispatch({
        type: 'UPDATE_POST_SUCCESS',
        payload: response.data,
      });
      return response;
    } catch (err) {
      dispatch({
        type: 'POST_ERROR',
        payload: err.response?.data?.error || 'Failed to update post',
      });
      throw err;
    }
  };

  // Delete post
  const deletePost = async (id) => {
    try {
      dispatch({ type: 'SET_LOADING' });
      await postService.deletePost(id);
      dispatch({
        type: 'DELETE_POST_SUCCESS',
        payload: id,
      });
    } catch (err) {
      dispatch({
        type: 'POST_ERROR',
        payload: err.response?.data?.error || 'Failed to delete post',
      });
      throw err;
    }
  };

  // Add comment
  const addComment = async (postId, commentData) => {
    try {
      dispatch({ type: 'SET_LOADING' });
      const response = await postService.addComment(postId, commentData);
      dispatch({
        type: 'ADD_COMMENT_SUCCESS',
        payload: response.data,
      });
      return response;
    } catch (err) {
      dispatch({
        type: 'POST_ERROR',
        payload: err.response?.data?.error || 'Failed to add comment',
      });
      throw err;
    }
  };

  // Search posts
  const searchPosts = async (query) => {
    try {
      dispatch({ type: 'SET_LOADING' });
      const response = await postService.searchPosts(query);
      dispatch({
        type: 'GET_POSTS_SUCCESS',
        payload: {
          data: response.data,
          pagination: null,
        },
      });
      return response;
    } catch (err) {
      dispatch({
        type: 'POST_ERROR',
        payload: err.response?.data?.error || 'Failed to search posts',
      });
      throw err;
    }
  };

  // Get posts by category
  const getPostsByCategory = async (categoryId) => {
    try {
      dispatch({ type: 'SET_LOADING' });
      const response = await postService.getPostsByCategory(categoryId);
      dispatch({
        type: 'GET_POSTS_SUCCESS',
        payload: response,
      });
      return response;
    } catch (err) {
      dispatch({
        type: 'POST_ERROR',
        payload: err.response?.data?.error || 'Failed to fetch posts by category',
      });
      throw err;
    }
  };

  // Clear errors
  const clearErrors = () => {
    dispatch({
      type: 'CLEAR_ERRORS',
    });
  };

  return (
    <PostContext.Provider
      value={{
        ...state,
        getPosts,
        getPost,
        getCategories,
        createPost,
        updatePost,
        deletePost,
        addComment,
        searchPosts,
        getPostsByCategory,
        clearErrors,
      }}
    >
      {children}
    </PostContext.Provider>
  );
};

// Hook to use the post context
export const usePosts = () => {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error('usePosts must be used within a PostProvider');
  }
  return context;
};

export default PostContext;