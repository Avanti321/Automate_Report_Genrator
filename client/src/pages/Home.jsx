import { Link } from "react-router-dom";
import bg from "../assets/college.jpg";

export default function Home() {
  return (
    <div className="text-white">

      {/* HERO WITH BACKGROUND */}
      <div
        className="relative min-h-screen bg-cover bg-center"
        style={{ backgroundImage: `url(${bg})` }}
      >

        {/* Overlay (NO BLUR) */}
        <div className="absolute inset-0 bg-black/70"></div>

        {/* NAVBAR */}
        <nav className="relative z-10 flex justify-between items-center px-8 py-5">

          <h1 className="text-2xl font-bold">
            Activity Report System
          </h1>

          <div className="space-x-6 hidden md:flex">
            <Link to="/" className="hover:text-gray-300">Home</Link>
            <Link to="/dashboard" className="hover:text-gray-300">Reports</Link>
            <Link to="/create" className="hover:text-gray-300">Create</Link>

            {/* Register */}
            <Link
              to="/register"
              className="bg-green-600 px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Register
            </Link>

            {/* Login */}
            <Link
              to="/login"
              className="bg-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              Login
            </Link>
          </div>
        </nav>

        {/*  HERO CONTENT */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-32">

          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Automatic Department Activity Report System
          </h1>

          <p className="max-w-2xl text-lg text-gray-200 mb-10">
            A centralized web-based platform developed to simplify
            documentation and management of departmental activities.
            Generate structured reports with PDF export and email sharing.
          </p>

         
          <div className="flex justify-center items-center gap-8 mt-4">

            <Link
              to="/create"
              className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-semibold shadow-lg"
            >
              Create Report
            </Link>

            <Link
              to="/dashboard"
              className="bg-green-600 hover:bg-green-700 px-8 py-3 rounded-lg font-semibold shadow-lg"
            >
              View Reports
            </Link>

          </div>
        </div>
      </div>

      {/* PROJECT OVERVIEW  */}
      <section className="bg-white text-black py-16 px-8">
        <div className="max-w-5xl mx-auto text-center">

          <h2 className="text-3xl font-bold mb-6">
            Project Overview
          </h2>

          <p className="text-lg leading-relaxed">
            This system is designed to automate the preparation of
            departmental activity reports. Faculty members can enter
            activity details, upload supporting documents, and generate
            professionally formatted reports instantly. The system
            improves efficiency, accuracy, and record management.
          </p>

        </div>
      </section>

      {/* OBJECTIVES */}
      <section className="bg-gray-100 text-black py-16 px-8">
        <div className="max-w-5xl mx-auto">

          <h2 className="text-3xl font-bold text-center mb-10">
            Project Objectives
          </h2>

          <ul className="space-y-4 text-lg list-disc list-inside">
            <li>Automate preparation of departmental activity reports</li>
            <li>Provide centralized storage for event documentation</li>
            <li>Enable PDF generation and email sharing</li>
            <li>Reduce manual paperwork and errors</li>
            <li>Improve accessibility and record management</li>
          </ul>

        </div>
      </section>

      {/* SYSTEM MODULES */}
      <section className="bg-white text-black py-16 px-8">
        <div className="max-w-6xl mx-auto">

          <h2 className="text-3xl font-bold text-center mb-12">
            System Modules
          </h2>

          <div className="grid md:grid-cols-3 gap-8">

            <div className="p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-bold mb-3">
                User Authentication
              </h3>
              <p>
                Secure login for faculty members to access the system.
              </p>
            </div>

            <div className="p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-bold mb-3">
                Report Management
              </h3>
              <p>
                Create, update, and manage activity reports efficiently.
              </p>
            </div>

            <div className="p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-bold mb-3">
                Document Generation
              </h3>
              <p>
                Generate PDF reports and share via email instantly.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-gray-100 text-black py-16 px-8">
        <div className="max-w-5xl mx-auto text-center">

          <h2 className="text-3xl font-bold mb-8">
            How It Works
          </h2>

          <p className="text-lg leading-relaxed">
            Faculty members log into the system, enter activity details,
            upload notices and photographs, and submit the form. The
            system automatically generates a formatted report that can be
            downloaded as a PDF or shared via email.
          </p>

        </div>
      </section>

      {/* FOOTER  */}
      <footer className="bg-black text-center py-6 text-gray-400">
        © 2026 Automatic Department Activity Report System  
        <br />
        Final Year Project — Computer Science Department
      </footer>

    </div>
  );
}