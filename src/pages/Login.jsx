import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, LogIn, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('admin');
  const [isLoading, setIsLoading] = useState(false);

  // Bersihin sisa login lama tiap kali buka halaman ini
  useEffect(() => {
    localStorage.clear();
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Pura-puranya loading nembak API
    setTimeout(() => {
      // Simpan role yang dipilih ke memori browser
      localStorage.setItem('userRole', selectedRole);
      
      toast.success(`Berhasil masuk sebagai ${selectedRole.toUpperCase()}`);
      navigate('/'); // Terbang ke Dashboard
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl border w-full max-w-md animate-fade-in">
        
        {/* Header Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-200">
            <Building2 size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">Portal HRIS PT. BEST</h1>
          <p className="text-gray-500 text-sm mt-1">Mode UI Testing (Tanpa API)</p>
        </div>

        {/* Form Login Dummy */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Pilih Role Akun:</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Users size={18} className="text-gray-400" />
              </div>
              <select 
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all appearance-none bg-white"
              >
                <option value="admin">Administrator / HR</option>
                <option value="pkwtt">Karyawan Tetap (PKWTT)</option>
                <option value="pkwt">Karyawan Kontrak (PKWT)</option>
                <option value="thl">Tenaga Harian Lepas (THL)</option>
                <option value="magang">Anak Magang / Internship</option>
                <option value="konsultan">Konsultan</option>
              </select>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              *Pilih role di atas untuk melihat perbedaan tampilan Dashboard dan Form.
            </p>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full flex items-center justify-center gap-2 p-3 text-white rounded-lg font-bold shadow-md transition-all ${
              isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-primary hover:bg-blue-700 hover:shadow-lg'
            }`}
          >
            {isLoading ? 'Memuat Dashboard...' : <><LogIn size={20} /> Masuk Sistem</>}
          </button>
        </form>

      </div>
    </div>
  );
}