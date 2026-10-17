'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { INITIAL_USERS } from '@/lib/mockData';

export type PermissionAction =
  | 'DESIGN_WORKFLOW'
  | 'CONFIRM_ORDER'
  | 'CREATE_ORDER'
  | 'ALLOCATE_MATERIAL'
  | 'OPERATE_STATION'
  | 'INSPECT_QC'
  | 'VIEW_REPORTS'
  | 'MANAGE_USERS'
  | 'MANAGE_FABRIC_MATRIX';

interface RegisterData {
  fullName: string;
  email: string;
  password?: string;
  role: UserRole;
  stationId?: string;
}

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  allUsers: User[];
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchUser: (userId: string) => void;
  switchRole: (role: UserRole) => void;
  canPerform: (action: PermissionAction) => boolean;
}

const ROLE_PERMISSIONS: Record<UserRole, PermissionAction[]> = {
  ADMIN: [
    'DESIGN_WORKFLOW',
    'CONFIRM_ORDER',
    'CREATE_ORDER',
    'ALLOCATE_MATERIAL',
    'OPERATE_STATION',
    'INSPECT_QC',
    'VIEW_REPORTS',
    'MANAGE_USERS',
    'MANAGE_FABRIC_MATRIX',
  ],
  PROCESS_ENGINEER: ['DESIGN_WORKFLOW', 'VIEW_REPORTS'],
  PRODUCTION_PLANNER: ['CREATE_ORDER', 'CONFIRM_ORDER', 'ALLOCATE_MATERIAL', 'VIEW_REPORTS'],
  WAREHOUSE_KEEPER: ['ALLOCATE_MATERIAL'],
  STATION_OPERATOR: ['OPERATE_STATION'],
  QC_INSPECTOR: ['INSPECT_QC'],
  MANAGER: ['VIEW_REPORTS'],
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(INITIAL_USERS[2]); // Default planner
  const [allUsers, setAllUsers] = useState<User[]>(INITIAL_USERS);

  useEffect(() => {
    const savedUserId = localStorage.getItem('denimflow_active_user_id');
    if (savedUserId) {
      const found = allUsers.find((u) => u.id === savedUserId);
      if (found) setCurrentUser(found);
    }
  }, [allUsers]);

  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!data.success) {
        return { success: false, error: data.error };
      }

      setCurrentUser(data.data);
      localStorage.setItem('denimflow_active_user_id', data.data.id);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Lỗi kết nối máy chủ' };
    }
  };

  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!result.success) {
        return { success: false, error: result.error };
      }

      const newUser: User = result.data;
      setAllUsers((prev) => [...prev, newUser]);
      setCurrentUser(newUser);
      localStorage.setItem('denimflow_active_user_id', newUser.id);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Lỗi kết nối máy chủ' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('denimflow_active_user_id');
  };

  const switchUser = (userId: string) => {
    const target = allUsers.find((u) => u.id === userId);
    if (target) {
      setCurrentUser(target);
      localStorage.setItem('denimflow_active_user_id', target.id);
    }
  };

  const switchRole = (role: UserRole) => {
    const target = allUsers.find((u) => u.role === role);
    if (target) {
      setCurrentUser(target);
      localStorage.setItem('denimflow_active_user_id', target.id);
    }
  };

  const canPerform = (action: PermissionAction): boolean => {
    if (!currentUser) return false;
    const allowed = ROLE_PERMISSIONS[currentUser.role] || [];
    return allowed.includes(action);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        allUsers,
        login,
        register,
        logout,
        switchUser,
        switchRole,
        canPerform,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
