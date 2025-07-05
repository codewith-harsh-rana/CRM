import { useState, useEffect } from "react";
import {
  FaUserTie,
  FaUsers,
  FaCalendarCheck,
  FaSignOutAlt,
  FaChartBar,
  FaClipboardList,
  FaEdit,
  FaTrash,
  FaFileCsv,
  FaSearch,
  FaPlus,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CSVLink } from "react-csv";

// Redesigned HR Dashboard UI
const HrDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [attendanceData, setAttendanceData] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [filterName, setFilterName] = useState("All");
  const [filterDate, setFilterDate] = useState("");
  const [filterEmail, setFilterEmail] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [searchJob, setSearchJob] = useState("");
  const [showJobForm, setShowJobForm] = useState(false);

  const employeeNames = Array.from(
    new Set(attendanceData.map((a) => a.staffId?.name).filter(Boolean))
  );
  const employeeEmails = Array.from(
    new Set(attendanceData.map((a) => a.staffId?.email).filter(Boolean))
  );

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    type: "full-time",
    salary: "",
    experience: "",
    companyName: "",
    skills: "",
    education: "",
    benefits: "",
    deadline: "",
  });
  const [editId, setEditId] = useState(null);

  const fetchAttendanceData = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/attendance/all", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setAttendanceData(res.data);
    } catch (error) {
      toast.error("Failed to load attendance");
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/jobs", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setJobs(res.data);
    } catch {
      toast.error("Failed to load jobs");
    }
  };

  const handleViewApplicants = async (jobId) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/jobs/applicants/${jobId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setApplicants(res.data.applicants);
      toast.success("Applicants loaded");
    } catch {
      toast.error("Failed to load applicants");
    }
  };

  useEffect(() => {
    if (activeTab === "jobs") {
      fetchJobs();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "attendance") fetchAttendanceData();
  }, [activeTab]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = editId
      ? `http://localhost:5000/api/jobs/${editId}`
      : "http://localhost:5000/api/jobs";

    try {
      const method = editId ? axios.put : axios.post;
      await method(endpoint, form, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success(`Job ${editId ? "updated" : "created"} successfully`);
      setForm({
        title: "",
        description: "",
        location: "",
        type: "full-time",
        salary: "",
        experience: "",
        companyName: "",
        skills: "",
        education: "",
        benefits: "",
        deadline: "",
      });
      setEditId(null);
      setShowJobForm(false);
      fetchJobs();
    } catch {
      toast.error("Operation failed");
    }
  };

  const handleEdit = (job) => {
    setForm({
      title: job.title,
      description: job.description,
      location: job.location,
      type: job.type,
      salary: job.salary || "",
      experience: job.experience || "",
      companyName: job.companyName || "",
      skills: job.skills || "",
      education: job.education || "",
      benefits: job.benefits || "",
      deadline: job.deadline?.substring(0, 10) || "",
    });
    setEditId(job._id);
    setShowJobForm(true);
    setActiveTab("jobs");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/jobs/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Job deleted");
      fetchJobs();
    } catch {
      toast.error("Failed to delete job");
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("token");
      toast.success("Logged out");
      setTimeout(() => {
        window.location.href = "/staff-login";
      }, 1000);
    }
  };

  const navItems = [
    { key: "dashboard", icon: <FaChartBar />, label: "Dashboard" },
    { key: "jobs", icon: <FaClipboardList />, label: "Jobs" },
    { key: "employees", icon: <FaUsers />, label: "Employees" },
    { key: "attendance", icon: <FaCalendarCheck />, label: "Attendance" },
  ];

  // Filter attendance data by employee name, email, and date
  const filteredAttendance = attendanceData.filter((a) => {
    const nameMatch =
      filterName === "All" || a.staffId?.name === filterName;
    const emailMatch =
      !filterEmail || a.staffId?.email === filterEmail;
    const dateMatch =
      !filterDate || a.date === filterDate;
    return nameMatch && emailMatch && dateMatch;
  });

  // Filter jobs by search
  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchJob.toLowerCase()) ||
      job.companyName?.toLowerCase().includes(searchJob.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchJob.toLowerCase())
  );

  const renderContent = () => {
    if (activeTab === "dashboard") {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <FaChartBar className="text-7xl text-indigo-500 mb-6" />
          <h2 className="text-3xl font-extrabold text-gray-800 mb-2">Welcome, HR Manager</h2>
          <p className="text-gray-500 text-center max-w-xl text-lg">
            Manage jobs, employees, and attendance with a modern, intuitive dashboard.
          </p>
        </div>
      );
    }
    if (activeTab === "jobs") {
      return (
        <div className="space-y-10">
          {/* Jobs Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <FaClipboardList className="text-2xl text-indigo-500" />
              <h2 className="text-2xl font-bold text-indigo-700">Job Listings</h2>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={searchJob}
                  onChange={(e) => setSearchJob(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-300"
                />
              </div>
              <button
                onClick={() => {
                  setShowJobForm((v) => !v);
                  setEditId(null);
                  setForm({
                    title: "",
                    description: "",
                    location: "",
                    type: "full-time",
                    salary: "",
                    experience: "",
                    companyName: "",
                    skills: "",
                    education: "",
                    benefits: "",
                    deadline: "",
                  });
                }}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 shadow"
              >
                <FaPlus /> {showJobForm ? "Close" : "Post Job"}
              </button>
            </div>
          </div>
          {/* Jobs List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredJobs.map((job) => (
              <div
                key={job._id}
                className="bg-white border border-gray-100 rounded-2xl shadow-lg p-6 flex flex-col justify-between hover:shadow-xl transition"
              >
                <div>
                  <h3 className="font-bold text-lg text-indigo-800">{job.title}</h3>
                  <p className="text-sm text-gray-500">{job.location}</p>
                  <p className="text-xs text-gray-400 mb-2">
                    Deadline: {job.deadline ? new Date(job.deadline).toLocaleDateString() : "N/A"}
                  </p>
                  <p className="text-xs text-gray-500 mb-2">{job.companyName}</p>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleEdit(job)}
                    className="flex items-center gap-1 px-3 py-1 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition text-sm font-medium"
                    title="Edit"
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(job._id)}
                    className="flex items-center gap-1 px-3 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 transition text-sm font-medium"
                    title="Delete"
                  >
                    <FaTrash /> Delete
                  </button>
                  <button
                    onClick={() => handleViewApplicants(job._id)}
                    className="flex items-center gap-1 px-3 py-1 rounded bg-green-50 text-green-700 hover:bg-green-100 transition text-sm font-medium"
                  >
                    View Applicants
                  </button>
                </div>
              </div>
            ))}
            {filteredJobs.length === 0 && (
              <div className="col-span-full text-center text-gray-400 py-8">
                No jobs found.
              </div>
            )}
          </div>
          {/* Job Form */}
          {showJobForm && (
            <section>
              <h2 className="text-xl font-semibold text-indigo-700 mb-6">
                {editId ? "Edit Job" : "Post New Job"}
              </h2>
              <form
                onSubmit={handleSubmit}
                className="bg-white rounded-2xl shadow-lg p-8 grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <input
                  type="text"
                  placeholder="Title"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
                <input
                  type="text"
                  placeholder="Location"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
                <input
                  type="text"
                  placeholder="Company"
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
                <input
                  type="text"
                  placeholder="Salary"
                  value={form.salary}
                  onChange={(e) => setForm({ ...form, salary: e.target.value })}
                  className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
                <input
                  type="text"
                  placeholder="Experience"
                  value={form.experience}
                  onChange={(e) => setForm({ ...form, experience: e.target.value })}
                  className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
                <input
                  type="text"
                  placeholder="Skills"
                  value={form.skills}
                  onChange={(e) => setForm({ ...form, skills: e.target.value })}
                  className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
                <input
                  type="text"
                  placeholder="Education"
                  value={form.education}
                  onChange={(e) => setForm({ ...form, education: e.target.value })}
                  className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
                <input
                  type="text"
                  placeholder="Benefits"
                  value={form.benefits}
                  onChange={(e) => setForm({ ...form, benefits: e.target.value })}
                  className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
                <input
                  type="date"
                  placeholder="Deadline"
                  value={form.deadline}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                  className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
                <textarea
                  placeholder="Description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="border border-gray-300 rounded px-3 py-2 md:col-span-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                ></textarea>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white py-2 rounded col-span-2 hover:bg-indigo-700 transition font-semibold"
                >
                  {editId ? "Update Job" : "Post Job"}
                </button>
              </form>
            </section>
          )}
          {/* Applicants Section */}
          {applicants.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-indigo-700 mb-6">Applicants</h2>
              <ul className="bg-white rounded-2xl shadow divide-y divide-gray-100">
                {applicants.map((a) => (
                  <li key={a._id} className="py-4 px-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div>
                        <p className="font-medium text-gray-800">{a.name}</p>
                        <p className="text-sm text-gray-500">{a.email}</p>
                        <p className="text-xs text-gray-400">
                          Applied at: {new Date(a.appliedAt).toLocaleString()}
                        </p>
                      </div>
                      {a.resume && (
                        <div className="flex gap-2">
                          <a
                            href={`http://localhost:5000/uploads/${a.resume}`}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded shadow text-sm font-semibold"
                          >
                            View CV
                          </a>
                          <a
                            href={`http://localhost:5000/${a.resume}`}
                            download
                            className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-4 py-2 rounded shadow text-sm font-semibold"
                          >
                            Download CV
                          </a>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      );
    }
    if (activeTab === "attendance") {
      return (
        <div>
          {/* Attendance Header */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-3">
            <div className="flex items-center gap-2">
              <FaCalendarCheck className="text-2xl text-indigo-500" />
              <h2 className="text-2xl font-bold text-indigo-700">Attendance Report</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters((v) => !v)}
                className="flex items-center gap-1 bg-gray-100 px-3 py-2 rounded-lg font-semibold text-gray-700 hover:bg-gray-200 shadow"
              >
                <FaSearch />
                Filters
                {showFilters ? <FaChevronUp /> : <FaChevronDown />}
              </button>
              <CSVLink
                data={filteredAttendance.map((a) => ({
                  Name: a.staffId?.name || "",
                  Email: a.staffId?.email || "",
                  Date: a.date,
                  "Check In": a.checkIn,
                  "Check Out": a.checkOut,
                  Duration: a.duration,
                }))}
                filename="attendance_report.csv"
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 shadow font-semibold"
              >
                <FaFileCsv /> Export CSV
              </CSVLink>
            </div>
          </div>
          {/* Filters */}
          {showFilters && (
            <div className="bg-white rounded-xl shadow p-4 mb-6 flex flex-col md:flex-row gap-4 items-center">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Employee Name</label>
                <select
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 shadow-sm focus:ring-indigo-300"
                >
                  <option value="All">All Employees</option>
                  {employeeNames.map((name, index) => (
                    <option key={index} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Email</label>
                <select
                  value={filterEmail}
                  onChange={(e) => setFilterEmail(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 shadow-sm focus:ring-indigo-300"
                >
                  <option value="">All Emails</option>
                  {employeeEmails.map((email, index) => (
                    <option key={index} value={email}>
                      {email}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Date</label>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 shadow-sm focus:ring-indigo-300"
                />
              </div>
              <button
                onClick={() => {
                  setFilterName("All");
                  setFilterEmail("");
                  setFilterDate("");
                }}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 font-semibold"
              >
                Reset
              </button>
            </div>
          )}
          {/* Attendance Table */}
          <div className="overflow-auto rounded-2xl shadow">
            <table className="min-w-full bg-white">
              <thead className="bg-indigo-100">
                <tr>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Check-In</th>
                  <th className="px-4 py-2 text-left">Check-Out</th>
                  <th className="px-4 py-2 text-left">Duration</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendance.length > 0 ? (
                  filteredAttendance.map((a) => (
                    <tr key={a._id} className="border-b">
                      <td className="px-4 py-2">{a.staffId?.name}</td>
                      <td className="px-4 py-2">{a.staffId?.email}</td>
                      <td className="px-4 py-2">{a.date}</td>
                      <td className="px-4 py-2">{a.checkIn}</td>
                      <td className="px-4 py-2">{a.checkOut || "--"}</td>
                      <td className="px-4 py-2">{a.duration || "--"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-gray-400 py-6">
                      No attendance records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
    if (activeTab === "employees") {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <FaUsers className="text-7xl text-indigo-400 mb-4" />
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Employees</h2>
          <p className="text-gray-500 text-center max-w-md text-lg">
            Employee management coming soon.
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-indigo-50 to-white">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      {/* Sidebar */}
      <aside className="w-20 md:w-64 bg-white border-r shadow-lg flex flex-col py-8 px-2 md:px-6 min-h-screen">
        <div className="mb-10 flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center mb-2">
            <FaUserTie className="text-3xl text-indigo-600" />
          </div>
          <span className="hidden md:block text-xl font-bold text-indigo-700">
            Unique Infotech
          </span>
          <span className="hidden md:block text-xs text-gray-400">HR Panel</span>
        </div>
        <nav className="flex-1 flex flex-col gap-2">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`flex items-center gap-3 md:gap-4 w-full px-3 py-3 rounded-lg text-base font-medium transition ${
                activeTab === item.key
                  ? "bg-indigo-100 text-indigo-700 shadow"
                  : "text-gray-600 hover:bg-indigo-50"
              }`}
              title={item.label}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="hidden md:inline">{item.label}</span>
            </button>
          ))}
        </nav>
        <button
          onClick={handleLogout}
          className="mt-10 flex items-center gap-3 bg-red-600 hover:bg-red-700 text-white px-4 py-3 w-full rounded-lg font-semibold text-base shadow"
        >
          <FaSignOutAlt /> <span className="hidden md:inline">Logout</span>
        </button>
      </aside>
      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="h-20 bg-white shadow flex items-center justify-between px-8">
          <h2 className="text-3xl font-extrabold text-indigo-800">
            {navItems.find((n) => n.key === activeTab)?.label}
          </h2>
          <div className="flex items-center gap-3">
            <FaUserTie className="text-2xl text-indigo-600" />
            <span className="font-semibold text-gray-700 hidden md:inline text-lg">HR Manager</span>
          </div>
        </header>
        {/* Main Area */}
        <section className="flex-1 p-6 md:p-10">{renderContent()}</section>
      </main>
    </div>
  );
};

export default HrDashboard;
