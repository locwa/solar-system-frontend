import React, { createContext, useState, useEffect, useContext } from 'react';

interface User {
  id: number;
  name: string;
  role: string;
  isGalactic: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // On mount, try to fetch user data from a session endpoint or local storage
    // For this example, we'll assume a session endpoint '/api/auth/me'
    const fetchUser = async () => {
      try {
        const response = await fetch(`https://solar-system-backend-production.up.railway.app/api/auth/me`, { credentials: 'include' });
        if (response.ok) {
          const userData: User = await response.json();
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to fetch user session:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);
//g
  const login = (userData: User) => {
    setUser(userData);
  };

  const BASE_URL = "solar-system-backend-production.up.railway.app"

  const logout = async () => {
    try {
      const response = await fetch(`https://solar-system-backend-production.up.railway.app/api/auth/logout`, { method: 'POST', credentials: 'include' });
      if (response.ok) {
        setUser(null);
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
