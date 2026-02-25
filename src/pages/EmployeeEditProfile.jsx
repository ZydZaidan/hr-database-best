import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { User, BookOpen, Briefcase, Wallet, ChevronLeft, ChevronRight, Save, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EmployeeEditProfile() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Ambil NIK KTP dari memory browser (Sebagai simulasi siapa yang lagi login)
  const nikKtp = localStorage.getItem('nik_ktp'); 

  // reset dipake buat ngisi form otomatis kalau data dari BE udah dapet
  const { register, handleSubmit, trigger, reset } = useForm();

  const steps = [
    { title: 'Data Pribadi (A)', icon: User },
    { title: 'Pendidikan & Kompetensi (B & E)', icon: BookOpen },
    { title: 'Data Karir (C)', icon: Briefcase },
    { title: 'Data Finansial (D)', icon: Wallet },
  ];

  // ==========================================
  // TARIK DATA ASLI DARI DATABASE (OTOMATIS)
  // ==========================================
  useEffect(() => {
    const fetchCurrentData = async () => {
      if (!nikKtp) {
        setIsLoading(false);
        return; // Kalau nggak ada NIK di memori, biarin formnya kosong
      }

      try {
        // Tembak API detail karyawan buat dapet data lamanya
        const response = await fetch(`https://absensi-backend-production-6002.up.railway.app/api/karyawan/${nikKtp}`);
        const result = await response.json();

        if (response.ok) {
          const emp = result.data || result;
          
          // Pecah TTL kalau formatnya "Tempat, YYYY-MM-DD"
          const ttlSplit = emp.ttl ? emp.ttl.split(', ') : ['', ''];

          // Ngisi form otomatis pakai data asli dari database!
          reset({
            nama_lengkap: emp.nama,
            nik_karyawan: emp.nik_karyawan !== '-' ? emp.nik_karyawan : 'Belum ada NIK Karyawan',
            tanggal_lahir: ttlSplit[1] || '', // Asumsi tanggal ada di indeks 1
            status_ptkp: emp.status_ptkp,
            no_hp: emp.no_hp,
            alamat_domisili: emp.alamat_domisili,
            nama_bank: emp.nama_bank,
            nomor_rekening: emp.no_rekening,
            // Nanti bisa ditambahin field lain sesuai kebutuhan
          });
        }
      } catch (error) {
        console.error("Gagal menarik data profil:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentData();
  }, [nikKtp, reset]);


  const nextStep = async () => {
    const isValid = await trigger(); 
    if (isValid) setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const onSubmit = async (data) => {
    if (!nikKtp) {
      toast.error('Gagal: Sesi tidak ditemukan. Anda harus mengisi profil awal dulu.');
      return;
    }

    const loadingToast = toast.loading('Mengirim pengajuan perubahan ke Admin HR...');

    // Mapping Payload data apa aja yang Karyawan ajuin perubahannya
    const payloadToBE = {
      nik_ktp: nikKtp, // ID Wajib
      nama: data.nama_lengkap, // SEKARANG NAMA BISA DIEDIT
      tanggal_lahir: data.tanggal_lahir, // SEKARANG TTL BISA DIEDIT
      no_hp: data.no_hp,
      status_ptkp: data.status_ptkp,
      alamat_domisili: data.alamat_domisili,
      
      nama_sekolah: data.nama_pendidikan_baru || undefined,
      seminar_bootcamp_ext: `${data.kompetensi_seminar || '-'} | ${data.kompetensi_bootcamp || '-'}`,
      
      nama_bank: data.nama_bank,
      no_rekening: data.nomor_rekening
    };

    console.log("🔥 Payload Perubahan Data:", payloadToBE);

    try {
      const response = await fetch('https://absensi-backend-production-6002.up.railway.app/api/karyawan/request-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payloadToBE)
      });

      if (response.ok) {
        toast.success('Pengajuan berhasil! Menunggu persetujuan HR.', { id: loadingToast });
        navigate('/pengaturan'); 
      } else {
        toast.error('Gagal ngirim pengajuan.', { id: loadingToast });
      }
    } catch  {
      toast.error('Koneksi terputus ke server.', { id: loadingToast });
    }
  };

  if (isLoading) {
    return <div className="text-center py-20 font-bold text-gray-500">Memuat profil Anda...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <div className="mb-8 bg-white p-6 rounded-xl shadow-sm border">
        <h1 className="text-2xl font-bold mb-2 text-gray-800">Pengajuan Perubahan Data</h1>
        <p className="text-gray-500 text-sm mb-6">Ubah data yang diperlukan. Kolom dengan ikon gembok tidak dapat diubah tanpa lapor ke HR.</p>
        
        {/* Indikator Stepper */}
        <div className="flex justify-between items-center relative px-4">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 -z-10"></div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary transition-all duration-300 -z-10" style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}></div>
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index <= currentStep;
            return (
              <div key={index} className="flex flex-col items-center gap-2 bg-white px-2">
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 transition-colors ${isActive ? 'bg-primary border-primary text-white' : 'bg-white border-gray-300 text-gray-400'}`}>
                  <Icon size={20} />
                </div>
                <span className={`text-[10px] md:text-xs font-medium text-center ${isActive ? 'text-primary' : 'text-gray-400'}`}>{step.title}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border">
        <form onSubmit={handleSubmit(onSubmit)}>
          
          {/* ================= STEP 1: DATA PRIBADI (A) ================= */}
          {currentStep === 0 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-primary">A. Data Pribadi (Induk)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* --- BISA DIEDIT SEKARANG --- */}
                <div>
                  <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
                  <input {...register('nama_lengkap')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                </div>

                {/* --- TETAP TERKUNCI (KARENA INI ID DATABASE) --- */}
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <label className="text-xs font-medium text-gray-500 flex items-center gap-1 mb-1"><Lock size={12}/> NIK KTP (Identitas Utama)</label>
                  <input disabled value={nikKtp || 'Belum ada NIK'} className="w-full bg-transparent text-gray-700 font-medium outline-none cursor-not-allowed" />
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <label className="text-xs font-medium text-gray-500 flex items-center gap-1 mb-1"><Lock size={12}/> NIK Karyawan</label>
                  <input disabled {...register('nik_karyawan')} className="w-full bg-transparent text-gray-700 font-medium outline-none cursor-not-allowed" />
                </div>

                {/* --- BISA DIEDIT --- */}
                <div>
                  <label className="block text-sm font-medium mb-1">Tanggal Lahir</label>
                  <input type="date" {...register('tanggal_lahir')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status PTKP Baru</label>
                  <select {...register('status_ptkp')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none">
                    <option value="TK/0">TK/0</option><option value="K/0">K/0</option><option value="K/1">K/1</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">No. Handphone Baru</label>
                  <input type="number" {...register('no_hp')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Alamat Domisili Baru</label>
                  <textarea {...register('alamat_domisili')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none h-20"></textarea>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 2: PENDIDIKAN & KOMPETENSI (B & E) ================= */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-primary">B & E. Pendidikan & Sertifikasi</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-sm font-medium mb-1">Update Jenjang Baru (Jika Ada)</label>
                    <input {...register('nama_pendidikan_baru')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="Contoh: S2 - Universitas Gadjah Mada" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1">Update Riwayat Seminar</label>
                    <input {...register('kompetensi_seminar')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="Masukkan jika ada tambahan..." />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1">Update Riwayat Bootcamp / Sertifikasi</label>
                    <input {...register('kompetensi_bootcamp')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="Masukkan jika ada tambahan..." />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 3: KARIR (C) ================= */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-primary">C. Karir & Kinerja (Terkunci)</h3>
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4 text-sm text-blue-800">
                ℹ️ Data karir dan evaluasi hanya dapat diubah oleh pihak HR / Manajemen.
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 opacity-70">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <label className="text-xs font-medium text-gray-500 flex items-center gap-1 mb-1"><Lock size={12}/> Status Pegawai</label>
                  <input disabled value="Terisi dari HR" className="w-full bg-transparent text-gray-700 font-medium outline-none cursor-not-allowed" />
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <label className="text-xs font-medium text-gray-500 flex items-center gap-1 mb-1"><Lock size={12}/> Jabatan Struktural</label>
                  <input disabled value="Terisi dari HR" className="w-full bg-transparent text-gray-700 font-medium outline-none cursor-not-allowed" />
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 4: FINANSIAL (D) ================= */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-primary">D. Data Finansial</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium mb-1">Nama Bank Baru</label>
                  <input {...register('nama_bank')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nomor Rekening Baru</label>
                  <input type="number" {...register('nomor_rekening')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                </div>
              </div>
            </div>
          )}

          {/* --- TOMBOL NAVIGASI BAWAH --- */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            {currentStep > 0 ? (
              <button type="button" onClick={prevStep} className="flex items-center gap-2 px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                <ChevronLeft size={20} /> Kembali
              </button>
            ) : (
              <button type="button" onClick={() => navigate('/pengaturan')} className="flex items-center gap-2 px-6 py-2 text-gray-500 hover:text-gray-700 transition-colors">
                Batal
              </button>
            )}

            {currentStep < steps.length - 1 ? (
              <button type="button" onClick={nextStep} className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:brightness-110 shadow-md transition-all">
                Lanjut <ChevronRight size={20} />
              </button>
            ) : (
              <button type="submit" className="flex items-center gap-2 px-8 py-2 bg-secondary text-white rounded-lg hover:brightness-110 font-bold shadow-lg shadow-green-200 transition-all">
                <Save size={20} /> Ajukan Perubahan
              </button>
            )}
          </div>

        </form>
      </div>
    </div>
  );
}