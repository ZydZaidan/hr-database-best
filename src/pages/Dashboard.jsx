import { useNavigate } from 'react-router-dom';
import { Users, FileText, CheckCircle } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  
  // Ambil data dari memori browser
  const role = localStorage.getItem('userRole'); 
  // Cek apakah profil sudah lengkap (ambil tanda dari AddEmployee tadi)
  const isProfileComplete = localStorage.getItem('isProfileComplete') === 'true'; 
  
  const isAdmin = role === 'admin';
  const isPKWTT = role === 'pkwtt';
  const isNonPKWTT = ['pkwt', 'thl', 'magang', 'konsultan'].includes(role);

  return (
    <div className="space-y-6">
      
      {/* Header Welcome Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold mb-2 text-gray-800">
          {isAdmin ? 'Dashboard Direksi & HR' : 'Beranda Karyawan'}
        </h1>
        <p className="text-gray-500">
          {isAdmin 
            ? 'Pantau statistik kehadiran dan aktivitas karyawan PT. BEST di sini.' 
            : 'Selamat datang di portal HRIS PT. BEST. Semoga harimu menyenangkan!'}
        </p>
      </div>

      {/* =========================================
          BANNER PENGINGAT ISI DATA (KHUSUS PEGAWAI)
          Syarat Muncul: Harus Pegawai AND Profil Belum Lengkap (!isProfileComplete)
          ========================================= */}
      {((isPKWTT || isNonPKWTT) && !isProfileComplete) && (
        <div className="bg-blue-50 border border-blue-200 p-5 rounded-xl flex items-center justify-between shadow-sm animate-fade-in">
          <div>
            <h3 className="font-bold text-blue-800 text-lg">Lengkapi Profil Anda</h3>
            <p className="text-sm text-blue-600 mt-1">
              {isPKWTT 
                ? 'Data profil Anda belum lengkap. Silakan isi formulir A-E agar proses administrasi berjalan lancar.' 
                : 'Silakan isi kelengkapan Data Pribadi dan Finansial (Rekening) Anda untuk keperluan administrasi.'}
            </p>
          </div>
          <button 
            onClick={() => navigate('/tambah-karyawan')} // Pastiin path-nya sesuai route lo
            className="px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-lg shadow-md hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            Isi Data Sekarang
          </button>
        </div>
      )}

      {/* TAMPILAN KALAU UDAH LENGKAP (Opsional, biar dashboard gak kosong) */}
      {((isPKWTT || isNonPKWTT) && isProfileComplete) && (
        <div className="bg-green-50 border border-green-200 p-5 rounded-xl flex items-center shadow-sm animate-fade-in">
          <CheckCircle className="text-green-600 mr-3" size={24} />
          <div>
            <h3 className="font-bold text-green-800">Profil Anda Sudah Lengkap</h3>
            <p className="text-sm text-green-600 mt-1">Terima kasih telah melengkapi data administrasi. Anda sekarang dapat menggunakan seluruh fitur HRIS.</p>
          </div>
        </div>
      )}

      {/* =========================================
          WIDGET STATISTIK (KHUSUS ADMIN)
          ========================================= */}
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><Users size={24} /></div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Karyawan</p>
              <h3 className="text-2xl font-bold">142</h3>
            </div>
          </div>
          {/* ... Widget lainnya ... */}
        </div>
      )}

    </div>
  );
}