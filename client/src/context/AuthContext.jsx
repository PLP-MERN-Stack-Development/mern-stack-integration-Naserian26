// context/AuthContext.jsx
import { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from "../services/api"; // ✅ correct


// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  error: null,
};

// Create context
const AuthContext = createContext(initialState);

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'USER_LOADED_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        user: action.payload,
      };
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        ...action.payload,
        isAuthenticated: true,
        loading: false,
      };
    case 'AUTH_ERROR':
    case 'LOGOUT':
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
        user: null,
        error: action.payload,
      };
    case 'CLEAR_ERRORS':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user
  useEffect(() => {
    const loadUser = async () => {
      if (localStorage.token) {
        try {
          const user = authService.getCurrentUser();
          if (user) {
            dispatch({
              type: 'USER_LOADED_SUCCESS',
              payload: user,
            });
          } else {
            dispatch({
              type: 'AUTH_ERROR',
            });
          }
        } catch (err) {
          dispatch({
            type: 'AUTH_ERROR',
            payload: err.response?.data?.error || 'Authentication failed',
          });
        }
      } else {
        dispatch({
          type: 'AUTH_ERROR',
        });
      }
    };

    loadUser();
  }, []);

  // Register user
  const register = async (formData) => {
    try {
      const response = await authService.register(formData);
      dispatch({
        type: 'REGISTER_SUCCESS',
        payload: response,
      });
      return response;
    } catch (err) {
      dispatch({
        type: 'AUTH_ERROR',
        payload: err.response?.data?.error || 'Registration failed',
      });
      throw err;
    }
  };

  // Login user
  const login = async (formData) => {
    try {
      const response = await authService.login(formData);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: response,
      });
      return response;
    } catch (err) {
      dispatch({
        type: 'AUTH_ERROR',
        payload: err.response?.data?.error || 'Login failed',
      });
      throw err;
    }
  };

  // Logout
  const logout = () => {
    authService.logout();
    dispatch({
      type: 'LOGOUT',
    });
  };

  // Clear errors
  const clearErrors = () => {
    dispatch({
      type: 'CLEAR_ERRORS',
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        register,
        login,
        logout,
        clearErrors,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;