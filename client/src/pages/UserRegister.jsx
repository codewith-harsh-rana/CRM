import { useState } from "react";
import axios from "axios";
import {
  FaEnvelope,
  FaLock,
  FaUser,
  FaUserPlus,
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, Link } from "react-router-dom";

function UserRegister() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/register", form);
      toast.success("🎉 Registered Successfully!");
      setTimeout(() => navigate("/login"), 1500);
      setForm({ name: "", email: "", password: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration Failed!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-500 via-white to-green-200 px-4 py-10 relative">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      {/* Background Art */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-green-300 rounded-full blur-[120px] opacity-20 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-green-100 rounded-full blur-[100px] opacity-30 animate-ping"></div>
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-lg bg-white/80 backdrop-blur-md shadow-2xl rounded-2xl px-10 py-12 border border-green-100">
        {/* Logo */}
        <div className="flex justify-center items-center gap-2 mb-6">
          <FaUserPlus className="text-green-600 text-3xl drop-shadow" />
          <h1 className="text-3xl font-extrabold text-green-700">
            Unique<span className="text-gray-900"> Infotech</span>
          </h1>
        </div>

        <h2 className="text-center text-xl font-semibold text-gray-700 mb-6">
          Create Your Account
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <FaUser className="absolute top-3 left-3 text-green-500" />
            <input
              type="text"
              required
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>
          <div className="relative">
            <FaEnvelope className="absolute top-3 left-3 text-green-500" />
            <input
              type="email"
              required
              placeholder="Email Address"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>
          <div className="relative">
            <FaLock className="absolute top-3 left-3 text-green-500" />
            <input
              type="password"
              required
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-md transition shadow-sm"
          >
            Register
          </button>
        </form>

        {/* Bottom Link */}
        <p className="text-sm text-center text-gray-600 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-green-600 font-semibold hover:underline">
            Login
          </Link>
        </p>

        {/* Footer */}
        <p className="text-xs text-center text-gray-400 mt-4">
          &copy; {new Date().getFullYear()} Unique Infotech . All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default UserRegister;
