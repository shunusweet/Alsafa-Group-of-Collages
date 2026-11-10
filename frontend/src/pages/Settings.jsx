import { useState } from "react";
import AdminLayout from "../components/AdminLayout";

const Settings = () => {
  // ==========================================
  // USER DATA
  // ==========================================
  const savedUser = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  // ==========================================
  // STATES
  // ==========================================
  const [profile, setProfile] = useState({
    name: savedUser?.name || "",
    email: savedUser?.email || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  // ==========================================
  // PROFILE CHANGE
  // ==========================================
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================
  // PASSWORD CHANGE
  // ==========================================
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================
  // SAVE PROFILE
  // ==========================================
  const handleSaveProfile = (e) => {
    e.preventDefault();

    const updatedUser = {
      ...savedUser,
      name: profile.name,
      email: profile.email,
    };

    localStorage.setItem(
      "user",
      JSON.stringify(updatedUser)
    );

    setMessage({
      type: "success",
      text: "Profile updated successfully.",
    });

    setTimeout(() => {
      setMessage({
        type: "",
        text: "",
      });
    }, 3000);
  };

  // ==========================================
  // CHANGE PASSWORD
  // ==========================================
  const handleChangePassword = (e) => {
    e.preventDefault();

    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      setMessage({
        type: "error",
        text: "Please fill all password fields.",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({
        type: "error",
        text: "New password must be at least 6 characters.",
      });
      return;
    }

    if (
      passwordData.newPassword !==
      passwordData.confirmPassword
    ) {
      setMessage({
        type: "error",
        text: "New password and confirm password do not match.",
      });
      return;
    }

    setMessage({
      type: "success",
      text:
        "Password validation successful. Connect this form to your backend password API.",
    });

    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setTimeout(() => {
      setMessage({
        type: "",
        text: "",
      });
    }, 4000);
  };

  // ==========================================
  // STYLES
  // ==========================================
  const inputStyle =
    "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-[#198754] focus:ring-4 focus:ring-green-100";

  const labelStyle = "mb-2 block text-sm font-semibold text-gray-700";

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <AdminLayout title="Settings">
      <div className="w-full space-y-6">

        {/* ================= PAGE HEADER ================= */}
        <div className="bg-gradient-to-r from-[#198754] to-[#146c43] rounded-2xl p-6 md:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-5 w-full">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-3xl text-white shadow-inner">
              <i className="fa-solid fa-user-gear"></i>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-green-100">
                System Management
              </p>
              <h1 className="text-2xl md:text-3xl font-bold text-white mt-0.5">
                Settings
              </h1>
              <p className="text-green-100 text-sm mt-1">
                Manage your administrator account credentials and system preferences.
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-white/15 px-5 py-3 text-sm font-semibold text-white border border-white/25 shadow-sm flex items-center gap-2">
            <i className="fa-solid fa-shield-halved"></i>
            Administrator Panel
          </div>
        </div>

        {/* ================= MESSAGE ================= */}
        {message.text && (
          <div
            className={`flex items-start gap-3 rounded-xl border px-5 py-4 text-sm font-semibold shadow-sm w-full ${
              message.type === "success"
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            <i
              className={`fa-solid ${
                message.type === "success"
                  ? "fa-circle-check text-green-700"
                  : "fa-circle-exclamation text-red-700"
              } text-xl mt-0.5`}
            ></i>
            <div>
              <p className="font-semibold">
                {message.type === "success" ? "Success" : "Validation Error"}
              </p>
              <p className="text-sm mt-0.5">{message.text}</p>
            </div>
          </div>
        )}

        {/* ================= SETTINGS GRID ================= */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 w-full">

          {/* ================= PROFILE SETTINGS ================= */}
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm w-full">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5 bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-[#198754] text-lg font-bold">
                  <i className="fa-solid fa-user-pen"></i>
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-800">
                    Profile Settings
                  </h2>
                  <p className="text-xs text-gray-500">
                    Update your account name and email address
                  </p>
                </div>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-[#198754]">
                <i className="fa-solid fa-user"></i>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="p-6 md:p-8 space-y-6">
              <div>
                <label className={labelStyle}>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleProfileChange}
                  placeholder="Enter your name"
                  required
                  className={inputStyle}
                />
              </div>

              <div>
                <label className={labelStyle}>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                  placeholder="Enter your email"
                  required
                  className={inputStyle}
                />
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#198754] px-5 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#146c43]"
              >
                <i className="fa-solid fa-floppy-disk"></i>
                Save Profile
              </button>
            </form>
          </div>

          {/* ================= PASSWORD SETTINGS ================= */}
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm w-full">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5 bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-[#198754] text-lg font-bold">
                  <i className="fa-solid fa-lock"></i>
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-800">
                    Security & Password
                  </h2>
                  <p className="text-xs text-gray-500">
                    Change and protect your account password
                  </p>
                </div>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-[#198754]">
                <i className="fa-solid fa-key"></i>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="p-6 md:p-8 space-y-5">
              <div>
                <label className={labelStyle}>Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter current password"
                  required
                  className={inputStyle}
                />
              </div>

              <div>
                <label className={labelStyle}>New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter new password (min 6 chars)"
                  required
                  className={inputStyle}
                />
              </div>

              <div>
                <label className={labelStyle}>Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm new password"
                  required
                  className={inputStyle}
                />
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#198754] px-5 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#146c43]"
              >
                <i className="fa-solid fa-shield-keyhole"></i>
                Change Password
              </button>
            </form>
          </div>

        </div>

        {/* ================= SYSTEM INFORMATION ================= */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm w-full">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5 bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-[#198754] text-lg font-bold">
                <i className="fa-solid fa-server"></i>
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-800">
                  System Information
                </h2>
                <p className="text-xs text-gray-500">
                  Application architecture and technology details
                </p>
              </div>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-[#198754]">
              <i className="fa-solid fa-circle-info"></i>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 p-6 md:p-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* APP */}
            <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-5 transition hover:shadow-sm">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-[#198754]">
                <i className="fa-solid fa-desktop"></i>
              </div>
              <p className="text-xs font-medium text-gray-400">Application</p>
              <p className="mt-1 font-bold text-gray-800">
                Student Management System
              </p>
            </div>

            {/* FRONTEND */}
            <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-5 transition hover:shadow-sm">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-[#198754]">
                <i className="fa-brands fa-react"></i>
              </div>
              <p className="text-xs font-medium text-gray-400">Frontend</p>
              <p className="mt-1 font-bold text-gray-800">React.js & Tailwind</p>
            </div>

            {/* BACKEND */}
            <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-5 transition hover:shadow-sm">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-[#198754]">
                <i className="fa-brands fa-node-js"></i>
              </div>
              <p className="text-xs font-medium text-gray-400">Backend</p>
              <p className="mt-1 font-bold text-gray-800">Node.js / Express</p>
            </div>

            {/* DATABASE */}
            <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-5 transition hover:shadow-sm">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-[#198754]">
                <i className="fa-solid fa-database"></i>
              </div>
              <p className="text-xs font-medium text-gray-400">Database</p>
              <p className="mt-1 font-bold text-gray-800">MySQL Database</p>
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

export default Settings;