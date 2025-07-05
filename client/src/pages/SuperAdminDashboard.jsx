import { useState, useEffect } from "react";
import {
  FaTachometerAlt, FaUserPlus, FaUsers, FaSignOutAlt, FaUserShield,
  FaEdit, FaTrash, FaFileCsv, FaUserCheck, FaUserSlash, FaFileAlt,
  FaEye, FaDownload, FaMoneyCheckAlt
} from "react-icons/fa";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CreateSalarySlip from "../pages/Salaryslip"; // adjust path if needed


// --- UI Helper Classes ---
const tabClasses = (active) =>
  `flex items-center gap-2 px-5 py-2 rounded-md text-base font-semibold transition ${
    active
      ? "bg-gradient-to-r from-blue-600 to-blue-400 text-white shadow"
      : "bg-white text-blue-700 hover:bg-blue-50"
  }`;

const cardClasses =
  "bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center border border-blue-100 hover:shadow-2xl transition";

const btnPrimary =
  "bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-6 py-2 rounded-lg font-semibold transition";
const btnSecondary =
  "bg-gray-100 hover:bg-gray-200 text-blue-700 px-4 py-2 rounded-lg font-medium transition";
const btnDanger =
  "bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition";

// --- Input Field Helper ---
function InputField({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-gray-700 mb-1 font-medium">{label}</label>
      <input
        type="text"
        required
        className="w-full px-4 py-2 border rounded-lg"
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

// --- Main Component ---
const SuperAdminDashboard = () => {
  // --- State Hooks ---
  const [activeTab, setActiveTab] = useState("dashboard");
  const [form, setForm] = useState({ name: "", email: "", role: "" });
  const [generated, setGenerated] = useState({ userId: "", password: "" });
  const [staffList, setStaffList] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const itemsPerPage = 6;
  const [currentPage, setCurrentPage] = useState(1);

  // Jobs & Applicants
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [applicants, setApplicants] = useState([]);
  const [applicantsPage, setApplicantsPage] = useState(1);
  const applicantsPerPage = 6;

  // --- Fetch Data ---
  const fetchStaff = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/auth/staff", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setStaffList(res.data.staff);
    } catch {
      toast.error("Failed to fetch staff list");
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/jobs/all", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setJobs(res.data || []);
      if (res.data.length > 0) setSelectedJobId(res.data[0]._id);
    } catch {
      toast.error("Failed to load jobs");
    }
  };

  useEffect(() => { fetchStaff(); }, []);
  useEffect(() => { if (activeTab === "applicants") fetchJobs(); }, [activeTab]);
  useEffect(() => { if (activeTab === "applicants" && selectedJobId) fetchApplicants(selectedJobId); }, [selectedJobId]);
  useEffect(() => { if (activeTab === "applicants" && selectedJobId) fetchApplicants(selectedJobId); }, [jobs]);

  const fetchApplicants = async (jobId) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/jobs/superadmin/applicants/${jobId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setApplicants(res.data.applicants || []);
    } catch {
      toast.error("Failed to fetch applicants");
    }
  };

  // --- Staff CRUD ---
  const generateCredentials = () => {
    const id = `${form.role}_${form.name.toLowerCase().replace(/\s+/g, "")}@uniqueinfotech.com`;
    const pw = Math.random().toString(36).slice(-8);
    setGenerated({ userId: id, password: pw });
    toast.info("Credentials generated");
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await axios.put(
          `http://localhost:5000/api/auth/staff/${editId}`,
          { name: form.name, role: form.role },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        toast.success("Staff updated successfully!");
      } else {
        await axios.post(
          "http://localhost:5000/api/auth/create-staff",
          { name: form.name, email: generated.userId, password: generated.password, role: form.role },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        toast.success("Staff created successfully!");
      }
      resetForm();
      fetchStaff();
      setActiveTab("view");
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    }
  };

  const resetForm = () => {
    setForm({ name: "", email: "", role: "" });
    setGenerated({ userId: "", password: "" });
    setEditMode(false);
    setEditId(null);
  };

  const handleEdit = (staff) => {
    setEditMode(true);
    setEditId(staff._id);
    setForm({ name: staff.name, email: staff.email, role: staff.role });
    setActiveTab("add");
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      try {
        await axios.delete(`http://localhost:5000/api/auth/staff/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        toast.success("Staff deleted");
        fetchStaff();
      } catch {
        toast.error("Failed to delete staff");
      }
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await axios.put(
        `http://localhost:5000/api/auth/staff/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      toast.success(`User ${status}`);
      fetchStaff();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const exportToCSV = () => {
    const csvRows = ["Name,Email,Role"];
    staffList.forEach((s) => {
      csvRows.push(`${s.name},${s.email},${s.role}`);
    });
    const csvData = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(csvData);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", "staff_list.csv");
    a.click();
  };

  // --- Pagination ---
  const paginatedList = staffList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const renderPagination = () => {
    const totalPages = Math.ceil(staffList.length / itemsPerPage);
    if (totalPages <= 1) return null;
    return (
      <div className="flex gap-2 justify-center mt-4">
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-4 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
              currentPage === i + 1
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-blue-100"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    );
  };

  // --- Main Layout ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-white flex flex-col">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar theme="colored" />
      {/* Header */}
      <header className="bg-white shadow flex items-center justify-between px-10 py-6">
        <div className="flex items-center gap-3 text-blue-700 text-3xl font-extrabold tracking-tight">
          <FaUserShield className="text-4xl" /> CRM Super Admin
        </div>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/superadmin-login";
          }}
          className={btnDanger + " flex items-center gap-2"}
        >
          <FaSignOutAlt /> Logout
        </button>
      </header>
      {/* Navigation Tabs */}
      <nav className="flex gap-3 border-b border-blue-200 bg-blue-50 px-10 pt-6 pb-2">
        <button className={tabClasses(activeTab === "dashboard")} onClick={() => setActiveTab("dashboard")}>
          <FaTachometerAlt /> Dashboard
        </button>
        <button className={tabClasses(activeTab === "view")} onClick={() => setActiveTab("view")}>
          <FaUsers /> Staff List
        </button>
        <button className={tabClasses(activeTab === "add")} onClick={() => { resetForm(); setActiveTab("add"); }}>
          <FaUserPlus /> Add Staff
        </button>
        <button className={tabClasses(activeTab === "applicants")} onClick={() => setActiveTab("applicants")}>
          <FaFileAlt /> Job Applicants
        </button>
        <button
    className={tabClasses(activeTab === "salary")}
    onClick={() => setActiveTab("salary")}
  >
    <FaMoneyCheckAlt /> Salary Slip
  </button>
      </nav>
      {/* Main Content */}
      <main className="flex-1 px-4 md:px-10 py-8">
          {activeTab === "salary" && <CreateSalarySlip />}

        {activeTab === "dashboard" && (
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className={cardClasses + " hover:scale-105"}>
              <FaUsers className="text-5xl text-blue-500 mb-3" />
              <div className="text-3xl font-bold">{staffList.length}</div>
              <div className="text-gray-500 mt-1">Total Staff</div>
            </div>
            <div className={cardClasses + " hover:scale-105"}>
              <FaUserCheck className="text-5xl text-green-500 mb-3" />
              <div className="text-3xl font-bold">
                {staffList.filter((s) => s.status === "active").length}
              </div>
              <div className="text-gray-500 mt-1">Active</div>
            </div>
            <div className={cardClasses + " hover:scale-105"}>
              <FaUserSlash className="text-5xl text-yellow-500 mb-3" />
              <div className="text-3xl font-bold">
                {staffList.filter((s) => s.status === "suspended").length}
              </div>
              <div className="text-gray-500 mt-1">Suspended</div>
            </div>
          </div>
        )}
        {activeTab === "view" && (
          <div className="max-w-6xl mx-auto mt-10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-blue-700 flex items-center gap-2">
                <FaUsers /> Staff List
              </h2>
              <div className="flex gap-2">
                <button onClick={exportToCSV} className={btnSecondary}>
                  <FaFileCsv className="mr-2" /> Export CSV
                </button>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg overflow-x-auto border border-blue-100">
              <table className="w-full text-base">
                <thead className="bg-blue-50 text-blue-700">
                  <tr>
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Email</th>
                    <th className="p-3 text-left">Role</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedList.map((staff) => (
                    <tr key={staff._id} className="border-b hover:bg-blue-50">
                      <td className="p-3">{staff.name}</td>
                      <td className="p-3">{staff.email}</td>
                      <td className="p-3 capitalize">{staff.role}</td>
                      <td className="p-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            staff.status === "active"
                              ? "bg-green-100 text-green-700"
                              : staff.status === "suspended"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {staff.status}
                        </span>
                      </td>
                      <td className="p-3 text-center flex gap-2 justify-center">
                        <button title="Edit" className="text-blue-600 hover:text-blue-800" onClick={() => handleEdit(staff)}>
                          <FaEdit />
                        </button>
                        <button title="Delete" className="text-red-600 hover:text-red-800" onClick={() => handleDelete(staff._id)}>
                          <FaTrash />
                        </button>
                        <button title="Activate" className="text-green-600 hover:text-green-800" onClick={() => handleStatusUpdate(staff._id, "active")}>
                          <FaUserCheck />
                        </button>
                        <button title="Suspend" className="text-yellow-600 hover:text-yellow-800" onClick={() => handleStatusUpdate(staff._id, "suspended")}>
                          <FaUserSlash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {renderPagination()}
            </div>
          </div>
        )}
        {activeTab === "add" && (
          <div className="max-w-lg mx-auto mt-10 bg-white rounded-2xl shadow-xl p-10 border border-blue-100">
            <h2 className="text-2xl font-bold text-blue-700 mb-6 flex items-center gap-2">
              <FaUserPlus /> {editMode ? "Edit Staff" : "Add Staff"}
            </h2>
            <form onSubmit={handleCreateStaff} className="space-y-5">
              <InputField
                label="Name"
                name="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <div>
                <label className="block text-gray-700 mb-1 font-medium">Role</label>
                <select
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300 outline-none"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="">Select Role</option>
                  <option value="hr">HR</option>
                  <option value="developer">Developer</option>
                </select>
              </div>
              {!editMode && (
                <>
                  <button
                    type="button"
                    onClick={generateCredentials}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg font-semibold"
                  >
                    Generate ID & Password
                  </button>
                  {generated.userId && (
                    <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg mt-2">
                      <div>
                        <span className="font-semibold">Email:</span> {generated.userId}
                      </div>
                      <div>
                        <span className="font-semibold">Password:</span> {generated.password}
                      </div>
                    </div>
                  )}
                </>
              )}
              <div className="flex gap-3 mt-4">
                <button type="submit" className={btnPrimary + " flex-1"}>
                  {editMode ? "Update Staff" : "Add Staff"}
                </button>
                <button
                  type="button"
                  className={btnSecondary + " flex-1"}
                  onClick={() => {
                    resetForm();
                    setActiveTab("view");
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
        {activeTab === "applicants" && (
          <div className="max-w-6xl mx-auto mt-10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-blue-700 flex items-center gap-2">
                <FaFileAlt /> Job Applicants
              </h2>
              <div>
                <select
                  className="border rounded-lg px-3 py-2"
                  value={selectedJobId}
                  onChange={(e) => {
                    setSelectedJobId(e.target.value);
                    setApplicantsPage(1);
                  }}
                >
                  {jobs.map((job) => (
                    <option key={job._id} value={job._id}>
                      {job.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg overflow-x-auto border border-blue-100">
              <table className="w-full text-base">
                <thead className="bg-blue-50 text-blue-700">
                  <tr>
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Email</th>
                    <th className="p-3 text-left">Phone</th>
                    <th className="p-3 text-left">Position</th>
                    <th className="p-3 text-left">CV</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applicants
                    .slice((applicantsPage - 1) * applicantsPerPage, applicantsPage * applicantsPerPage)
                    .map((a) => (
                      <tr key={a._id} className="border-b hover:bg-blue-50">
                        <td className="p-3">{a.name}</td>
                        <td className="p-3">{a.email}</td>
                        <td className="p-3">{a.phone ? a.phone : <span className="text-gray-400">N/A</span>}</td>
                        <td className="p-3 capitalize">{a.position}</td>
                        <td className="p-3">
                          {a.resume && a.resume !== "undefined" ? (
                            <span
                              className="text-blue-600 underline cursor-pointer"
                              onClick={() => window.open(`http://localhost:5000/uploads/${a.resume}`, "_blank")}
                            >
                              View CV
                            </span>
                          ) : (
                            <span className="text-gray-400">No CV</span>
                          )}
                        </td>
                        <td className="p-3 text-center flex gap-2 justify-center">
                          {a.resume && a.resume !== "undefined" && (
                            <>
                              <button
                                title="View CV"
                                className="text-blue-600 hover:text-blue-800"
                                onClick={() => window.open(`http://localhost:5000/uploads/${a.resume}`, "_blank")}
                              >
                                <FaEye />
                              </button>
                              <button
                                title="Download CV"
                                className="text-green-600 hover:text-green-800"
                                onClick={() => {
                                  const link = document.createElement("a");
                                  link.href = `http://localhost:5000/${a.resume}`;
                                  link.download = "";
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                }}
                              >
                                <FaDownload />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {/* Pagination */}
              {(() => {
                const totalPages = Math.ceil(applicants.length / applicantsPerPage);
                if (totalPages <= 1) return null;
                return (
                  <div className="flex gap-2 justify-center mt-4">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setApplicantsPage(i + 1)}
                        className={`px-4 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                          applicantsPage === i + 1
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-blue-100"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SuperAdminDashboard;
