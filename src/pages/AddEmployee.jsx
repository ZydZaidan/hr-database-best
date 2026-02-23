import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, BookOpen, Briefcase, Wallet, Save, ChevronRight, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AddEmployee() {
  const navigate = useNavigate();
  
  // 1. CEK SIAPA YANG LAGI BUKA FORM INI
  const role = localStorage.getItem('userRole');
  const isAdmin = role === 'admin';
  const isPKWTT = role === 'pkwtt';
  // const isNonPKWTT = ['pkwt', 'thl', 'magang', 'konsultan'].includes(role); // Opsional kalau mau dipake logic lain

  const [currentStep, setCurrentStep] = useState(0);

  // 2. LOGIKA STEP DINAMIS (Ini kuncinya bro!)
  // Kalau Admin atau PKWTT, dapet 4 menu. Kalau selain itu, cuma dapet 2 menu.
  const steps = (isAdmin || isPKWTT) 
    ? [
        { title: 'Data Pribadi', icon: User, id: 'A' },
        { title: 'Pendidikan', icon: BookOpen, id: 'B' },
        { title: 'Karir', icon: Briefcase, id: 'C' },
        { title: 'Finansial', icon: Wallet, id: 'D' },
      ]
    : [
        { title: 'Data Pribadi', icon: User, id: 'A' },
        { title: 'Data Finansial', icon: Wallet, id: 'D' },
      ];

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success(isAdmin ? 'Data Karyawan Baru Berhasil Ditambah!' : 'Profil Berhasil Dilengkapi!');
    navigate('/'); 
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      
      {/* Header Dinamis */}
      <div className="bg-white p-6 rounded-xl shadow-sm border mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {isAdmin ? 'Tambah Karyawan Baru' : 'Lengkapi Data Diri Anda'}
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          {isAdmin 
            ? 'Isi formulir berikut untuk menambahkan data karyawan ke sistem.'
            : (isAdmin || isPKWTT) 
                ? 'Silakan lengkapi seluruh riwayat data Anda.' 
                : 'Silakan isi data pribadi dan informasi finansial Anda untuk keperluan administrasi.'}
        </p>
      </div>

      {/* Indikator Step */}
      <div className="flex justify-between items-center relative px-4 mb-8">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 -z-10"></div>
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index <= currentStep;
          return (
            <div key={index} className="flex flex-col items-center gap-2 bg-white px-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${isActive ? 'bg-primary border-primary text-white' : 'bg-gray-100 border-gray-300 text-gray-400'}`}>
                <Icon size={18} />
              </div>
              <span className={`text-xs font-medium ${isActive ? 'text-primary' : 'text-gray-400'}`}>{step.title}</span>
            </div>
          );
        })}
      </div>

      {/* Form Area */}
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border">
        
        {/* STEP A: DATA PRIBADI (Semua dapet) */}
        {steps[currentStep].id === 'A' && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-lg font-bold border-b pb-2">Data Pribadi</h3>
            {/* ... Taruh inputan data pribadi lu di sini ... */}
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm mb-1">Nama Lengkap</label><input type="text" className="w-full p-2.5 border rounded-lg" required /></div>
              <div><label className="block text-sm mb-1">NIK KTP</label><input type="text" className="w-full p-2.5 border rounded-lg" required /></div>
            </div>
          </div>
        )}

        {/* STEP B: PENDIDIKAN (Cuma Admin & PKWTT) */}
        {steps[currentStep].id === 'B' && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-lg font-bold border-b pb-2">Riwayat Pendidikan</h3>
            {/* ... Taruh inputan pendidikan lu di sini ... */}
            <input type="text" placeholder="Nama Kampus / Sekolah" className="w-full p-2.5 border rounded-lg" />
          </div>
        )}

        {/* STEP C: KARIR (Cuma Admin & PKWTT) */}
        {steps[currentStep].id === 'C' && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-lg font-bold border-b pb-2">Riwayat Karir</h3>
            {/* ... Taruh inputan karir lu di sini ... */}
            <textarea placeholder="Pengalaman kerja sebelumnya..." className="w-full p-2.5 border rounded-lg h-24" />
          </div>
        )}

        {/* STEP D: FINANSIAL (Semua dapet) */}
        {steps[currentStep].id === 'D' && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-lg font-bold border-b pb-2">Data Finansial</h3>
            {/* ... Taruh inputan rekening lu di sini ... */}
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm mb-1">Nama Bank</label><input type="text" className="w-full p-2.5 border rounded-lg" /></div>
              <div><label className="block text-sm mb-1">Nomor Rekening</label><input type="text" className="w-full p-2.5 border rounded-lg" /></div>
            </div>
          </div>
        )}

        {/* Tombol Navigasi Bawah */}
        <div className="flex justify-between mt-8 pt-6 border-t">
          {currentStep > 0 ? (
            <button type="button" onClick={() => setCurrentStep(prev => prev - 1)} className="px-6 py-2 border rounded-lg flex items-center gap-2"><ChevronLeft size={18}/> Kembali</button>
          ) : <div></div>}

          {currentStep < steps.length - 1 ? (
            <button type="button" onClick={() => setCurrentStep(prev => prev + 1)} className="px-6 py-2 bg-primary text-white rounded-lg flex items-center gap-2">Lanjut <ChevronRight size={18}/></button>
          ) : (
            <button type="submit" className="px-8 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2 font-bold"><Save size={18}/> Simpan Data</button>
          )}
        </div>
      </form>
    </div>
  );
}