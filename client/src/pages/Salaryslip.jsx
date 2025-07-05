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
    const [actionLoading, setActionLoading] = useState({});
    const [rejectModal, setRejectModal] = useState({ open: false, slipId: null });
    const [rejectReason, setRejectReason] = useState("");

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

    useEffect(() => {
        fetchStaff();
    }, []);

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
    const handleAction = async (slipId, status, reason = "") => {
        setActionLoading((prev) => ({ ...prev, [slipId]: true }));
        try {
            await axios.put(
                `http://localhost:5000/api/salary-slips/status/${slipId}`,
                { status, reason },
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

    // --- MODERN UI DESIGN ---
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-10 px-2">
            <div className="max-w-4xl mx-auto rounded-2xl shadow-2xl bg-white border border-gray-200 p-0 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-700 to-blue-500 px-8 py-8 flex items-center gap-6">
                    <div className="bg-white rounded-full p-4 shadow-lg">
                        <FaCheckCircle className="text-4xl text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-extrabold text-white mb-1 tracking-tight">
                            Salary Slip Portal
                        </h2>
                        <p className="text-blue-100 text-lg font-medium">
                            Generate and manage salary slips for your team with ease.
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 md:grid-cols-2 gap-8 px-8 py-10 bg-white"
                >
                    {/* Staff */}
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                            <FaUserTie className="text-blue-500" /> Staff Member
                        </label>
                        <select
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 text-gray-900 text-base"
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
                        <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                            <FaCalendarAlt className="text-blue-500" /> Month
                        </label>
                        <input
                            type="month"
                            required
                            value={/^\d{4}-\d{2}$/.test(form.month) ? form.month : ""}
                            onChange={(e) => setForm({ ...form, month: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 text-gray-900 text-base"
                        />
                    </div>

                    {/* LPA */}
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                            <FaRupeeSign className="text-blue-500" /> Annual Salary (LPA)
                        </label>
                        <input
                            type="number"
                            placeholder="e.g. 600000"
                            required
                            value={form.LPA}
                            onChange={(e) => setForm({ ...form, LPA: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 text-gray-900 text-base"
                        />
                    </div>

                    {/* Working Hours (auto-calculated) */}
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                            <FaClock className="text-blue-500" /> Working Hours
                        </label>
                        <input
                            type="number"
                            placeholder="Auto"
                            required
                            value={form.totalWorkingHours}
                            readOnly
                            disabled
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-100 text-gray-900 text-base"
                        />
                        {loadingHours && (
                            <span className="text-blue-500 text-xs mt-1 block">
                                Calculating...
                            </span>
                        )}
                    </div>

                    {/* Submit Button - full width row */}
                    <div className="col-span-1 md:col-span-2 mt-8">
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white py-4 rounded-lg text-xl font-bold flex items-center justify-center gap-3 shadow-lg transition"
                            disabled={loadingHours}
                        >
                            <FaCheckCircle className="text-2xl" /> Generate Salary Slip
                        </button>
                    </div>
                </form>

                {/* Collapsible View All Salary Slips */}
                <div className="px-8 pb-10">
                    <button
                        onClick={handleToggleSlips}
                        className="flex items-center gap-2 text-blue-700 font-semibold mt-2 mb-2 text-lg hover:underline focus:outline-none"
                    >
                        {showSlips ? <FaChevronUp /> : <FaChevronDown />}
                        {showSlips ? "Hide" : "View"} All Salary Slips
                    </button>
                    {showSlips && (
                        <div className="mt-4 border border-gray-100 rounded-2xl p-6 bg-blue-50 shadow-inner">
                            {loadingSlips ? (
                                <div className="text-blue-500 text-lg font-semibold flex items-center gap-2">
                                    <FaClock className="animate-spin" /> Loading salary slips...
                                </div>
                            ) : salarySlips.length === 0 ? (
                                <div className="text-gray-500 text-lg">No salary slips found.</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-base rounded-xl overflow-hidden shadow">
                                        <thead>
                                            <tr className="bg-blue-100 text-blue-900">
                                                <th className="px-5 py-3 text-left font-bold">Staff</th>
                                                <th className="px-5 py-3 text-left font-bold">Month</th>
                                                <th className="px-5 py-3 text-left font-bold">LPA</th>
                                                <th className="px-5 py-3 text-left font-bold">Hours</th>
                                                <th className="px-5 py-3 text-left font-bold">Salary</th>
                                                <th className="px-5 py-3 text-left font-bold">Status</th>
                                                <th className="px-5 py-3 text-left font-bold">Action</th>
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
                                                        {slip.status === "rejected" && slip.reason && (
                                                            <div className="text-xs text-red-700 mt-1">
                                                                Reason: {slip.reason}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        {slip.status === "pending" ? (
                                                            <div className="flex gap-2">
                                                                <button
                                                                    className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1 shadow"
                                                                    disabled={actionLoading[slip._id]}
                                                                    onClick={() => handleAction(slip._id, "approved")}
                                                                >
                                                                    <FaThumbsUp /> Approve
                                                                </button>
                                                                <button
                                                                    className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1 shadow"
                                                                    disabled={actionLoading[slip._id]}
                                                                    onClick={() =>
                                                                        setRejectModal({ open: true, slipId: slip._id })
                                                                    }
                                                                >
                                                                    <FaThumbsDown /> Reject
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-300 text-lg">
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

            {/* Reject Reason Modal */}
            {rejectModal.open && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-red-200">
                        <h3 className="text-xl font-bold mb-3 text-red-700 flex items-center gap-2">
                            <FaThumbsDown /> Reject Salary Slip
                        </h3>
                        <label className="block text-gray-700 mb-2 text-base">
                            Please enter reason for rejection <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-red-400 text-base"
                            rows={3}
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            required
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                className="px-5 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold"
                                onClick={() => {
                                    setRejectModal({ open: false, slipId: null });
                                    setRejectReason("");
                                }}
                                type="button"
                            >
                                Cancel
                            </button>
                            <button
                                className="px-5 py-2 rounded-lg bg-red-600 text-white font-semibold shadow"
                                disabled={!rejectReason.trim() || actionLoading[rejectModal.slipId]}
                                onClick={async () => {
                                    if (!rejectReason.trim()) return;
                                    await handleAction(rejectModal.slipId, "rejected", rejectReason.trim());
                                    setRejectModal({ open: false, slipId: null });
                                    setRejectReason("");
                                }}
                                type="button"
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateSalarySlip;
