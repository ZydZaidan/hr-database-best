import { Outlet } from 'react-router-dom';
import Sidebar from '../components/SidebarUI'; 

export default function MainLayout() {
  // Ambil data dari localStorage hasil login tadi
  const userRole = localStorage.getItem('userRole') || 'Guest'; 
  
  // FIX: Ambil dari kunci 'userName' (bukan 'name') sesuai yang kita set di Login.jsx
  const userName = localStorage.getItem('userName') || 'User HRIS';
  
  // Ambil inisial nama buat avatar (contoh: Muh. Cholish -> MC)
  const userInitial = userName
    .split(' ')
    .filter(word => word.length > 0) // Filter spasi kosong
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  // Logika buat nentuin judul Header
  const isAdmin = userRole.toLowerCase() === 'admin';
  const headerTitle = isAdmin ? 'Portal HR Admin' : `Portal ${userRole.toUpperCase()}`;

  return (
    <div className="flex min-h-screen bg-gray-50 animate-fade-in">
      <Sidebar role={userRole} />
      
      <div className="flex-1 ml-64 p-8">
        {/* TOPBAR / HEADER */}
        <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">
            {headerTitle}
          </h2>
          
          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-gray-700">{userName}</p>
              <p className="text-[10px] text-gray-500 font-mono tracking-tighter uppercase px-2 bg-gray-100 rounded-full inline-block">
                {userRole}
              </p>
            </div>
            
            {/* AVATAR DINAMIS */}
            <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold shadow-md ring-2 ring-blue-50 ring-offset-2">
              {userInitial}
            </div>
          </div>
        </div>

        {/* AREA KONTEN */}
        <div className="animate-fade-in-up">
          <Outlet />
        </div>
      </div>
    </div>
  );
}