import { useState } from "react";
import axios from "axios";
import { FaSignInAlt, FaEnvelope, FaLock } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function UserLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", form);
      localStorage.setItem("token", res.data.token);
      toast.success(` Logged in as ${res.data.user.role}`);
      
      // Redirect after login
      setTimeout(() => {
        if (res.data.user.role === "user") {
          navigate("/user-dashboard");
        } else {
          navigate("/staff-dashboard");
        }
      }, 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || "❌ Login failed");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-300 via-white to-blue-100 px-4 overflow-hidden">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      {/* Blurry Circles Background */}
      <div className="absolute -top-24 -left-24 w-80 h-80 bg-blue-400 rounded-full filter blur-3xl opacity-30 animate-pulse z-0" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-300 rounded-full filter blur-2xl opacity-30 animate-spin-slow z-0" />

      {/* Card */}
      <div className="z-10 w-full max-w-md bg-white bg-opacity-30 backdrop-blur-xl border border-blue-200 shadow-xl rounded-3xl px-10 py-12 animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-blue-600 p-4 rounded-full shadow-lg">
            <FaSignInAlt className="text-white text-2xl" />
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-blue-700 drop-shadow">Login to CRM</h2>
          <p className="text-sm text-gray-600 mt-1">Access your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div className="relative">
            <FaEnvelope className="absolute left-3 top-3 text-blue-400" />
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="Email address"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
            />
          </div>

          {/* Password Field */}
          <div className="relative">
            <FaLock className="absolute left-3 top-3 text-blue-400" />
            <input
              type="password"
              required
              autoComplete="current-password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-300 shadow-md"
          >
            Login
          </button>
        </form>

        {/* Register Link */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Don’t have an account?{" "}
            <Link
              to="/register"
              className="text-blue-600 hover:underline font-medium"
            >
              Register here
            </Link>
          </p>
        </div>

        <p className="text-xs text-center text-gray-400 mt-8">
          &copy; {new Date().getFullYear()} Unique Infotech CRM
        </p>
      </div>
    </div>
  );
}

export default UserLogin;
