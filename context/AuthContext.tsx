import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserRole, StudentData, AdminUser } from '../types';
import { auth } from '../firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

interface AuthContextType {
  currentUser: StudentData | AdminUser | null;
  role: UserRole | null;
  isLoading: boolean;
  loginAsStudent: (student: StudentData) => void;
  updateProfile: (data: Partial<StudentData>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<StudentData | AdminUser | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Handle Admin Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
      if (firebaseUser) {
        setCurrentUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          role: UserRole.ADMIN
        });
        setRole(UserRole.ADMIN);
      } else {
        if (role !== UserRole.STUDENT) {
            setCurrentUser(null);
            setRole(null);
        }
      }
      setIsLoading(false);
    });
    return unsubscribe;
  }, [role]);

  const loginAsStudent = (student: StudentData) => {
    setCurrentUser(student);
    setRole(UserRole.STUDENT);
    localStorage.setItem('student_session', JSON.stringify(student));
  };

  const updateProfile = (data: Partial<StudentData>) => {
    if (role === UserRole.STUDENT && currentUser) {
      const updatedUser = { ...currentUser, ...data } as StudentData;
      setCurrentUser(updatedUser);
      localStorage.setItem('student_session', JSON.stringify(updatedUser));
    }
  };

  const logout = async () => {
    if (role === UserRole.ADMIN) {
      await auth.signOut();
    }
    localStorage.removeItem('student_session');
    setCurrentUser(null);
    setRole(null);
  };

  // Persist student session
  useEffect(() => {
    const stored = localStorage.getItem('student_session');
    if (stored && !currentUser && !isLoading) {
      try {
        const student = JSON.parse(stored);
        setCurrentUser(student);
        setRole(UserRole.STUDENT);
      } catch (e) {
        localStorage.removeItem('student_session');
      }
    }
  }, [currentUser, isLoading]);

  return (
    <AuthContext.Provider value={{ currentUser, role, isLoading, loginAsStudent, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};