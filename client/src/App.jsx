// App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import { PostProvider } from './context/PostContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import PostDetail from './pages/PostDetail';
import CreatePost from './pages/CreatePost';
import EditPost from './pages/EditPost';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import CategoryPosts from './pages/CategoryPosts';
import SearchResults from './pages/SearchResults';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

function App() {
  return (
    <AuthProvider>
      <PostProvider>
        <Router>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/posts/:id" element={<PostDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/categories/:id" element={<CategoryPosts />} />
                <Route path="/search" element={<SearchResults />} />
                <Route
                  path="/create-post"
                  element={
                    <ProtectedRoute>
                      <CreatePost />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/edit-post/:id"
                  element={
                    <ProtectedRoute>
                      <EditPost />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <Dashboard />
                    </AdminRoute>
                  }
                />
              </Routes>
            </main>
            <Footer />
            <ToastContainer />
          </div>
        </Router>
      </PostProvider>
    </AuthProvider>
  );
}

export default App;