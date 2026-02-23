import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const [reports, setReports] = useState([]);
  const [emailInputs, setEmailInputs] = useState({}); // { reportId: email }
  const [emailStatus, setEmailStatus] = useState({}); // { reportId: 'sending'|'sent'|'error' }

  useEffect(() => {
    axios.get("http://localhost:5000/api/reports")
      .then(res => setReports(res.data));
  }, []);

  const deleteReport = async (id) => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;
    await axios.delete(`http://localhost:5000/api/reports/${id}`);
    setReports(reports.filter(r => r._id !== id));
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
      {/* Top bar */}
      <nav className="bg-white shadow px-8 py-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-indigo-600">
          Activity Report System
        </Link>
        <div className="space-x-4">
          <Link to="/create" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
            + New Report
          </Link>
          <Link to="/" className="text-gray-600 hover:text-indigo-600 font-medium transition">
            Home
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-indigo-500">
            <h2 className="text-sm font-medium text-gray-500 uppercase">Total Reports</h2>
            <p className="text-3xl font-bold text-indigo-600 mt-1">{reports.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
            <h2 className="text-sm font-medium text-gray-500 uppercase">Faculty Users</h2>
            <p className="text-3xl font-bold text-green-600 mt-1">—</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-500">
            <h2 className="text-sm font-medium text-gray-500 uppercase">Departments</h2>
            <p className="text-3xl font-bold text-purple-600 mt-1">—</p>
          </div>
        </div>

        {/* Report Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-800">All Reports</h2>
          </div>

          {reports.length === 0 ? (
            <div className="p-10 text-center text-gray-400">
              No reports yet. Create your first report!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-left text-sm text-gray-500 uppercase">
                  <tr>
                    <th className="px-6 py-3">Title</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Email Report</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reports.map(r => (
                    <tr key={r._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-medium text-gray-800">{r.title}</td>
                      <td className="px-6 py-4 text-gray-600">{r.date}</td>

                      {/* Email column */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="email"
                            placeholder="recipient@email.com"
                            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 w-48"
                            value={emailInputs[r._id] || ""}
                            onChange={(e) => setEmailInputs({ ...emailInputs, [r._id]: e.target.value })}
                          />
                          <button
                            onClick={() => sendEmail(r._id)}
                            disabled={emailStatus[r._id] === "sending"}
                            className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:bg-green-400 transition"
                          >
                            {emailStatus[r._id] === "sending" ? "Sending..." :
                             emailStatus[r._id] === "sent" ? "Sent!" : "Send"}
                          </button>
                        </div>
                        {emailStatus[r._id] === "error" && (
                          <p className="text-xs text-red-500 mt-1">Failed to send</p>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <a
                            href={`http://localhost:5000/api/reports/pdf/${r._id}`}
                            className="px-3 py-1.5 bg-indigo-100 text-indigo-700 text-sm rounded-lg hover:bg-indigo-200 transition"
                          >
                            Download PDF
                          </a>
                          <button
                            onClick={() => deleteReport(r._id)}
                            className="px-3 py-1.5 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200 transition"
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
    </div>
  );
}
