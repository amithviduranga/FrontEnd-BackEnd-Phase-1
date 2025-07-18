import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI, apiUtils } from '@/services/api';
import { LoginRequest, AuthenticationResponse } from '@/types';
import { AdminLoginRequest } from '@/Admin/types/AdminTypes';
import { toast } from 'react-hot-toast';

// Define the context type
interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthenticationResponse | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<boolean>;
  adminLogin: (credentials: AdminLoginRequest) => Promise<boolean>;
  logout: () => void;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  loading: true,
  login: async () => false,
  adminLogin: async () => false,
  logout: () => {},
});

// Hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Auth Provider Component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<AuthenticationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const location = useLocation();
  // Check if user is authenticated on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('userData');
    
    console.log('🔍 AuthContext: Checking stored authentication data...');
    console.log('🔍 Token exists:', !!token);
    console.log('🔍 User data exists:', !!storedUser);
    
    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        console.log('🔍 Parsed user data:', userData);
        
        // Add token back to userData for complete AuthenticationResponse
        const completeUserData = { ...userData, token };
        setUser(completeUserData);
        setIsAuthenticated(true);
        
        console.log('✅ Authentication restored for user:', userData.role || 'unknown role');
      } catch (error) {
        console.error('❌ Error parsing stored user data:', error);
        // Clear invalid data
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      }
    } else {
      console.log('ℹ️ No stored authentication data found');
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (credentials: LoginRequest): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await authAPI.login(credentials);
      
      if (response.success && response.data) {
        const { token, ...userData } = response.data;
        
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Keep complete response data including token
        setUser(response.data);
        setIsAuthenticated(true);
        
        // Role-based routing
        const userRole = response.data.role?.toLowerCase() || 'buyer';

        console.log("user role",userRole)
        console.log('🔄 Redirecting user based on role:', userRole);
        
        if (userRole === 'admin') {
          console.log('👑 Redirecting to admin dashboard');
          navigate('/admin/dashboard');
        } else if (userRole === 'seller') {
          console.log('🏪 Redirecting to seller dashboard');
          navigate('/seller/dashboard');
        } else {
          console.log('🛒 Redirecting to buyer dashboard');
          navigate('/buyer/dashboard');
        }
        
        toast.success('Login successful!');
        return true;
      } else {
        toast.error(response.message || 'Login failed');
        return false;
      }
    } catch (error) {
      const errorMessage = apiUtils.formatErrorMessage(error);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Admin login function
  const adminLogin = async (credentials: AdminLoginRequest): Promise<boolean> => {
    try {
      setLoading(true);
      console.log('🔑 Admin login attempt for username:', credentials.username);
      const response = await authAPI.adminLogin(credentials);
      
      if (response.success && response.data) {
        console.log('✅ Admin login successful');
        
        // Store admin token and data
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('userData', JSON.stringify({
          userId: response.data.userId,
          username: response.data.username,
          email: response.data.email,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          role: response.data.role,
          department: response.data.department,
          employeeId: response.data.employeeId,
          accessLevel: response.data.accessLevel,
          isActive: response.data.isActive
        }));
        
        // Convert admin response to AuthenticationResponse format for compatibility
        const adminUserData: AuthenticationResponse = {
          token: response.data.token,
          type: response.data.type,
          userId: response.data.userId,
          email: response.data.email,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          isVerified: true, // Admins are always verified
          verificationStatus: 'VERIFIED',
          role: response.data.role
        };
        
        // Update auth context state
        setUser(adminUserData);
        setIsAuthenticated(true);
        
        toast.success('Admin login successful!');
        
        // Redirect to admin dashboard
        navigate('/admin/dashboard');
        return true;
      } else {
        console.error('❌ Admin login failed:', response.message);
        toast.error(response.message || 'Admin login failed');
        return false;
      }
    } catch (error: any) {
      console.error('❌ Admin login error:', error);
      toast.error(error.response?.data?.message || 'Admin login failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    // Check user role before clearing data
    const isAdminUser = user?.role?.toLowerCase() === 'admin';
    const currentPath = location.pathname;
    
    console.log('🚪 Logout initiated...');
    console.log('🔍 User role:', user?.role);
    console.log('🔍 Current path:', currentPath);
    console.log('🔍 Is admin user:', isAdminUser);
    
    // Clear stored data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('registrationProgress');
    
    // Clear context state
    setUser(null);
    setIsAuthenticated(false);
    
    // Redirect based on user role and current location
    if (isAdminUser || currentPath.startsWith('/admin')) {
      console.log('👑 Redirecting admin to admin login');
      navigate('/admin/login');
      toast.success('Admin logged out successfully');
    } else {
      console.log('👤 Redirecting regular user to login');
      navigate('/login');
      toast.success('Logged out successfully');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        login,
        adminLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
