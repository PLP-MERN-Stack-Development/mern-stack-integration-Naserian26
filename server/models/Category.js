const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a category name'],
    unique: true,
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters'],
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters'],
  },
  color: {
    type: String,
    default: '#6366f1',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create slug from name before saving
CategorySchema.pre('save', function (next) {
  if (!this.isModified('name')) {
    return next();
  }
  
  this.slug = this.name
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
    
  next();
});

module.exports = mongoose.model('Category', CategorySchema);