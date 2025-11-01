const Post = require('../models/Post');
const Category = require('../models/Category');
const generateUniqueSlug = require('../utils/generateSlug');

/**
 * @desc    Get all posts
 * @route   GET /api/posts
 * @access  Public
 */
exports.getPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const { category, search, isPublished } = req.query;

    const query = {};
    if (category) query.category = category;
    if (search) query.$text = { $search: search };
    if (!req.user || req.user.role !== 'admin') {
      query.isPublished = isPublished !== 'false';
    }

    const posts = await Post.find(query)
      .populate('author', 'name avatar')
      .populate('category', 'name color slug')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    const total = await Post.countDocuments(query);

    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    };

    res.status(200).json({ success: true, count: posts.length, pagination, data: posts });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get single post by slug or ID
 * @route   GET /api/posts/:identifier
 * @access  Public
 */
exports.getPost = async (req, res, next) => {
  try {
    const { identifier } = req.params;
    const query = identifier.match(/^[0-9a-fA-F]{24}$/) ? { _id: identifier } : { slug: identifier };

    const post = await Post.findOne(query)
      .populate('author', 'name avatar bio')
      .populate('category', 'name color slug')
      .populate('comments.user', 'name avatar');

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    await post.incrementViewCount();
    res.status(200).json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create new post
 * @route   POST /api/posts
 * @access  Private
 */
exports.createPost = async (req, res, next) => {
  try {
    const { title, content, category, tags } = req.body;

    if (!title || !content || !category) {
      return res.status(400).json({ success: false, message: 'Please provide title, content, and category' });
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ success: false, message: 'Invalid category' });
    }

    // FIX: Pass the Post model as the first argument
    const slug = await generateUniqueSlug(Post, title);

    const plainTextContent = content.replace(/<[^>]*>/g, '');
    const excerpt = plainTextContent.substring(0, 197) + '...';

    
// In controllers/postController.js
const postData = {
  title,
  content,
  author: req.user.id,
  category,
  slug,
  excerpt,
  tags: tags || [],
  // FIX: Default to true if not provided in the request body
  isPublished: req.body.isPublished !== undefined ? req.body.isPublished : true,
};
    const post = await Post.create(postData);
    const populatedPost = await Post.findById(post._id)
      .populate('author', 'name avatar')
      .populate('category', 'name color slug');

    res.status(201).json({ success: true, data: populatedPost });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: 'Validation Error', errors });
    }
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Duplicate field value entered.' });
    }
    next(err);
  }
};

/**
 * @desc    Update post
 * @route   PUT /api/posts/:id
 * @access  Private
 */
exports.updatePost = async (req, res, next) => {
  try {
    let post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to update this post' });
    }

    // If title is updated, generate a new slug
    if (req.body.title && req.body.title !== post.title) {
      // FIX: Pass the Post model as the first argument
      req.body.slug = await generateUniqueSlug(Post, req.body.title);
    }

    if (req.body.content) {
      const plainTextContent = req.body.content.replace(/<[^>]*>/g, '');
      req.body.excerpt = plainTextContent.substring(0, 197) + '...';
    }

    const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('author', 'name avatar')
      .populate('category', 'name color slug');

    res.status(200).json({ success: true, data: updatedPost });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: 'Validation Error', errors });
    }
    next(err);
  }
};

/**
 * @desc    Delete post
 * @route   DELETE /api/posts/:id
 * @access  Private
 */
exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this post' });
    }

    await Post.deleteOne({ _id: req.params.id });

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Add comment to post
 * @route   POST /api/posts/:id/comments
 * @access  Private
 */
exports.addComment = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const { content } = req.body;
    if (!content) return res.status(400).json({ success: false, message: 'Comment content is required' });

    await post.addComment(req.user.id, content);

    const updatedPost = await Post.findById(req.params.id)
      .populate('author', 'name avatar')
      .populate('category', 'name color slug')
      .populate('comments.user', 'name avatar');

    res.status(200).json({ success: true, data: updatedPost });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Search posts
 * @route   GET /api/posts/search
 * @access  Public
 */
exports.searchPosts = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a search query',
      });
    }

    const posts = await Post.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } },
        { excerpt: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } },
      ],
      isPublished: true,
    })
      .populate('author', 'name avatar')
      .populate('category', 'name color slug')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts,
    });
  } catch (err) {
    next(err);
  }
};