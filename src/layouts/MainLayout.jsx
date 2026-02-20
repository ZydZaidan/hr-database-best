import { Outlet } from 'react-router-dom';
// PASTIKAN NAMA IMPORT SIDEBAR-NYA SESUAI SAMA YANG UDAH LO BENERIN KEMARIN (SidebarUI atau Sidebar)
import Sidebar from '../components/SidebarUI'; 

export default function MainLayout() {
  // Cukup ambil role buat dikasih tau ke Sidebar & Header, gak perlu fungsi navigate lagi
  const userRole = localStorage.getItem('userRole'); 

  return (
    <div className="flex min-h-screen bg-gray-50 animate-fade-in">
      {/* Lempar role-nya ke Sidebar biar menunya menyesuaikan */}
      <Sidebar role={userRole} />
      
      <div className="flex-1 ml-64 p-8">
        <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border">
          <h2 className="text-xl font-bold text-gray-800">
            {userRole === 'admin' ? 'Portal HR Admin' : 'Portal Karyawan'}
          </h2>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-bold text-gray-700">Muh. Cholish</p>
              <p className="text-xs text-gray-500 uppercase">{userRole}</p>
            </div>
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold shadow-md">
              MC
            </div>
          </div>
        </div>

        <Outlet />
      </div>
    </div>
  );
}