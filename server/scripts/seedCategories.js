const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('../models/Category');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Function to generate slugs from names
const generateSlug = (name) => name.toLowerCase().replace(/\s+/g, '-');

const seedCategories = async () => {
  try {
    // Remove existing categories
    await Category.deleteMany({});

    // Categories with slugs
    const categories = [
      { name: 'Technology', description: 'Tech news and tutorials', color: '#3b82f6' },
      { name: 'Web Development', description: 'HTML, CSS, JavaScript and more', color: '#10b981' },
      { name: 'React', description: 'React.js tutorials and news', color: '#06b6d4' },
      { name: 'Node.js', description: 'Server-side JavaScript', color: '#84cc16' },
      { name: 'Design', description: 'UI/UX design principles', color: '#f59e0b' },
      { name: 'Business', description: 'Business and entrepreneurship', color: '#ef4444' },
    ].map(cat => ({ ...cat, slug: generateSlug(cat.name) })); // Add slug dynamically

    // Insert categories
    await Category.insertMany(categories);

    console.log('Categories seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
};

seedCategories();
