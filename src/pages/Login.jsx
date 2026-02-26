import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('https://absensi-backend-production-6002.up.railway.app/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

// Di dalam fungsi handleSubmit Login.jsx
// Di dalam fungsi handleSubmit Login.jsx pas sukses
// Di dalam Login.jsx pas login sukses
// Di dalam Login.jsx
if (response.ok && result.success) {
    const { user, token } = result.data;

    localStorage.setItem('auth_token', token);
    
    // LOGIKA SAKTI: Kalau status_pegawai kosong (buat Admin), ambil dari 'peran'
    const roleDinamis = user.peran === 'admin' ? user.peran : user.status_pegawai;
    localStorage.setItem('userRole', roleDinamis); 

    localStorage.setItem('userName', user.name); 
    localStorage.setItem('nik_ktp', user.nik_ktp);
    navigate('/');


      } else {
        // Handle error seperti: Akun belum aktif atau password salah
        toast.error(result.message || 'Login Gagal. Silakan cek kembali.');
      }
    } catch (error) {
      console.error('Login Error:', error);
      toast.error('Gagal terhubung ke server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="p-8">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-primary">PT. BEST</h1>
            <p className="text-gray-500 mt-2">Human Resource Information System</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Perusahaan</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  required
                  type="email"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                  placeholder="name@ptbest.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-xl bg-primary text-white font-bold flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-lg shadow-blue-100 ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn size={20} /> Masuk Sekarang
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-500">
            Belum punya akun? <span className="text-primary font-bold cursor-pointer hover:underline">Hubungi HRD</span>
          </div>
        </div>
      </div>
    </div>
  );
}