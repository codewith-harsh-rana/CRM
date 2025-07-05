import { Routes, Route } from "react-router-dom";
import SuperAdminLogin from "./pages/SuperAdminLogin";
import UserLogin from "./pages/UserLogin";
import UserRegister from "./pages/UserRegister";
import StaffLogin from "./pages/StaffLogin";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import HrDashboard from "./pages/HrDashboard";
import DeveloperDashboard from "./pages/DeveloperDashboard";
import UserDashboard from "./pages/UserDashboard";
import MySalarySlips from "./pages/MySalarySlips";


function App() {
  return (
    <Routes>
      <Route path="/" element={<SuperAdminLogin />} />
      <Route path="/superadmin-login" element={<SuperAdminLogin />} />
      <Route path="/login" element={<UserLogin />} />
      <Route path="/register" element={<UserRegister />} />
      <Route path="/staff-login" element={<StaffLogin />} />
      <Route path="/superadmin-dashboard" element={<SuperAdminDashboard />} />
      <Route path="/hr-dashboard" element={<HrDashboard />} />
      <Route path="/developer-dashboard" element={<DeveloperDashboard />} />
      <Route path="/user-dashboard" element={<UserDashboard />} />
      <Route path="/my-salary-slips" element={<MySalarySlips />} />
      {/* Add more routes as needed */}


    </Routes>
  );
}

export default App;
