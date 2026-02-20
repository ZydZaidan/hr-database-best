import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, Building2, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api'; // Pastikan path ini bener sesuai lokasi api.js lo

export default function Login() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(false);

  // Bersihin memori login lama tiap kali mendarat di halaman ini
  useEffect(() => {
    localStorage.clear();
  }, []);

  const onSubmit = async (data) => {
    setIsLoading(true);
    const loadingToast = toast.loading('Sedang otentikasi...');

    try {
      // 1. Nembak API Login ke Backend (Railway)
      const response = await api.post('/login', {
        email: data.email,
        password: data.password
      });

      // 2. Ekstrak data dari jawaban Backend (Sesuai kamus API dari temen lo)
      const { token, user } = response.data;

      // 3. Simpan Kunci (Token) dan Identitas (Role, Nama) di Browser
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('userName', user.name); // Simpan nama buat ditampilin di Header nanti

      toast.dismiss(loadingToast);
      toast.success(`Welcome back, ${user.name}!`);
      
      // 4. Buka pintu ke Dashboard
      navigate('/'); 

    } catch (error) {
      toast.dismiss(loadingToast);
      
      // Nangkep error dari Backend (misal password salah atau email gak ketemu)
      const errorMsg = error.response?.data?.message || 'Login gagal. Periksa kembali email dan password Anda.';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
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
          <p className="text-gray-500 text-sm mt-1">Silakan masuk ke akun Anda</p>
        </div>

        {/* Form Login */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Alamat Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={18} className="text-gray-400" />
              </div>
              <input 
                type="email" 
                {...register('email', { required: 'Email wajib diisi' })}
                placeholder="admin@ptbest.com" 
                className="w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all"
                disabled={isLoading}
              />
            </div>
            {errors.email && <span className="text-xs text-red-500 mt-1">{errors.email.message}</span>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-400" />
              </div>
              <input 
                type="password" 
                {...register('password', { required: 'Password wajib diisi' })}
                placeholder="••••••••" 
                className="w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all"
                disabled={isLoading}
              />
            </div>
            {errors.password && <span className="text-xs text-red-500 mt-1">{errors.password.message}</span>}
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full flex items-center justify-center gap-2 p-3 text-white rounded-lg font-bold shadow-md transition-all ${
              isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-primary hover:bg-blue-700 hover:shadow-lg'
            }`}
          >
            {isLoading ? 'Memproses...' : <><LogIn size={20} /> Masuk Sistem</>}
          </button>
        </form>

      </div>
    </div>
  );
}