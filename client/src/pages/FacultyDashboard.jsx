import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function FacultyDashboard() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/reports")
      .then(res => setReports(res.data));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      <div className="flex justify-between mb-6">

        <h1 className="text-3xl font-bold">
          Faculty Dashboard
        </h1>

        <Link
          to="/create"
          className="bg-indigo-600 text-white px-5 py-2 rounded"
        >
          + Create Report
        </Link>

      </div>

      <div className="grid md:grid-cols-2 gap-6">

        {reports.map(r => (
          <div
            key={r._id}
            className="bg-white p-6 rounded shadow"
          >
            <h2 className="text-xl font-bold">
              {r.title}
            </h2>

            <p className="text-gray-600">
              {r.date}
            </p>

            <div className="mt-4 flex gap-3">

              <a
                href={`http://localhost:5000/api/reports/pdf/${r._id}`}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                PDF
              </a>

              <a
                href={`http://localhost:5000/api/reports/email/${r._id}`}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Email
              </a>

            </div>
          </div>
        ))}

      </div>
    </div>
  );
}