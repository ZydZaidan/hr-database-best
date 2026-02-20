import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, Wallet, Settings, LogOut, CalendarCheck, FileText, Activity, CheckCircle } from 'lucide-react';

export default function SidebarUI({ role }) {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  // Fungsi Logout
  const handleLogout = () => {
    localStorage.removeItem('userRole'); // Hapus sesi login
    navigate('/login'); // Balik ke halaman login
  };

  return (
    <div className="w-64 bg-white border-r h-screen flex flex-col justify-between fixed top-0 left-0">
      <div>
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-primary">PT. BEST</h1>
          <p className="text-xs text-gray-500 mt-1">HRIS System</p>
        </div>

        <nav className="p-4 space-y-2">
          {/* =========================================
              MENU KHUSUS ADMIN
              ========================================= */}
          {role === 'admin' && (
            <>
              <Link to="/" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive('/') ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                <Home size={20} /> Dashboard Direksi
              </Link>
              <Link to="/karyawan" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive('/karyawan') || isActive('/tambah-karyawan') ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                <Users size={20} /> Kelola Data Karyawan
              </Link>
              <Link to="/rekap-data" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive('/rekap-data') ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                <FileText size={20} /> Rekap & Analisis
              </Link>
              <Link to="/approval" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive('/approval') ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                <CheckCircle size={20} /> Approval Data
              </Link>
            </>
          )}

          {/* =========================================
              MENU KHUSUS KARYAWAN
              ========================================= */}
          {role === 'karyawan' && (
            <>
              <Link to="/" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive('/') ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                <Home size={20} /> Beranda Saya
              </Link>
              <Link to="/absen" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive('/absen') ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                <CalendarCheck size={20} /> Riwayat Absen
              </Link>
              <Link to="/kinerja" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive('/kinerja') ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                <Activity size={20} /> Eviden Kinerja
              </Link>
              <Link to="/slip-gaji" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive('/slip-gaji') ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                <Wallet size={20} /> Slip Gaji
              </Link>
              <Link to="/pengajuan" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive('/pengajuan') ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                <FileText size={20} /> Pengajuan Surat
              </Link>
            </>
          )}

          {/* Menu Pengaturan (Bisa diakses keduanya) */}
          <Link to="/pengaturan" className={`flex items-center gap-3 p-3 rounded-lg transition-colors mt-4 border-t ${isActive('/pengaturan') ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
            <Settings size={20} /> Pengaturan Akun
          </Link>
        </nav>
      </div>

      {/* Tombol Logout */}
      <div className="p-4 border-t">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 p-3 w-full rounded-lg text-danger hover:bg-red-50 transition-colors font-medium"
        >
          <LogOut size={20} /> Logout
        </button>
      </div>
    </div>
  );
}