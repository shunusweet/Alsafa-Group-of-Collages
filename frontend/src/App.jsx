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
import StudentLogin from "./studentpannel/pages/StudentLogin";
import StudentDashboard from "./studentpannel/pages/StudentDashboard";


import StaffLogin from "./staffpannel/pages/StaffLogin";
import StaffDashboard from "./staffpannel/pages/StaffDashboard";
import StaffProtectedRoute from "./staffpannel/pages/StaffProtectedRoute";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Students */}
        <Route path="/students" element={<Students />} />
        <Route path="/students/add" element={<AddStudent />} />

        {/* Courses */}
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/add" element={<AddCourse />} />

        {/* Staff */}
        <Route path="/staff" element={<Staffs />} />
        <Route path="/staff/add" element={<AddStaff />} />
        <Route path="/staff/edit/:id" element={<EditStaff />} />

        {/* Student Attendance */}
        <Route path="/attendance" element={<Attandance />} />
        <Route path="/attendance/add" element={<AddAttandance />} />

        {/* Staff Attendance */}
        <Route path="/staff-attendance" element={<ViewStaffAttendance />} />
        <Route path="/staff-attendance/add" element={<AddStaffAttendance />} />

        {/* Fees */}
        <Route path="/fees" element={<Fees />} />
        <Route path="/fees/add" element={<AddFee />} />

        {/* Settings */}
        <Route path="/settings" element={<Settings />} />

        {/* Unknown paths */}
        <Route path="*" element={<Navigate to="/login" replace />} />

        {/*Student Pannel*/}
        <Route path="/student/login" element={<StudentLogin />} />

        <Route path="/student/dashboard" element={<StudentDashboard />} />
        
          <Route
          path="/staffpannel/login"
          element={<StaffLogin />}
        />

        <Route
          path="/staffpannel/login"
          element={<StaffLogin />}
        />

        <Route element={<StaffProtectedRoute />}>
          <Route
            path="/staffpannel/dashboard"
            element={<StaffDashboard />}
          />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
