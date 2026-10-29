import React, { createContext, useContext, useEffect, useState } from 'react';
import { IUser, UserRole } from '../types';
import { authApi } from '../services/api/authApi';

interface AuthContextType {
  user: IUser | null;
  profile: any;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (credentials: any) => Promise<any>;
  signUpStudent: (data: any) => Promise<any>;
  signUpFaculty: (data: any) => Promise<any>;
  signOut: () => Promise<void>;
  reloadUser: () => Promise<void>;
  signInWithGoogle: (idToken: string, linkPassword?: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const reloadUser = async () => {
    try {
      const data = await authApi.getCurrentUser();
      setUser(data.user);
      setProfile(data.profile);
    } catch {
      setUser(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    reloadUser();
  }, []);

  const handleAuthSuccess = (data: any) => {
    setUser(data.user);
    setProfile(data.profile);
    if (data.tokens?.accessToken) {
      localStorage.setItem('acr_access_token', data.tokens.accessToken);
    }
    if (data.tokens?.refreshToken) {
      localStorage.setItem('acr_refresh_token', data.tokens.refreshToken);
    }
  };

  const signIn = async (credentials: any) => {
    const data = await authApi.signIn(credentials);
    handleAuthSuccess(data);
    return data;
  };

  const signInWithGoogle = async (idToken: string, linkPassword?: string) => {
    const data = await authApi.googleAuth({ idToken, linkPassword });
    handleAuthSuccess(data);
    return data;
  };

  const signUpStudent = async (formData: any) => {
    const data = await authApi.signUpStudent(formData);
    handleAuthSuccess(data);
    return data;
  };

  const signUpFaculty = async (formData: any) => {
    const data = await authApi.signUpFaculty(formData);
    handleAuthSuccess(data);
    return data;
  };

  const signOut = async () => {
    try {
      await authApi.signOut();
    } finally {
      localStorage.removeItem('acr_access_token');
      localStorage.removeItem('acr_refresh_token');
      setUser(null);
      setProfile(null);
      window.location.href = '/sign-in';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isAuthenticated: !!user,
        signIn,
        signInWithGoogle,
        signUpStudent,
        signUpFaculty,
        signOut,
        reloadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
