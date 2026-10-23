
import { Navigate, Outlet } from "react-router-dom";

export default function StaffProtectedRoute() {
  const token = localStorage.getItem("staffToken");

  if (!token) {
    return (
      <Navigate
        to="/staffpannel/login"
        replace
      />
    );
  }

  return <Outlet />;
}
