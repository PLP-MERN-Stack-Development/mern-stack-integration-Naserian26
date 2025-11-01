const express = require('express');
const router = express.Router();

// Import all the controller functions
const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  addComment,
  searchPosts,
} = require('../controllers/postController');

// Import middleware for protecting routes
const { protect } = require('../middleware/auth');

// --- Public Routes ---

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
router.route('/').get(getPosts);

// @desc    Search posts
// @route   GET /api/posts/search
// @access  Public
router.route('/search').get(searchPosts);

// @desc    Get a single post by ID or slug
// @route   GET /api/posts/:identifier
// @access  Public
router.route('/:identifier').get(getPost);


// --- Protected Routes (Require Login) ---

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
router.route('/').post(protect, createPost);

// @desc    Update or delete a post
// @route   PUT /api/posts/:id
// @route   DELETE /api/posts/:id
// @access  Private
router
  .route('/:id')
  .put(protect, updatePost)
  .delete(protect, deletePost);

// @desc    Add a comment to a post
// @route   POST /api/posts/:id/comments
// @access  Private
router.route('/:id/comments').post(protect, addComment);

module.exports = router;