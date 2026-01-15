import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserRole, StudentData, AdminUser } from '../types';
import { auth } from '../firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

interface AuthContextType {
  currentUser: StudentData | AdminUser | null;
  role: UserRole | null;
  isLoading: boolean;
  loginAsStudent: (student: StudentData) => void;
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
        // Only clear if not logged in as student (since Firebase Auth is for admins only in this setup)
        // However, mixing the two means we need to be careful.
        // If we are logged in as student, firebaseUser will be null, but we shouldn't wipe student state unless intended.
        // For simplicity, if firebase auth is null, we check local storage or session for student,
        // OR we just rely on the manual login functions.
        // BUT, onAuthStateChanged fires on load. 
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
    <AuthContext.Provider value={{ currentUser, role, isLoading, loginAsStudent, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};