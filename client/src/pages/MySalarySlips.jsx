import { useEffect, useState } from "react";
import { FaMoneyCheckAlt, FaCalendarAlt, FaClock, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";

const MySalarySlips = () => {
    const [slips, setSlips] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");

    const fetchSalarySlips = async () => {
        setLoading(true);
        try {
            // Dynamically get base URL
            const baseURL = process.env.REACT_APP_API_URL || "http://localhost:5000";
            const res = await axios.get(`${baseURL}/api/salary-slips/my`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSlips(res.data);
        } catch {
            toast.error("Failed to load salary slips");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSalarySlips();
        // eslint-disable-next-line
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6">
            <div className="max-w-5xl mx-auto bg-white/10 border border-blue-900 p-8 rounded-2xl shadow-xl">
                <h1 className="text-3xl font-bold text-cyan-300 mb-6 flex items-center gap-3">
                    <FaMoneyCheckAlt className="text-cyan-400" /> My Salary Slips
                </h1>

                {loading ? (
                    <p className="text-gray-300">Loading...</p>
                ) : slips.length === 0 ? (
                    <p className="text-gray-300">No slips available yet.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm border border-gray-600 rounded-lg overflow-hidden">
                            <thead className="bg-blue-900 text-left text-cyan-100">
                                <tr>
                                    <th className="px-4 py-3">Month</th>
                                    <th className="px-4 py-3">LPA</th>
                                    <th className="px-4 py-3">Working Hours</th>
                                    <th className="px-4 py-3">Calculated Salary</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Reason</th>
                                </tr>
                            </thead>
                            <tbody>
                                {slips.map((slip) => (
                                    <tr
                                        key={slip._id}
                                        className="border-t border-gray-700 hover:bg-slate-800 transition"
                                    >
                                        <td className="px-4 py-2 flex items-center gap-2">
                                            <FaCalendarAlt className="text-cyan-400" />
                                            {slip.month}
                                        </td>
                                        <td className="px-4 py-2">₹ {(slip.LPA / 100000).toFixed(2)} LPA</td>
                                        <td className="px-4 py-2">{slip.totalWorkingHours} hrs</td>
                                        <td className="px-4 py-2 text-green-300 font-semibold">₹ {slip.calculatedSalary}</td>
                                        <td className="px-4 py-2">
                                            {slip.status === "approved" ? (
                                                <span className="flex items-center gap-1 text-green-400">
                                                    <FaCheckCircle /> Approved
                                                </span>
                                            ) : slip.status === "rejected" ? (
                                                <span className="flex items-center gap-1 text-red-400">
                                                    <FaTimesCircle /> Rejected
                                                </span>
                                            ) : (
                                                <span className="text-yellow-300">Pending</span>
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
            </div>
        </div>
    );
};

export default MySalarySlips;
