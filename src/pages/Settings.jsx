import { useNavigate } from 'react-router-dom';
import { User, Shield, Edit3 } from 'lucide-react';

export default function Settings() {
  const userRole = localStorage.getItem('userRole');
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-xl shadow-sm border mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Pengaturan Akun</h2>
        <p className="text-gray-500 mt-1">Kelola profil dan preferensi keamanan Anda</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* KARTU PROFIL (KHUSUS KARYAWAN) */}
        {userRole === 'karyawan' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-50 text-primary rounded-lg">
                <User size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Profil Saya</h3>
                <p className="text-sm text-gray-500">Lihat atau ajukan perubahan data</p>
              </div>
            </div>
            <div className="space-y-3 mb-6">
              <p className="text-sm"><span className="text-gray-500">Nama:</span> Muh. Cholish</p>
              <p className="text-sm"><span className="text-gray-500">NIK:</span> 1234567890</p>
              <p className="text-sm"><span className="text-gray-500">No HP:</span> 08123456789</p>
            </div>
            <button 
              onClick={() => navigate('/edit-profil')}
              className="w-full flex justify-center items-center gap-2 py-2.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              <Edit3 size={18} /> Ajukan Perubahan Data
            </button>
          </div>
        )}

        {/* KARTU KEAMANAN (SEMUA ROLE) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
              <Shield size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Keamanan</h3>
              <p className="text-sm text-gray-500">Ubah kata sandi akun Anda</p>
            </div>
          </div>
          <form className="space-y-4">
            <div>
              <input type="password" placeholder="Password Lama" className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm" />
            </div>
            <div>
              <input type="password" placeholder="Password Baru" className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm" />
            </div>
            <button type="button" className="w-full py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-900 font-medium transition-colors">
              Update Password
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}