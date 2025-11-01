const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    content: {
      type: String,
      required: [true, 'Please provide content'],
    },
    excerpt: {
      type: String,
      maxlength: [200, 'Excerpt cannot be more than 200 characters'],
    },
    featuredImage: {
      type: String,
      default: 'default-post.jpg',
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    tags: [String],
    isPublished: {
      type: Boolean,
      default: false,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        content: {
          type: String,
          required: [true, 'Comment cannot be empty'],
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// --- INDEXES FOR PERFORMANCE ---
PostSchema.index({ slug: 1 });
PostSchema.index({ title: 'text', content: 'text' });

// --- MIDDLEWARE ---

// Pre-save hook to ONLY generate excerpt as a fallback.
// Slug generation is now handled in the controller to avoid circular dependency.
PostSchema.pre('save', function (next) {
  // Auto-generate excerpt if not provided
  if (!this.excerpt && this.content) {
    const plainTextContent = this.content.replace(/<[^>]*>/g, '');
    this.excerpt = plainTextContent.substring(0, 197) + '...';
  }
  next();
});

// --- VIRTUALS ---
PostSchema.virtual('url').get(function () {
  return `/posts/${this.slug}`;
});

// --- INSTANCE METHODS ---
PostSchema.methods.addComment = function (userId, content) {
  this.comments.push({ user: userId, content });
  return this.save();
};

PostSchema.methods.incrementViewCount = function () {
  this.viewCount += 1;
  return this.save();
};

module.exports = mongoose.model('Post', PostSchema);