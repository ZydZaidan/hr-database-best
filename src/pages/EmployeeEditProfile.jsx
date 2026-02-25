import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { User, BookOpen, Briefcase, Wallet, ChevronLeft, ChevronRight, Save, Award, Plus, Trash2, Link as LinkIcon, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EmployeeEditProfile() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2024 + 1 }, (_, i) => 2024 + i);

  const nikKtp = localStorage.getItem('nik_ktp');
  const role = localStorage.getItem('userRole') || '';
  const isPKWTT = role === 'pkwtt';

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
    const fetchEmployeeData = async () => {
      if (!nikKtp) { setIsLoading(false); return; }
      try {
        const response = await fetch(`https://absensi-backend-production-6002.up.railway.app/api/karyawan/${nikKtp}`);
        const result = await response.json();
        if (response.ok) {
          const emp = result.data || result;
          const ttlSplit = emp.ttl ? emp.ttl.split(', ') : ['', ''];
          reset({
            nama: emp.nama,
            tempat_lahir: ttlSplit[0] || '',
            tanggal_lahir: ttlSplit[1] || '',
            no_hp: emp.no_hp,
            status_ptkp: emp.status_ptkp,
            alamat_domisili: emp.alamat_domisili,
            nama_bank: emp.nama_bank,
            nomor_rekening: emp.no_rekening,
            karir_dinamis: emp.jenjang_karir_json || [],
            sk_dinamis: emp.sk_direksi_json || [],
            talenta_dinamis: emp.talenta_history_json || [],
            bukti_talenta_dinamis: emp.bukti_talenta_json || [],
            kompetensi_dinamis: emp.kompetensi_json || [],
          });
        }
      } catch (error) { console.error(error); } finally { setIsLoading(false); }
    };
    fetchEmployeeData();
  }, [nikKtp, reset]);

  const nextStep = async () => {
    const isValid = await trigger(); 
    if (isValid) setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const onSubmit = async (data) => {
    const loadingToast = toast.loading('Mengirim pengajuan perubahan...');
    try {
      const response = await fetch('https://absensi-backend-production-6002.up.railway.app/api/karyawan/request-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ ...data, nik_ktp: nikKtp })
      });
      if (response.ok) {
        toast.success('Pengajuan terkirim! Menunggu review HR.', { id: loadingToast });
        navigate('/pengaturan');
      } else { toast.error('Gagal mengirim data.', { id: loadingToast }); }
    } catch { toast.error('Masalah koneksi.', { id: loadingToast }); }
  };

  if (isLoading) return <div className="p-20 text-center font-bold text-gray-400">Memuat Data...</div>;

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <div className="mb-8 bg-white p-6 rounded-xl shadow-sm border">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Ajukan Perubahan Profil</h1>
        <div className={`flex justify-between items-center relative px-4 mx-auto ${steps.length <= 2 ? 'max-w-lg' : 'w-full'}`}>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 -z-10"></div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary transition-all duration-300 -z-10" style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}></div>
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center gap-2 bg-white px-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${index <= currentStep ? 'bg-primary border-primary text-white' : 'text-gray-400'}`}><step.icon size={18}/></div>
              <span className="text-[10px] font-medium text-gray-500">{step.title}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* STEP A: PRIBADI */}
          {steps[currentStep].id === 'A' && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-lg font-bold text-primary border-b pb-2">A. Data Pribadi</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div><label className="text-sm font-medium">Nama Lengkap</label><input {...register('nama')} className="w-full p-2.5 border rounded-lg" /></div>
                <div className="bg-gray-50 p-2.5 rounded-lg border"><label className="text-xs font-bold text-gray-400 flex items-center gap-1"><Lock size={12}/> NIK KTP</label><input disabled value={nikKtp} className="w-full bg-transparent text-gray-500 cursor-not-allowed" /></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="text-sm font-medium">Tempat Lahir</label><input {...register('tempat_lahir')} className="w-full p-2.5 border rounded-lg" /></div>
                  <div><label className="text-sm font-medium">Tanggal Lahir</label><input type="date" {...register('tanggal_lahir')} className="w-full p-2.5 border rounded-lg" /></div>
                </div>
                <div><label className="text-sm font-medium">No. Handphone</label><input type="number" {...register('no_hp')} className="w-full p-2.5 border rounded-lg" /></div>
                <div className="md:col-span-2"><label className="text-sm font-medium">Alamat Domisili</label><textarea {...register('alamat_domisili')} className="w-full p-2.5 border rounded-lg h-20"></textarea></div>
              </div>
            </div>
          )}

          {/* STEP B: PENDIDIKAN */}
          {isPKWTT && steps[currentStep].id === 'B' && (
            <div className="space-y-4 animate-fade-in">
               <h3 className="text-lg font-bold text-primary border-b pb-2">B. Pendidikan</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 <div><label className="text-sm font-medium">Institusi</label><input {...register('nama_pendidikan')} className="w-full p-2.5 border rounded-lg" /></div>
                 <div><label className="text-sm font-medium">Tahun Lulus</label><input type="number" {...register('tahun_lulus')} className="w-full p-2.5 border rounded-lg" /></div>
               </div>
            </div>
          )}

          {/* STEP C: KARIR, SK, & TALENTA (DISINI SEMUA VARIABEL DIGUNAKAN) */}
          {isPKWTT && steps[currentStep].id === 'C' && (
            <div className="space-y-6 animate-fade-in">
               {/* KARIR */}
               <div className="border p-5 rounded-xl bg-gray-50">
                  <div className="flex justify-between items-center mb-4"><h4 className="font-bold">Jenjang Karir</h4><button type="button" onClick={() => appendKarir({tahun: '', tipe: 'Basic'})} className="p-2 bg-green-600 text-white rounded-lg"><Plus size={16}/></button></div>
                  {karirFields.map((f, i) => (
                    <div key={f.id} className="flex gap-2 mb-2">
                      <input {...register(`karir_dinamis.${i}.tahun`)} className="flex-1 p-2 border rounded" placeholder="Tahun"/>
                      <button type="button" onClick={() => removeKarir(i)} className="text-red-500"><Trash2 size={20}/></button>
                    </div>
                  ))}
               </div>
               {/* SK DIREKSI */}
               <div className="border p-5 rounded-xl bg-orange-50/50 border-orange-200">
                  <div className="flex justify-between items-center mb-4 text-orange-800 font-bold"><h4>SK Direksi</h4><button type="button" onClick={() => appendSk({nama_sk: 'PKWT', link_sk: ''})} className="p-2 bg-orange-600 text-white rounded-lg"><Plus size={16}/></button></div>
                  {skFields.map((f, i) => (
                    <div key={f.id} className="flex gap-2 mb-2">
                      <input {...register(`sk_dinamis.${i}.link_sk`)} className="flex-1 p-2 border border-orange-200 rounded" placeholder="Link GDrive SK"/>
                      <button type="button" onClick={() => removeSk(i)} className="text-red-500"><Trash2 size={20}/></button>
                    </div>
                  ))}
               </div>
               {/* PENILAIAN TALENTA */}
               <div className="border p-5 rounded-xl bg-blue-50/50 border-blue-200">
                  <div className="flex justify-between items-center mb-4 text-blue-800 font-bold"><h4>Penilaian Talenta</h4><button type="button" onClick={() => appendTalenta({semester: 'Sem 1', tahun: currentYear.toString(), status: 'Standar'})} className="p-2 bg-blue-600 text-white rounded-lg"><Plus size={16}/></button></div>
                  {talentaFields.map((f, i) => (
                    <div key={f.id} className="flex gap-2 mb-2">
                      <select {...register(`talenta_dinamis.${i}.tahun`)} className="p-2 border border-blue-200 rounded">{years.map(y => <option key={y} value={y}>{y}</option>)}</select>
                      <button type="button" onClick={() => removeTalenta(i)} className="text-red-500"><Trash2 size={20}/></button>
                    </div>
                  ))}
               </div>
               {/* BUKTI TALENTA */}
               <div className="border p-5 rounded-xl bg-purple-50/50 border-purple-200">
                  <div className="flex justify-between items-center mb-4 text-purple-800 font-bold"><h4>Bukti Talenta</h4><button type="button" onClick={() => appendBuktiTalenta({tahun: '', link_bukti: ''})} className="p-2 bg-purple-600 text-white rounded-lg"><Plus size={16}/></button></div>
                  {buktiTalentaFields.map((f, i) => (
                    <div key={f.id} className="flex gap-2 mb-2">
                      <input {...register(`bukti_talenta_dinamis.${i}.link_bukti`)} className="flex-1 p-2 border border-purple-200 rounded" placeholder="Link Bukti GDrive"/>
                      <button type="button" onClick={() => removeBuktiTalenta(i)} className="text-red-500"><Trash2 size={20}/></button>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {/* STEP D: FINANSIAL */}
          {steps[currentStep].id === 'D' && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-lg font-bold text-primary border-b pb-2">D. Finansial</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div><label className="text-sm font-medium">Nama Bank</label><input {...register('nama_bank')} className="w-full p-2.5 border rounded-lg" /></div>
                <div><label className="text-sm font-medium">No. Rekening</label><input type="number" {...register('nomor_rekening')} className="w-full p-2.5 border rounded-lg" /></div>
              </div>
            </div>
          )}

          {/* STEP E: KOMPETENSI */}
          {isPKWTT && steps[currentStep].id === 'E' && (
             <div className="space-y-4 animate-fade-in">
                <h3 className="text-lg font-bold text-primary border-b pb-2">E. Sertifikasi</h3>
                <div className="border p-5 rounded-xl bg-teal-50 border-teal-200">
                  <button type="button" onClick={() => appendKompetensi({jenis: 'Lainnya', link_sertifikat: ''})} className="mb-4 bg-teal-600 text-white p-2 rounded-lg flex items-center gap-2"><Plus size={16}/> Tambah Sertifikat</button>
                  {kompetensiFields.map((f, i) => (
                    <div key={f.id} className="flex gap-2 mb-2">
                      <input {...register(`kompetensi_dinamis.${i}.link_sertifikat`)} className="flex-1 p-2 border border-teal-200 rounded" placeholder="Link Sertifikat"/>
                      <button type="button" onClick={() => removeKompetensi(i)} className="text-red-500"><Trash2 size={20}/></button>
                    </div>
                  ))}
                </div>
             </div>
          )}

          <div className="flex justify-between mt-8 pt-6 border-t">
            {currentStep > 0 ? <button type="button" onClick={() => setCurrentStep(c => c - 1)} className="flex items-center gap-2 px-6 py-2 border rounded-lg hover:bg-gray-50 transition-colors"><ChevronLeft size={20}/> Kembali</button> : <div/>}
            {currentStep < steps.length - 1 
              ? <button type="button" onClick={nextStep} className="bg-primary text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:brightness-110">Lanjut <ChevronRight size={20}/></button>
              : <button type="submit" className="bg-secondary text-white px-8 py-2 rounded-lg font-bold flex items-center gap-2 hover:brightness-110 shadow-lg shadow-green-200"><Save size={20}/> Kirim Pengajuan</button>
            }
          </div>
        </form>
      </div>
    </div>
  );
}