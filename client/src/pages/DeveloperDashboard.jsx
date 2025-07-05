// DeveloperDashboard.jsx

import { useEffect, useState } from "react";
import {
  FaClock, FaTasks, FaSignOutAlt, FaCodeBranch,
  FaDownload, FaUserCircle, FaCheckCircle,
  FaSignInAlt, FaMoneyBillWave, FaUser, FaHistory
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import { CSVLink } from "react-csv";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const TABS = [
  { key: "attendance", label: "Attendance History", icon: <FaHistory /> },
  { key: "salary", label: "Salary", icon: <FaMoneyBillWave /> },
  { key: "profile", label: "Profile", icon: <FaUser /> },
  { key: "tasks", label: "Tasks", icon: <FaTasks /> },
];

const DeveloperDashboard = () => {
  const [checkedIn, setCheckedIn] = useState(false);
  const [attendanceToday, setAttendanceToday] = useState(null);
  const [allAttendance, setAllAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [activeTab, setActiveTab] = useState("attendance");
  const [salarySlips, setSalarySlips] = useState([]);

  const token = localStorage.getItem("token");

  // CSV headers for attendance export
  const csvHeaders = [
    { label: "Date", key: "date" },
    { label: "Check-In", key: "checkIn" },
    { label: "Check-Out", key: "checkOut" },
    { label: "Duration", key: "duration" },
  ];

const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/attendance/my", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const today = new Date().toISOString().split("T")[0];
      const todayRecord = res.data.find((record) => record.date === today);

      setAttendanceToday(todayRecord || null);
      setCheckedIn(!!todayRecord);
      setAllAttendance(res.data);
      setLoading(false);
    } catch (err) {
      toast.error("Failed to load attendance");
      setLoading(false);
    }
  };  

  const handleCheckIn = async () => {
    try {
      await axios.post("http://localhost:5000/api/attendance/check-in", {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Checked in successfully");
      fetchAttendance();
    } catch (err) {
      toast.error(err.response?.data?.message || "Check-in failed");
    }
  };

  const handleCheckOut = async () => {
    try {
      await axios.post("http://localhost:5000/api/attendance/check-out", {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Checked out successfully"); 
      fetchAttendance();
    } catch (err) {
      toast.error(err.response?.data?.message || "Check-out failed");
    }
  };  

  const handleLogout = () => {
    if (attendanceToday && !attendanceToday.checkOut) {
      toast.warning("Please check-out before logout!");
      return;
    }
    localStorage.removeItem("token");
    toast.info("Logged out successfully");
    setTimeout(() => (window.location.href = "/staff-login"), 1500);
  };

  useEffect(() => {
    fetchAttendance();
    fetchSalarySlips();
    // eslint-disable-next-line
  }, []);

  const filteredAttendance = allAttendance.filter((record) => {
    const recordDate = new Date(record.date);
    return (
      recordDate.getFullYear() === Number(selectedYear) &&
      recordDate.getMonth() + 1 === Number(selectedMonth)
    );
  });

  const fetchSalarySlips = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/salary-slips/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSalarySlips(res.data);
    } catch {
      toast.error("Failed to load salary slips");
    }
  };
   // UI gradients
  const cardGradient = "bg-gradient-to-br from-white/10 via-blue-900/30 to-blue-950/60";
  const bgGradient = "bg-gradient-to-br from-slate-900 via-blue-950 to-slate-800";

  // Tab content renderers
  const renderAttendance = () => (
    <section className={`${cardGradient} rounded-2xl p-6 shadow-xl`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-cyan-200">Attendance History</h2>
        <div className="flex gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-gray-800 text-white p-2 rounded"
          >
            {months.map((m, idx) => (
              <option key={idx} value={idx + 1}>{m}</option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-gray-800 text-white p-2 rounded"
          >
            {[2023, 2024, 2025].map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <CSVLink
            headers={csvHeaders}
            data={filteredAttendance}
            filename={`attendance-${selectedMonth}-${selectedYear}.csv`}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded shadow font-semibold flex items-center gap-2"
          >
            <FaDownload /> Export
          </CSVLink>
        </div>
      </div>

      {loading ? (
        <p className="text-cyan-100 text-center py-6">Loading...</p>
      ) : filteredAttendance.length === 0 ? (
        <p className="text-gray-400 text-center py-6">No records this month.</p>
      ) : (
        <table className="w-full text-white text-sm">
          <thead className="bg-cyan-800">
            <tr>
              <th className="text-left px-4 py-2">Date</th>
              <th className="text-left px-4 py-2">Check-In</th>
              <th className="text-left px-4 py-2">Check-Out</th>
              <th className="text-left px-4 py-2">Duration</th>
            </tr>
          </thead>
          <tbody>
            {filteredAttendance.map((item) => (
              <tr key={item._id} className="border-t border-gray-800 hover:bg-gray-900">
                <td className="px-4 py-2">{item.date}</td>
                <td className="px-4 py-2">{item.checkIn || "--"}</td>
                <td className="px-4 py-2">{item.checkOut || "--"}</td>
                <td className="px-4 py-2">{item.duration || "--"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );

  const renderSalary = () => (
    <section className={`${cardGradient} rounded-2xl p-6 shadow-xl`}>
      <h2 className="text-2xl font-bold text-cyan-200 mb-4 flex items-center gap-2">
        <FaMoneyBillWave /> Salary Details
      </h2>
      {salarySlips.length === 0 ? (
        <p className="text-gray-300 text-center py-6">No salary slips available yet.</p>
      ) : (
        <div className="overflow-auto rounded-lg border border-gray-700">
          <table className="min-w-full text-sm text-white">
            <thead className="bg-cyan-800 text-left">
              <tr>
                <th className="px-4 py-2">Month</th>
                <th className="px-4 py-2">LPA</th>
                <th className="px-4 py-2">Hours</th>
                <th className="px-4 py-2">Calculated</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Reason</th>
              </tr>  
            </thead>
            <tbody>
              {salarySlips.map((slip) => (
                <tr key={slip._id} className="hover:bg-gray-900 border-t border-gray-800">
                  <td className="px-4 py-2">{slip.month}</td>
                  <td className="px-4 py-2">₹ {(slip.LPA / 100000).toFixed(2)} LPA</td>
                  <td className="px-4 py-2">{slip.totalWorkingHours} hrs</td>
                  <td className="px-4 py-2 text-green-300 font-semibold">₹ {slip.calculatedSalary}</td>
                  <td className="px-4 py-2">
                    {slip.status === "approved" ? (
                      <span className="text-green-400 font-bold">Approved</span>
                    ) : slip.status === "rejected" ? (
                      <span className="text-red-400 font-bold">Rejected</span>
                    ) : (
                      <span className="text-yellow-300 font-bold">Pending</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-red-300 italic">
                    {slip.status === "rejected" ? slip.rejectionReason : "--"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );

  const renderProfile = () => (
    <section className={`${cardGradient} rounded-2xl p-6 shadow-xl`}>
      <h2 className="text-2xl font-bold text-cyan-200 mb-4 flex items-center gap-2">
        <FaUser /> Profile
      </h2>
      <div className="text-gray-300 text-center py-8">Profile information coming soon...</div>
    </section>
  );

  const renderTasks = () => (
    <section className={`${cardGradient} rounded-2xl p-6 shadow-xl`}>
      <h2 className="text-2xl font-bold text-cyan-200 mb-4 flex items-center gap-2">
        <FaTasks /> Tasks
      </h2>
      <div className="text-gray-300 text-center py-8">Tasks management coming soon...</div>
    </section>
  );

  return (
    <div className={`min-h-screen ${bgGradient} flex flex-col`}>
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      {/* Top Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 bg-blue-950/95 shadow-lg border-b border-blue-900">
        <div className="flex items-center gap-3">
          <FaCodeBranch className="text-cyan-400 text-2xl" />
          <span className="text-cyan-200 text-xl font-bold tracking-wide">
            Developer Dashboard
          </span>
        </div>
        <ul className="flex gap-2 md:gap-6">
          {TABS.map((tab) => (
            <li key={tab.key}>
              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition 
                  ${activeTab === tab.key
                    ? "bg-cyan-700 text-white shadow"
                    : "bg-blue-900/80 text-cyan-200 hover:bg-cyan-800/80 hover:text-white"}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.icon} {tab.label}
              </button>
            </li>
          ))}
        </ul>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-semibold shadow"
        >
          <FaSignOutAlt /> Logout
        </button>
      </nav>

      <main className="flex-1 p-8 max-w-5xl mx-auto w-full">
        {/* Welcome & Attendance Summary */}
        <section className={`${cardGradient} p-6 rounded-2xl shadow-lg mb-8`}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col items-center gap-1">
              <FaUserCircle className="text-6xl text-cyan-400" />
              <p className="text-cyan-200 font-semibold">Developer</p>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl text-cyan-100 font-bold mb-2">Welcome Back!</h2>
              <p className="text-gray-300 mb-4">
                {new Date().toLocaleDateString(undefined, {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="flex items-center gap-2 bg-cyan-800 px-4 py-1 text-cyan-100 rounded-lg shadow">
                  <FaCheckCircle />{" "}
                  {checkedIn
                    ? attendanceToday?.checkOut
                      ? "Checked Out"
                      : "Checked In"
                    : "Not Checked In"}
                </span>
                <span className="flex items-center gap-2 bg-blue-800 px-4 py-1 text-blue-100 rounded-lg shadow">
                  <FaSignInAlt /> {attendanceToday?.checkIn || "No Check-In"}
                </span>
                <span className="flex items-center gap-2 bg-blue-800 px-4 py-1 text-blue-100 rounded-lg shadow">
                  <FaSignOutAlt /> {attendanceToday?.checkOut || "No Check-Out"}
                </span>
                <span className="flex items-center gap-2 bg-blue-800 px-4 py-1 text-blue-100 rounded-lg shadow">
                  <FaClock /> Duration: {attendanceToday?.duration || "--"}
                </span>
              </div>
            </div>
            <div>
              {!checkedIn ? (
                <button
                  onClick={handleCheckIn}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl font-bold shadow flex items-center gap-2"
                >
                  <FaSignInAlt /> Check In
                </button>
              ) : !attendanceToday?.checkOut ? (
                <button
                  onClick={handleCheckOut}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl font-bold shadow flex items-center gap-2"
                >
                  <FaSignOutAlt /> Check Out
                </button>
              ) : null}
            </div>
          </div>
        </section>

        {/* Tab Content */}
        {activeTab === "attendance" && renderAttendance()}
        {activeTab === "salary" && renderSalary()}
        {activeTab === "profile" && renderProfile()}
        {activeTab === "tasks" && renderTasks()}
      </main>
    </div>
  );
};

export default DeveloperDashboard;
