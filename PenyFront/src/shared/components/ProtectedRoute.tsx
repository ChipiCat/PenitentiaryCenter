import { useSelector } from "react-redux";
import { Navigate } from "react-router";
import type { RootState } from "../store/store";
import { DEFAULT_PUBLIC_ROUTE, ROUTES } from "../config/routes";
import { useGlobalContext } from "../hooks/useGlobalContext";
import { useLocation } from "react-router";


interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated);
  const status = useSelector((state: RootState) => state.user.status);
  const { user } = useGlobalContext();
  const location = useLocation();


  // Mostrar loading mientras se verifica la autenticación
  if (status === "loading") {
    return <div>Verificando acceso...</div>;
  }

  if (!isAuthenticated) {

    return <Navigate to={DEFAULT_PUBLIC_ROUTE} replace />;
  }

  if (user && user.isFirstLogin && location.pathname !== ROUTES.WELCOME) {
    return <Navigate to={ROUTES.WELCOME} replace />;
  } 


  return <>{children}</>;
};

export default ProtectedRoute;
