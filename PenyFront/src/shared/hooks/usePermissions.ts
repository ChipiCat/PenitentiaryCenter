import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import type { UserRole, Permission } from '../config/routes';
import { ROLE_PERMISSIONS, ALL_NAV_LINKS } from '../config/routes';
import { getRoleLabel } from '../utils/userUtils';

export const usePermissions = () => {
  // Obtener usuario actual desde Redux
  const { user, isAuthenticated } = useSelector((state: RootState) => state.user);

  const currentUser = useMemo(() => {
    if (!user || !isAuthenticated) {
      return null;
    }
    
    return {
      ...user,
      roleLabel: getRoleLabel(user.role)
    };
  }, [user, isAuthenticated]);

  const userPermissions = useMemo(() => {
    if (!currentUser) return [];
    return ROLE_PERMISSIONS[currentUser.role as UserRole] || [];
  }, [currentUser]);

  const hasPermission = (permission: Permission): boolean => {
    if (!currentUser) return false;
    return userPermissions.includes(permission);
  };

  const getNavigationLinks = () => {
    if (!currentUser) return [];
    return ALL_NAV_LINKS.filter(link => hasPermission(link.permission));
  };

  const canAccess = (requiredPermission: Permission): boolean => {
    return hasPermission(requiredPermission);
  };

  return {
    currentUser,
    userPermissions,
    hasPermission,
    getNavigationLinks,
    canAccess,
    isAuthenticated
  };
};