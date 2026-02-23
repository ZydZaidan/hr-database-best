import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import EmployeeList from './pages/EmployeeList';
import AddEmployee from './pages/AddEmployee';
import Login from './pages/Login';
import Attendance from './pages/Attendance';
import Performance from './pages/Performance';
import Payslip from './pages/Payslip';
import DocumentRequest from './pages/DocumentRequest';
import Settings from './pages/Settings';
import AdminApproval from './pages/AdminApproval';
import EmployeeEditProfile from './pages/EmployeeEditProfile';
// --- BIKIN KOMPONEN SATPAM (PROTECTED ROUTE) ---
// Fungsi ini bakal ngecek: "Ada role login nggak di browser?"
const RequireAuth = ({ children }) => {
  const userRole = localStorage.getItem('userRole');
  
  if (!userRole) {
    // Kalau belum login, langsung tendang ke halaman /login
    return <Navigate to="/login" replace />;
  }
  
  // Kalau udah login, silakan masuk ke halaman yang dituju
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Route Login dibiarin bebas akses */}
        <Route path="/login" element={<Login />} />

        {/* Semua halaman di dalam blok ini DIBUNGKUS sama RequireAuth.
          Jadi kalau buka link "/" tapi belum login, otomatis ke "/login".
        */}
        <Route path="/" element={<RequireAuth><MainLayout /></RequireAuth>}>
          <Route index element={<Dashboard />} />
          
          {/* Routes Admin */}
          <Route path="karyawan" element={<EmployeeList />} />
          <Route path="tambah-karyawan" element={<AddEmployee />} />
          <Route path="rekap-data" element={<div className="p-6 bg-white rounded-xl">Halaman Rekap Data</div>} />
          <Route path="approval" element={<AdminApproval />} />
          
          {/* Routes Karyawan */}
          <Route path="absen" element={<Attendance />} />
          <Route path="kinerja" element={<Performance />} />
          <Route path="slip-gaji" element={<Payslip />} />
          <Route path="pengajuan" element={<DocumentRequest />} />
          <Route path="edit-profil" element={<EmployeeEditProfile />} />
          
          {/* Umum */}
          <Route path="pengaturan" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;