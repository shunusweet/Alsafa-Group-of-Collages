import { useMemo } from "react";
import AdminLayout from "../components/AdminLayout";

export default function AdminAttendanceQR() {
  const attendanceUrl = useMemo(
    () => (typeof window === "undefined" ? "" : `${window.location.origin}/student/attendance`),
    []
  );

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&format=png&data=${encodeURIComponent(
    attendanceUrl
  )}`;

  const handleDownloadQR = () => {
    const link = document.createElement("a");
    link.href = qrImageUrl;
    link.download = "Student_Attendance_QR.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout title="Student Attendance QR">
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* PAGE HEADER */}
        <div
          className="
            bg-gradient-to-r
            from-[#198754]
            to-[#146c43]
            rounded-2xl
            p-6 md:p-8
            text-white
            shadow-lg
          "
        >
          <div className="flex items-center gap-4">
            <div
              className="
                w-12 h-12
                rounded-xl
                bg-white/20
                flex
                items-center
                justify-center
                text-2xl
              "
            >
              <i className="fa-solid fa-qrcode text-white"></i>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Student Attendance QR
              </h1>
              <p className="text-green-100 mt-1">
                Display this QR code at the campus entrance for student check-in.
              </p>
            </div>
          </div>
        </div>

        {/* QR CODE CARD */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 text-center shadow-sm flex flex-col items-center">
          <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-6 shadow-sm">
            <img
              src={qrImageUrl}
              alt="QR code for student attendance"
              width="280"
              height="280"
              className="h-[280px] w-[280px] rounded-xl object-contain bg-white p-2"
            />
          </div>

          <h2 className="mt-6 text-xl font-bold text-gray-800">
            Scan to Open Attendance Page
          </h2>

          <p className="mt-2 max-w-md break-all text-sm font-medium text-[#198754] bg-green-50 px-4 py-2 rounded-xl border border-green-100">
            {attendanceUrl || "Loading URL..."}
          </p>

          {/* BUTTONS */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => window.print()}
              className="
                bg-[#198754]
                hover:bg-[#146c43]
                text-white
                px-6 py-3
                rounded-xl
                font-semibold
                transition-all
                shadow-md
                flex
                items-center
                gap-2
                text-sm
              "
            >
              <i className="fa-solid fa-print"></i>
              Print QR Code
            </button>

            <button
              onClick={handleDownloadQR}
              className="
                border border-gray-300
                text-gray-700
                hover:bg-gray-100
                px-6 py-3
                rounded-xl
                font-semibold
                transition-all
                flex
                items-center
                gap-2
                text-sm
              "
            >
              <i className="fa-solid fa-download"></i>
              Download QR
            </button>
          </div>

          {/* NOTICE NOTE */}
          <div className="mt-6 max-w-lg rounded-xl border border-amber-200 bg-amber-50 p-4 text-left text-xs text-amber-800 flex items-start gap-3">
            <i className="fa-solid fa-circle-info text-base mt-0.5 text-amber-600"></i>
            <div>
              <p className="font-semibold mb-0.5">Important Note:</p>
              The QR code opens the attendance portal; it does not mark attendance automatically. Students must log in and tap the mark attendance button. For mobile devices on campus, ensure the web app is hosted on a reachable network IP or deployed HTTPS domain instead of localhost.
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}