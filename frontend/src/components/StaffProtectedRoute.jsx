
import { Navigate, Outlet } from "react-router-dom";

export default function StaffProtectedRoute() {
  const token = localStorage.getItem("staffToken");

  if (!token) {
    return <Navigate to="/staff/login" replace />;
  }

  return <Outlet />;
}
