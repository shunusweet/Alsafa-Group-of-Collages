import { useEffect, useState } from "react";
import staffApi from "../services/staffApi";

const money = (value) =>
  `Rs. ${Number(value || 0).toLocaleString("en-PK")}`;

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleDateString("en-PK", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

function StatCard({ title, value, subtitle, icon, featured = false }) {
  return (
    <div
      className={`group rounded-[22px] border p-5 transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-6 ${
        featured
          ? "border-[#176747] bg-gradient-to-br from-[#104b35] to-[#23845b] text-white"
          : "border-slate-100 bg-white text-slate-900"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p
            className={`text-sm font-medium ${
              featured ? "text-emerald-100" : "text-slate-500"
            }`}
          >
            {title}
          </p>

          <h2 className="mt-5 break-words text-2xl font-bold tracking-tight sm:text-3xl">
            {value}
          </h2>
        </div>

        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl ${
            featured
              ? "bg-white/15 text-white"
              : "border border-slate-200 bg-white text-[#176747]"
          }`}
        >
          {icon}
        </span>
      </div>

      <p
        className={`mt-4 text-xs ${
          featured ? "text-emerald-100" : "text-slate-400"
        }`}
      >
        {subtitle}
      </p>
    </div>
  );
}

function PaymentStatus({ status }) {
  const normalized = String(status || "").toLowerCase();

  const isPaid = ["paid", "completed"].includes(normalized);
  const isPending = ["pending", "unpaid"].includes(normalized);

  const color = isPaid
    ? "bg-emerald-50 text-emerald-700"
    : isPending
    ? "bg-amber-50 text-amber-700"
    : "bg-slate-100 text-slate-600";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${color}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status || "Recorded"}
    </span>
  );
}

export default function SalaryHistory() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadSalary() {
      try {
        setError("");

        const response = await staffApi.get("/staff-salary/mine");

        if (active) {
          setRecords(response.data.records || []);
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Unable to load salary history. Please check the salary API."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadSalary();

    return () => {
      active = false;
    };
  }, []);

  const totalPaid = records.reduce(
    (sum, item) =>
      sum + Number(item.paidAmount ?? item.paid_amount ?? 0),
    0
  );

  const totalSalary = records.reduce(
    (sum, item) =>
      sum +
      Number(
        item.salaryAmount ??
          item.salary_amount ??
          item.amount ??
          0
      ),
    0
  );

  const paidRecords = records.filter((item) =>
    ["paid", "completed"].includes(
      String(item.status || "").toLowerCase()
    )
  ).length;

  return (
    <div className="min-h-screen bg-[#f6f7f6] p-3 text-slate-900 sm:p-5 lg:p-7">
      <div className="mx-auto max-w-[1500px] space-y-6">

        {/* Page Heading */}
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#247653]">
              Staff Portal / Payroll
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Salary History
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Review your salary records, payments and payment dates.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-xl text-[#176747]">
              ₹
            </span>

            <div>
              <p className="text-xs text-slate-400">Payroll Overview</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                Your Salary Records
              </p>
            </div>
          </div>
        </header>

        {/* Error Message */}
        {error && (
          <div
            role="alert"
            className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
          >
            <span className="font-semibold">Connection notice: </span>
            {error}
          </div>
        )}

        {/* Summary Cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Amount Paid"
            value={money(totalPaid)}
            subtitle="Combined amount recorded as paid"
            icon="₹"
            featured
          />

          <StatCard
            title="Salary Records"
            value={records.length}
            subtitle="Total available payment entries"
            icon="▦"
          />

          <StatCard
            title="Recorded Salary"
            value={money(totalSalary)}
            subtitle="Combined salary amounts in records"
            icon="◷"
          />

          <StatCard
            title="Paid Records"
            value={paidRecords}
            subtitle="Entries marked paid or completed"
            icon="✓"
          />
        </section>

        {/* Salary Information Banner */}
        <section className="relative isolate overflow-hidden rounded-[24px] bg-gradient-to-br from-[#104b35] to-[#23845b] p-6 text-white shadow-sm sm:p-8">
          <div className="pointer-events-none absolute -right-12 -top-16 -z-10 h-56 w-56 rounded-full border-[28px] border-white/10" />

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-emerald-50">
                <span className="h-2 w-2 rounded-full bg-emerald-300" />
                PAYROLL SUMMARY
              </span>

              <h2 className="mt-4 text-2xl font-bold sm:text-3xl">
                Your payment overview
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-emerald-50">
                Keep track of the salary amounts and payment information
                recorded in your staff account.
              </p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm sm:min-w-52">
              <p className="text-sm text-emerald-100">
                Total Amount Paid
              </p>
              <p className="mt-2 break-words text-2xl font-bold">
                {money(totalPaid)}
              </p>
              <p className="mt-2 text-xs text-emerald-100">
                {records.length} total records
              </p>
            </div>
          </div>
        </section>

        {/* Payment Records */}
        <section className="overflow-hidden rounded-[24px] border border-slate-100 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:p-7">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Payment Records
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                View the salary and payment details available in your account.
              </p>
            </div>

            <span className="flex items-center gap-2 self-start rounded-full bg-emerald-50 px-4 py-2 text-xs font-semibold text-[#176747]">
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
              {records.length} Records
            </span>
          </div>

          {loading ? (
            <div className="p-10 text-center">
              <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-emerald-100 border-t-[#176747]" />

              <p className="mt-4 text-sm text-slate-500">
                Loading salary history...
              </p>
            </div>
          ) : records.length === 0 ? (
            <div className="p-10 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-2xl text-[#176747]">
                ₹
              </span>

              <h3 className="mt-4 font-semibold text-slate-800">
                No salary records available
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Your payment records will appear here when available.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px] text-left text-sm">
                <thead className="bg-[#f8faf8] text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Month</th>
                    <th className="px-6 py-4 font-semibold">Salary</th>
                    <th className="px-6 py-4 font-semibold">Paid Amount</th>
                    <th className="px-6 py-4 font-semibold">Payment Date</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {records.map((item, index) => {
                    const status = item.status || "Recorded";

                    return (
                      <tr
                        key={item.id || index}
                        className="border-t border-slate-100 transition hover:bg-[#f8faf8]"
                      >
                        <td className="whitespace-nowrap px-6 py-5 font-semibold text-slate-800">
                          {item.month ||
                            item.salaryMonth ||
                            item.salary_month ||
                            "—"}
                        </td>

                        <td className="whitespace-nowrap px-6 py-5 text-slate-600">
                          {money(
                            item.salaryAmount ??
                              item.salary_amount ??
                              item.amount
                          )}
                        </td>

                        <td className="whitespace-nowrap px-6 py-5 font-semibold text-[#176747]">
                          {money(item.paidAmount ?? item.paid_amount)}
                        </td>

                        <td className="whitespace-nowrap px-6 py-5 text-slate-600">
                          {formatDate(
                            item.paymentDate || item.payment_date
                          )}
                        </td>

                        <td className="whitespace-nowrap px-6 py-5">
                          <PaymentStatus status={status} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="flex flex-col justify-between gap-2 border-t border-slate-200 py-5 text-xs text-slate-400 sm:flex-row">
          <p>© {new Date().getFullYear()} Connect API Staff Portal</p>
          <p>Staff Workspace · Payroll Management</p>
        </footer>
      </div>
    </div>
  );
}
