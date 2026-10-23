
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";

const Dashboard = () => {
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <AdminLayout title="Dashboard">
      {/* =====================================================
          WELCOME
      ===================================================== */}

      <div className="mb-7">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Welcome, {user?.name || "Administrator"} 👋
        </h1>

        <p className="text-gray-500 mt-1">
          Manage your students, courses and staff from here.
        </p>
      </div>

      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          xl:grid-cols-5
          gap-5
          mb-8
        "
      >
        {/* STUDENTS */}

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Total Students
              </p>

              <h3 className="text-3xl font-bold text-gray-800 mt-2">
                104
              </h3>

              <p className="text-xs text-green-600 mt-2">
                Active Students
              </p>
            </div>

            <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl">
              👥
            </div>
          </div>
        </div>

        {/* COURSES */}

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Total Courses
              </p>

              <h3 className="text-3xl font-bold text-gray-800 mt-2">
                12
              </h3>

              <p className="text-xs text-blue-600 mt-2">
                Available Courses
              </p>
            </div>

            <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl">
              📚
            </div>
          </div>
        </div>

        {/* STAFF */}

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Total Staff
              </p>

              <h3 className="text-3xl font-bold text-gray-800 mt-2">
                8
              </h3>

              <p className="text-xs text-purple-600 mt-2">
                Active Staff
              </p>
            </div>

            <div className="w-14 h-14 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-2xl">
              👨‍💼
            </div>
          </div>
        </div>

        {/* NEW STUDENTS */}

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                New Students
              </p>

              <h3 className="text-3xl font-bold text-gray-800 mt-2">
                25
              </h3>

              <p className="text-xs text-green-600 mt-2">
                This Month
              </p>
            </div>

            <div className="w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-2xl">
              👨‍🎓
            </div>
          </div>
        </div>

        {/* SYSTEM STATUS */}

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                System Status
              </p>

              <h3 className="text-2xl font-bold text-green-600 mt-3">
                Active
              </h3>

              <p className="text-xs text-gray-400 mt-2">
                System is running
              </p>
            </div>

            <div className="w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-2xl">
              ✓
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          QUICK LINKS
      ===================================================== */}

      <div className="bg-black text-white rounded-t-lg px-5 py-3 mb-5">
        <h2 className="text-center font-semibold text-lg">
          Quick Links
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
        {/* ADD STUDENT */}

        <button
          type="button"
          onClick={() =>
            handleNavigation("/students/add")
          }
          className="
            group
            bg-[#075985]
            text-white
            rounded-lg
            p-6
            text-left
            border-l-4
            border-blue-400
            hover:bg-blue-700
            transition
            shadow-sm
          "
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center text-2xl group-hover:scale-110 transition">
              👤+
            </div>

            <div>
              <h3 className="font-bold text-lg">
                Add Student
              </h3>

              <p className="text-blue-100 text-sm mt-1">
                Register new student
              </p>
            </div>
          </div>
        </button>

        {/* VIEW STUDENTS */}

        <button
          type="button"
          onClick={() =>
            handleNavigation("/students")
          }
          className="
            group
            bg-blue-600
            text-white
            rounded-lg
            p-6
            text-left
            border-l-4
            border-red-400
            hover:bg-blue-700
            transition
            shadow-sm
          "
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center text-2xl group-hover:scale-110 transition">
              👥
            </div>

            <div>
              <h3 className="font-bold text-lg">
                Student Records
              </h3>

              <p className="text-blue-100 text-sm mt-1">
                View all students
              </p>
            </div>
          </div>
        </button>

        {/* ADD COURSE */}

        <button
          type="button"
          onClick={() =>
            handleNavigation("/courses/add")
          }
          className="
            group
            bg-[#075985]
            text-white
            rounded-lg
            p-6
            text-left
            border-l-4
            border-cyan-400
            hover:bg-blue-700
            transition
            shadow-sm
          "
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center text-2xl group-hover:scale-110 transition">
              📚+
            </div>

            <div>
              <h3 className="font-bold text-lg">
                Add Course
              </h3>

              <p className="text-blue-100 text-sm mt-1">
                Create new course
              </p>
            </div>
          </div>
        </button>

        {/* VIEW COURSES */}

        <button
          type="button"
          onClick={() =>
            handleNavigation("/courses")
          }
          className="
            group
            bg-blue-600
            text-white
            rounded-lg
            p-6
            text-left
            border-l-4
            border-yellow-400
            hover:bg-blue-700
            transition
            shadow-sm
          "
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center text-2xl group-hover:scale-110 transition">
              📖
            </div>

            <div>
              <h3 className="font-bold text-lg">
                Course Records
              </h3>

              <p className="text-blue-100 text-sm mt-1">
                View all courses
              </p>
            </div>
          </div>
        </button>

        {/* ADD STAFF */}

        <button
          type="button"
          onClick={() =>
            handleNavigation("/staff/add")
          }
          className="
            group
            bg-[#075985]
            text-white
            rounded-lg
            p-6
            text-left
            border-l-4
            border-purple-400
            hover:bg-blue-700
            transition
            shadow-sm
          "
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center text-2xl group-hover:scale-110 transition">
              👨‍💼+
            </div>

            <div>
              <h3 className="font-bold text-lg">
                Add Staff
              </h3>

              <p className="text-blue-100 text-sm mt-1">
                Register new staff
              </p>
            </div>
          </div>
        </button>

        {/* VIEW STAFF */}

        <button
          type="button"
          onClick={() =>
            handleNavigation("/staff")
          }
          className="
            group
            bg-blue-600
            text-white
            rounded-lg
            p-6
            text-left
            border-l-4
            border-pink-400
            hover:bg-blue-700
            transition
            shadow-sm
          "
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center text-2xl group-hover:scale-110 transition">
              👨‍👩‍👧
            </div>

            <div>
              <h3 className="font-bold text-lg">
                Staff Records
              </h3>

              <p className="text-blue-100 text-sm mt-1">
                View all staff
              </p>
            </div>
          </div>
        </button>
        {/* ADD FEE */}

        <button
          type="button"
          onClick={() => handleNavigation("/fees/add")}
          className="
            group bg-emerald-600 text-white rounded-lg p-6 text-left
            border-l-4 border-emerald-300 hover:bg-emerald-700
            transition shadow-sm
          "
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center text-2xl group-hover:scale-110 transition">
              💰+
            </div>
            <div>
              <h3 className="font-bold text-lg">Add Fee</h3>
              <p className="text-emerald-100 text-sm mt-1">Record a monthly student payment</p>
            </div>
          </div>
        </button>

        {/* VIEW FEES */}

        <button
          type="button"
          onClick={() => handleNavigation("/fees")}
          className="
            group bg-teal-600 text-white rounded-lg p-6 text-left
            border-l-4 border-teal-300 hover:bg-teal-700
            transition shadow-sm
          "
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center text-2xl group-hover:scale-110 transition">
              📊
            </div>
            <div>
              <h3 className="font-bold text-lg">Fee Records</h3>
              <p className="text-teal-100 text-sm mt-1">View payments and outstanding balance</p>
            </div>
          </div>
        </button>
      </div>

      {/* =====================================================
          MANAGEMENT SECTIONS
      ===================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* STUDENT MANAGEMENT */}

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="bg-[#075985] text-white px-5 py-4 rounded-t-xl">
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                👥
              </span>

              <div>
                <h2 className="font-bold">
                  Student Management
                </h2>

                <p className="text-xs text-blue-100">
                  Manage student records
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-3">
            <button
              type="button"
              onClick={() =>
                handleNavigation("/students/add")
              }
              className="w-full flex items-center gap-4 p-4 rounded-lg bg-gray-50 hover:bg-blue-50 transition text-left"
            >
              <div className="w-11 h-11 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xl">
                +
              </div>

              <div>
                <h3 className="font-semibold text-gray-800">
                  Add Student
                </h3>

                <p className="text-xs text-gray-500">
                  Add a new student record
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() =>
                handleNavigation("/students")
              }
              className="w-full flex items-center gap-4 p-4 rounded-lg bg-gray-50 hover:bg-blue-50 transition text-left"
            >
              <div className="w-11 h-11 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xl">
                ☷
              </div>

              <div>
                <h3 className="font-semibold text-gray-800">
                  View Students
                </h3>

                <p className="text-xs text-gray-500">
                  View and manage students
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* COURSE MANAGEMENT */}

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="bg-[#075985] text-white px-5 py-4 rounded-t-xl">
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                📚
              </span>

              <div>
                <h2 className="font-bold">
                  Course Management
                </h2>

                <p className="text-xs text-blue-100">
                  Manage available courses
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-3">
            <button
              type="button"
              onClick={() =>
                handleNavigation("/courses/add")
              }
              className="w-full flex items-center gap-4 p-4 rounded-lg bg-gray-50 hover:bg-blue-50 transition text-left"
            >
              <div className="w-11 h-11 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xl">
                +
              </div>

              <div>
                <h3 className="font-semibold text-gray-800">
                  Add Course
                </h3>

                <p className="text-xs text-gray-500">
                  Add a new course
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() =>
                handleNavigation("/courses")
              }
              className="w-full flex items-center gap-4 p-4 rounded-lg bg-gray-50 hover:bg-blue-50 transition text-left"
            >
              <div className="w-11 h-11 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xl">
                ☷
              </div>

              <div>
                <h3 className="font-semibold text-gray-800">
                  View Courses
                </h3>

                <p className="text-xs text-gray-500">
                  Edit and manage courses
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* STAFF MANAGEMENT */}

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="bg-[#075985] text-white px-5 py-4 rounded-t-xl">
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                👨‍💼
              </span>

              <div>
                <h2 className="font-bold">
                  Staff Management
                </h2>

                <p className="text-xs text-blue-100">
                  Manage staff records
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-3">
            <button
              type="button"
              onClick={() =>
                handleNavigation("/staff/add")
              }
              className="w-full flex items-center gap-4 p-4 rounded-lg bg-gray-50 hover:bg-blue-50 transition text-left"
            >
              <div className="w-11 h-11 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xl">
                +
              </div>

              <div>
                <h3 className="font-semibold text-gray-800">
                  Add Staff
                </h3>

                <p className="text-xs text-gray-500">
                  Add a new staff record
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() =>
                handleNavigation("/staff")
              }
              className="w-full flex items-center gap-4 p-4 rounded-lg bg-gray-50 hover:bg-blue-50 transition text-left"
            >
              <div className="w-11 h-11 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center text-xl">
                ☷
              </div>

              <div>
                <h3 className="font-semibold text-gray-800">
                  View Staff
                </h3>

                <p className="text-xs text-gray-500">
                  View and manage staff
                </p>
              </div>
            </button>
          </div>
        </div>
        {/* FEE MANAGEMENT */}

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="bg-emerald-700 text-white px-5 py-4 rounded-t-xl">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💰</span>
              <div>
                <h2 className="font-bold">Fee Management</h2>
                <p className="text-xs text-emerald-100">Manage student fee payments</p>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-3">
            <button
              type="button"
              onClick={() => handleNavigation("/fees/add")}
              className="w-full flex items-center gap-4 p-4 rounded-lg bg-gray-50 hover:bg-emerald-50 transition text-left"
            >
              <div className="w-11 h-11 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xl">
                +
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Add Fee / Payment</h3>
                <p className="text-xs text-gray-500">Record a fee payment</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleNavigation("/fees")}
              className="w-full flex items-center gap-4 p-4 rounded-lg bg-gray-50 hover:bg-emerald-50 transition text-left"
            >
              <div className="w-11 h-11 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl">
                ☷
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">View Fee Records</h3>
                <p className="text-xs text-gray-500">Track paid and remaining fees</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;

