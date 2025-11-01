// pages/SearchResults.jsx
import { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { usePosts } from '../context/PostContext';
import PostCard from '../components/PostCard';
import LoadingSpinner from '../components/LoadingSpinner';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const { posts, loading, searchPosts } = usePosts();
  const query = searchParams.get('q') || '';

  useEffect(() => {
    if (query) {
      searchPosts(query);
    }
  }, [query]);

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Search Results</h1>
        {query && (
          <p className="text-gray-600 mt-2">Showing results for: "{query}"</p>
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
                <h3 className="text-xl font-medium text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-500 mb-4">Try searching with different keywords.</p>
                <Link to="/" className="btn btn-primary">
                  Back to Home
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SearchResults;