import { useEffect, useState } from "react";
import axios from "axios";

export default function ViewReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/reports")
      .then((res) => setReports(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-full bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-800">View Reports</h1>
        <p className="text-gray-500 text-sm mt-1">Browse all submitted activity reports</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-gray-400">
          Loading reports...
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500 font-medium">No reports yet.</p>
          <p className="text-gray-400 text-sm mt-1">Create your first report to get started.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {reports.map((r) => (
            <div
              key={r._id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>

              <h2 className="text-base font-bold text-gray-800 mb-1 line-clamp-2">{r.title}</h2>
              <p className="text-xs text-gray-400 mb-4">{r.date}</p>

              {r.organizedBy && (
                <p className="text-xs text-gray-500 mb-4">
                  <span className="font-medium">By:</span> {r.organizedBy}
                </p>
              )}

              <div className="flex gap-2 mt-auto">
                <a
                  href={`http://localhost:5000/api/reports/pdf/${r._id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 text-center bg-indigo-50 text-indigo-700 text-sm font-medium py-2 rounded-lg hover:bg-indigo-100 transition"
                >
                  📄 Download PDF
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}