import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { User, BookOpen, Briefcase, Wallet, ChevronLeft, ChevronRight, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AddEmployee() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  
  const { register, handleSubmit, trigger} = useForm();

  // Penyesuaian Step sesuai arahan A-E
  const steps = [
    { title: 'Data Pribadi (A)', icon: User },
    { title: 'Pendidikan & Kompetensi (B & E)', icon: BookOpen },
    { title: 'Data Karir (C)', icon: Briefcase },
    { title: 'Data Finansial (D)', icon: Wallet },
  ];

  const nextStep = async () => {
    const isValid = await trigger(); 
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));
//+++++++++++++++++++++++++++++++
const onSubmit = (data) => {
    // 1. Tampilkan loading
    const loadingToast = toast.loading('Memproses dan menyamakan data dengan Database...');

    // 2. BIKIN PAYLOAD MAPPING (DTO)
    const payloadToBE = {
      // --- A. Data Pribadi & Identitas ---
      nama: data.nama,
      nik_ktp: data.nik_ktp,
      nik_karyawan: data.nik_karyawan,
      jenis_kelamin: data.jenis_kelamin,
      // Gabung tempat dan tanggal lahir jadi 1 string "ttl"
      ttl: `${data.tempat_lahir}, ${data.tanggal_lahir}`, 
      agama: data.agama,
      no_hp: data.no_hp,
      status_ptkp: data.status_ptkp,
      emergency_contact: data.emergency_contact_nama,
      hubungan_emergency: data.emergency_contact_hubungan,
      alamat_domisili: data.alamat_domisili,

      // --- B. Pendidikan & Diklat ---
      jenjang_pendidikan: data.jenjang_pendidikan,
      nama_sekolah: data.nama_pendidikan,
      // Pastikan IPK jadi tipe Float (Desimal)
      ipk_nilai: parseFloat(data.ipk) || 0, 
      diklat_ptbest: data.diklat_pt_best || '-',

      // --- C. Karir & Talenta ---
      status_pegawai: data.status_pegawai,
      level_grade: data.level_grade,
      jabatan_structural: data.jabatan_struktural, // Penyesuaian huruf 'c'
      jenjang_karir_histori: data.jenjang_karir,
      // Talenta diubah jadi JSON String
      talenta_history: JSON.stringify({
        "Sem I 2024": data.talenta_sem1 || "Standar",
        "Sem II 2024": data.talenta_sem2 || "Standar"
      }),
      review_kpi: data.review_kpi,

      // --- D. Finansial & Benefit ---
      nama_bank: data.nama_bank,
      no_rekening: data.nomor_rekening,
      npwp: data.npwp,
      // Pastikan string angka diubah jadi Integer
      gaji_p1: parseInt(data.gaji_pokok_p1) || 0,
      gaji_p2: parseInt(data.tunjangan_p2) || 0,
      // THR dan Bonus dijumlahkan sesuai request BE
      thr_bonus: (parseInt(data.thr) || 0) + (parseInt(data.bonus) || 0),
      uang_cuti: parseInt(data.uang_cuti) || 0,
      bpjs_kesehatan: data.no_bpjs_kesehatan,
      bpjs_ketenagakerjaan: data.no_bpjs_ketenagakerjaan,

      // --- E. Kompetensi & Lain-lain ---
      brevet_pajak: data.kompetensi_brevet || '-',
      // Seminar dan Bootcamp digabung pakai pemisah ( | )
      seminar_bootcamp_ext: `${data.kompetensi_seminar || '-'} | ${data.kompetensi_bootcamp || '-'}`,
      jurnal_publikasi: data.kompetensi_jurnal || '-',
      kompetensi_lainnya: '-' // Default kosong kalau ngga ada inputannya
    };

    // 3. Simulasi Kirim API (Nanti kita ganti pakai Axios)
    console.log("🔥 Payload Siap Tembak API:", payloadToBE);
    
    setTimeout(() => {
      toast.dismiss(loadingToast);
      toast.success(`Berhasil! Data ${payloadToBE.nama} siap masuk database Supabase.`);
      // Nanti setelah axios sukses, baru kita navigate
      navigate('/karyawan'); 
    }, 2000);
  };

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <div className="mb-8 bg-white p-6 rounded-xl shadow-sm border">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Registrasi Karyawan Baru</h1>
        
        {/* Indikator Stepper */}
        <div className="flex justify-between items-center relative px-4">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 -z-10"></div>
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary transition-all duration-300 -z-10"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          ></div>
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index <= currentStep;
            return (
              <div key={index} className="flex flex-col items-center gap-2 bg-white px-2">
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 transition-colors ${
                  isActive ? 'bg-primary border-primary text-white' : 'bg-white border-gray-300 text-gray-400'
                }`}>
                  <Icon size={20} />
                </div>
                <span className={`text-[10px] md:text-xs font-medium text-center ${isActive ? 'text-primary' : 'text-gray-400'}`}>
                  {step.title}
                </span>
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
                <div>
                  <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
                  <input {...register('nama', { required: true })} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="Nama Lengkap" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">NIK Karyawan (Unik)</label>
                  <input {...register('nik_karyawan', { required: true })} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="ID Karyawan dari PT" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">NIK KTP</label>
                  <input type="number" {...register('nik_ktp', { required: true, minLength: 16 })} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="16 Digit NIK KTP" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Tempat Lahir</label>
                    <input {...register('tempat_lahir')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="Kota" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Tanggal Lahir</label>
                    <input type="date" {...register('tanggal_lahir')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Jenis Kelamin</label>
                  <select {...register('jenis_kelamin')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none">
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Agama</label>
                  <select {...register('agama')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none">
                    <option value="Islam">Islam</option>
                    <option value="Kristen">Kristen</option>
                    <option value="Katolik">Katolik</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Buddha">Buddha</option>
                    <option value="Konghucu">Konghucu</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status PTKP</label>
                  <select {...register('status_ptkp')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none">
                    <option value="TK/0">TK/0 (Tidak Kawin, 0 Tanggungan)</option>
                    <option value="K/0">K/0 (Kawin, 0 Tanggungan)</option>
                    <option value="K/1">K/1 (Kawin, 1 Tanggungan)</option>
                    <option value="K/2">K/2 (Kawin, 2 Tanggungan)</option>
                    <option value="K/3">K/3 (Kawin, 3 Tanggungan)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">No. Handphone</label>
                  <input type="number" {...register('no_hp')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="08..." />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Kontak Darurat (Nama)</label>
                    <input {...register('emergency_contact_nama')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="Nama" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Hubungan</label>
                    <input {...register('emergency_contact_hubungan')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="Ayah/Ibu/Istri" />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Alamat Domisili</label>
                  <textarea {...register('alamat_domisili')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none h-20" placeholder="Alamat lengkap..."></textarea>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 2: PENDIDIKAN & KOMPETENSI (B & E) ================= */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-primary">B. Pendidikan</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium mb-1">Jenjang Pendidikan Terakhir</label>
                    <select {...register('jenjang_pendidikan')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none">
                      <option value="SD">SD</option>
                      <option value="SMP">SMP</option>
                      <option value="SMA">SMA/SMK</option>
                      <option value="DIPLOMA">DIPLOMA</option>
                      <option value="S1">S1</option>
                      <option value="S2">S2</option>
                      <option value="S3">S3</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Nama Institusi Pendidikan</label>
                    <input {...register('nama_pendidikan')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="Contoh: Universitas Indonesia" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">IPK / Nilai</label>
                    <input step="0.01" type="number" {...register('ipk')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="Contoh: 3.50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Diklat PT. Best</label>
                    <input {...register('diklat_pt_best')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="Riwayat diklat internal" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-primary">E. Kompetensi Eksternal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium mb-1">Brevet Pajak</label>
                    <input {...register('kompetensi_brevet')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="Ada/Tidak (Sebutkan levelnya)" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Riwayat Seminar</label>
                    <input {...register('kompetensi_seminar')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="Sebutkan..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Riwayat Bootcamp</label>
                    <input {...register('kompetensi_bootcamp')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="Sebutkan..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Publikasi Jurnal</label>
                    <input {...register('kompetensi_jurnal')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="Sebutkan jika ada..." />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 3: KARIR (C) ================= */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-primary">C. Karir & Kinerja</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium mb-1">Status Pegawai</label>
                  <select {...register('status_pegawai')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none">
                    <option value="PKWT">PKWT (Kontrak)</option>
                    <option value="PKWTT">PKWTT (Tetap)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Level / Grade</label>
                  <input {...register('level_grade')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="Contoh: Grade 3 / Staff" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Jabatan Struktural</label>
                  <input {...register('jabatan_struktural')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="Posisi Saat Ini" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Review Hasil KPI</label>
                  <input {...register('review_kpi')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="Skor / Hasil evaluasi terakhir" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Jenjang Karir (Histori)</label>
                  <textarea {...register('jenjang_karir')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none h-20" placeholder="Ceritakan histori dari awal gabung PT. Best sampai sekarang..."></textarea>
                </div>
                <div className="md:col-span-2 border p-4 rounded-lg bg-gray-50">
                  <label className="block text-sm font-bold mb-2 text-gray-700">Penilaian Talenta</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium mb-1">Semester I 2024</label>
                      <input {...register('talenta_sem1')} defaultValue="Standar" className="w-full p-2 border rounded focus:ring-2 focus:ring-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Semester II 2024</label>
                      <input {...register('talenta_sem2')} defaultValue="Standar" className="w-full p-2 border rounded focus:ring-2 focus:ring-primary outline-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 4: FINANSIAL (D) ================= */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-4 text-sm text-red-800 font-medium">
                ⚠️ D. Data Finansial: Informasi Rahasia. Pastikan validasi data sebelum menyimpan.
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium mb-1">Nama Bank</label>
                  <input {...register('nama_bank')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="Contoh: BCA / Mandiri" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nomor Rekening</label>
                  <input type="number" {...register('nomor_rekening')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Gaji Pokok (P1)</label>
                  <input type="number" {...register('gaji_pokok_p1')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="Rp." />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tunjangan (P2)</label>
                  <input type="number" {...register('tunjangan_p2')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="Rp." />
                </div>
                <div className="grid grid-cols-3 gap-2 md:col-span-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">THR</label>
                    <input type="number" {...register('thr')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Bonus</label>
                    <input type="number" {...register('bonus')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Uang Cuti</label>
                    <input type="number" {...register('uang_cuti')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">NPWP</label>
                  <input {...register('npwp')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="Nomor NPWP" />
                </div>
                <div className="grid grid-cols-2 gap-2 md:col-span-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">No. BPJS Kesehatan</label>
                    <input type="number" {...register('no_bpjs_kesehatan')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">No. BPJS Ketenagakerjaan</label>
                    <input type="number" {...register('no_bpjs_ketenagakerjaan')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                  </div>
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
            ) : <div></div>}

            {currentStep < steps.length - 1 ? (
              <button type="button" onClick={nextStep} className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:brightness-110 shadow-md transition-all">
                Lanjut <ChevronRight size={20} />
              </button>
            ) : (
              <button type="submit" className="flex items-center gap-2 px-8 py-2 bg-secondary text-white rounded-lg hover:brightness-110 font-bold shadow-lg shadow-green-200 transition-all">
                <Save size={20} /> Simpan Semua Data
              </button>
            )}
          </div>

        </form>
      </div>
    </div>
  );
}