import { useState } from "react";
import AdminLayout from "../components/AdminLayout";

const HelpSupport = () => {
  const [formData, setFormData] = useState({
    subject: "",
    category: "Technical Issue",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.message.trim()) return;

    setSubmitted(true);
    setFormData({ subject: "", category: "Technical Issue", message: "" });

    setTimeout(() => {
      setSubmitted(false);
    }, 4000);
  };

  return (
    <AdminLayout title="Help & Support">
      {/* FontAwesome Icons Link */}
      <div dangerouslySetInnerHTML={{ __html: `<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />` }} />

      <div className="w-full space-y-6">
        
        {/* ================= PAGE HEADER ================= */}
        <div className="flex flex-col justify-between gap-5 rounded-2xl bg-gradient-to-r from-[#198754] to-[#146c43] p-6 md:p-8 text-white shadow-lg lg:flex-row lg:items-center w-full">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-3xl text-white shadow-inner">
              <i className="fa-solid fa-headset"></i>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-green-100">
                Alsafa Group of Colleges
              </p>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-0.5">
                Help & Support Center
              </h1>
              <p className="mt-1 text-sm text-green-100">
                Need assistance with the management portal? Submit a query or check FAQs below.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-xl bg-white/15 px-5 py-3 text-sm font-semibold text-white border border-white/25 shadow-sm">
            <i className="fa-solid fa-shield-halved text-green-200"></i>
            24/7 IT Helpdesk
          </div>
        </div>

        {/* ================= SUCCESS NOTIFICATION ================= */}
        {submitted && (
          <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-semibold text-green-700 shadow-sm w-full">
            <i className="fa-solid fa-circle-check text-xl mt-0.5"></i>
            <div>
              <p className="font-semibold">Support Ticket Submitted Successfully!</p>
              <p className="text-sm mt-0.5">Your ticket has been routed to the Alsafa Group of Colleges IT support desk. We will respond shortly.</p>
            </div>
          </div>
        )}

        {/* ================= CONTENT GRID ================= */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3 w-full">
          
          {/* CONTACT & INFO CARDS (1 Column) */}
          <div className="space-y-6 xl:col-span-1">
            
            {/* INSTITUTE INFO CARD */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:border-[#198754] transition">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-[#198754] text-lg font-bold">
                  <i className="fa-solid fa-building-columns"></i>
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Alsafa Group of Colleges</h2>
                  <p className="text-xs text-gray-400">Campus Administration Desk</p>
                </div>
              </div>

              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-3">
                  <i className="fa-solid fa-location-dot text-[#198754] mt-1"></i>
                  <p className="leading-relaxed">Main Campus, Alsafa Group of Colleges, Sindh, Pakistan.</p>
                </div>
                <div className="flex items-center gap-3">
                  <i className="fa-solid fa-envelope text-[#198754]"></i>
                  <p>support@alsafacolleges.edu.pk</p>
                </div>
                <div className="flex items-center gap-3">
                  <i className="fa-solid fa-phone text-[#198754]"></i>
                  <p>+92 (22) 1234567 / +92 300 1234567</p>
                </div>
              </div>
            </div>

            {/* QUICK FAQS */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:border-[#198754] transition">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-[#198754] text-lg font-bold">
                  <i className="fa-solid fa-circle-question"></i>
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Frequently Asked Questions</h2>
                  <p className="text-xs text-gray-400">Common management queries</p>
                </div>
              </div>

              <div className="space-y-3 text-sm text-gray-700">
                <details className="group rounded-xl border border-gray-100 bg-gray-50/50 p-3.5 cursor-pointer">
                  <summary className="font-semibold text-gray-800 list-none flex justify-between items-center">
                    How to export attendance sheets?
                    <i className="fa-solid fa-chevron-down text-xs text-gray-400 group-open:rotate-180 transition"></i>
                  </summary>
                  <p className="mt-2 text-xs text-gray-500 leading-relaxed">
                    Go to Student Attendance or Staff Attendance and click on the "Download Excel Report" button at the top header.
                  </p>
                </details>

                <details className="group rounded-xl border border-gray-100 bg-gray-50/50 p-3.5 cursor-pointer">
                  <summary className="font-semibold text-gray-800 list-none flex justify-between items-center">
                    How to edit student or staff info?
                    <i className="fa-solid fa-chevron-down text-xs text-gray-400 group-open:rotate-180 transition"></i>
                  </summary>
                  <p className="mt-2 text-xs text-gray-500 leading-relaxed">
                    Navigate to the respective view section (View Students / View Staff), click the Edit icon next to the record, and update details.
                  </p>
                </details>
              </div>
            </div>

          </div>

          {/* TICKET FORM (2 Columns) */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm hover:border-[#198754] transition xl:col-span-2">
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Submit a Support Ticket</h2>
                <p className="text-xs text-gray-400">Describe your technical issue or requirement.</p>
              </div>
              <span className="rounded-full bg-green-50 border border-green-200 px-3.5 py-1 text-xs font-bold text-[#198754]">
                ● Helpdesk Active
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Issue Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition hover:border-[#198754] focus:border-[#198754] focus:ring-4 focus:ring-green-100 cursor-pointer"
                  >
                    <option value="Technical Issue">Technical / Portal Error</option>
                    <option value="Attendance Sync">Attendance System</option>
                    <option value="Fee & Accounts">Fee & Accounts Module</option>
                    <option value="General Inquiry">General Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Subject <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Issue downloading fee invoice"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition hover:border-[#198754] focus:border-[#198754] focus:ring-4 focus:ring-green-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Detailed Message <span className="text-red-500">*</span></label>
                <textarea
                  required
                  rows={5}
                  placeholder="Explain the problem or request in detail..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition hover:border-[#198754] focus:border-[#198754] focus:ring-4 focus:ring-green-100"
                ></textarea>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-[#198754] px-7 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#146c43] cursor-pointer"
                >
                  <i className="fa-solid fa-paper-plane"></i> Send Support Ticket
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>
    </AdminLayout>
  );
};

export default HelpSupport;