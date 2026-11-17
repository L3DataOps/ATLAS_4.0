import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useXlvAuth } from "./XlvAuthContext";

export default function XlvProtectedRoute() {
  const { user, loading } = useXlvAuth();
  const location = useLocation();

  if (loading) return <div>Loading...</div>;
  if (!user)
    return <Navigate to="/xlv/login" state={{ from: location }} replace />;

  return <Outlet />;
}
