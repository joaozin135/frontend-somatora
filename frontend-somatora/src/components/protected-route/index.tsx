import { Navigate, Outlet } from "react-router";
import { useAuth, type Role } from "../../contexts/authContext";

export interface ProtectedRouteProps {
  roles?: Role[];
}

export default function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { isAuthenticated, hasRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (roles && !hasRole(...roles)) {
    return <Navigate to="/acesso-negado" replace />;
  }

  return <Outlet />;
}
