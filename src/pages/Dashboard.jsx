import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Briefcase, FileSignature, CheckCircle, ArrowRight, Clock } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  
  // Ambil data dari memori browser
  const role = localStorage.getItem('userRole') || ''; 
  const isProfileComplete = localStorage.getItem('isProfileComplete') === 'true'; 
  
  const isAdmin = role === 'admin';
  const isPKWTT = role === 'pkwtt';
  const isNonPKWTT = ['pkwt', 'thl', 'magang', 'konsultan'].includes(role);

  // === STATE UNTUK ADMIN DASHBOARD ===
  const [stats, setStats] = useState({
    total: 0,
    pkwtt: 0,
    pkwt: 0,
    magang: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  // Fungsi khusus Admin buat narik dan ngitung data karyawan
  useEffect(() => {
    if (isAdmin) {
      const fetchStats = async () => {
        setIsLoading(true);
        try {
          const response = await fetch('https://absensi-backend-production-6002.up.railway.app/api/karyawan');
          const result = await response.json();

          if (response.ok) {
            const employees = result.data || result;
            
            // Hitung statistik dari data
            const total = employees.length;
            const pkwtt = employees.filter(e => e.status_pegawai === 'PKWTT').length;
            const pkwt = employees.filter(e => e.status_pegawai === 'PKWT').length;
            const magang = employees.filter(e => e.status_pegawai === 'Internship').length;

            setStats({ total, pkwtt, pkwt, magang });
          }
        } catch (error) {
          console.error("Gagal memuat statistik", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchStats();
    }
  }, [isAdmin]);

  return (
    <div className="space-y-6">
      
      {/* Header Welcome Card */}
      <div className="bg-linear-to-r from-blue-800 to-blue-600 p-8 rounded-2xl shadow-lg text-white relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">
            {isAdmin ? 'Selamat Datang, Direksi & Tim HR 👋' : 'Halo, Selamat Datang di Portal HRIS 👋'}
          </h1>
          <p className="text-blue-100 max-w-2xl">
            {isAdmin 
              ? 'Pantau ringkasan data demografi karyawan dan kelola persetujuan administrasi PT. BEST dengan mudah melalui dashboard ini.' 
              : 'Pantau kehadiran, ajukan perizinan, dan lengkapi administrasi Anda dengan mudah dalam satu sistem terintegrasi.'}
          </p>
        </div>
        {/* Hiasan background lengkungan */}
        <div className="absolute -right-10 -top-24 w-64 h-64 bg-white opacity-10 rounded-full blur-2xl"></div>
        <div className="absolute right-32 -bottom-10 w-40 h-40 bg-blue-400 opacity-20 rounded-full blur-xl"></div>
      </div>

      {/* =========================================
          VIEW KHUSUS KARYAWAN (BANNER LENGKAPI DATA)
          ========================================= */}
      {((isPKWTT || isNonPKWTT) && !isProfileComplete) && (
        <div className="bg-orange-50 border border-orange-200 p-5 rounded-xl flex items-center justify-between shadow-sm animate-fade-in">
          <div>
            <h3 className="font-bold text-orange-800 text-lg flex items-center gap-2">
              ⚠️ Lengkapi Profil Anda
            </h3>
            <p className="text-sm text-orange-700 mt-1">
              Data profil Anda belum lengkap. Silakan lengkapi formulir agar proses administrasi Anda berjalan lancar.
            </p>
          </div>
          <button 
            onClick={() => navigate('/tambah-karyawan')}
            className="px-5 py-2.5 bg-orange-600 text-white text-sm font-bold rounded-lg shadow-md hover:bg-orange-700 transition-colors whitespace-nowrap"
          >
            Isi Data Sekarang
          </button>
        </div>
      )}

      {((isPKWTT || isNonPKWTT) && isProfileComplete) && (
        <div className="bg-green-50 border border-green-200 p-5 rounded-xl flex items-center shadow-sm animate-fade-in">
          <CheckCircle className="text-green-600 mr-3 shrink-0" size={28} />
          <div>
            <h3 className="font-bold text-green-800 text-lg">Profil Anda Sudah Lengkap</h3>
            <p className="text-sm text-green-700 mt-1">Terima kasih telah melengkapi data. Fitur pengajuan surat dan absensi sudah dapat digunakan sepenuhnya.</p>
          </div>
        </div>
      )}

      {/* =========================================
          VIEW KHUSUS ADMIN DIREKSI (STATISTIK)
          ========================================= */}
      {isAdmin && (
        <div className="space-y-6 animate-fade-in">
          
          <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Ringkasan Demografi Karyawan</h2>
          
          {isLoading ? (
            <div className="h-32 flex items-center justify-center text-gray-400 font-medium">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mr-3"></div>
              Memuat data statistik...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              
              {/* Card 1: Total Karyawan */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                    <Users size={24} />
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl font-extrabold text-gray-800">{stats.total}</h3>
                  <p className="text-sm font-medium text-gray-500 mt-1">Total Karyawan Aktif</p>
                </div>
              </div>

              {/* Card 2: PKWTT */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                    <Briefcase size={24} />
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl font-extrabold text-gray-800">{stats.pkwtt}</h3>
                  <p className="text-sm font-medium text-gray-500 mt-1">Pegawai Tetap (PKWTT)</p>
                </div>
              </div>

              {/* Card 3: PKWT */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                    <Clock size={24} />
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl font-extrabold text-gray-800">{stats.pkwt}</h3>
                  <p className="text-sm font-medium text-gray-500 mt-1">Pegawai Kontrak (PKWT)</p>
                </div>
              </div>

              {/* Card 4: Magang */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
                    <FileSignature size={24} />
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl font-extrabold text-gray-800">{stats.magang}</h3>
                  <p className="text-sm font-medium text-gray-500 mt-1">Internship / Magang</p>
                </div>
              </div>

            </div>
          )}

          {/* Quick Actions / Shortcut */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
            <button 
              onClick={() => navigate('/karyawan')} // Sesuaikan path rute Kelola Data Karyawan lo
              className="group bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between hover:border-primary hover:shadow-md transition-all text-left"
            >
              <div>
                <h4 className="font-bold text-gray-800 text-lg group-hover:text-primary transition-colors">Kelola Direktori Karyawan</h4>
                <p className="text-sm text-gray-500 mt-1">Lihat, edit, atau hapus database riwayat hidup karyawan.</p>
              </div>
              <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-blue-50 group-hover:text-primary transition-colors">
                <ArrowRight size={20} />
              </div>
            </button>

            <button 
              onClick={() => navigate('/approval')} // Sesuaikan path rute Approval Data lo
              className="group bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between hover:border-primary hover:shadow-md transition-all text-left relative overflow-hidden"
            >
              <div>
                <h4 className="font-bold text-gray-800 text-lg group-hover:text-primary transition-colors">Approval Data & Surat</h4>
                <p className="text-sm text-gray-500 mt-1">Tinjau antrean pengajuan CV dan Surat Keterangan Penghasilan.</p>
              </div>
              <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-blue-50 group-hover:text-primary transition-colors">
                <ArrowRight size={20} />
              </div>
              
              {/* Indikator "Ada Tugas Baru" (Dummy dulu sblm fitur approval jadi) */}
              <div className="absolute top-0 right-0 w-12 h-12 bg-red-500 transform rotate-45 translate-x-6 -translate-y-6"></div>
              <div className="absolute top-1.5 right-1.5 w-3 h-3 bg-red-500 rounded-full shadow-sm shadow-red-300 animate-pulse"></div>
            </button>
          </div>

        </div>
      )}

    </div>
  );
}