import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import AddStudent from "./pages/AddStudent";
import Courses from "./pages/Courses";
import AddCourse from "./pages/AddCourse";
import Staffs from "./pages/Staffs";
import AddStaff from "./pages/AddStaff";
import EditStaff from "./pages/EditStaff";
import Attandance from "./pages/Attandance";
import AddAttandance from "./pages/AddAttandance";
import AddStaffAttendance from "./pages/AddStaffAttendance";
import ViewStaffAttendance from "./pages/ViewStaffAttendance";
import AddFee from "./pages/AddFee";
import Fees from "./pages/Fees";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import HelpSupport from "./pages/HelpSupport";

import StudentLogin from "./studentpannel/pages/StudentLogin";
import StudentDashboard from "./studentpannel/pages/StudentDashboard";

import StaffLogin from "./staffpannel/pages/StaffLogin";
import StaffLayout from "./staffpannel/pages/StaffLayout";
import StaffDashboard from "./staffpannel/pages/StaffDashboard";
import StaffAttendance from "./staffpannel/pages/StaffAttendance";
import SalaryHistory from "./staffpannel/pages/SalaryHistory";
import StaffSettings from "./staffpannel/pages/StaffSettings";
import StaffProtectedRoute from "./staffpannel/pages/StaffProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home */}
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        {/* Admin Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Admin Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Students */}
        <Route path="/students" element={<Students />} />
        <Route path="/students/add" element={<AddStudent />} />

        {/* Courses */}
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/add" element={<AddCourse />} />

        {/* Admin Staff Management */}
        <Route path="/staff" element={<Staffs />} />
        <Route path="/staff/add" element={<AddStaff />} />
        <Route path="/staff/edit/:id" element={<EditStaff />} />

        {/* Student Attendance */}
        <Route path="/attendance" element={<Attandance />} />
        <Route
          path="/attendance/add"
          element={<AddAttandance />}
        />

        {/* Admin Staff Attendance */}
        <Route
          path="/staff-attendance"
          element={<ViewStaffAttendance />}
        />
        <Route
          path="/staff-attendance/add"
          element={<AddStaffAttendance />}
        />

        {/* Fees */}
        <Route path="/fees" element={<Fees />} />
        <Route path="/fees/add" element={<AddFee />} />

        {/* Settings & Help */}
        <Route path="/settings" element={<Settings />} />
        <Route path="/help" element={<HelpSupport />} />

        {/* Student Panel */}
        <Route
          path="/student/login"
          element={<StudentLogin />}
        />
        <Route
          path="/student/dashboard"
          element={<StudentDashboard />}
        />

        {/* Staff Panel */}
        <Route
          path="/staff/login"
          element={<StaffLogin />}
        />

        <Route element={<StaffProtectedRoute />}>
          <Route element={<StaffLayout />}>
            <Route
              path="/staff/dashboard"
              element={<StaffDashboard />}
            />

            <Route
              path="/staff/attendance"
              element={<StaffAttendance />}
            />

            <Route
              path="/staff/salary-history"
              element={<SalaryHistory />}
            />

            <Route
              path="/staff/settings"
              element={<StaffSettings />}
            />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;