import { useEffect, useState } from "react";
import axios from "axios";
import {
    FaUserTie,
    FaCalendarAlt,
    FaClock,
    FaRupeeSign,
    FaCheckCircle,
    FaChevronDown,
    FaChevronUp,
    FaHourglassHalf,
    FaThumbsUp,
    FaThumbsDown,
    FaEllipsisV,
} from "react-icons/fa";
import { toast } from "react-toastify";

// Helper for formatting currency
const formatCurrency = (num) =>
    num ? "₹" + Number(num).toLocaleString("en-IN") : "-";

// Helper for formatting month
const formatMonth = (monthStr) => {
    if (!monthStr) return "-";
    const [year, month] = monthStr.split("-");
    const date = new Date(`${year}-${month}-01`);
    return date.toLocaleString("default", { month: "long", year: "numeric" });
};

const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
};

const statusIcons = {
    pending: <FaHourglassHalf className="inline mr-1" />,
    approved: <FaThumbsUp className="inline mr-1" />,
    rejected: <FaThumbsDown className="inline mr-1" />,
};

const CreateSalarySlip = () => {
    const [staffList, setStaffList] = useState([]);
    const [form, setForm] = useState({
        staffId: "",
        month: "",
        LPA: "",
        totalWorkingHours: "",
    });
    const [loadingHours, setLoadingHours] = useState(false);

    // Collapsible state and salary slips
    const [showSlips, setShowSlips] = useState(false);
    const [salarySlips, setSalarySlips] = useState([]);
    const [loadingSlips, setLoadingSlips] = useState(false);
    const [actionLoading, setActionLoading] = useState({}); // {slipId: true/false}

    const fetchStaff = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/auth/staff", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            setStaffList(res.data.staff);
        } catch {
            toast.error("Failed to load staff");
        }
    };

    // Fetch working hours when staffId and month are selected
    useEffect(() => {
        const fetchWorkingHours = async () => {
            if (form.staffId && form.month) {
                setLoadingHours(true);
                try {
                    let monthStr = form.month;
                    if (!/^\d{4}-\d{2}$/.test(monthStr)) {
                        const [monthName, year] = monthStr.split(" ");
                        const monthNum = new Date(`${monthName} 1, ${year}`).getMonth() + 1;
                        monthStr = `${year}-${monthNum.toString().padStart(2, "0")}`;
                    }
                    const res = await axios.get(
                        `http://localhost:5000/api/attendance/working-hours`,
                        {
                            params: { staffId: form.staffId, month: monthStr },
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem("token")}`,
                            },
                        }
                    );
                    setForm((prev) => ({
                        ...prev,
                        totalWorkingHours: res.data.totalHours || 0,
                    }));
                } catch {
                    setForm((prev) => ({ ...prev, totalWorkingHours: "" }));
                    toast.error("Failed to fetch working hours");
                } finally {
                    setLoadingHours(false);
                }
            } else {
                setForm((prev) => ({ ...prev, totalWorkingHours: "" }));
            }
        };
        fetchWorkingHours();
        // eslint-disable-next-line
    }, [form.staffId, form.month]);

    useEffect(() => {
        fetchStaff();
    }, []);

    // Fetch all salary slips
    const fetchSalarySlips = async () => {
        setLoadingSlips(true);
        try {
            const res = await axios.get(
                "http://localhost:5000/api/salary-slips/all",
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            setSalarySlips(res.data || []);
        } catch {
            toast.error("Failed to load salary slips");
        } finally {
            setLoadingSlips(false);
        }
    };

    // Toggle collapsible and fetch slips if opening
    const handleToggleSlips = () => {
        if (!showSlips) fetchSalarySlips();
        setShowSlips((prev) => !prev);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(
                "http://localhost:5000/api/salary-slips",
                { ...form, status: "pending" },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            toast.success("Salary Slip Generated Successfully!");
            setForm({ staffId: "", month: "", LPA: "", totalWorkingHours: "" });
            fetchSalarySlips();
        } catch (err) {
            toast.error(err.response?.data?.message || "Error creating salary slip");
        }
    };

    // Action: Approve/Reject (API: /status/:slipId)
    const handleAction = async (slipId, status) => {
        setActionLoading((prev) => ({ ...prev, [slipId]: true }));
        try {
            await axios.put(
                `http://localhost:5000/api/salary-slips/status/${slipId}`,
                { status },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            toast.success(`Slip ${status.charAt(0).toUpperCase() + status.slice(1)}`);
            fetchSalarySlips();
        } catch {
            toast.error("Failed to update status");
        } finally {
            setActionLoading((prev) => ({ ...prev, [slipId]: false }));
        }
    };

    // --- NEW UI DESIGN ---
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-12 px-2">
            <div className="max-w-4xl mx-auto rounded-3xl shadow-2xl bg-white border border-blue-200 p-0 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-700 to-blue-500 px-10 py-8 flex items-center gap-5">
                    <FaCheckCircle className="text-5xl text-white drop-shadow-lg" />
                    <div>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight">
                            Salary Slip Portal
                        </h2>
                        <p className="text-blue-100 text-lg font-medium">
                            Effortlessly generate and manage salary slips for your team.
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 md:grid-cols-2 gap-8 px-10 py-10 bg-white"
                >
                    {/* Staff */}
                    <div>
                        <label className="flex text-blue-900 font-bold mb-3 items-center gap-2 text-lg">
                            <FaUserTie className="text-blue-600" /> Staff Member
                        </label>
                        <select
                            required
                            className="w-full px-5 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50 text-blue-900 font-semibold"
                            value={form.staffId}
                            onChange={(e) => setForm({ ...form, staffId: e.target.value })}
                        >
                            <option value="">Select Staff</option>
                            {staffList.map((s) => (
                                <option key={s._id} value={s._id}>
                                    {s.name} ({s.role})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Month */}
                    <div>
                        <label className="flex text-blue-900 font-bold mb-3 items-center gap-2 text-lg">
                            <FaCalendarAlt className="text-blue-600" /> Month
                        </label>
                        <input
                            type="month"
                            required
                            value={/^\d{4}-\d{2}$/.test(form.month) ? form.month : ""}
                            onChange={(e) => setForm({ ...form, month: e.target.value })}
                            className="w-full px-5 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50 text-blue-900 font-semibold"
                        />
                    </div>

                    {/* LPA */}
                    <div>
                        <label className="flex text-blue-900 font-bold mb-3 items-center gap-2 text-lg">
                            <FaRupeeSign className="text-blue-600" /> Annual Salary (LPA)
                        </label>
                        <input
                            type="number"
                            placeholder="e.g. 600000"
                            required
                            value={form.LPA}
                            onChange={(e) => setForm({ ...form, LPA: e.target.value })}
                            className="w-full px-5 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50 text-blue-900 font-semibold"
                        />
                    </div>

                    {/* Working Hours (auto-calculated) */}
                    <div>
                        <label className="flex text-blue-900 font-bold mb-3 items-center gap-2 text-lg">
                            <FaClock className="text-blue-600" /> Working Hours
                        </label>
                        <input
                            type="number"
                            placeholder="Auto"
                            required
                            value={form.totalWorkingHours}
                            readOnly
                            disabled
                            className="w-full px-5 py-3 border border-blue-200 rounded-xl bg-gray-100 text-blue-900 font-semibold"
                        />
                        {loadingHours && (
                            <span className="text-blue-500 text-xs mt-2 block">
                                Calculating...
                            </span>
                        )}
                    </div>

                    {/* Submit Button - full width row */}
                    <div className="col-span-1 md:col-span-2 mt-8">
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white py-4 rounded-xl text-xl font-extrabold flex items-center justify-center gap-3 shadow-lg transition"
                            disabled={loadingHours}
                        >
                            <FaCheckCircle className="text-2xl" /> Generate Salary Slip
                        </button>
                    </div>
                </form>

                {/* Collapsible View All Salary Slips */}
                <div className="px-10 pb-10">
                    <button
                        onClick={handleToggleSlips}
                        className="flex items-center gap-2 text-blue-700 font-bold mt-2 mb-2 text-lg hover:underline focus:outline-none"
                    >
                        {showSlips ? <FaChevronUp /> : <FaChevronDown />}
                        {showSlips ? "Hide" : "View"} All Salary Slips
                    </button>
                    {showSlips && (
                        <div className="mt-4 border border-blue-100 rounded-2xl p-6 bg-gradient-to-br from-blue-50 via-white to-blue-100 shadow-inner">
                            {loadingSlips ? (
                                <div className="text-blue-500 text-lg font-bold flex items-center gap-2">
                                    <FaClock className="animate-spin" /> Loading salary slips...
                                </div>
                            ) : salarySlips.length === 0 ? (
                                <div className="text-gray-500 text-lg">No salary slips found.</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-base rounded-2xl overflow-hidden shadow">
                                        <thead>
                                            <tr className="bg-blue-100 text-blue-900">
                                                <th className="px-5 py-3 text-left font-extrabold">Staff</th>
                                                <th className="px-5 py-3 text-left font-extrabold">Month</th>
                                                <th className="px-5 py-3 text-left font-extrabold">LPA</th>
                                                <th className="px-5 py-3 text-left font-extrabold">Hours</th>
                                                <th className="px-5 py-3 text-left font-extrabold">Salary</th>
                                                <th className="px-5 py-3 text-left font-extrabold">Status</th>
                                                <th className="px-5 py-3 text-left font-extrabold">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {salarySlips.map((slip, idx) => (
                                                <tr
                                                    key={slip._id}
                                                    className={`${
                                                        idx % 2 === 0 ? "bg-white" : "bg-blue-50"
                                                    } border-b border-blue-100`}
                                                >
                                                    <td className="px-5 py-3 font-semibold">
                                                        {slip.staffName || slip.staffId?.name || "-"}
                                                    </td>
                                                    <td className="px-5 py-3">{formatMonth(slip.month)}</td>
                                                    <td className="px-5 py-3">{formatCurrency(slip.LPA)}</td>
                                                    <td className="px-5 py-3">{slip.totalWorkingHours}</td>
                                                    <td className="px-5 py-3 font-bold text-blue-700">
                                                        {formatCurrency(slip.calculatedSalary)}
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        <span
                                                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${statusColors[slip.status || "pending"]}`}
                                                        >
                                                            {statusIcons[slip.status || "pending"]}
                                                            {(slip.status || "pending").charAt(0).toUpperCase() +
                                                                (slip.status || "pending").slice(1)}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        {slip.status === "pending" ? (
                                                            <div className="flex gap-3">
                                                                <button
                                                                    className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-1"
                                                                    disabled={actionLoading[slip._id]}
                                                                    onClick={() => handleAction(slip._id, "approved")}
                                                                >
                                                                    <FaThumbsUp /> Approve
                                                                </button>
                                                                <button
                                                                    className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-1"
                                                                    disabled={actionLoading[slip._id]}
                                                                    onClick={() => handleAction(slip._id, "rejected")}
                                                                >
                                                                    <FaThumbsDown /> Reject
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span className="text-blue-300 text-lg">
                                                                <FaEllipsisV />
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateSalarySlip;
