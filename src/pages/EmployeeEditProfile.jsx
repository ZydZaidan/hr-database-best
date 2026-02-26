import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { User, BookOpen, Briefcase, Wallet, ChevronLeft, ChevronRight, Save, Award, Plus, Trash2, Lock, Star } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EmployeeEditProfile() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2024 + 1 }, (_, i) => 2024 + i);

  const nikKtp = localStorage.getItem('nik_ktp');
  const role = localStorage.getItem('userRole') || '';
  const isPKWTT = role.toLowerCase() === 'pkwtt';

  const { register, trigger, control, handleSubmit, reset } = useForm({
    defaultValues: {
      jenjang_karir_json: [],
      sk_direksi_json: [],
      talenta_history_json: [],
      kompetensi_json: []
    }
  });

  const { fields: karirFields, append: appendKarir, remove: removeKarir } = useFieldArray({ control, name: "jenjang_karir_json" });
  const { fields: skFields, append: appendSk, remove: removeSk } = useFieldArray({ control, name: "sk_direksi_json" });
  const { fields: talentaFields, append: appendTalenta, remove: removeTalenta } = useFieldArray({ control, name: "talenta_history_json" });
  const { fields: kompetensiFields, append: appendKompetensi, remove: removeKompetensi } = useFieldArray({ control, name: "kompetensi_json" });

  const steps = isPKWTT 
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

  useEffect(() => {
    const fetchCurrentData = async () => {
      if (!nikKtp) { setIsLoading(false); return; }
      try {
        const response = await fetch(`https://absensi-backend-production-6002.up.railway.app/api/karyawan/${nikKtp}`);
        const result = await response.json();
        if (response.ok && result.data) {
          const emp = result.data;
          const ttlSplit = emp.ttl ? emp.ttl.split(', ') : ['', ''];
          
          reset({
            nama: emp.nama,
            tempat_lahir: ttlSplit[0] || '',
            tanggal_lahir: ttlSplit[1] || '',
            no_hp: emp.no_hp,
            status_ptkp: emp.status_ptkp,
            alamat_domisili: emp.alamat_domisili,
            nama_sekolah: emp.nama_sekolah,
            nama_bank: emp.nama_bank,
            no_rekening: emp.no_rekening,
            jenjang_karir_json: emp.jenjang_karir_json || [],
            sk_direksi_json: emp.sk_direksi_json || [],
            talenta_history_json: emp.talenta_history_json || [],
            kompetensi_json: emp.kompetensi_json || [],
          });
        }
      } catch (err) { console.error(err); } finally { setIsLoading(false); }
    };
    fetchCurrentData();
  }, [nikKtp, reset]);

  const onSubmit = async (data) => {
    const loadingToast = toast.loading('Mengirim usulan perubahan ke Admin...');
    const payload = {
      ...data,
      nik_ktp: nikKtp,
      ttl: `${data.tempat_lahir}, ${data.tanggal_lahir}`
    };

    try {
      const response = await fetch('https://absensi-backend-production-6002.up.railway.app/api/karyawan/request-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (response.ok) {
        toast.success(result.message, { id: loadingToast });
        navigate('/pengaturan');
      } else {
        toast.error(result.message || 'Gagal mengirim usulan', { id: loadingToast });
      }
    } catch { toast.error('Koneksi terputus', { id: loadingToast }); }
  };

  const nextStep = async () => {
    const isValid = await trigger(); 
    if (isValid) setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  if (isLoading) return <div className="p-20 text-center font-bold text-gray-400 animate-pulse">Menghubungkan ke Server PT. BEST...</div>;

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <div className="mb-8 bg-white p-6 rounded-xl shadow-sm border">
        <h1 className="text-2xl font-bold mb-2 text-gray-800">Ajukan Perubahan Profil</h1>
        <p className="text-gray-500 text-sm mb-6 font-medium">Ubah data Anda di bawah. Perubahan akan aktif setelah disetujui oleh Admin HR.</p>
        
        <div className={`flex justify-between items-center relative px-4 mx-auto ${steps.length <= 2 ? 'max-w-md' : 'w-full'}`}>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 -z-10"></div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary transition-all duration-300 -z-10" style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}></div>
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center gap-2 bg-white px-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${index <= currentStep ? 'bg-primary border-primary text-white' : 'bg-white border-gray-300 text-gray-400'}`}>
                <step.icon size={18} />
              </div>
              <span className={`text-[10px] font-bold ${index <= currentStep ? 'text-primary' : 'text-gray-400'}`}>{step.title}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border">
        <form onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault() }}>
          
          {steps[currentStep].id === 'A' && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-lg font-bold text-primary border-b pb-2 flex items-center gap-2"><User size={20}/> A. Data Pribadi</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div><label className="block text-sm font-medium mb-1">Nama Lengkap</label><input {...register('nama')} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" /></div>
                <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                  <label className="text-xs font-bold text-gray-400 flex items-center gap-1"><Lock size={12}/> NIK KTP (Terkunci)</label>
                  <input disabled value={nikKtp} className="w-full bg-transparent font-medium text-gray-500 cursor-not-allowed outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="block text-sm font-medium mb-1">Tempat Lahir</label><input {...register('tempat_lahir')} className="w-full p-2.5 border rounded-lg" /></div>
                  <div><label className="block text-sm font-medium mb-1">Tanggal Lahir</label><input type="date" {...register('tanggal_lahir')} className="w-full p-2.5 border rounded-lg" /></div>
                </div>
                <div><label className="block text-sm font-medium mb-1">No. Handphone</label><input type="number" {...register('no_hp')} className="w-full p-2.5 border rounded-lg" /></div>
                <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Alamat Domisili</label><textarea {...register('alamat_domisili')} className="w-full p-2.5 border rounded-lg h-20 outline-none"></textarea></div>
              </div>
            </div>
          )}

          {isPKWTT && steps[currentStep].id === 'B' && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-lg font-bold text-primary border-b pb-2 flex items-center gap-2"><BookOpen size={20}/> B. Pendidikan</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 <div><label className="block text-sm font-medium mb-1">Nama Institusi Terakhir</label><input {...register('nama_sekolah')} className="w-full p-2.5 border rounded-lg" /></div>
              </div>
            </div>
          )}

          {isPKWTT && steps[currentStep].id === 'C' && (
            <div className="space-y-6 animate-fade-in">
              {/* RIWAYAT KARIR */}
              <div className="border border-gray-100 p-5 rounded-xl bg-gray-50">
                <div className="flex justify-between items-center mb-4"><h4 className="font-bold text-gray-700">Riwayat Jenjang Karir</h4><button type="button" onClick={() => appendKarir({tahun: '', tipe: 'Basic'})} className="p-2 bg-green-600 text-white rounded-lg"><Plus size={16}/></button></div>
                {karirFields.map((f, i) => (
                  <div key={f.id} className="flex gap-2 mb-2">
                    <input {...register(`jenjang_karir_json.${i}.tahun`)} className="flex-1 p-2 border rounded bg-white" placeholder="Rentang Tahun" />
                    <button type="button" onClick={() => removeKarir(i)} className="text-red-500 p-2"><Trash2 size={20}/></button>
                  </div>
                ))}
              </div>

              {/* SK DIREKSI */}
              <div className="border border-orange-100 p-5 rounded-xl bg-orange-50/30">
                <div className="flex justify-between items-center mb-4"><h4 className="font-bold text-orange-800">SK Direksi</h4><button type="button" onClick={() => appendSk({nama_sk: 'PKWT', link_sk: ''})} className="p-2 bg-orange-600 text-white rounded-lg"><Plus size={16}/></button></div>
                {skFields.map((f, i) => (
                  <div key={f.id} className="flex gap-2 mb-2">
                    <input {...register(`sk_direksi_json.${i}.link_sk`)} className="flex-1 p-2 border border-orange-200 rounded bg-white" placeholder="Link GDrive SK" />
                    <button type="button" onClick={() => removeSk(i)} className="text-red-500 p-2"><Trash2 size={20}/></button>
                  </div>
                ))}
              </div>

              {/* === PENILAIAN TALENTA (MENYELESAIKAN ERROR) === */}
              <div className="border border-blue-100 p-5 rounded-xl bg-blue-50/30">
                <div className="flex justify-between items-center mb-4 text-blue-800 font-bold">
                  <h4 className="flex items-center gap-2"><Star size={18}/> Penilaian Talenta</h4>
                  <button type="button" onClick={() => appendTalenta({semester: 'Sem 1', tahun: currentYear.toString(), status: 'Standar'})} className="p-2 bg-blue-600 text-white rounded-lg"><Plus size={16}/></button>
                </div>
                <div className="space-y-3">
                  {talentaFields.map((f, i) => (
                    <div key={f.id} className="flex gap-2 items-center bg-white p-2 rounded-lg border border-blue-100 shadow-sm">
                      <select {...register(`talenta_history_json.${i}.semester`)} className="p-2 border rounded outline-none focus:ring-1 focus:ring-blue-400">
                        <option value="Sem 1">Sem 1</option>
                        <option value="Sem 2">Sem 2</option>
                      </select>
                      <select {...register(`talenta_history_json.${i}.tahun`)} className="p-2 border rounded">
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                      <select {...register(`talenta_history_json.${i}.status`)} className="flex-1 p-2 border rounded">
                        <option value="Optimal">Optimal</option>
                        <option value="Potensial">Potensial</option>
                        <option value="Standar">Standar</option>
                        <option value="Kurang">Kurang</option>
                      </select>
                      <button type="button" onClick={() => removeTalenta(i)} className="text-red-500 p-2"><Trash2 size={18}/></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {steps[currentStep].id === 'D' && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-lg font-bold text-primary border-b pb-2 flex items-center gap-2"><Wallet size={20}/> D. Data Finansial</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div><label className="block text-sm font-medium mb-1">Nama Bank</label><input {...register('nama_bank')} className="w-full p-2.5 border rounded-lg" /></div>
                <div><label className="block text-sm font-medium mb-1">Nomor Rekening</label><input type="number" {...register('no_rekening')} className="w-full p-2.5 border rounded-lg" /></div>
              </div>
            </div>
          )}

          {isPKWTT && steps[currentStep].id === 'E' && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-lg font-bold text-primary border-b pb-2">E. Sertifikasi & Kompetensi</h3>
              <div className="border border-teal-100 p-5 rounded-xl bg-teal-50/50">
                <button type="button" onClick={() => appendKompetensi({jenis: 'Lainnya', link_sertifikat: ''})} className="mb-4 bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold"><Plus size={16}/> Tambah Sertifikat</button>
                {kompetensiFields.map((f, i) => (
                  <div key={f.id} className="flex gap-2 mb-2">
                    <input {...register(`kompetensi_json.${i}.link_sertifikat`)} className="flex-1 p-2 border border-teal-200 rounded bg-white" placeholder="Link GDrive Sertifikat" />
                    <button type="button" onClick={() => removeKompetensi(i)} className="text-red-500"><Trash2 size={20}/></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8 pt-6 border-t">
            {currentStep > 0 ? (
              <button type="button" onClick={() => setCurrentStep(c => c - 1)} className="flex items-center gap-2 px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all font-medium"><ChevronLeft size={20} /> Kembali</button>
            ) : <div/>}

            {currentStep < steps.length - 1 ? (
              <button type="button" onClick={nextStep} className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:brightness-110 shadow-md transition-all font-bold">Lanjut <ChevronRight size={20} /></button>
            ) : (
              <button type="button" onClick={handleSubmit(onSubmit)} className="flex items-center gap-2 px-8 py-2 bg-secondary text-white rounded-lg hover:brightness-110 font-bold shadow-lg shadow-green-200 transition-all">
                <Save size={20} /> Ajukan Perubahan Profil
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}