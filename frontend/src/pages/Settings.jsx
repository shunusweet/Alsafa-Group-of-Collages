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
        text:
          "New password must be at least 6 characters.",
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
  // RENDER
  // ==========================================

  return (
    <AdminLayout title="Settings">

      {/* ==========================================
          PAGE HEADER
      ========================================== */}

      <div className="mb-6">

        <div
          className="
            bg-gradient-to-r
            from-[#075985]
            to-[#064e6f]
            rounded-2xl
            p-5
            md:p-6
            text-white
            shadow-lg
          "
        >
          <div className="flex items-center gap-4">

            <div
              className="
                w-14
                h-14
                rounded-xl
                bg-white/15
                flex
                items-center
                justify-center
                text-2xl
              "
            >
              ⚙️
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Settings
              </h1>

              <p className="text-blue-100 text-sm mt-1">
                Manage your administrator account settings
              </p>
            </div>

          </div>
        </div>

      </div>

      {/* ==========================================
          MESSAGE
      ========================================== */}

      {message.text && (
        <div
          className={`
            mb-6
            px-4
            py-3
            rounded-xl
            border
            flex
            items-center
            gap-3
            ${
              message.type === "success"
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-red-50 border-red-200 text-red-700"
            }
          `}
        >
          <span className="text-lg">
            {message.type === "success"
              ? "✅"
              : "⚠️"}
          </span>

          <span className="text-sm font-medium">
            {message.text}
          </span>
        </div>
      )}

      {/* ==========================================
          SETTINGS GRID
      ========================================== */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* ==========================================
            PROFILE SETTINGS
        ========================================== */}

        <div
          className="
            bg-white
            rounded-2xl
            border
            border-gray-100
            shadow-sm
            overflow-hidden
          "
        >

          <div
            className="
              px-6
              py-5
              border-b
              border-gray-100
            "
          >
            <div className="flex items-center gap-3">

              <div
                className="
                  w-11
                  h-11
                  rounded-xl
                  bg-blue-50
                  text-blue-600
                  flex
                  items-center
                  justify-center
                  text-xl
                "
              >
                👤
              </div>

              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  Profile Settings
                </h2>

                <p className="text-xs text-gray-400">
                  Update your account information
                </p>
              </div>

            </div>
          </div>

          <form
            onSubmit={handleSaveProfile}
            className="p-6"
          >

            {/* Name */}

            <div className="mb-5">

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>

              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleProfileChange}
                placeholder="Enter your name"
                className="
                  w-full
                  px-4
                  py-3
                  border
                  border-gray-200
                  rounded-xl
                  outline-none
                  focus:ring-2
                  focus:ring-blue-500
                  focus:border-blue-500
                "
              />

            </div>

            {/* Email */}

            <div className="mb-6">

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>

              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleProfileChange}
                placeholder="Enter your email"
                className="
                  w-full
                  px-4
                  py-3
                  border
                  border-gray-200
                  rounded-xl
                  outline-none
                  focus:ring-2
                  focus:ring-blue-500
                  focus:border-blue-500
                "
              />

            </div>

            <button
              type="submit"
              className="
                w-full
                bg-blue-600
                text-white
                px-5
                py-3
                rounded-xl
                font-semibold
                hover:bg-blue-700
                transition
              "
            >
              💾 Save Profile
            </button>

          </form>

        </div>

        {/* ==========================================
            PASSWORD SETTINGS
        ========================================== */}

        <div
          className="
            bg-white
            rounded-2xl
            border
            border-gray-100
            shadow-sm
            overflow-hidden
          "
        >

          <div
            className="
              px-6
              py-5
              border-b
              border-gray-100
            "
          >
            <div className="flex items-center gap-3">

              <div
                className="
                  w-11
                  h-11
                  rounded-xl
                  bg-purple-50
                  text-purple-600
                  flex
                  items-center
                  justify-center
                  text-xl
                "
              >
                🔐
              </div>

              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  Change Password
                </h2>

                <p className="text-xs text-gray-400">
                  Update your account password
                </p>
              </div>

            </div>
          </div>

          <form
            onSubmit={handleChangePassword}
            className="p-6"
          >

            {/* Current Password */}

            <div className="mb-5">

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Current Password
              </label>

              <input
                type="password"
                name="currentPassword"
                value={
                  passwordData.currentPassword
                }
                onChange={handlePasswordChange}
                placeholder="Enter current password"
                className="
                  w-full
                  px-4
                  py-3
                  border
                  border-gray-200
                  rounded-xl
                  outline-none
                  focus:ring-2
                  focus:ring-purple-500
                  focus:border-purple-500
                "
              />

            </div>

            {/* New Password */}

            <div className="mb-5">

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                New Password
              </label>

              <input
                type="password"
                name="newPassword"
                value={
                  passwordData.newPassword
                }
                onChange={handlePasswordChange}
                placeholder="Enter new password"
                className="
                  w-full
                  px-4
                  py-3
                  border
                  border-gray-200
                  rounded-xl
                  outline-none
                  focus:ring-2
                  focus:ring-purple-500
                  focus:border-purple-500
                "
              />

            </div>

            {/* Confirm Password */}

            <div className="mb-6">

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm New Password
              </label>

              <input
                type="password"
                name="confirmPassword"
                value={
                  passwordData.confirmPassword
                }
                onChange={handlePasswordChange}
                placeholder="Confirm new password"
                className="
                  w-full
                  px-4
                  py-3
                  border
                  border-gray-200
                  rounded-xl
                  outline-none
                  focus:ring-2
                  focus:ring-purple-500
                  focus:border-purple-500
                "
              />

            </div>

            <button
              type="submit"
              className="
                w-full
                bg-purple-600
                text-white
                px-5
                py-3
                rounded-xl
                font-semibold
                hover:bg-purple-700
                transition
              "
            >
              🔐 Change Password
            </button>

          </form>

        </div>

      </div>

      {/* ==========================================
          SYSTEM INFORMATION
      ========================================== */}

      <div
        className="
          mt-6
          bg-white
          rounded-2xl
          border
          border-gray-100
          shadow-sm
          p-6
        "
      >

        <div className="flex items-center gap-3 mb-5">

          <div
            className="
              w-11
              h-11
              rounded-xl
              bg-gray-100
              text-gray-600
              flex
              items-center
              justify-center
              text-xl
            "
          >
            ℹ️
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800">
              System Information
            </h2>

            <p className="text-xs text-gray-400">
              Application information
            </p>
          </div>

        </div>

        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-4
            gap-4
          "
        >

          <div className="p-4 rounded-xl bg-gray-50">
            <p className="text-xs text-gray-400">
              Application
            </p>

            <p className="font-bold text-gray-700 mt-1">
              Student Management System
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gray-50">
            <p className="text-xs text-gray-400">
              Frontend
            </p>

            <p className="font-bold text-gray-700 mt-1">
              React
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gray-50">
            <p className="text-xs text-gray-400">
              Backend
            </p>

            <p className="font-bold text-gray-700 mt-1">
              Node.js
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gray-50">
            <p className="text-xs text-gray-400">
              Database
            </p>

            <p className="font-bold text-gray-700 mt-1">
              MySQL
            </p>
          </div>

        </div>

      </div>

    </AdminLayout>
  );
};

export default Settings;