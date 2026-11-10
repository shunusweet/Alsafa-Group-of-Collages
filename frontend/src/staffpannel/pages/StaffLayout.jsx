import { Outlet, useLocation } from "react-router-dom";
import StaffSidebar from "../components/StaffSidebar";

const pageTitles = {
  "/staff/dashboard": "Dashboard",
  "/staff/attendance": "My Attendance",
  "/staff/salary-history": "Salary History",
  "/staff/settings": "Account Settings",
};

export default function StaffLayout() {
  const location = useLocation();
  const title = pageTitles[location.pathname] || "Staff Portal";

  return (
    <div className="min-h-screen bg-slate-100">
      <StaffSidebar />

      <main className="min-h-screen pt-16 lg:ml-72 lg:pt-0">
        
        <div>
          <Outlet />
        </div>
      </main>
    </div>
  );
}