import { Navigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import type { UserRole } from '@/data/mockData';

const dashboardByRole: Record<Exclude<UserRole, 'guest'>, string> = {
  buyer: '/buyer/dashboard',
  seller: '/seller/dashboard',
  admin: '/admin/dashboard',
};

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

/**
 * Redirects guests to /login.
 * Buyer/Seller users can access each other's routes (dual-mode support).
 * Admin can only access admin routes; wrong-role users are redirected to their dashboard.
 */
const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { currentRole } = useApp();

  // Not logged in → go to login
  if (currentRole === 'guest') {
    return <Navigate to="/login" replace />;
  }

  // Buyer/Seller dual-mode: if route allows buyer OR seller, let both through
  const isBuyerOrSeller = currentRole === 'buyer' || currentRole === 'seller';
  const routeAllowsBuyerOrSeller = allowedRoles.includes('buyer') || allowedRoles.includes('seller');
  if (isBuyerOrSeller && routeAllowsBuyerOrSeller) {
    return <>{children}</>;
  }

  // Role doesn't match → redirect to own dashboard
  if (!allowedRoles.includes(currentRole)) {
    const redirect = dashboardByRole[currentRole as Exclude<UserRole, 'guest'>];
    return <Navigate to={redirect} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

