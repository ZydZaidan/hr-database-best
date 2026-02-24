import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { User, BookOpen, Briefcase, Wallet, ChevronLeft, ChevronRight, Save, Award, Plus, Trash2, Link as LinkIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EditEmployee() {
  const navigate = useNavigate();
  const { id } = useParams(); // Ambil ID dari URL (contoh: /edit-karyawan/5)
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2024 + 1 }, (_, i) => 2024 + i);
  
  const { register, trigger, control, handleSubmit, reset } = useForm({
    defaultValues: {
      karir_dinamis: [],
      sk_dinamis: [],
      talenta_dinamis: [],
      bukti_talenta_dinamis: [],
      kompetensi_dinamis: []
    }
  });

  const { fields: karirFields, append: appendKarir, remove: removeKarir } = useFieldArray({ control, name: "karir_dinamis" });
  const { fields: skFields, append: appendSk, remove: removeSk } = useFieldArray({ control, name: "sk_dinamis" });
  const { fields: talentaFields, append: appendTalenta, remove: removeTalenta } = useFieldArray({ control, name: "talenta_dinamis" });
  const { fields: buktiTalentaFields, append: appendBuktiTalenta, remove: removeBuktiTalenta } = useFieldArray({ control, name: "bukti_talenta_dinamis" });
  const { fields: kompetensiFields, append: appendKompetensi, remove: removeKompetensi } = useFieldArray({ control, name: "kompetensi_dinamis" });

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

  // ==========================================
  // AMBIL DATA LAMA BUAT DIISI KE FORM
  // ==========================================
  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const response = await fetch(`https://absensi-backend-production-6002.up.railway.app/api/karyawan/${id}`);
        const result = await response.json();

        if (response.ok) {
          const emp = result.data || result;
          
          // Pecah TTL jadi tempat dan tanggal
          const ttlSplit = emp.ttl ? emp.ttl.split(', ') : ['', ''];
          
          // Ngisi form otomatis (Pre-fill)
          reset({
            nama: emp.nama,
            nik_ktp: emp.nik_ktp,
            nik_karyawan: emp.nik_karyawan !== '-' ? emp.nik_karyawan : '',
            jenis_kelamin: emp.jenis_kelamin === 'Laki-laki' ? 'L' : 'P',
            tempat_lahir: ttlSplit[0] || '',
            tanggal_lahir: ttlSplit[1] || '',
            agama: emp.agama,
            no_hp: emp.no_hp,
            status_ptkp: emp.status_ptkp,
            emergency_contact_nama: emp.emergency_contact,
            emergency_contact_hubungan: emp.hubungan_emergency,
            alamat_domisili: emp.alamat_domisili,

            jenjang_pendidikan: emp.jenjang_pendidikan,
            nama_pendidikan: emp.nama_sekolah,
            tahun_lulus: emp.tahun_lulus,
            keterangan_lulus: emp.keterangan_lulus,
            ipk: emp.ipk_nilai,
            diklat_pt_best: emp.diklat_ptbest !== '-' ? emp.diklat_ptbest : '',

            status_pegawai: emp.status_pegawai,
            level_grade: emp.level_grade !== '-' ? emp.level_grade : '',
            jabatan_struktural: emp.jabatan_structural !== '-' ? emp.jabatan_structural : '',
            review_kpi: emp.review_kpi !== '-' ? emp.review_kpi : '',

            // Data Dinamis
            karir_dinamis: emp.jenjang_karir_json || [],
            sk_dinamis: emp.sk_direksi_json || [],
            talenta_dinamis: emp.talenta_history_json || [],
            bukti_talenta_dinamis: emp.bukti_talenta_json || [],
            kompetensi_dinamis: emp.kompetensi_json || [],

            nama_bank: emp.nama_bank,
            nomor_rekening: emp.no_rekening,
            npwp: emp.npwp,
            gaji_pokok_p1: emp.gaji_p1,
            tunjangan_p2: emp.gaji_p2,
            thr: emp.thr,
            bonus: emp.bonus,
            uang_cuti: emp.uang_cuti,
            no_bpjs_kesehatan: emp.bpjs_kesehatan,
            no_bpjs_ketenagakerjaan: emp.bpjs_ketenagakerjaan,
          });
        } else {
          toast.error('Gagal mengambil data karyawan.');
          navigate('/karyawan');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Koneksi terputus saat mengambil data.');
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchEmployeeData();
  }, [id, reset, navigate]);

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
  // LOGIKA SIMPAN PERUBAHAN (UPDATE API)
  // ==========================================
  const onSubmit = async (data) => {
    const loadingToast = toast.loading('Menyimpan perubahan data...');

    let otomatisStatusPegawai = 'Internship';
    if (role === 'pkwt') otomatisStatusPegawai = 'PKWT';
    if (role === 'pkwtt') otomatisStatusPegawai = 'PKWTT';

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

      jenjang_pendidikan: data.jenjang_pendidikan || null,
      nama_sekolah: data.nama_pendidikan || null,
      tahun_lulus: data.tahun_lulus || null,
      keterangan_lulus: data.keterangan_lulus || null,
      ipk_nilai: parseFloat(data.ipk) || 0,
      diklat_ptbest: data.diklat_pt_best || '-',

      status_pegawai: data.status_pegawai || otomatisStatusPegawai, 
      level_grade: data.level_grade || '-', 
      jabatan_structural: data.jabatan_struktural || '-', 
      review_kpi: data.review_kpi || '-',
      
      jenjang_karir_json: data.karir_dinamis || [],
      talenta_history_json: data.talenta_dinamis || [],
      sk_direksi_json: data.sk_dinamis || [],
      bukti_talenta_json: data.bukti_talenta_dinamis || [],
      kompetensi_json: data.kompetensi_dinamis || [],
      
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

    try {
      // NOTE: Default pakai method PUT. Kalau Laravel temen lu mintanya POST, ganti 'PUT' jadi 'POST'
      const response = await fetch(`https://absensi-backend-production-6002.up.railway.app/api/karyawan/${id}`, {
        method: 'PUT', 
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payloadToBE) 
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Perubahan data berhasil disimpan!', { id: loadingToast });
        navigate('/karyawan'); // Balik ke halaman tabel admin
      } else {
        toast.error('Gagal update: ' + (result.message || 'Cek database'), { id: loadingToast });
      }
    } catch {
      toast.error('Gagal menghubungi server!', { id: loadingToast });
    }
  };

  if (isLoadingData) {
    return <div className="min-h-screen flex justify-center items-center font-bold text-gray-500">Memuat Data Karyawan...</div>;
  }

  // ==========================================
  // RENDER UI (SAMA PERSIS KAYAK ADD EMPLOYEE)
  // ==========================================
  return (
    <div className="max-w-5xl mx-auto pb-10">
      <div className="mb-8 bg-white p-6 rounded-xl shadow-sm border">
        <h1 className="text-2xl font-bold mb-2 text-gray-800">Edit Data Karyawan</h1>
        <p className="text-gray-500 text-sm mb-6">Perbarui informasi profil dan riwayat karyawan.</p>
        
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
        <form onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault() }}>
          
          {/* ================= STEP A: DATA PRIBADI ================= */}
          {steps[currentStep].id === 'A' && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-primary">A. Data Pribadi (Induk)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div><label className="block text-sm font-medium mb-1">Nama Lengkap *</label><input {...register('nama', { required: true })} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" /></div>
                <div><label className="block text-sm font-medium mb-1">NIK KTP *</label><input type="number" {...register('nik_ktp', { required: true })} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" /></div>
                <div><label className="block text-sm font-medium mb-1 text-gray-600">NIK Karyawan</label><input {...register('nik_karyawan')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none bg-gray-50" /></div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status PTKP</label>
                  <select {...register('status_ptkp')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none">
                    <option value="TK/0">TK/0</option><option value="K/0">K/0</option><option value="K/1">K/1</option><option value="K/2">K/2</option><option value="K/3">K/3</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="block text-sm font-medium mb-1">Tempat Lahir</label><input {...register('tempat_lahir')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" /></div>
                  <div><label className="block text-sm font-medium mb-1">Tanggal Lahir</label><input type="date" {...register('tanggal_lahir')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" /></div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Jenis Kelamin</label>
                  <select {...register('jenis_kelamin')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none">
                    <option value="L">Laki-laki</option><option value="P">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Agama</label>
                  <select {...register('agama')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none">
                    <option value="Islam">Islam</option><option value="Kristen">Kristen</option><option value="Katolik">Katolik</option><option value="Hindu">Hindu</option><option value="Buddha">Buddha</option><option value="Konghucu">Konghucu</option>
                  </select>
                </div>
                <div><label className="block text-sm font-medium mb-1">No. Handphone</label><input type="number" {...register('no_hp')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" /></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="block text-sm font-medium mb-1">Kontak Darurat (Nama)</label><input {...register('emergency_contact_nama')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" /></div>
                  <div><label className="block text-sm font-medium mb-1">Hubungan</label><input {...register('emergency_contact_hubungan')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" /></div>
                </div>
                <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Alamat Domisili</label><textarea {...register('alamat_domisili')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none h-20"></textarea></div>
              </div>
            </div>
          )}

          {/* ================= STEP B: PENDIDIKAN ================= */}
          {steps[currentStep].id === 'B' && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-primary">B. Pendidikan & Diklat</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium mb-1">Jenjang Pendidikan Terakhir</label>
                  <select {...register('jenjang_pendidikan')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none">
                    <option value="SD">SD</option><option value="SMP">SMP</option><option value="SMA">SMA/SMK</option><option value="DIPLOMA">DIPLOMA</option><option value="S1">S1</option><option value="S2">S2</option><option value="S3">S3</option>
                  </select>
                </div>
                <div><label className="block text-sm font-medium mb-1">Nama Institusi Pendidikan</label><input {...register('nama_pendidikan')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" /></div>
                <div><label className="block text-sm font-medium mb-1">Tahun Lulus</label><input type="number" {...register('tahun_lulus')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" /></div>
                <div>
                  <label className="block text-sm font-medium mb-1">Keterangan Kelulusan</label>
                  <select {...register('keterangan_lulus')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none">
                    <option value="Lulus">Lulus</option><option value="Sedang Menempuh">Sedang Menempuh</option><option value="Tidak Lulus">Tidak Lulus</option>
                  </select>
                </div>
                <div><label className="block text-sm font-medium mb-1">IPK / Nilai</label><input step="0.01" type="number" {...register('ipk')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" /></div>
                <div><label className="block text-sm font-medium mb-1">Diklat PT. Best</label><input {...register('diklat_pt_best')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" /></div>
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
                    <option value="PKWT">PKWT</option><option value="PKWTT">PKWTT</option><option value="Internship">Internship</option>
                  </select>
                </div>
                <div><label className="block text-sm font-medium mb-1">Level / Grade</label><input {...register('level_grade')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" /></div>
                <div><label className="block text-sm font-medium mb-1">Jabatan Struktural</label><input {...register('jabatan_struktural')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" /></div>
                <div><label className="block text-sm font-medium mb-1">Review Hasil KPI</label><input {...register('review_kpi')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" /></div>
              </div>

              {/* Dinamis Area */}
              <div className="border border-gray-200 rounded-xl p-5 bg-gray-50/50">
                <div className="flex items-center justify-between mb-4 border-b pb-3"><h4 className="font-bold text-gray-700">Jenjang Karir</h4><button type="button" onClick={() => appendKarir({ tahun: '', tipe: 'Basic' })} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm"><Plus size={16} /> Tambah</button></div>
                <div className="space-y-3">
                  {karirFields.map((field, index) => (
                    <div key={field.id} className="flex gap-3 items-center">
                      <div className="w-10 flex justify-center"><button type="button" onClick={() => removeKarir(index)} className="p-2 text-red-500"><Trash2 size={18} /></button></div>
                      <input {...register(`karir_dinamis.${index}.tahun`)} className="flex-1 p-2 border rounded-lg" placeholder="Cth: 2020-2022" />
                      <select {...register(`karir_dinamis.${index}.tipe`)} className="flex-1 p-2 border rounded-lg"><option value="Basic">Basic</option><option value="Spesific">Spesific</option><option value="System">System</option></select>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-orange-200 rounded-xl p-5 bg-orange-50/30">
                <div className="flex items-center justify-between mb-4 border-b border-orange-200 pb-3"><h4 className="font-bold text-orange-800">SK Direksi</h4><button type="button" onClick={() => appendSk({ nama_sk: 'PKWT', link_sk: '' })} className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-sm"><Plus size={16} /> Tambah</button></div>
                <div className="space-y-3">
                  {skFields.map((field, index) => (
                    <div key={field.id} className="flex gap-3 items-center">
                      <div className="w-10 flex justify-center"><button type="button" onClick={() => removeSk(index)} className="p-2 text-red-500"><Trash2 size={18} /></button></div>
                      <select {...register(`sk_dinamis.${index}.nama_sk`)} className="flex-1 p-2 border border-orange-200 rounded-lg"><option value="PKWT">PKWT</option><option value="PKWTT">PKWTT</option><option value="Promosi">Promosi</option></select>
                      <input {...register(`sk_dinamis.${index}.link_sk`)} className="flex-1 p-2 border border-orange-200 rounded-lg" placeholder="Link GDrive..." />
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-blue-200 rounded-xl p-5 bg-blue-50/30">
                <div className="flex items-center justify-between mb-4 border-b border-blue-200 pb-3"><h4 className="font-bold text-blue-800">Penilaian Talenta</h4><button type="button" onClick={() => appendTalenta({ semester: 'Sem 1', tahun: currentYear.toString(), status: 'Standar' })} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm"><Plus size={16} /> Tambah</button></div>
                <div className="space-y-3">
                  {talentaFields.map((field, index) => (
                    <div key={field.id} className="flex gap-3 items-center">
                      <div className="w-10 flex justify-center"><button type="button" onClick={() => removeTalenta(index)} className="p-2 text-red-500"><Trash2 size={18} /></button></div>
                      <select {...register(`talenta_dinamis.${index}.semester`)} className="w-1/4 p-2 border border-blue-200 rounded-lg"><option value="Sem 1">Sem 1</option><option value="Sem 2">Sem 2</option></select>
                      <select {...register(`talenta_dinamis.${index}.tahun`)} className="w-1/4 p-2 border border-blue-200 rounded-lg">{years.map(year => (<option key={year} value={year}>{year}</option>))}</select>
                      <select {...register(`talenta_dinamis.${index}.status`)} className="flex-1 p-2 border border-blue-200 rounded-lg"><option value="Optimal">Optimal</option><option value="Potensial">Potensial</option><option value="Standar">Standar</option><option value="Kurang">Kurang</option></select>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-purple-200 rounded-xl p-5 bg-purple-50/30">
                <div className="flex items-center justify-between mb-4 border-b border-purple-200 pb-3"><h4 className="font-bold text-purple-800">Bukti Talenta</h4><button type="button" onClick={() => appendBuktiTalenta({ tahun: '', link_bukti: '' })} className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm"><Plus size={16} /> Tambah</button></div>
                <div className="space-y-3">
                  {buktiTalentaFields.map((field, index) => (
                    <div key={field.id} className="flex gap-3 items-center">
                      <div className="w-10 flex justify-center"><button type="button" onClick={() => removeBuktiTalenta(index)} className="p-2 text-red-500"><Trash2 size={18} /></button></div>
                      <input {...register(`bukti_talenta_dinamis.${index}.tahun`)} className="flex-1 p-2 border border-purple-200 rounded-lg" placeholder="Tahun" />
                      <input {...register(`bukti_talenta_dinamis.${index}.link_bukti`)} className="flex-1 p-2 border border-purple-200 rounded-lg" placeholder="Link Bukti..." />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP D: FINANSIAL ================= */}
          {steps[currentStep].id === 'D' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div><label className="block text-sm font-medium mb-1">Nama Bank</label><input {...register('nama_bank')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" /></div>
                <div><label className="block text-sm font-medium mb-1">Nomor Rekening</label><input type="number" {...register('nomor_rekening')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" /></div>
                <div><label className="block text-sm font-medium mb-1">Gaji Pokok (P1)</label><input type="number" {...register('gaji_pokok_p1')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" /></div>
                <div><label className="block text-sm font-medium mb-1">Tunjangan (P2)</label><input type="number" {...register('tunjangan_p2')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" /></div>
                <div><label className="block text-sm font-medium mb-1">THR</label><input type="number" {...register('thr')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" /></div>
                <div><label className="block text-sm font-medium mb-1">Bonus</label><input type="number" {...register('bonus')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" /></div>
                <div><label className="block text-sm font-medium mb-1">Uang Cuti</label><input type="number" {...register('uang_cuti')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" /></div>
                <div><label className="block text-sm font-medium mb-1">NPWP</label><input {...register('npwp')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" /></div>
                <div><label className="block text-sm font-medium mb-1">No. BPJS Kesehatan</label><input type="number" {...register('no_bpjs_kesehatan')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" /></div>
                <div><label className="block text-sm font-medium mb-1">No. BPJS Ketenagakerjaan</label><input type="number" {...register('no_bpjs_ketenagakerjaan')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" /></div>
              </div>
            </div>
          )}

          {/* ================= STEP E: KOMPETENSI EKSTERNAL ================= */}
          {steps[currentStep].id === 'E' && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-primary">E. Kompetensi Eksternal</h3>
              <div className="border border-teal-200 rounded-xl p-5 bg-teal-50/30">
                <div className="flex items-center justify-between mb-4 border-b border-teal-200 pb-3"><h4 className="font-bold text-teal-800">Sertifikat / Kompetensi</h4><button type="button" onClick={() => appendKompetensi({ jenis: 'Brevet Pajak', link_sertifikat: '' })} className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-100 text-teal-700 rounded-lg text-sm"><Plus size={16} /> Tambah</button></div>
                <div className="space-y-3">
                  {kompetensiFields.map((field, index) => (
                    <div key={field.id} className="flex gap-3 items-center">
                      <div className="w-10 flex justify-center"><button type="button" onClick={() => removeKompetensi(index)} className="p-2 text-red-500"><Trash2 size={18} /></button></div>
                      <select {...register(`kompetensi_dinamis.${index}.jenis`)} className="flex-1 p-2 border border-teal-200 rounded-lg"><option value="Brevet Pajak">Brevet Pajak</option><option value="Bootcamp IT">Bootcamp IT</option><option value="Seminar HR">Seminar HR</option><option value="Jurnal Publikasi">Jurnal Publikasi</option><option value="Lainnya">Lainnya</option></select>
                      <input {...register(`kompetensi_dinamis.${index}.link_sertifikat`)} className="flex-1 p-2 border border-teal-200 rounded-lg" placeholder="Link Sertifikat..." />
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
              <button type="button" onClick={handleSubmit(onSubmit)} className="flex items-center gap-2 px-8 py-2 bg-secondary text-white rounded-lg hover:brightness-110 font-bold shadow-lg shadow-green-200 transition-all">
                <Save size={20} /> Simpan Perubahan
              </button>
            )}
          </div>

        </form>
      </div>
    </div>
  );
}