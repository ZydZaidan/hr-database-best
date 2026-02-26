import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Wallet, Search, Save, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminPayslip() {
  const { register, handleSubmit, reset } = useForm();
  const [employees, setEmployees] = useState([]);
  const token = localStorage.getItem('auth_token');

  // Tarik daftar karyawan untuk dropdown
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch('https://absensi-backend-production-6002.up.railway.app/api/karyawan/all', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await res.json();
        if (res.ok) setEmployees(result.data);
      } catch (err) { console.error(err); }
    };
    fetchEmployees();
  }, [token]);

  const onSubmit = async (data) => {
    const loading = toast.loading('Mengunggah data gaji...');
    try {
      const response = await fetch('https://absensi-backend-production-6002.up.railway.app/api/admin/upload-payslip', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        toast.success('Slip gaji berhasil diterbitkan!', { id: loading });
        reset();
      } else { toast.error('Gagal mengunggah data', { id: loading }); }
    } catch { toast.error('Koneksi bermasalah', { id: loading }); }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-xl shadow-sm border flex items-center gap-3">
        <div className="p-3 bg-blue-50 text-primary rounded-xl"><Wallet size={28} /></div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Manajemen Slip Gaji</h2>
          <p className="text-gray-500 text-sm font-medium">Input rincian gaji bulanan karyawan PT. BEST.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-xl shadow-sm border grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="font-bold text-gray-700 border-b pb-2 flex items-center gap-2"><Search size={18}/> Identitas & Periode</h3>
          <div>
            <label className="block text-sm font-medium mb-1">Pilih Karyawan</label>
            <select {...register('nik_ktp', { required: true })} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-primary">
              <option value="">-- Pilih Nama Karyawan --</option>
              {employees.map(emp => <option key={emp.nik_ktp} value={emp.nik_ktp}>{emp.nama} ({emp.nik_ktp})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bulan & Tahun</label>
            <input type="month" {...register('bulan', { required: true })} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-primary" />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-gray-700 border-b pb-2 flex items-center gap-2"><Save size={18}/> Rincian Gaji</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase">Gaji Pokok (P1)</label>
              <input type="number" {...register('gaji_p1')} className="w-full p-2 border rounded" placeholder="0" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase">Tunjangan (P2)</label>
              <input type="number" {...register('gaji_p2')} className="w-full p-2 border rounded" placeholder="0" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase">BPJS (Potongan)</label>
              <input type="number" {...register('potongan_bpjs')} className="w-full p-2 border rounded" placeholder="0" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase">Pajak / PPh21</label>
              <input type="number" {...register('potongan_pajak')} className="w-full p-2 border rounded" placeholder="0" />
            </div>
          </div>
          <button type="submit" className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:brightness-110 shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2 mt-4">
             Terbitkan Slip Gaji
          </button>
        </div>
      </form>
    </div>
  );
}