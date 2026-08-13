import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadSavedUserSession, saveUserSession, loadUsers } from '../utils/storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Detect URL portal route from pathname (clean URL) or hash (fallback)
  const getRouteFromWindow = () => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();

    if (path === '/quanly' || path.startsWith('/quanly') || hash.includes('quanly')) {
      return 'quanly';
    }
    if (path === '/admin' || path.startsWith('/admin') || hash.includes('admin')) {
      return 'admin';
    }
    return 'default';
  };

  const [portalRoute, setPortalRoute] = useState(getRouteFromWindow);
  const [user, setUser] = useState(() => loadSavedUserSession()); // null = logged out
  const [usersList, setUsersList] = useState(() => loadUsers());

  useEffect(() => {
    saveUserSession(user);
  }, [user]);

  useEffect(() => {
    const handleLocationChange = () => {
      setPortalRoute(getRouteFromWindow());
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigateToRoute = (route) => {
    window.history.pushState({}, '', `/${route}`);
    setPortalRoute(route);
  };

  const login = (username, password) => {
    const currentUsers = loadUsers();
    const foundUser = currentUsers.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
    );
    if (foundUser) {
      // On /quanly route, only allow MANAGER login
      if (getRouteFromWindow() === 'quanly' && foundUser.role !== 'MANAGER') {
        return { success: false, message: 'Cổng này chỉ dành cho tài khoản Quản Lý!' };
      }
      // On /admin route, only allow ADMIN login
      if (getRouteFromWindow() === 'admin' && foundUser.role !== 'ADMIN') {
        return { success: false, message: 'Cổng này chỉ dành cho tài khoản Admin!' };
      }
      setUser(foundUser);
      return { success: true, user: foundUser };
    }
    return { success: false, message: 'Tên đăng nhập hoặc mật khẩu không chính xác!' };
  };

  const logout = () => {
    setUser(null);
    saveUserSession(null);
  };

  const switchAccount = (roleName) => {
    const currentUsers = loadUsers();
    const found = currentUsers.find((u) => u.role === roleName);
    if (found) setUser(found);
  };

  const role = user?.role || 'GUEST';

  const permissions = {
    isAdmin: role === 'ADMIN',
    isManager: role === 'MANAGER',
    canAddTransaction: role === 'ADMIN' || role === 'MANAGER',
    canEditTransaction: role === 'ADMIN' || role === 'MANAGER',
    canDeleteTransaction: role === 'ADMIN',
    canManageUsers: role === 'ADMIN',
    canManageSettings: role === 'ADMIN',
    canAccessFinancialReports: role === 'ADMIN',
    canManageInventory: role === 'ADMIN' || role === 'MANAGER',
    canModifyInventory: role === 'ADMIN' || role === 'MANAGER',
  };

  return (
    <AuthContext.Provider value={{ user, role, portalRoute, setPortalRoute, navigateToRoute, permissions, login, logout, switchAccount, usersList, setUsersList }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
