
import { useEffect, useState } from "react";
import staffApi from "../services/staffApi";
import SvgRepoIcon from "../../components/SvgRepoIcon";

const emptyForm = {
  id: "",
  staff_name: "",
  father_name: "",
  cnic_no: "",
  mobile_no: "",
  address: "",
  designation: "",
  salary: "",
  email: "",
  image: "",
  cnic_image_front: "",
  cnic_image_back: "",
  password: "",
};

const API_SERVER_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/api\/?$/, "");

// ==========================================
// IMAGE URL
// ==========================================
function getImageUrl(value) {
  if (!value) return "";

  const imagePath = String(value).trim();

  if (/^https?:\/\//i.test(imagePath)) {
    return imagePath;
  }

  const path = imagePath.replace(/^\/+/, "");
  return `${API_SERVER_URL}/${path}`;
}

// ==========================================
// NORMALIZE STAFF DATA
// ==========================================
function normalizeStaff(staff = {}) {
  return {
    ...emptyForm,
    ...staff,

    id: staff.id ?? staff.staff_id ?? "",

    staff_name: staff.staff_name ?? staff.staffName ?? "",
    father_name: staff.father_name ?? staff.fatherName ?? "",
    cnic_no: staff.cnic_no ?? staff.cnicNo ?? "",

    mobile_no:
      staff.mobile_no ??
      staff.mobileNo ??
      staff.phone ??
      "",

    address: staff.address ?? "",
    designation: staff.designation ?? "",
    salary: staff.salary ?? "",
    email: staff.email ?? "",

    image: staff.image ?? "",

    cnic_image_front:
      staff.cnic_image_front ??
      staff.cnicImageFront ??
      "",

    cnic_image_back:
      staff.cnic_image_back ??
      staff.cnicImageBack ??
      "",

    // Never populate a password from the server response.
    password: "",
  };
}

// ==========================================
// SECTION TITLE
// ==========================================
function SectionTitle({ icon, title, subtitle }) {
  return (
    <div className="mb-6 flex items-start gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#E5F3EB] text-xl text-[#176B4D]">
        {icon}
      </div>

      <div>
        <h2 className="text-lg font-bold text-[#173D2D]">
          {title}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

// ==========================================
// READ-ONLY FIELD
// ==========================================
function ReadOnlyField({ label, value, wide = false }) {
  const displayValue =
    value === null ||
    value === undefined ||
    value === ""
      ? "Not provided"
      : String(value);

  return (
    <div className={wide ? "md:col-span-2" : ""}>
      <label className="mb-2 block text-sm font-semibold text-slate-600">
        {label}
      </label>

      <input
        type="text"
        value={displayValue}
        disabled
        readOnly
        className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-[#F7F9F7] px-4 py-3 text-sm text-slate-600"
      />
    </div>
  );
}

// ==========================================
// DOCUMENT IMAGE PREVIEW
// ==========================================
function ImagePreview({ label, value }) {
  const [imageError, setImageError] = useState(false);
  const imageUrl = getImageUrl(value);

  useEffect(() => {
    setImageError(false);
  }, [imageUrl]);

  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <p className="mb-3 text-sm font-semibold text-slate-700">
        {label}
      </p>

      {imageUrl && !imageError ? (
        <a
          href={imageUrl}
          target="_blank"
          rel="noreferrer"
          className="block"
        >
          <img
            src={imageUrl}
            alt={label}
            onError={() => setImageError(true)}
            className="h-44 w-full rounded-xl bg-[#F7F9F7] object-contain p-2"
          />
        </a>
      ) : (
        <div className="flex h-44 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-[#F7F9F7] text-slate-400">
          <span className="mb-2 text-3xl">▧</span>

          <span className="text-sm">
            Image not available
          </span>
        </div>
      )}
    </div>
  );
}

// ==========================================
// PROFILE INFORMATION CARD
// ==========================================
function ProfileField({ label, value, icon }) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-xl bg-[#F7F9F7] p-4">
      <span className="text-lg text-[#176B4D]">
        {icon}
      </span>

      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-semibold text-slate-800">
          {value || "Not provided"}
        </p>
      </div>
    </div>
  );
}

// ==========================================
// MAIN STAFF SETTINGS PAGE
// ==========================================
export default function StaffSettings() {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [profileImageError, setProfileImageError] = useState(false);

  // ==========================================
  // LOAD STAFF PROFILE
  // ==========================================
  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        setError("");

        const response = await staffApi.get(
          "/staff-portal/me"
        );

        const staff = response.data?.staff;

        if (!staff) {
          throw new Error(
            "Staff profile was not returned by the server."
          );
        }

        if (active) {
          setForm(normalizeStaff(staff));

          localStorage.setItem(
            "staffUser",
            JSON.stringify(staff)
          );
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Unable to load staff profile."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  // ==========================================
  // INPUT CHANGE
  // ==========================================
  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setMessage("");
    setError("");
  };

  // ==========================================
  // SAVE PROFILE SETTINGS
  // ==========================================
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (saving) return;

    const email = form.email.trim();
    const mobileNo = form.mobile_no.trim();

    if (!email || !mobileNo) {
      setError("Email address and phone number are required.");
      return;
    }

    if (form.password && form.password.length < 8) {
      setError("New password must contain at least 8 characters.");
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const payload = {
        email,
        mobileNo,
      };

      if (form.password.trim().length > 0) {
        payload.password = form.password;
      }

      const response = await staffApi.put(
        "/staff-portal/profile",
        payload
      );

      let updatedStaff = response.data?.staff;

      // Refresh the profile if the update endpoint
      // does not return the updated staff object.
      if (!updatedStaff) {
        const refreshed = await staffApi.get(
          "/staff-portal/me"
        );

        updatedStaff = refreshed.data?.staff;
      }

      if (updatedStaff) {
        setForm(normalizeStaff(updatedStaff));

        localStorage.setItem(
          "staffUser",
          JSON.stringify(updatedStaff)
        );
      } else {
        setForm((current) => ({
          ...current,
          email,
          mobile_no: mobileNo,
          password: "",
        }));
      }

      setShowPassword(false);

      setMessage(
        response.data?.message ||
          "Settings updated successfully."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update settings. Please check your connection and backend API."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // FORM STYLES
  // ==========================================
  const inputClass =
    "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#25835E] focus:ring-4 focus:ring-[#25835E]/10 disabled:cursor-not-allowed disabled:opacity-60";

  // ==========================================
  // LOADING SCREEN
  // ==========================================
  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-3xl border border-slate-100 bg-white p-10 text-slate-500 shadow-sm">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#DCECE2] border-t-[#176B4D]" />

          Loading staff information...
        </div>
      </div>
    );
  }

  // ==========================================
  // DISPLAY VALUES
  // ==========================================
  const name = form.staff_name || "Staff Member";

  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  // FIXED: salaryText is now defined.
  const salaryText =
    form.salary !== "" &&
    form.salary !== null &&
    form.salary !== undefined &&
    Number.isFinite(Number(form.salary))
      ? `Rs. ${Number(form.salary).toLocaleString("en-PK")}`
      : "Not provided";

  const profileImageUrl = getImageUrl(form.image);

  return (
    <div className="min-h-screen space-y-6 bg-[#F5F7F5] pb-8 text-slate-800">
      {/* PAGE HEADING */}
      <header className="flex flex-col justify-between gap-4 rounded-3xl border border-white bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:p-7">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#25835E]">
            STAFF PORTAL / ACCOUNT
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#173D2D]">
            My Profile
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage your personal details and account preferences.
          </p>
        </div>

        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[#E5F3EB] px-4 py-2 text-sm font-semibold text-[#176B4D]">
          <span className="h-2 w-2 rounded-full bg-[#25835E]" />
          Staff Account
        </div>
      </header>

      {/* SUCCESS MESSAGE */}
      {message && (
        <div
          role="status"
          className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800"
        >
          ✓ {message}
        </div>
      )}

      {/* ERROR MESSAGE */}
      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {/* PROFILE BANNER */}
      <section className="relative isolate overflow-hidden rounded-[28px] bg-gradient-to-br from-[#07111f] via-[#123b55] to-[#047857] p-6 text-white shadow-xl sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute -right-16 -top-20 -z-10 h-72 w-72 rounded-full border-[35px] border-white/5" />

        <div className="pointer-events-none absolute -bottom-28 right-1/3 -z-10 h-64 w-64 rounded-full bg-emerald-300/10 blur-3xl" />

        <div className="flex flex-col gap-7 md:flex-row md:items-center">
          {/* PROFILE IMAGE WITH FALLBACK */}
          <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl border-2 border-white/20 bg-white/10 text-3xl font-extrabold shadow-lg sm:h-28 sm:w-28">
            {profileImageUrl && !profileImageError ? (
              <img
                src={profileImageUrl}
                alt={name}
                className="absolute inset-0 h-full w-full object-cover"
                onError={() => setProfileImageError(true)}
              />
            ) : (
              <span>{initials || "S"}</span>
            )}
          </div>

          {/* STAFF INFORMATION */}
          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-emerald-100">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              STAFF PROFILE
            </span>

            <h2 className="mt-4 break-words text-2xl font-extrabold sm:text-3xl lg:text-4xl">
              {name}
            </h2>

            <p className="mt-2 text-sm font-medium text-emerald-100 sm:text-base">
              {form.designation || "Staff Member"}
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <span className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm">
                <span className="text-emerald-200">
                  Staff ID:{" "}
                </span>

                <strong>{form.id || "N/A"}</strong>
              </span>

              <span className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm">
                <span className="text-emerald-200">
                  Salary:{" "}
                </span>

                <strong>{salaryText}</strong>
              </span>
            </div>
          </div>

          <div className="hidden h-24 w-px bg-white/15 md:block" />

          {/* ACCOUNT SECURITY */}
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4 md:min-w-48">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-100">
              Account Security
            </p>

            <p className="mt-3 text-lg font-extrabold">
              Protected
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-200">
              Keep your contact details up to date.
            </p>
          </div>
        </div>
      </section>

      {/* MAIN FORM */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* PERSONAL INFORMATION */}
        <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-7">
          <SectionTitle
            icon="♙"
            title="Personal Information"
            subtitle="Your registered information from the institute database."
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <ReadOnlyField
              label="Full Name"
              value={form.staff_name}
            />

            <ReadOnlyField
              label="Father Name"
              value={form.father_name}
            />

            <ReadOnlyField
              label="CNIC Number"
              value={form.cnic_no}
            />

            <ReadOnlyField
              label="Designation"
              value={form.designation}
            />

            <ReadOnlyField
              label="Monthly Salary"
              value={salaryText}
            />

            <ReadOnlyField
              label="Staff ID"
              value={form.id}
            />

            <ReadOnlyField
              label="Address"
              value={form.address}
              wide
            />
          </div>
        </section>

        {/* IDENTITY DOCUMENTS */}
        <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-7">
          <SectionTitle
            icon="▤"
            title="Identity Documents"
            subtitle="View your registered CNIC documents."
          />

          <div className="grid gap-5 md:grid-cols-2">
            <ImagePreview
              label="CNIC Front Image"
              value={form.cnic_image_front}
            />

            <ImagePreview
              label="CNIC Back Image"
              value={form.cnic_image_back}
            />
          </div>
        </section>

        {/* LOGIN AND CONTACT DETAILS */}
        <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-7">
          <SectionTitle
            icon={<SvgRepoIcon name="settings" />}
            title="Login & Contact Details"
            subtitle="Update your contact details or choose a new password."
          />

          <div className="mb-6 grid gap-4 sm:grid-cols-2">
            <ProfileField
              icon="♙"
              label="Account Name"
              value={name}
            />

            <ProfileField
              icon={<SvgRepoIcon name="profile" />}
              label="Registered Email"
              value={form.email}
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {/* EMAIL */}
            <div>
              <label
                htmlFor="staff-email"
                className="text-sm font-semibold text-slate-700"
              >
                Email Address
              </label>

              <input
                id="staff-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
                className={inputClass}
                placeholder="Enter email address"
              />
            </div>

            {/* PHONE */}
            <div>
              <label
                htmlFor="staff-mobile"
                className="text-sm font-semibold text-slate-700"
              >
                Phone Number
              </label>

              <input
                id="staff-mobile"
                name="mobile_no"
                type="tel"
                value={form.mobile_no}
                onChange={handleChange}
                required
                autoComplete="tel"
                className={inputClass}
                placeholder="Enter phone number"
              />
            </div>

            {/* PASSWORD */}
            <div className="md:col-span-2">
              <label
                htmlFor="staff-password"
                className="text-sm font-semibold text-slate-700"
              >
                New Password
              </label>

              <div className="relative">
                <input
                  id="staff-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  minLength={8}
                  autoComplete="new-password"
                  className={`${inputClass} pr-24`}
                  placeholder="Leave blank to keep current password"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((current) => !current)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-bold text-[#176B4D] hover:bg-[#E5F3EB]"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Use at least 8 characters for a new password.
                Leave this field empty to keep your current password.
              </p>
            </div>
          </div>
        </section>

        {/* SAVE ACTIONS */}
        <section className="flex flex-col justify-between gap-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:p-6">
          <div>
            <p className="font-semibold text-[#173D2D]">
              Keep your account up to date
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Your name, CNIC, designation, salary and address
              are read-only.
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#176B4D] px-7 py-3.5 text-sm font-bold text-white shadow-md shadow-emerald-900/10 transition hover:bg-[#10553C] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Saving Changes...
              </>
            ) : (
              <>✓ Save Changes</>
            )}
          </button>
        </section>
      </form>

      {/* FOOTER */}
      <footer className="px-2 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Connect API · Staff Portal
      </footer>
    </div>
  );
}
