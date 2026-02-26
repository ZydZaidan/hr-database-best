import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Briefcase, FileSignature, CheckCircle, ArrowRight, Clock, Calendar, Wallet, Activity } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  
  // Ambil data dari memori browser dengan proteksi toLowerCase()
  const roleRaw = localStorage.getItem('userRole') || 'Guest';
  const role = roleRaw.toLowerCase();
  const userName = localStorage.getItem('userName') || 'Karyawan';
  const isProfileComplete = localStorage.getItem('isProfileComplete') === 'true'; 
  
  // FIX LOGIKA: Admin dicek dari string 'admin', Pegawai dari status_pegawai
  const isAdmin = role === 'admin';
  const isPegawai = ['pkwtt', 'pkwt', 'thl', 'magang', 'konsultan'].includes(role);

  const [stats, setStats] = useState({ total: 0, pkwtt: 0, pkwt: 0, magang: 0 });
  const [isLoading, setIsLoading] = useState(false);

  // Fungsi khusus Admin buat narik data statistik
  useEffect(() => {
    if (isAdmin) {
      const fetchStats = async () => {
        setIsLoading(true);
        try {
          const response = await fetch('https://absensi-backend-production-6002.up.railway.app/api/karyawan');
          const result = await response.json();
          if (response.ok) {
            const employees = result.data || result;
            setStats({
              total: employees.length,
              pkwtt: employees.filter(e => e.status_pegawai === 'PKWTT').length,
              pkwt: employees.filter(e => e.status_pegawai === 'PKWT').length,
              magang: employees.filter(e => e.status_pegawai === 'Internship' || e.status_pegawai === 'Magang').length,
            });
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

  // SUB-KOMPONEN UNTUK ADMIN
  const AdminDashboard = () => (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Ringkasan Demografi Karyawan</h2>
      {isLoading ? (
        <div className="h-32 flex items-center justify-center text-gray-400 font-medium">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mr-3"></div>
          Memuat data statistik...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard icon={<Users size={24}/>} color="blue" count={stats.total} label="Total Karyawan Aktif" />
          <StatCard icon={<Briefcase size={24}/>} color="green" count={stats.pkwtt} label="Pegawai Tetap (PKWTT)" />
          <StatCard icon={<Clock size={24}/>} color="indigo" count={stats.pkwt} label="Pegawai Kontrak (PKWT)" />
          <StatCard icon={<FileSignature size={24}/>} color="orange" count={stats.magang} label="Internship / Magang" />
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
        <QuickAction title="Kelola Direktori Karyawan" desc="Lihat, edit, atau hapus database riwayat hidup karyawan." onClick={() => navigate('/karyawan')} />
        <QuickAction title="Approval Data & Surat" desc="Tinjau antrean pengajuan perubahan profil dan dokumen." onClick={() => navigate('/approval')} isNew={true} />
      </div>
    </div>
  );

  // SUB-KOMPONEN UNTUK PEGAWAI
  const EmployeeDashboard = () => (
    <div className="space-y-6 animate-fade-in">
      {!isProfileComplete ? (
        <div className="bg-orange-50 border border-orange-200 p-5 rounded-xl flex items-center justify-between shadow-sm border-l-8 border-l-orange-500">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 text-orange-600 rounded-full hidden md:block"><Activity size={24}/></div>
            <div>
              <h3 className="font-bold text-orange-800 text-lg">⚠️ Lengkapi Profil Anda</h3>
              <p className="text-sm text-orange-700 mt-0.5">Lengkapi data diri agar proses administrasi PT. BEST berjalan lancar.</p>
            </div>
          </div>
          <button onClick={() => navigate('/tambah-karyawan')} className="px-6 py-2.5 bg-orange-600 text-white text-sm font-bold rounded-lg shadow-md hover:bg-orange-700 transition-all">Lengkapi Sekarang</button>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 p-5 rounded-xl flex items-center shadow-sm border-l-8 border-l-green-500">
          <CheckCircle className="text-green-600 mr-4 shrink-0" size={32} />
          <div>
            <h3 className="font-bold text-green-800 text-lg">Profil Terverifikasi</h3>
            <p className="text-sm text-green-700">Terima kasih telah melengkapi data. Semua layanan administrasi sudah aktif.</p>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <EmployeeWidget title="Riwayat Presensi" icon={<Calendar className="text-blue-600"/>} desc="Cek kehadiran bulanan Anda." onClick={() => navigate('/absen')} />
        <EmployeeWidget title="Pengajuan Surat" icon={<FileSignature className="text-purple-600"/>} desc="Unduh CV atau SK Penghasilan." onClick={() => navigate('/pengajuan')} />
        <EmployeeWidget title="Informasi Gaji" icon={<Wallet className="text-green-600"/>} desc="Lihat slip gaji terbaru Anda." onClick={() => navigate('/slip-gaji')} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Banner Header */}
      <div className="bg-linear-to-r from-blue-800 to-blue-600 p-10 rounded-2xl shadow-xl text-white relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">
            {isAdmin ? `Selamat Datang, ${userName.split(' ')[0]} 👋` : `Halo, ${userName.split(' ')[0]} 👋`}
          </h1>
          <p className="text-blue-100 max-w-2xl opacity-90">
            {isAdmin 
              ? 'Dashboard Direksi: Pantau demografi karyawan dan kelola persetujuan administrasi dalam satu layar.' 
              : 'Portal HRIS: Pantau kehadiran, unduh dokumen, dan kelola administrasi Anda dengan mudah.'}
          </p>
        </div>
        <div className="absolute -right-10 -top-24 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute right-32 -bottom-10 w-40 h-40 bg-blue-400 opacity-20 rounded-full blur-2xl"></div>
      </div>

      {/* RENDER KONDISIONAL */}
      {isAdmin ? <AdminDashboard /> : isPegawai ? <EmployeeDashboard /> : null}
    </div>
  );
}

// Helper Components
function StatCard({ icon, color, count, label }) {
  const colors = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    indigo: "bg-indigo-100 text-indigo-600",
    orange: "bg-orange-100 text-orange-600"
  };
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:scale-[1.02] transition-all">
      <div className={`p-3 w-fit rounded-xl mb-4 ${colors[color]}`}>{icon}</div>
      <h3 className="text-3xl font-extrabold text-gray-800">{count}</h3>
      <p className="text-sm font-medium text-gray-500 mt-1">{label}</p>
    </div>
  );
}

function QuickAction({ title, desc, onClick, isNew }) {
  return (
    <button onClick={onClick} className="group bg-white p-6 rounded-xl border border-gray-200 flex items-center justify-between hover:border-primary hover:shadow-md transition-all text-left relative overflow-hidden">
      <div className="z-10">
        <h4 className="font-bold text-gray-800 text-lg group-hover:text-primary transition-colors">{title}</h4>
        <p className="text-sm text-gray-500 mt-1">{desc}</p>
      </div>
      <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-blue-50 group-hover:text-primary transition-colors z-10">
        <ArrowRight size={20} />
      </div>
      {isNew && <div className="absolute top-1.5 right-1.5 w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>}
    </button>
  );
}

function EmployeeWidget({ title, icon, desc, onClick }) {
  return (
    <div onClick={onClick} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md cursor-pointer transition-all group border-b-4 border-b-gray-200 hover:border-b-primary">
      <div className="p-3 bg-gray-50 rounded-xl w-fit mb-4 group-hover:bg-blue-50 transition-colors">{icon}</div>
      <h4 className="font-bold text-gray-800 mb-1">{title}</h4>
      <p className="text-xs text-gray-500">{desc}</p>
    </div>
  );
}