import { useNavigate } from 'react-router-dom';
import { User, Shield } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();

  // Simulasi login sementara (Nanti diganti pakai API Axios ke Laravel)
  const handleLogin = (role) => {
    localStorage.setItem('userRole', role); // Simpan role di browser
    navigate('/'); // Arahin ke halaman utama
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-primary mb-2">Portal HRIS</h1>
        <p className="text-gray-500 mb-8">Pilih role untuk simulasi login</p>
        
        <div className="space-y-4">
          <button 
            onClick={() => handleLogin('admin')}
            className="w-full flex items-center justify-center gap-3 p-4 bg-primary text-white rounded-lg hover:brightness-110"
          >
            <Shield size={24} /> Login sebagai Admin HR
          </button>
          
          <button 
            onClick={() => handleLogin('karyawan')}
            className="w-full flex items-center justify-center gap-3 p-4 border-2 border-primary text-primary rounded-lg hover:bg-blue-50"
          >
            <User size={24} /> Login sebagai Karyawan
          </button>
        </div>
      </div>
    </div>
  );
}