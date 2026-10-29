import React, { createContext, useContext, useEffect, useState } from 'react';
import { IUser, UserRole } from '../types';
import { authApi } from '../services/api/authApi';

interface AuthContextType {
  user: IUser | null;
  profile: any;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (credentials: any) => Promise<void>;
  signUpStudent: (data: any) => Promise<void>;
  signUpFaculty: (data: any) => Promise<void>;
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

  const signIn = async (credentials: any) => {
    const data = await authApi.signIn(credentials);
    setUser(data.user);
    setProfile(data.profile);
  };

  const signInWithGoogle = async (idToken: string, linkPassword?: string) => {
    const data = await authApi.googleAuth({ idToken, linkPassword });
    setUser(data.user);
    setProfile(data.profile);
    return data;
  };

  const signUpStudent = async (formData: any) => {
    const data = await authApi.signUpStudent(formData);
    setUser(data.user);
    setProfile(data.profile);
  };

  const signUpFaculty = async (formData: any) => {
    const data = await authApi.signUpFaculty(formData);
    setUser(data.user);
    setProfile(data.profile);
  };

  const signOut = async () => {
    try {
      await authApi.signOut();
    } finally {
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
