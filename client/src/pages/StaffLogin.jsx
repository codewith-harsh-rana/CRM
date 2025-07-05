import { useState } from "react";
import axios from "axios";
import { FaUsersCog, FaEnvelope, FaLock } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

function StaffLogin() {
  const [form, setForm] = useState({ email: "", password: "", role: "hr" });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", form);
      const { token, user } = res.data;

      // Save token
      localStorage.setItem("token", token);

      toast.success(`Welcome ${user.name} (${user.role})`);

      setTimeout(() => {
        if (user.role === "hr") navigate("/hr-dashboard");
        else if (user.role === "user") navigate(toast.error("Unauthorized access for regular users")); 
        else navigate("/developer-dashboard");
      }, 1500);
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-green-100 via-white to-green-200 flex items-center justify-center px-4">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      <div className="w-full max-w-4xl flex rounded-2xl shadow-2xl overflow-hidden bg-opacity-70 backdrop-blur-lg bg-white border border-green-200">
        {/* Left Panel */}
        <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-b from-green-600 to-green-800 text-white p-10 w-1/2">
          <FaUsersCog className="text-6xl mb-4 animate-pulse" />
          <h2 className="text-3xl font-bold text-center">Unique Infotech Staff Portal</h2>
          <p className="mt-2 text-center text-green-100 text-sm">
            Secure access for HR and Developer team members.
          </p>
        </div>

        {/* Right Panel - Login Form */}
        <div className="w-full md:w-1/2 p-8 sm:p-12">
          <h2 className="text-2xl font-bold text-green-700 mb-6 text-center">Staff Login</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Select Role</label>
              <div className="flex gap-6">
                {['hr', 'developer'].map((role) => (
                  <label key={role} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      value={role}
                      name="role"
                      checked={form.role === role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                      className="accent-green-600"
                    />
                    <span className="capitalize text-gray-700">{role}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Email Input */}
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-3 text-green-500" />
              <input
                type="email"
                required
                autoComplete="email"
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none"
                placeholder="Enter your email"
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <FaLock className="absolute left-3 top-3 text-green-500" />
              <input
                type="password"
                required
                autoComplete="current-password"
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none"
                placeholder="Enter password"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full text-white font-semibold py-2 rounded-lg transition duration-300 ${
                loading ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="text-center text-gray-500 text-xs mt-8">
            &copy; {new Date().getFullYear()} Unique Infotech CRM. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

export default StaffLogin;
