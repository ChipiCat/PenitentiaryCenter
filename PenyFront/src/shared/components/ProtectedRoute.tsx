import { useSelector } from "react-redux";
import { Navigate } from "react-router";
import type { RootState } from "../store/store";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated);
  const status = useSelector((state: RootState) => state.user.status);

  // Mostrar loading mientras se verifica la autenticación
  if (status === "loading") {
    return <div>Verificando acceso...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
