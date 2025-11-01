// pages/Home.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePosts } from '../context/PostContext';
import PostCard from '../components/PostCard';
import Pagination from '../components/Pagination';
import SearchBar from '../components/SearchBar';
import LoadingSpinner from '../components/LoadingSpinner';

const Home = () => {
  const { posts, loading, pagination, getPosts } = usePosts();
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(6);

  useEffect(() => {
    getPosts(currentPage, limit);
  }, [currentPage, limit]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-primary-600 text-white py-16">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to MERN Blog</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Discover amazing stories and insights from our community
          </p>
          <SearchBar />
        </div>
      </div>
      
      {/* Latest Posts Section */}
      <div className="container py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Latest Posts</h2>
          <Link to="/categories" className="text-primary-600 hover:text-primary-700 font-medium">
            View All Categories →
          </Link>
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
                  <h3 className="text-2xl font-semibold text-gray-600 mb-4">No posts found</h3>
                  <p className="text-gray-500 mb-6">Be the first to create a post!</p>
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
    </div>
  );
};

export default Home;