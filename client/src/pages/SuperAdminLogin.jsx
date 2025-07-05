import { useState } from "react";
import axios from "axios";
import { FaUser, FaLock, FaUserShield, FaUsersCog } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function SuperAdminLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/superadmin/login", form);
      localStorage.setItem("token", res.data.token);
      toast.success("Welcome Super Admin!", { autoClose: 2000 });
      setTimeout(() => navigate("/superadmin-dashboard"), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed", { autoClose: 3000 });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-white">
      <ToastContainer position="top-right" />

      <div className="flex flex-col md:flex-row bg-[#1e293b] bg-opacity-60 backdrop-blur-md shadow-2xl rounded-2xl p-8 md:p-0 overflow-hidden w-full max-w-5xl">
        {/* Left Side */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-tr from-cyan-800 via-indigo-700 to-purple-800 items-center justify-center">
          <div className="text-center p-8">
            <FaUserShield className="text-5xl text-cyan-300 mb-4 animate-pulse" />
            <h2 className="text-3xl font-bold text-cyan-200">CRM Super Admin</h2>
            <p className="text-gray-300 mt-4">Your gateway to secure management access</p>
          </div>
        </div>

        {/* Right Side - Login */}
        <div className="w-full md:w-1/2 bg-[#0f172a] p-8 md:p-12">
          <h3 className="text-2xl font-bold text-cyan-400 mb-6">Super Admin Login</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <FaUser className="absolute top-3 left-3 text-cyan-400" />
              <input
                type="email"
                autoComplete="email"
                placeholder="Email address"
                required
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-800 border border-cyan-700 text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="relative">
              <FaLock className="absolute top-3 left-3 text-cyan-400" />
              <input
                type="password"
                autoComplete="current-password"
                placeholder="Password"
                required
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-800 border border-cyan-700 text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2 rounded-lg font-semibold transition duration-300"
            >
              Login
            </button>
          </form>

          <div className="flex justify-between text-sm mt-6 text-gray-400">
            <Link to="/forgot-password" className="hover:underline text-cyan-400">
              Forgot Password?
            </Link>
            <Link to="/" className="hover:underline text-cyan-400">
              Back to Home
            </Link>
          </div>

          <div className="mt-8 text-sm text-center text-gray-400 space-y-1">
            <p>Other Login Options:</p>
            <div className="flex justify-center space-x-4 mt-1">
              <Link to="/login" className="text-blue-400 hover:underline flex items-center gap-1">
                <FaUser /> User Login
              </Link>
              <Link to="/staff-login" className="text-green-400 hover:underline flex items-center gap-1">
                <FaUsersCog /> HR/Dev Login
              </Link>
            </div>
            <p className="text-xs text-gray-500 mt-6">
              &copy; {new Date().getFullYear()} Unique Infotech CRM
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SuperAdminLogin;
