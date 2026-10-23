import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import AdminLayout from "../components/AdminLayout";

const initialForm = {
  staffName: "", fatherName: "", designation: "", cnicNo: "", mobileNo: "",
  address: "", salary: "", email: "", password: "",
  image: null, cnicImageFront: null, cnicImageBack: null,
};

const imageFields = [
  { title: "Staff Image", fieldName: "image", inputId: "staffImage", icon: "👤" },
  { title: "CNIC Front", fieldName: "cnicImageFront", inputId: "cnicImageFront", icon: "🪪" },
  { title: "CNIC Back", fieldName: "cnicImageBack", inputId: "cnicImageBack", icon: "🪪" },
];

const AddStaff = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialForm);
  const [previews, setPreviews] = useState({ image: null, cnicImageFront: null, cnicImageBack: null });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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
    setPreviews((prev) => ({ ...prev, [fieldName]: URL.createObjectURL(file) }));
    setFormData((prev) => ({ ...prev, [fieldName]: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(""); setSuccessMessage("");
    for (const [key, label] of [
      ["staffName", "staff name"], ["fatherName", "father name"], ["designation", "designation"],
      ["cnicNo", "CNIC number"], ["mobileNo", "mobile number"], ["address", "address"],
      ["email", "email"], ["password", "password"],
    ]) {
      if (!String(formData[key] || "").trim()) return setErrorMessage(`Please enter ${label}.`);
    }
    if (formData.password.length < 8) return setErrorMessage("Password must be at least 8 characters.");
    if (formData.salary === "" || !Number.isFinite(Number(formData.salary)) || Number(formData.salary) < 0) {
      return setErrorMessage("Please enter a valid non-negative salary.");
    }
    if (!formData.image || !formData.cnicImageFront || !formData.cnicImageBack) {
      return setErrorMessage("Please choose staff image, CNIC front and CNIC back images.");
    }

    const data = new FormData();
    ["staffName", "fatherName", "designation", "cnicNo", "mobileNo", "address", "salary", "email", "password"].forEach((key) => {
      data.append(key, String(formData[key]).trim());
    });
    ["image", "cnicImageFront", "cnicImageBack"].forEach((key) => data.append(key, formData[key]));

    setLoading(true);
    try {
      const response = await api.post("/staff", data);
      if (response.data?.success) {
        setSuccessMessage("Staff added successfully.");
        setTimeout(() => navigate("/staff"), 700);
      } else setErrorMessage(response.data?.message || "Failed to add staff.");
    } catch (error) {
      console.error("Add Staff Error:", error);
      console.error("Backend Response:", error.response?.data);

      if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else if (error.response?.data?.error) {
        setErrorMessage(error.response.data.error);
      } else if (error.code === "ERR_NETWORK") {
        setErrorMessage(
          "Backend se connection nahi ho raha. Backend terminal aur server check karein."
        );
      } else {
        setErrorMessage(
          error.message || "Staff save nahi ho saka. Backend terminal check karein."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#075985] focus:ring-4 focus:ring-blue-100";
  const fields = [
    ["staffName", "Staff Name", "Enter staff name", "text"],
    ["fatherName", "Father Name", "Enter father name", "text"],
    ["designation", "Designation", "e.g. Admin Officer, Lecturer", "text"],
    ["cnicNo", "CNIC Number", "42101-1234567-1", "text"],
    ["mobileNo", "Mobile Number", "03XX-XXXXXXX", "tel"],
    ["salary", "Monthly Salary", "Enter salary amount", "number"],
    ["email", "Email", "staff@example.com", "email"],
    ["password", "Password", "Minimum 8 characters", "password"],
  ];

  return (
    <AdminLayout title="Add Staff">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-2xl bg-gradient-to-r from-[#075985] to-[#064e6f] p-6 text-white shadow-lg md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div><div className="mb-2 flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-2xl">👨‍💼</div><h1 className="text-2xl font-bold md:text-3xl">Add New Staff</h1></div><p className="text-blue-100">Enter staff information and upload required documents.</p></div>
            <button type="button" onClick={() => navigate("/staff")} className="rounded-xl bg-white px-5 py-3 font-semibold text-[#075985] hover:bg-blue-50">View All Staff</button>
          </div>
        </div>

        {errorMessage && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-700"><strong>Please check the form</strong><p className="mt-1 text-sm">{errorMessage}</p></div>}
        {successMessage && <div role="status" className="rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-green-700">{successMessage}</div>}

        <form onSubmit={handleSubmit} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 bg-gray-50 px-6 py-5 md:px-8"><h2 className="text-lg font-bold text-gray-800">Staff Information</h2><p className="mt-1 text-sm text-gray-500">Complete all required fields.</p></div>
          <div className="space-y-8 p-6 md:p-8">
            <section>
              <h3 className="mb-5 font-bold text-gray-800">Personal & Account Information</h3>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {fields.map(([name, label, placeholder, type]) => <div key={name}>
                  <label htmlFor={name} className="mb-2 block text-sm font-semibold text-gray-700">{label} <span className="text-red-500">*</span></label>
                  <input id={name} name={name} type={type} value={formData[name]} onChange={handleChange} placeholder={placeholder}
                    min={name === "salary" ? "0" : undefined} step={name === "salary" ? "0.01" : undefined}
                    minLength={name === "password" ? 8 : undefined} maxLength={name === "cnicNo" ? 15 : undefined}
                    autoComplete={name === "password" ? "new-password" : name === "email" ? "email" : "off"}
                    className={inputClass} />
                </div>)}
              </div>
              <div className="mt-5"><label htmlFor="address" className="mb-2 block text-sm font-semibold text-gray-700">Address <span className="text-red-500">*</span></label><textarea id="address" name="address" value={formData.address} onChange={handleChange} placeholder="Enter complete staff address" rows={3} className={inputClass} /></div>
            </section>

            <section className="border-t border-gray-100 pt-8">
              <h3 className="mb-2 font-bold text-gray-800">Staff Documents</h3><p className="mb-6 text-sm text-gray-500">JPG, PNG or WEBP; each image up to 5MB.</p>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {imageFields.map(({ title, fieldName, inputId, icon }) => <div key={fieldName} className="rounded-2xl border border-gray-200 bg-white p-4 transition hover:border-[#075985] hover:shadow-md">
                  <label htmlFor={inputId} className="mb-3 block font-bold text-gray-700">{title} <span className="text-red-500">*</span></label>
                  <div className="mb-4 flex h-52 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gray-50">
                    {previews[fieldName] ? <img src={previews[fieldName]} alt={`${title} preview`} className="h-full w-full object-contain" /> : <div className="text-center"><div className="mb-2 text-4xl">{icon}</div><p className="text-sm text-gray-400">No file selected</p></div>}
                  </div>
                  <input id={inputId} type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={(e) => handleImageChange(e, fieldName)} className="w-full cursor-pointer text-sm text-gray-600" />
                </div>)}
              </div>
            </section>
            <div className="flex flex-col gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => { setFormData(initialForm); setPreviews({ image: null, cnicImageFront: null, cnicImageBack: null }); setErrorMessage(""); setSuccessMessage(""); }} className="rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50">Reset</button>
              <button type="submit" disabled={loading} className="rounded-xl bg-[#075985] px-6 py-3 font-semibold text-white hover:bg-[#064e6f] disabled:opacity-60">{loading ? "Saving..." : "Save Staff"}</button>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AddStaff;
