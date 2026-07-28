import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authStorage, loginUserApi, registerUserApi } from '../utils/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginUser: (userData: User, token?: string) => void;
  logoutUser: () => void;
  signIn: (userData: User) => void;
  signOut: () => void;
  loginWithEmail: (email: string, password?: string) => Promise<User>;
  registerAccount: (payload: {
    email: string;
    fullName: string;
    phone: string;
    address?: string;
    password?: string;
  }) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => authStorage.getUser());
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const cached = authStorage.getUser();
    if (cached) {
      setUser(cached);
    }
  }, []);

  const loginUser = (userData: User, token?: string) => {
    setUser(userData);
    authStorage.setAuth(userData, token || 'session-token');
  };

  const logoutUser = () => {
    setUser(null);
    authStorage.clearAuth();
  };

  const loginWithEmail = async (email: string, password?: string): Promise<User> => {
    setLoading(true);
    try {
      const res = await loginUserApi(email, password);
      loginUser(res.user);
      setLoading(false);
      return res.user;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const registerAccount = async (payload: {
    email: string;
    fullName: string;
    phone: string;
    address?: string;
    password?: string;
  }): Promise<User> => {
    setLoading(true);
    try {
      const res = await registerUserApi(payload);
      loginUser(res.user);
      setLoading(false);
      return res.user;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginUser,
        logoutUser,
        signIn: loginUser,
        signOut: logoutUser,
        loginWithEmail,
        registerAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
