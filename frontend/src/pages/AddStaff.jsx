import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import AdminLayout from "../components/AdminLayout";

const initialForm = {
  staffName: "",
  fatherName: "",
  designation: "",
  cnicNo: "",
  mobileNo: "",
  address: "",
  salary: "",
  email: "",
  password: "",
  image: null,
  cnicImageFront: null,
  cnicImageBack: null,
};

const imageFields = [
  { title: "Staff Photo", fieldName: "image", inputId: "staffImage", icon: "fa-user" },
  { title: "CNIC Front", fieldName: "cnicImageFront", inputId: "cnicImageFront", icon: "fa-id-card" },
  { title: "CNIC Back", fieldName: "cnicImageBack", inputId: "cnicImageBack", icon: "fa-id-card" },
];

const AddStaff = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialForm);
  const [previews, setPreviews] = useState({
    image: null,
    cnicImageFront: null,
    cnicImageBack: null,
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setErrorMessage("");
  };

  const handleImageChange = (e, fieldName) => {
    const file = e.target.files?.[0];
    setErrorMessage("");

    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setErrorMessage("Only JPG, JPEG, PNG and WEBP images are allowed.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Each image must be 5MB or smaller.");
      e.target.value = "";
      return;
    }

    setPreviews((prev) => {
      if (prev[fieldName]?.startsWith("blob:")) {
        URL.revokeObjectURL(prev[fieldName]);
      }
      return {
        ...prev,
        [fieldName]: URL.createObjectURL(file),
      };
    });

    setFormData((prev) => ({
      ...prev,
      [fieldName]: file,
    }));
  };

  const handleReset = () => {
    Object.values(previews).forEach((url) => {
      if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
    });

    setFormData(initialForm);
    setPreviews({
      image: null,
      cnicImageFront: null,
      cnicImageBack: null,
    });
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    for (const [key, label] of [
      ["staffName", "staff name"],
      ["fatherName", "father name"],
      ["designation", "designation"],
      ["cnicNo", "CNIC number"],
      ["mobileNo", "mobile number"],
      ["address", "address"],
      ["email", "email"],
      ["password", "password"],
    ]) {
      if (!String(formData[key] || "").trim()) {
        setErrorMessage(`Please enter ${label}.`);
        return;
      }
    }

    if (formData.password.length < 8) {
      setErrorMessage("Password must be at least 8 characters.");
      return;
    }

    if (
      formData.salary === "" ||
      !Number.isFinite(Number(formData.salary)) ||
      Number(formData.salary) < 0
    ) {
      setErrorMessage("Please enter a valid non-negative salary.");
      return;
    }

    if (!formData.image || !formData.cnicImageFront || !formData.cnicImageBack) {
      setErrorMessage("Please choose staff image, CNIC front and CNIC back images.");
      return;
    }

    const data = new FormData();

    [
      "staffName",
      "fatherName",
      "designation",
      "cnicNo",
      "mobileNo",
      "address",
      "salary",
      "email",
      "password",
    ].forEach((key) => {
      data.append(key, String(formData[key]).trim());
    });

    ["image", "cnicImageFront", "cnicImageBack"].forEach((key) => {
      data.append(key, formData[key]);
    });

    setLoading(true);

    try {
      const response = await api.post("/staff", data);

      if (response.data?.success) {
        setSuccessMessage("Staff added successfully.");
        setTimeout(() => navigate("/staff"), 700);
      } else {
        setErrorMessage(response.data?.message || "Failed to add staff.");
      }
    } catch (error) {
      console.error("Add Staff Error:", error);
      if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else if (error.response?.data?.error) {
        setErrorMessage(error.response.data.error);
      } else if (error.code === "ERR_NETWORK") {
        setErrorMessage("Backend connection failed. Please check your server.");
      } else {
        setErrorMessage(error.message || "Staff could not be saved.");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-[#198754] focus:ring-4 focus:ring-green-100";

  const fields = [
    ["staffName", "Staff Name", "Enter staff name", "text"],
    ["fatherName", "Father Name", "Enter father name", "text"],
    ["designation", "Designation", "e.g. Admin Officer, Lecturer", "text"],
    ["cnicNo", "CNIC Number", "42101-1234567-1", "text"],
    ["mobileNo", "Mobile Number", "03XX-XXXXXXX", "tel"],
    ["salary", "Monthly Salary", "Enter salary amount", "number"],
    ["email", "Email Address", "staff@example.com", "email"],
    ["password", "Password", "Minimum 8 characters", "password"],
  ];

  return (
    <AdminLayout title="Add Staff">
      <div className="w-full space-y-6">
        
        {/* PAGE HEADER */}
        <div className="bg-gradient-to-r from-[#198754] to-[#146c43] rounded-2xl p-6 md:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-5 w-full">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-3xl text-white shadow-inner">
              <i className="fa-solid fa-user-tie"></i>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-green-100">
                Staff Management
              </p>
              <h1 className="text-2xl md:text-3xl font-bold text-white mt-0.5">
                Add New Staff
              </h1>
              <p className="text-green-100 text-sm mt-1">
                Register new employees and upload their official verification documents.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/staff")}
            className="bg-white text-[#198754] hover:bg-green-50 px-6 py-3 rounded-xl font-semibold transition-all shadow-md flex items-center gap-2 text-sm self-start md:self-auto"
          >
            <i className="fa-solid fa-list-check"></i>
            View All Staff
          </button>
        </div>

        {/* ERROR MESSAGE */}
        {errorMessage && (
          <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-700 shadow-sm w-full">
            <i className="fa-solid fa-circle-exclamation text-xl mt-0.5"></i>
            <div>
              <p className="font-semibold">Validation Error</p>
              <p className="text-sm mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* SUCCESS MESSAGE */}
        {successMessage && (
          <div role="status" className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-green-700 shadow-sm w-full">
            <i className="fa-solid fa-circle-check text-xl mt-0.5"></i>
            <div>
              <p className="font-semibold">Success</p>
              <p className="text-sm mt-0.5">{successMessage}</p>
            </div>
          </div>
        )}

        {/* FORM CONTAINER */}
        <form onSubmit={handleSubmit} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm w-full">
          
          <div className="border-b border-gray-100 bg-gradient-to-r from-[#198754] to-[#146c43] text-white px-6 md:px-8 py-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-2xl text-white">
                <i className="fa-solid fa-address-card"></i>
              </div>
              <div>
                <h2 className="text-xl font-bold">Staff Registration Form</h2>
                <p className="mt-1 text-sm text-green-100">
                  Enter complete information and credentials.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-8 p-6 md:p-8">

            {/* SECTION 1: PERSONAL & ACCOUNT INFO */}
            <section>
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-[#198754] font-bold text-base">
                  01
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-base">
                    Personal & Account Information
                  </h3>
                  <p className="text-xs text-gray-500">
                    Basic employee details and secure login information
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {fields.map(([name, label, placeholder, type]) => (
                  <div key={name}>
                    <label
                      htmlFor={name}
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      {label} <span className="text-red-500">*</span>
                    </label>

                    <input
                      id={name}
                      name={name}
                      type={type}
                      value={formData[name]}
                      onChange={handleChange}
                      placeholder={placeholder}
                      min={name === "salary" ? "0" : undefined}
                      step={name === "salary" ? "0.01" : undefined}
                      minLength={name === "password" ? 8 : undefined}
                      maxLength={name === "cnicNo" ? 15 : undefined}
                      autoComplete={
                        name === "password"
                          ? "new-password"
                          : name === "email"
                          ? "email"
                          : "off"
                      }
                      className={inputClass}
                    />
                  </div>
                ))}
              </div>

              <div className="mt-5">
                <label
                  htmlFor="address"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Complete Address <span className="text-red-500">*</span>
                </label>

                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter complete staff residential address..."
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
              </div>
            </section>

            {/* SECTION 2: DOCUMENTS */}
            <section className="border-t border-gray-100 pt-7">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-[#198754] font-bold text-base">
                  02
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-base">
                    Staff Documents & Image Verification
                  </h3>
                  <p className="text-xs text-gray-500">
                    Upload employee photo and CNIC scans (Front & Back)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {imageFields.map(({ title, fieldName, inputId, icon }) => (
                  <div
                    key={fieldName}
                    className="rounded-2xl border border-gray-200 bg-gray-50 p-5 transition hover:border-[#198754] hover:shadow-md"
                  >
                    <label
                      htmlFor={inputId}
                      className="mb-3 block font-bold text-gray-800 text-sm"
                    >
                      {title} <span className="text-red-500">*</span>
                    </label>

                    <div className="mb-4 flex h-48 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-white shadow-sm">
                      {previews[fieldName] ? (
                        <img
                          src={previews[fieldName]}
                          alt={`${title} preview`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="text-center text-gray-400">
                          <div className="mb-2 text-3xl">
                            <i className={`fa-solid ${icon}`}></i>
                          </div>
                          <p className="text-xs font-medium text-gray-500">
                            No file selected
                          </p>
                        </div>
                      )}
                    </div>

                    <input
                      id={inputId}
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                      onChange={(e) => handleImageChange(e, fieldName)}
                      className="w-full cursor-pointer text-xs text-gray-600 file:mr-3 file:rounded-xl file:border-0 file:bg-green-50 file:px-3 file:py-2 file:font-semibold file:text-[#198754] hover:file:bg-green-100 transition"
                    />

                    <p className="mt-2 text-xs text-gray-400">
                      JPG, PNG, WEBP • Max 5MB
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* BUTTONS */}
            <div className="flex flex-col gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleReset}
                disabled={loading}
                className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
              >
                Reset Form
              </button>

              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-[#198754] px-7 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#146c43] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Saving Staff..." : "Save Staff"}
              </button>
            </div>

          </div>
        </form>

        {/* BOTTOM NOTE */}
        <div className="rounded-2xl border border-green-100 bg-green-50 p-4 text-xs text-green-800 flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-[#198754]">
            <i className="fa-solid fa-circle-info"></i>
          </div>
          <p>
            <strong>Note:</strong> All asterisk (*) fields are mandatory. Please verify CNIC and contact details before saving staff record.
          </p>
        </div>

      </div>
    </AdminLayout>
  );
};

export default AddStaff;