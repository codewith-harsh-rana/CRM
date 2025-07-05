import { useEffect, useState } from "react";
import {
  FaBriefcase, FaCalendarAlt, FaFileAlt, FaUserCircle, FaSignOutAlt,
  FaTachometerAlt, FaMapMarkerAlt, FaSearch, FaClock, FaBars,
  FaPaperPlane, FaClipboardList
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: <FaTachometerAlt /> },
  { key: "jobs", label: "Jobs", icon: <FaBriefcase /> },
  { key: "attendance", label: "Attendance", icon: <FaCalendarAlt /> },
  { key: "reports", label: "Reports", icon: <FaFileAlt /> },
];

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [active, setActive] = useState("dashboard");
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [filters, setFilters] = useState({ keyword: "", location: "", type: "" });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [jobTab, setJobTab] = useState("available");
  const [applications, setApplications] = useState([]);
  const [resumeFiles, setResumeFiles] = useState({});
  const [resumeErrors, setResumeErrors] = useState({});

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data.user);
    } catch {
      toast.error("Failed to fetch user");
    }
  };

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/jobs/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJobs(res.data);
      setFilteredJobs(res.data);
    } catch {
      toast.error("Failed to fetch jobs");
    }
  };

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/jobs/my-applications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setApplications(res.data);
    } catch {
      toast.error("Failed to fetch applications");
    }
  };

  const handleResumeChange = (jobId, file) => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    if (!file) {
      setResumeErrors((prev) => ({ ...prev, [jobId]: "Please select a file." }));
      return;
    }
    if (!allowedTypes.includes(file.type)) {
      setResumeErrors((prev) => ({ ...prev, [jobId]: "Invalid file type. Only PDF or Word documents allowed." }));
      toast.error("Invalid file type. Only PDF or Word documents allowed.");
      return;
    }
    setResumeFiles((prev) => ({
      ...prev,
      [jobId]: file,
    }));
    setResumeErrors((prev) => ({ ...prev, [jobId]: "" }));
  };

  const handleApplyJob = async (jobId) => {
    if (!resumeFiles[jobId]) {
      setResumeErrors((prev) => ({ ...prev, [jobId]: "Resume is required to apply." }));
      toast.error("Please upload your resume before applying.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("resume", resumeFiles[jobId]);
      const res = await axios.post(
        `http://localhost:5000/api/jobs/apply/${jobId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success(res.data.message);
      fetchApplications();
      setResumeFiles((prev) => ({ ...prev, [jobId]: null }));
      setResumeErrors((prev) => ({ ...prev, [jobId]: "" }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to apply");
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("token");
      toast.success("Logged out");
      setTimeout(() => (window.location.href = "/login"), 1500);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const updatedFilters = { ...filters, [name]: value.toLowerCase() };
    setFilters(updatedFilters);

    const filtered = jobs.filter((job) =>
      job.title.toLowerCase().includes(updatedFilters.keyword) &&
      job.location.toLowerCase().includes(updatedFilters.location) &&
      job.type.toLowerCase().includes(updatedFilters.type)
    );
    setFilteredJobs(filtered);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (active === "jobs") {
      fetchJobs();
      fetchApplications();
    }
  }, [active]);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 to-blue-100">
      <ToastContainer theme="colored" />
      {/* Sidebar */}
      <aside className={`fixed z-40 inset-y-0 left-0 w-20 bg-white shadow-xl transform ${sidebarOpen ? "translate-x-0" : "-translate-x-20"} transition-transform duration-200 md:translate-x-0 md:static md:block`}>
        <div className="flex flex-col h-full items-center py-6">
          <div className="mb-8">
            <FaUserCircle className="text-blue-600 text-4xl" />
          </div>
          <nav className="flex-1 flex flex-col gap-6 items-center">
            {NAV_ITEMS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActive(tab.key);
                  setSidebarOpen(false);
                }}
                className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-150
                  ${active === tab.key
                    ? "bg-blue-100 text-blue-700 shadow"
                    : "text-gray-400 hover:bg-blue-50 hover:text-blue-600"
                  }`}
                title={tab.label}
              >
                {tab.icon}
                <span className="text-xs mt-1">{tab.label[0]}</span>
              </button>
            ))}
          </nav>
          <div className="mt-auto">
            <button
              onClick={handleLogout}
              className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition"
              title="Logout"
            >
              <FaSignOutAlt className="text-lg" />
              <span className="text-xs mt-1">Out</span>
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-30 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-4 bg-white shadow sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-blue-700 text-2xl" onClick={() => setSidebarOpen((v) => !v)}>
              <FaBars />
            </button>
            <span className="text-xl font-bold text-blue-700">Unique Infotech</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-base text-gray-600 font-medium">Hi, {user?.name || "User"}</span>
            <img
              src={`https://ui-avatars.com/api/?name=${user?.name || "User"}&background=2563eb&color=fff`}
              alt="avatar"
              className="w-10 h-10 rounded-full border-2 border-blue-400 shadow"
            />
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 p-6 md:p-10">
          <div className="max-w-6xl mx-auto">
            {active === "dashboard" && <DashboardOverview />}
            {active === "jobs" && (
              <>
                <div className="flex gap-4 mb-6">
                  <button
                    onClick={() => setJobTab("available")}
                    className={`px-5 py-2 rounded-full font-semibold text-base shadow ${jobTab === "available" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
                  >
                    <FaBriefcase className="inline mr-2" /> Jobs
                  </button>
                  <button
                    onClick={() => setJobTab("applied")}
                    className={`px-5 py-2 rounded-full font-semibold text-base shadow ${jobTab === "applied" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
                  >
                    <FaClipboardList className="inline mr-2" /> Applications
                  </button>
                </div>
                {jobTab === "available" ? (
                  <JobSection
                    jobs={filteredJobs}
                    filters={filters}
                    handleFilterChange={handleFilterChange}
                    onApply={handleApplyJob}
                    appliedIds={applications.map(app => app._id)}
                    resumeFiles={resumeFiles}
                    handleResumeChange={handleResumeChange}
                    resumeErrors={resumeErrors}
                  />
                ) : (
                  <ApplicationsTable applications={applications} />
                )}
              </>
            )}
            {active === "attendance" && (
              <ContentBlock title="My Attendance" color="yellow" message="Attendance records will be shown here." />
            )}
            {active === "reports" && (
              <ContentBlock title="Reports" color="blue" message="All reports and documents will be shown here." />
            )}
          </div>
        </main>

        <footer className="text-center text-gray-400 text-xs py-4">
          &copy; {new Date().getFullYear()} Unique Infotech CRM. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

// Dashboard Overview
const DashboardOverview = () => (
  <div className="space-y-10">
    <h2 className="text-2xl font-extrabold text-blue-700 mb-2">Welcome Back!</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card icon={<FaBriefcase className="text-blue-500 text-3xl" />} label="My Jobs" value="5 Applied" />
      <Card icon={<FaCalendarAlt className="text-yellow-500 text-3xl" />} label="Attendance" value="95% Present" />
      <Card icon={<FaFileAlt className="text-purple-500 text-3xl" />} label="Reports" value="3 Pending" />
    </div>
  </div>
);

const ContentBlock = ({ title, color, message }) => (
  <section className={`bg-white p-8 rounded-2xl shadow-lg`}>
    <h2 className={`text-xl font-bold text-${color}-600 mb-2`}>{title}</h2>
    <p className="text-gray-600 text-base">{message}</p>
  </section>
);

const Card = ({ icon, label, value }) => (
  <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition flex flex-col items-center">
    {icon}
    <p className="text-gray-500 text-sm mt-2">{label}</p>
    <h3 className="text-xl font-bold text-gray-700 mt-1">{value}</h3>
  </div>
);

const JobSection = ({
  jobs,
  handleFilterChange,
  onApply,
  appliedIds = [],
  resumeFiles,
  handleResumeChange,
  resumeErrors = {}
}) => (
  <section>
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <InputWithIcon icon={<FaSearch />} name="keyword" placeholder="Keyword..." onChange={handleFilterChange} />
      <InputWithIcon icon={<FaMapMarkerAlt />} name="location" placeholder="Location..." onChange={handleFilterChange} />
      <SelectWithIcon
        icon={<FaClock />}
        name="type"
        onChange={handleFilterChange}
        options={["", "full-time", "part-time", "internship", "remote", "contract"]}
      />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {jobs.map((job) => (
        <div key={job._id} className="bg-white border rounded-2xl shadow-lg p-6 space-y-4 hover:shadow-2xl transition">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-gray-800">{job.title}</h3>
              <p className="text-sm text-gray-500">{job.companyName}</p>
            </div>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${job.status === "active" ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-600"}`}>
              {job.status}
            </span>
          </div>
          <p className="text-sm text-gray-700 line-clamp-3">{job.description}</p>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <FaMapMarkerAlt className="text-blue-500" /> {job.location}
            </div>
            <div className="flex items-center gap-1">
              <FaBriefcase className="text-blue-400" /> {job.type}
            </div>
            <div className="flex items-center gap-1">
              <FaCalendarAlt className="text-yellow-500" /> Exp: {job.experience}
            </div>
            <div className="flex items-center gap-1">
              <FaFileAlt className="text-purple-500" /> ₹{Number(job.salary).toLocaleString()}
            </div>
            <div className="flex items-center gap-1 col-span-2">
              <FaClock className="text-red-400" /> Deadline: {new Date(job.deadline).toLocaleDateString()}
            </div>
          </div>
          <div>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => handleResumeChange(job._id, e.target.files[0])}
              className="text-sm text-gray-600 file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
            />
            {resumeErrors[job._id] && (
              <div className="text-red-500 text-xs mt-1">{resumeErrors[job._id]}</div>
            )}
          </div>
          <button
            onClick={() => onApply(job._id)}
            className={`flex items-center justify-center gap-2 px-5 py-2 rounded-lg font-semibold text-base transition
              ${appliedIds.includes(job._id)
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : resumeFiles[job._id]
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-blue-200 text-blue-800"
              }`}
            disabled={appliedIds.includes(job._id) || !resumeFiles[job._id]}
          >
            <FaPaperPlane />
            {appliedIds.includes(job._id) ? "Applied" : "Apply"}
          </button>
        </div>
      ))}
    </div>
    {jobs.length === 0 && <p className="text-gray-500 text-center mt-8 text-base">No jobs found.</p>}
  </section>
);

const ApplicationsTable = ({ applications }) => (
  <section>
    <div className="overflow-x-auto bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-blue-700 mb-4">My Applications</h3>
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Job Title</th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Company</th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Location</th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Applied On</th>
          </tr>
        </thead>
        <tbody>
          {applications.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center text-gray-500 py-6 text-base">No applications found.</td>
            </tr>
          ) : (
            applications.map((app) => (
              <tr key={app._id} className="hover:bg-gray-50">
                <td className="px-4 py-2">{app.title}</td>
                <td className="px-4 py-2">{app.companyName}</td>
                <td className="px-4 py-2">{app.location}</td>
                <td className="px-4 py-2">{app.type}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${app.status === "active" ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-600"}`}>
                    {app.status}
                  </span>
                </td>
                <td className="px-4 py-2">{app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : "-"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </section>
);

const InputWithIcon = ({ icon, name, placeholder, onChange }) => (
  <div className="flex items-center border rounded-lg px-3 py-2 bg-white shadow-sm">
    {icon}
    <input type="text" name={name} placeholder={placeholder} onChange={onChange} className="w-full ml-2 outline-none text-sm bg-transparent" />
  </div>
);

const SelectWithIcon = ({ icon, name, onChange, options }) => (
  <div className="flex items-center border rounded-lg px-3 py-2 bg-white shadow-sm">
    {icon}
    <select name={name} onChange={onChange} className="w-full ml-2 outline-none text-sm bg-transparent">
      {options.map((opt, i) => (
        <option key={i} value={opt}>
          {opt ? opt.charAt(0).toUpperCase() + opt.slice(1) : "Job Type"}
        </option>
      ))}
    </select>
  </div>
);

export default UserDashboard;
