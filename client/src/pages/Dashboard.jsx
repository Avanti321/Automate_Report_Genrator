import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const [reports, setReports] = useState([]);
  const [emailInputs, setEmailInputs] = useState({});
  const [emailStatus, setEmailStatus] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/reports")
      .then((res) => setReports(res.data))
      .finally(() => setLoading(false));
  }, []);

  const deleteReport = async (id) => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;
    await axios.delete(`http://localhost:5000/api/reports/${id}`);
    setReports(reports.filter((r) => r._id !== id));
  };

  const sendEmail = async (id) => {
    const to = emailInputs[id];
    if (!to || !to.trim()) {
      alert("Please enter a recipient email.");
      return;
    }
    setEmailStatus({ ...emailStatus, [id]: "sending" });
    try {
      await axios.post(`http://localhost:5000/api/reports/email/${id}`, { to: to.trim() });
      setEmailStatus({ ...emailStatus, [id]: "sent" });
    } catch {
      setEmailStatus({ ...emailStatus, [id]: "error" });
    }
  };

  return (
    <div className="min-h-full bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Manage all reports, send emails and track activity</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-indigo-500">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Total Reports</p>
          <p className="text-4xl font-extrabold text-indigo-600">{reports.length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-green-500">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Faculty Users</p>
          <p className="text-4xl font-extrabold text-green-600">—</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-purple-500">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Departments</p>
          <p className="text-4xl font-extrabold text-purple-600">—</p>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-800">All Reports</h2>
          <span className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full font-medium">
            {reports.length} total
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading...</div>
        ) : reports.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            No reports yet. Create your first report!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wide">
                <tr>
                  <th className="px-6 py-3">Title</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Email Report</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {reports.map((r) => (
                  <tr key={r._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-800">{r.title}</td>
                    <td className="px-6 py-4 text-gray-500">{r.date}</td>

                    {/* Email column */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="email"
                          placeholder="recipient@email.com"
                          className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400 w-44"
                          value={emailInputs[r._id] || ""}
                          onChange={(e) =>
                            setEmailInputs({ ...emailInputs, [r._id]: e.target.value })
                          }
                        />
                        <button
                          onClick={() => sendEmail(r._id)}
                          disabled={emailStatus[r._id] === "sending"}
                          className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 disabled:bg-green-400 transition"
                        >
                          {emailStatus[r._id] === "sending"
                            ? "Sending..."
                            : emailStatus[r._id] === "sent"
                            ? "✓ Sent"
                            : "Send"}
                        </button>
                      </div>
                      {emailStatus[r._id] === "error" && (
                        <p className="text-xs text-red-500 mt-1">Failed to send</p>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <a
                          href={`http://localhost:5000/api/reports/pdf/${r._id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs rounded-lg hover:bg-indigo-100 transition"
                        >
                          Download PDF
                        </a>
                        <button
                          onClick={() => deleteReport(r._id)}
                          className="px-3 py-1.5 bg-red-50 text-red-600 text-xs rounded-lg hover:bg-red-100 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
