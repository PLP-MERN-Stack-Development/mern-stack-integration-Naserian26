// pages/CategoryPosts.jsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePosts } from '../context/PostContext';
import PostCard from '../components/PostCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';

const CategoryPosts = () => {
  const { id } = useParams();
  const { posts, loading, pagination, getPostsByCategory } = usePosts();
  const [category, setCategory] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(6);

  useEffect(() => {
    const fetchCategoryPosts = async () => {
      try {
        const response = await getPostsByCategory(id);
        if (response.data.length > 0) {
          setCategory(response.data[0].category);
        }
      } catch (error) {
        console.error('Failed to fetch category posts:', error);
      }
    };

    fetchCategoryPosts();
  }, [id]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="container py-8">
      <div className="text-center mb-8">
        {category ? (
          <>
            <div 
              className="inline-block px-4 py-2 text-lg font-semibold rounded-full text-white mb-4"
              style={{ backgroundColor: category.color || '#6366f1' }}
            >
              {category.name}
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Posts in {category.name}</h1>
            {category.description && (
              <p className="text-gray-600 mt-2 max-w-2xl mx-auto">{category.description}</p>
            )}
          </>
        ) : (
          <h1 className="text-3xl font-bold text-gray-900">Category Posts</h1>
        )}
      </div>
      
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.length > 0 ? (
              posts.map(post => <PostCard key={post._id} post={post} />)
            ) : (
              <div className="col-span-full text-center py-12">
                <h3 className="text-xl font-medium text-gray-900 mb-2">No posts found in this category</h3>
                <p className="text-gray-500 mb-4">Try exploring other categories or create a new post.</p>
                <Link to="/create-post" className="btn btn-primary">
                  Create Post
                </Link>
              </div>
            )}
          </div>
          
          {pagination && pagination.totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
};

export default CategoryPosts;