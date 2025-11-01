// pages/Categories.jsx
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePosts } from '../context/PostContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Categories = () => {
  const { categories, loading, getCategories } = usePosts();

  useEffect(() => {
    getCategories();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Categories</h1>
      
      {categories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(category => (
            <div key={category._id} className="card hover:shadow-lg transition-shadow duration-300">
              <div 
                className="h-2"
                style={{ backgroundColor: category.color || '#6366f1' }}
              ></div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{category.name}</h3>
                {category.description && (
                  <p className="text-gray-600 mb-4">{category.description}</p>
                )}
                <Link 
                  to={`/categories/${category._id}`} 
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  View Posts →
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium text-gray-900 mb-2">No categories found</h3>
          <p className="text-gray-500">There are no categories available at the moment.</p>
        </div>
      )}
    </div>
  );
};

export default Categories;