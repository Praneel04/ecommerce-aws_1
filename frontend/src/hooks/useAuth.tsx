import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { signIn, signOut, signUp, getCurrentUser, fetchAuthSession, confirmSignUp } from 'aws-amplify/auth';
import { AuthUser } from 'aws-amplify/auth';

// Types
export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'buyer' | 'seller' | 'admin';
  sellerCompany?: string;
  sellerVerified?: 'pending' | 'approved' | 'rejected';
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>;
  confirmRegistration: (email: string, code: string) => Promise<{ success: boolean; error?: string }>;
  getToken: () => Promise<string | null>;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'buyer' | 'seller';
  sellerCompany?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook for authentication
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Convert Cognito user to our UserProfile format
  const formatUser = (cognitoUser: AuthUser): UserProfile => {
    // For now, use basic user info from Cognito
    // In production, you'd fetch additional attributes from the user pool
    return {
      id: cognitoUser.userId,
      email: cognitoUser.username,
      firstName: 'User', // Default until we can fetch from attributes
      lastName: '',
      role: 'buyer', // Default role, can be updated after fetching user attributes
      sellerCompany: undefined,
      sellerVerified: undefined,
    };
  };

  // Check authentication status on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const currentUser = await getCurrentUser();
      if (currentUser) {
        const userProfile = formatUser(currentUser);
        setUser(userProfile);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.log('No authenticated user:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const signInResult = await signIn({
        username: email,
        password: password,
      });

      if (signInResult.isSignedIn) {
        const currentUser = await getCurrentUser();
        const userProfile = formatUser(currentUser);
        setUser(userProfile);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return { success: false, error: 'Sign in incomplete' };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.message || 'Login failed. Please check your credentials.' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const signUpResult = await signUp({
        username: userData.email,
        password: userData.password,
        options: {
          userAttributes: {
            email: userData.email,
            given_name: userData.firstName,
            family_name: userData.lastName,
            'custom:role': userData.role,
            'custom:seller_company': userData.sellerCompany || '',
          },
        },
      });

      console.log('Sign up result:', signUpResult);
      return { success: true };
    } catch (error: any) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.message || 'Registration failed. Please try again.' 
      };
    }
  };

  const confirmRegistration = async (email: string, code: string) => {
    try {
      await confirmSignUp({
        username: email,
        confirmationCode: code,
      });
      return { success: true };
    } catch (error: any) {
      console.error('Confirmation error:', error);
      return { 
        success: false, 
        error: error.message || 'Verification failed. Please check the code.' 
      };
    }
  };

  const getToken = async (): Promise<string | null> => {
    try {
      const session = await fetchAuthSession();
      return session.tokens?.idToken?.toString() || null;
    } catch (error) {
      console.error('Token fetch error:', error);
      return null;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
    confirmRegistration,
    getToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
