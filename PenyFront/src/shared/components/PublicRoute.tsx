import { useSelector } from "react-redux";
import { Navigate } from "react-router";
import type { RootState } from "../store/store";
import { DEFAULT_AUTHENTICATED_ROUTE, ROUTES } from "../config/routes";
import { useGlobalContext } from "../hooks/useGlobalContext";

interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const PublicRoute = ({ children, redirectTo = DEFAULT_AUTHENTICATED_ROUTE }: PublicRouteProps) => {
  const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated);
  const status = useSelector((state: RootState) => state.user.status);
  const {user} = useGlobalContext();

  if (status === "loading") {
    return <>{children}</>;
  }
  
  if (isAuthenticated) {
    if(user?.isFirstLogin) {
      redirectTo = ROUTES.WELCOME;
    }
    return <Navigate to={redirectTo} replace />;
  }
  
  return <>{children}</>;
};

export default PublicRoute;
