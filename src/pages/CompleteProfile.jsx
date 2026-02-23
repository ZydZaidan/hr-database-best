import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { User, BookOpen, Briefcase, Wallet, Save, ChevronRight, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CompleteProfile() {
  const navigate = useNavigate();
  const role = localStorage.getItem('userRole');
  const isPKWTT = role === 'pkwtt';
  const [currentStep, setCurrentStep] = useState(0);
  const { register, handleSubmit } = useForm();

  // LOGIKA DINAMIS: Kalau PKWTT dapet 4 Step, kalau selain itu cuma dapet 2 Step
  const steps = isPKWTT 
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

  const onSubmit = (data) => {
    console.log("Data Disubmit:", data);
    toast.success('Mantap! Data diri berhasil disimpan.');
    navigate('/'); // Balik ke dashboard
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div className="bg-white p-6 rounded-xl shadow-sm border mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Lengkapi Data Diri Anda</h2>
        <p className="text-gray-500 text-sm mt-1">
          {isPKWTT ? 'Silakan lengkapi seluruh data profil Anda (A-E).' : 'Silakan lengkapi data pribadi dan informasi finansial Anda.'}
        </p>
      </div>

      {/* --- UI STEPPER --- */}
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

      {/* --- AREA FORM --- */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-xl shadow-sm border">
        
        {/* STEP: DATA PRIBADI (Semua dapet) */}
        {steps[currentStep].id === 'A' && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-lg font-bold border-b pb-2">Data Pribadi</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm mb-1">Nama Lengkap</label><input {...register('nama')} className="w-full p-2.5 border rounded-lg" /></div>
              <div><label className="block text-sm mb-1">NIK KTP</label><input {...register('nik_ktp')} className="w-full p-2.5 border rounded-lg" /></div>
              <div className="col-span-2"><label className="block text-sm mb-1">Alamat</label><textarea {...register('alamat')} className="w-full p-2.5 border rounded-lg h-20" /></div>
            </div>
          </div>
        )}

        {/* STEP: PENDIDIKAN (Cuma PKWTT) */}
        {steps[currentStep].id === 'B' && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-lg font-bold border-b pb-2">Pendidikan & Kompetensi</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm mb-1">Kampus/Sekolah</label><input {...register('kampus')} className="w-full p-2.5 border rounded-lg" /></div>
              <div><label className="block text-sm mb-1">IPK</label><input {...register('ipk')} className="w-full p-2.5 border rounded-lg" /></div>
            </div>
          </div>
        )}

        {/* STEP: KARIR (Cuma PKWTT) */}
        {steps[currentStep].id === 'C' && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-lg font-bold border-b pb-2">Data Karir</h3>
            <p className="text-sm text-gray-500">Isi riwayat pekerjaan sebelumnya (jika ada).</p>
            <textarea {...register('riwayat_kerja')} className="w-full p-2.5 border rounded-lg h-24" placeholder="Contoh: Staff IT di PT XYZ (2020-2023)" />
          </div>
        )}

        {/* STEP: FINANSIAL (Semua dapet) */}
        {steps[currentStep].id === 'D' && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-lg font-bold border-b pb-2">Data Finansial (Rekening)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm mb-1">Nama Bank</label><input {...register('bank')} className="w-full p-2.5 border rounded-lg" placeholder="BCA/Mandiri/dll" /></div>
              <div><label className="block text-sm mb-1">Nomor Rekening</label><input {...register('rekening')} className="w-full p-2.5 border rounded-lg" /></div>
            </div>
          </div>
        )}

        {/* NAVIGASI BAWAH */}
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