// pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePosts } from '../context/PostContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const { user } = useAuth();
  const { getPosts } = usePosts();
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0
  });

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const response = await getPosts(1, 10, null, user.id);
        setUserPosts(response.data);
        
        // Calculate stats
        const total = response.data.length;
        const published = response.data.filter(post => post.isPublished).length;
        const drafts = total - published;
        
        setStats({
          totalPosts: total,
          publishedPosts: published,
          draftPosts: drafts
        });
      } catch (error) {
        console.error('Failed to fetch user posts:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserPosts();
    }
  }, [user]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {user?.name}!</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Posts</h3>
          <p className="text-3xl font-bold text-primary-600">{stats.totalPosts}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Published</h3>
          <p className="text-3xl font-bold text-green-600">{stats.publishedPosts}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Drafts</h3>
          <p className="text-3xl font-bold text-yellow-600">{stats.draftPosts}</p>
        </div>
      </div>
      
      {/* Create New Post Button */}
      <div className="mb-8">
        <Link to="/create-post" className="btn btn-primary">
          Create New Post
        </Link>
      </div>
      
      {/* User Posts */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Your Posts</h2>
        </div>
        
        {userPosts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {userPosts.map(post => (
                  <tr key={post._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/posts/${post._id}`} className="text-primary-600 hover:text-primary-900 font-medium">
                        {post.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        post.isPublished 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {post.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {post.category?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(post.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link to={`/edit-post/${post._id}`} className="text-primary-600 hover:text-primary-900">
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">You haven't created any posts yet</h3>
            <p className="text-gray-500 mb-4">Start by creating your first post!</p>
            <Link to="/create-post" className="btn btn-primary">
              Create Post
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;