import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({
    role: "faculty"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const register = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axios.post(
        "http://localhost:5000/api/auth/register",
        form
      );
      alert("Registration Successful!");
      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.message || err.response?.data || "Registration failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">

        <h2 className="text-3xl font-bold text-center mb-6">
          User Registration
        </h2>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4 border border-red-200">
            {typeof error === "string" ? error : "Registration failed."}
          </div>
        )}

        <form onSubmit={register} className="space-y-4">

          <input
            type="text"
            placeholder="Full Name"
            className="w-full p-3 border rounded"
            onChange={e =>
              setForm({ ...form, name: e.target.value })
            }
            required
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border rounded"
            onChange={e =>
              setForm({ ...form, email: e.target.value })
            }
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border rounded"
            onChange={e =>
              setForm({ ...form, password: e.target.value })
            }
            required
          />

          {/* Role Selection */}
          <select
            className="w-full p-3 border rounded"
            onChange={e =>
              setForm({ ...form, role: e.target.value })
            }
          >
            <option value="faculty">Faculty</option>
            <option value="admin">Admin</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white p-3 rounded hover:bg-indigo-700 disabled:bg-indigo-400"
          >
            {loading ? "Registering..." : "Register"}
          </button>

        </form>

        {/* Login Link */}
        <p className="text-center mt-4">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-indigo-600 font-semibold"
          >
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}