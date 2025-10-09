import { useSelector } from "react-redux";
import { Navigate } from "react-router";
import type { RootState } from "../store/store";
import { DEFAULT_AUTHENTICATED_ROUTE } from "../config/routes";

interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const PublicRoute = ({ children, redirectTo = DEFAULT_AUTHENTICATED_ROUTE }: PublicRouteProps) => {
  const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated);
  const status = useSelector((state: RootState) => state.user.status);

  // Permitir acceso durante loading para evitar flicker
  if (status === "loading") {
    return <>{children}</>;
  }
  
  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }
  
  return <>{children}</>;
};

export default PublicRoute;
