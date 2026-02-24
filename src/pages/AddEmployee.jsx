import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { User, BookOpen, Briefcase, Wallet, ChevronLeft, ChevronRight, Save, Award, Plus, Trash2, Link as LinkIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AddEmployee() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2024 + 1 }, (_, i) => 2024 + i);
  
  // 1. SETUP DEFAULT VALUES (Nambahin handleSubmit di mari)
  const { register, trigger, control, handleSubmit } = useForm({
    defaultValues: {
      karir_dinamis: [{ tahun: '', tipe: 'Basic' }],
      sk_dinamis: [{ nama_sk: 'PKWT', link_sk: '' }],
      talenta_dinamis: [{ semester: 'Sem 1', tahun: currentYear.toString(), status: 'Standar' }],
      bukti_talenta_dinamis: [{ tahun: '', link_bukti: '' }],
      kompetensi_dinamis: [{ jenis: 'Brevet Pajak', link_sertifikat: '' }]
    }
  });

  // 2. DAFTARIN SEMUA FIELD ARRAY NYA
  const { fields: karirFields, append: appendKarir, remove: removeKarir } = useFieldArray({ control, name: "karir_dinamis" });
  const { fields: skFields, append: appendSk, remove: removeSk } = useFieldArray({ control, name: "sk_dinamis" });
  const { fields: talentaFields, append: appendTalenta, remove: removeTalenta } = useFieldArray({ control, name: "talenta_dinamis" });
  const { fields: buktiTalentaFields, append: appendBuktiTalenta, remove: removeBuktiTalenta } = useFieldArray({ control, name: "bukti_talenta_dinamis" });
  const { fields: kompetensiFields, append: appendKompetensi, remove: removeKompetensi } = useFieldArray({ control, name: "kompetensi_dinamis" });

  // ==========================================
  // LOGIKA PENGECEKAN ROLE
  // ==========================================
  const role = localStorage.getItem('userRole') || '';
  const isAdmin = role === 'admin';
  const isPKWTT = role === 'pkwtt';

  const steps = (isAdmin || isPKWTT) 
    ? [
        { id: 'A', title: 'Data Pribadi', icon: User },
        { id: 'B', title: 'Pendidikan', icon: BookOpen },
        { id: 'C', title: 'Karir & Talenta', icon: Briefcase },
        { id: 'D', title: 'Finansial', icon: Wallet },
        { id: 'E', title: 'Kompetensi', icon: Award },
      ]
    : [
        { id: 'A', title: 'Data Pribadi', icon: User },
        { id: 'D', title: 'Finansial', icon: Wallet },
      ];

  const nextStep = async () => {
    const isValid = await trigger(); 
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    } else {
      toast.error('Ada data wajib yang belum diisi!');
    }
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  // ==========================================
  // LOGIKA SUBMIT API 100% SESUAI BE LARAVEL BARU
  // ==========================================
  const onSubmit = async (data) => {
    const loadingToast = toast.loading('Sedang mengirim data ke server Railway...');

    // Bikin mapping status otomatis berdasarkan role login
  let otomatisStatusPegawai = 'Internship';
  if (role === 'pkwt') otomatisStatusPegawai = 'PKWT';
  if (role === 'pkwtt') otomatisStatusPegawai = 'PKWTT';
  if (role === 'thl') otomatisStatusPegawai = 'THL';
  if (role === 'konsultan') otomatisStatusPegawai = 'Konsultan';

  // Mapping persis sama $fillable di KaryawanProfile Laravel
  const payloadToBE = {
    nik_ktp: data.nik_ktp,
    nik_karyawan: data.nik_karyawan || '-',
    nama: data.nama,
    jenis_kelamin: data.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan',
    ttl: `${data.tempat_lahir}, ${data.tanggal_lahir}`,
    agama: data.agama,
    no_hp: data.no_hp,
    status_ptkp: data.status_ptkp,
    emergency_contact: data.emergency_contact_nama,
    hubungan_emergency: data.emergency_contact_hubungan,
    alamat_domisili: data.alamat_domisili,

    // Step B (Bisa Kosong untuk Non-PKWTT)
    jenjang_pendidikan: data.jenjang_pendidikan || null,
    nama_sekolah: data.nama_pendidikan || null,
    tahun_lulus: data.tahun_lulus || null,
    keterangan_lulus: data.keterangan_lulus || null,
    ipk_nilai: parseFloat(data.ipk) || 0,
    diklat_ptbest: data.diklat_pt_best || '-',

    // Step C (Status otomatis diambil dari role login kalo nggak ngelewatin step ini)
    status_pegawai: data.status_pegawai || otomatisStatusPegawai, 
    level_grade: data.level_grade || '-', 
    jabatan_structural: data.jabatan_struktural || '-', 
    review_kpi: data.review_kpi || '-',
    
    // Data Array (Kasih default array kosong [] kalau undefined)
    jenjang_karir_json: data.karir_dinamis || [],
    talenta_history_json: data.talenta_dinamis || [],
    sk_direksi_json: data.sk_dinamis || [],
    bukti_talenta_json: data.bukti_talenta_dinamis || [],
    kompetensi_json: data.kompetensi_dinamis || [],
    
    // Step D (Finansial - Semua isi)
    nama_bank: data.nama_bank,
    no_rekening: data.nomor_rekening,
    npwp: data.npwp,
    gaji_p1: parseInt(data.gaji_pokok_p1) || 0,
    gaji_p2: parseInt(data.tunjangan_p2) || 0,
    thr: parseInt(data.thr) || 0,
    bonus: parseInt(data.bonus) || 0,
    uang_cuti: parseInt(data.uang_cuti) || 0,
    bpjs_kesehatan: data.no_bpjs_kesehatan,
    bpjs_ketenagakerjaan: data.no_bpjs_ketenagakerjaan,
  };
    console.log("🔥 Payload Siap Tembak API:", payloadToBE);

    try {
      const response = await fetch('https://absensi-backend-production-6002.up.railway.app/api/karyawan/save-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payloadToBE) 
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Data Berhasil Masuk ke Database Railway!', { id: loadingToast });

        localStorage.setItem('isProfileComplete', 'true');

        navigate('/');
      } else {
        console.error("Error dari Server:", result);
        toast.error('Gagal simpan: ' + (result.message || 'Cek koneksi database'), { id: loadingToast });
      }
    } catch (error) {
      console.error("Network Error:", error);
      toast.error('Gagal menghubungi server Railway!', { id: loadingToast });
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <div className="mb-8 bg-white p-6 rounded-xl shadow-sm border">
        <h1 className="text-2xl font-bold mb-2 text-gray-800">
          {isAdmin ? 'Registrasi Karyawan Baru' : 'Lengkapi Data Diri Anda'}
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          {isAdmin 
            ? 'Isi formulir berikut untuk menambahkan data karyawan ke sistem.'
            : 'Silakan isi data yang diperlukan untuk kelengkapan administrasi Anda.'}
        </p>
        
        {/* Indikator Stepper */}
        <div className={`flex justify-between items-center relative px-4 mx-auto ${steps.length <= 2 ? 'max-w-lg' : 'w-full'}`}>
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
        {/* MATIIN FUNGSI ENTER BAWAAN BIAR GAK NYELONONG (onKeyDown) */}
        <form onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault() }}>
          
          {/* ================= STEP A: DATA PRIBADI ================= */}
          {steps[currentStep].id === 'A' && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-primary">A. Data Pribadi (Induk)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium mb-1">Nama Lengkap <span className="text-red-500">*</span></label>
                  <input {...register('nama', { required: true })} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="Nama Lengkap" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">NIK KTP <span className="text-red-500">*</span></label>
                  <input type="number" {...register('nik_ktp', { required: true, minLength: 16 })} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="16 Digit NIK KTP (Wajib)" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-600">NIK Karyawan <span className="text-xs text-gray-400">(Opsional)</span></label>
                  <input {...register('nik_karyawan')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none bg-gray-50" placeholder="ID Karyawan dari PT" />
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

          {/* ================= STEP B: PENDIDIKAN ================= */}
          {steps[currentStep].id === 'B' && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-primary">B. Pendidikan & Diklat Internal</h3>
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
                  <label className="block text-sm font-medium mb-1">Tahun Lulus</label>
                  <input type="number" {...register('tahun_lulus')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="Contoh: 2023" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Keterangan Kelulusan</label>
                  <select {...register('keterangan_lulus')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none">
                    <option value="Lulus">Lulus (Sudah Lulus)</option>
                    <option value="Sedang Menempuh">Sedang Menempuh (Belum Lulus)</option>
                    <option value="Tidak Lulus">Tidak Lulus / Putus Studi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">IPK / Nilai</label>
                  <input step="0.01" type="number" {...register('ipk')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="Contoh: 3.50" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Diklat PT. Best (Internal)</label>
                  <input {...register('diklat_pt_best')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="Riwayat diklat internal" />
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP C: KARIR & KINERJA ================= */}
          {steps[currentStep].id === 'C' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-lg font-semibold border-b pb-2 text-primary">C. Karir & Talenta</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Status Pegawai</label>
                  <select {...register('status_pegawai')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none">
                    <option value="PKWT">PKWT (Kontrak)</option>
                    <option value="PKWTT">PKWTT (Tetap)</option>
                    <option value="Internship">Internship (Magang)</option>
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
              </div>

              {/* 1. DINAMIS: JENJANG KARIR */}
              <div className="border border-gray-200 rounded-xl p-5 bg-gray-50/50">
                <div className="flex items-center justify-between mb-4 border-b pb-3">
                  <h4 className="font-bold text-gray-700">Jenjang Karir</h4>
                  <button type="button" onClick={() => appendKarir({ tahun: '', tipe: 'Basic' })} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-semibold text-sm border border-green-300">
                    <Plus size={16} /> Tambah Karir
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="flex gap-3 px-1">
                    <div className="w-10"></div>
                    <div className="flex-1 text-xs font-bold text-gray-500 uppercase">Rentang Tahun</div>
                    <div className="flex-1 text-xs font-bold text-gray-500 uppercase">Level / Grade</div>
                  </div>
                  {karirFields.map((field, index) => (
                    <div key={field.id} className="flex gap-3 items-center">
                      <div className="w-10 flex justify-center">
                        {karirFields.length > 1 && (
                          <button type="button" onClick={() => removeKarir(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg">
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                      <input {...register(`karir_dinamis.${index}.tahun`)} className="flex-1 p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white" placeholder="Cth: 2020 - 2022" />
                      <select {...register(`karir_dinamis.${index}.tipe`)} className="flex-1 p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white">
                        <option value="Basic">Basic</option>
                        <option value="Spesific">Spesific</option>
                        <option value="System">System</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. DINAMIS: SK DIREKSI */}
              <div className="border border-orange-200 rounded-xl p-5 bg-orange-50/30">
                <div className="flex items-center justify-between mb-4 border-b border-orange-200 pb-3">
                  <h4 className="font-bold text-orange-800">SK Direksi</h4>
                  <button type="button" onClick={() => appendSk({ nama_sk: 'PKWT', link_sk: '' })} className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors font-semibold text-sm border border-orange-300">
                    <Plus size={16} /> Tambah SK
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="flex gap-3 px-1">
                    <div className="w-10"></div>
                    <div className="flex-1 text-xs font-bold text-orange-600 uppercase">Nama SK</div>
                    <div className="flex-1 text-xs font-bold text-orange-600 uppercase">No. SK & Link GDrive</div>
                  </div>
                  {skFields.map((field, index) => (
                    <div key={field.id} className="flex gap-3 items-center">
                      <div className="w-10 flex justify-center">
                        {skFields.length > 1 && (
                          <button type="button" onClick={() => removeSk(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg">
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                      <select {...register(`sk_dinamis.${index}.nama_sk`)} className="flex-1 p-2.5 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white">
                        <option value="PKWT">PKWT</option>
                        <option value="PKWTT">PKWTT</option>
                        <option value="Promosi">Promosi / Mutasi</option>
                      </select>
                      <div className="flex-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <LinkIcon size={16} className="text-gray-400" />
                        </div>
                        <input {...register(`sk_dinamis.${index}.link_sk`)} className="w-full pl-9 p-2.5 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white" placeholder="drive.google.com/..." />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. DINAMIS: PENILAIAN TALENTA */}
              <div className="border border-blue-200 rounded-xl p-5 bg-blue-50/30">
                <div className="flex items-center justify-between mb-4 border-b border-blue-200 pb-3">
                  <h4 className="font-bold text-blue-800">Penilaian Talenta</h4>
                  <button type="button" onClick={() => appendTalenta({ semester: 'Sem 1', tahun: currentYear.toString(), status: 'Standar' })} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-semibold text-sm border border-blue-300">
                    <Plus size={16} /> Tambah Talenta
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="flex gap-3 px-1">
                    <div className="w-10"></div>
                    <div className="flex-1 text-xs font-bold text-blue-600 uppercase">Semester & Tahun</div>
                    <div className="flex-1 text-xs font-bold text-blue-600 uppercase">Nilai</div>
                  </div>
                  {talentaFields.map((field, index) => (
                    <div key={field.id} className="flex gap-3 items-center">
                      <div className="w-10 flex justify-center">
                        {talentaFields.length > 1 && (
                          <button type="button" onClick={() => removeTalenta(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg">
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                      <div className="flex-1 flex gap-2">
                        <select {...register(`talenta_dinamis.${index}.semester`)} className="w-1/2 p-2.5 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                          <option value="Sem 1">Sem 1</option>
                          <option value="Sem 2">Sem 2</option>
                        </select>
                        <select {...register(`talenta_dinamis.${index}.tahun`)} className="w-1/2 p-2.5 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                          {years.map(year => (<option key={year} value={year}>{year}</option>))}
                        </select>
                      </div>
                      <select {...register(`talenta_dinamis.${index}.status`)} className="flex-1 p-2.5 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                        <option value="Optimal">Optimal</option>
                        <option value="Potensial">Potensial</option>
                        <option value="Standar">Standar</option>
                        <option value="Kurang">Kurang</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. DINAMIS: BUKTI TALENTA */}
              <div className="border border-purple-200 rounded-xl p-5 bg-purple-50/30">
                <div className="flex items-center justify-between mb-4 border-b border-purple-200 pb-3">
                  <h4 className="font-bold text-purple-800">Bukti Talenta</h4>
                  <button type="button" onClick={() => appendBuktiTalenta({ tahun: '', link_bukti: '' })} className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-semibold text-sm border border-purple-300">
                    <Plus size={16} /> Tambah Bukti
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="flex gap-3 px-1">
                    <div className="w-10"></div>
                    <div className="flex-1 text-xs font-bold text-purple-600 uppercase">Rentang Tahun</div>
                    <div className="flex-1 text-xs font-bold text-purple-600 uppercase">Link GDrive Bukti</div>
                  </div>
                  {buktiTalentaFields.map((field, index) => (
                    <div key={field.id} className="flex gap-3 items-center">
                      <div className="w-10 flex justify-center">
                        {buktiTalentaFields.length > 1 && (
                          <button type="button" onClick={() => removeBuktiTalenta(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg">
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                      <input {...register(`bukti_talenta_dinamis.${index}.tahun`)} className="flex-1 p-2.5 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-white" placeholder="Cth: 2023 - 2024" />
                      <div className="flex-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <LinkIcon size={16} className="text-gray-400" />
                        </div>
                        <input {...register(`bukti_talenta_dinamis.${index}.link_bukti`)} className="w-full pl-9 p-2.5 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-white" placeholder="drive.google.com/..." />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ================= STEP D: FINANSIAL ================= */}
          {steps[currentStep].id === 'D' && (
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

          {/* ================= STEP E: KOMPETENSI EKSTERNAL ================= */}
          {steps[currentStep].id === 'E' && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-primary">E. Kompetensi Eksternal</h3>
              
              {/* 5. DINAMIS: KOMPETENSI */}
              <div className="border border-teal-200 rounded-xl p-5 bg-teal-50/30">
                <div className="flex items-center justify-between mb-4 border-b border-teal-200 pb-3">
                  <h4 className="font-bold text-teal-800">Sertifikat / Kompetensi</h4>
                  <button type="button" onClick={() => appendKompetensi({ jenis: 'Brevet Pajak', link_sertifikat: '' })} className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition-colors font-semibold text-sm border border-teal-300">
                    <Plus size={16} /> Tambah Kompetensi
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="flex gap-3 px-1">
                    <div className="w-10"></div>
                    <div className="flex-1 text-xs font-bold text-teal-600 uppercase">Jenis Kompetensi</div>
                    <div className="flex-1 text-xs font-bold text-teal-600 uppercase">Link GDrive Sertifikat</div>
                  </div>
                  {kompetensiFields.map((field, index) => (
                    <div key={field.id} className="flex gap-3 items-center">
                      <div className="w-10 flex justify-center">
                        {kompetensiFields.length > 1 && (
                          <button type="button" onClick={() => removeKompetensi(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg">
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                      <select {...register(`kompetensi_dinamis.${index}.jenis`)} className="flex-1 p-2.5 border border-teal-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white">
                        <option value="Brevet Pajak">Brevet Pajak</option>
                        <option value="Bootcamp IT">Bootcamp IT</option>
                        <option value="Seminar HR">Seminar HR / Leadership</option>
                        <option value="Jurnal Publikasi">Jurnal Publikasi</option>
                        <option value="Sertifikasi Lainnya">Sertifikasi Lainnya</option>
                      </select>
                      <div className="flex-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <LinkIcon size={16} className="text-gray-400" />
                        </div>
                        <input {...register(`kompetensi_dinamis.${index}.link_sertifikat`)} className="w-full pl-9 p-2.5 border border-teal-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white" placeholder="drive.google.com/..." />
                      </div>
                    </div>
                  ))}
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
              <button 
                type="button" 
                onClick={handleSubmit(onSubmit)} 
                className="flex items-center gap-2 px-8 py-2 bg-secondary text-white rounded-lg hover:brightness-110 font-bold shadow-lg shadow-green-200 transition-all"
              >
                <Save size={20} /> Simpan Semua Data
              </button>
            )}
          </div>

        </form>
      </div>
    </div>
  );
}