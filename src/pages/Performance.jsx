import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Target, TrendingUp, Save, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Performance() {
  const { register, handleSubmit, watch, reset } = useForm();
  
  // Data riwayat KPI (Dummy)
  const [kpiData, setKpiData] = useState([
    { id: 1, bulan: 'Januari 2026', target: 100, realisasi: 95, capaian: 95 },
  ]);


  
const targetVal = watch('target', 0);
const realisasiVal = watch('realisasi', 0);
  
  // Rumus: (Realisasi / Target) * 100%
  const capaianPersen = targetVal > 0 
    ? ((parseFloat(realisasiVal) / parseFloat(targetVal)) * 100).toFixed(1) 
    : 0;

  const onSubmit = (data) => {
    const newData = {
      id: crypto.randomUUID(),      bulan: data.bulan,
      target: parseFloat(data.target),
      realisasi: parseFloat(data.realisasi),
      capaian: parseFloat(capaianPersen)
    };
    
    setKpiData([newData, ...kpiData]); // Tambah ke atas tabel
    toast.success('Eviden Kinerja bulan ini berhasil disimpan!');
    reset(); // Kosongin form
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Form Input Kinerja */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <div className="flex items-center gap-3 border-b pb-4 mb-4">
          <Activity className="text-primary" size={24} />
          <h2 className="text-xl font-bold text-gray-800">Update Eviden Kinerja Bulanan</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-1">Bulan & Tahun</label>
            <input type="month" {...register('bulan', { required: true })} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 flex items-center gap-1"><Target size={14}/> Target</label>
            <input type="number" {...register('target', { required: true })} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="Contoh: 100" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 flex items-center gap-1"><TrendingUp size={14}/> Realisasi</label>
            <input type="number" {...register('realisasi', { required: true })} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="Contoh: 95" />
          </div>
          <button type="submit" className="flex items-center justify-center gap-2 w-full p-2.5 bg-primary text-white rounded-lg hover:brightness-110 font-medium">
            <Save size={18} /> Simpan Eviden
          </button>
        </form>

        {/* Live Preview Hitungan */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">Simulasi Capaian Kinerja:</p>
            <p className="text-xs text-gray-500 mt-1">Rumus: (Realisasi / Target) × 100%</p>
          </div>
          <div className="text-right">
            <span className={`text-2xl font-bold ${capaianPersen >= 100 ? 'text-green-600' : capaianPersen >= 80 ? 'text-blue-600' : 'text-red-600'}`}>
              {capaianPersen}%
            </span>
          </div>
        </div>
      </div>

      {/* Tabel Riwayat Kinerja */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Riwayat Kinerja Saya</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b">
              <tr>
                <th className="px-6 py-4">Bulan</th>
                <th className="px-6 py-4 text-center">Target</th>
                <th className="px-6 py-4 text-center">Realisasi</th>
                <th className="px-6 py-4 text-center">Pencapaian (%)</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {kpiData.map((kpi) => (
                <tr key={kpi.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{kpi.bulan}</td>
                  <td className="px-6 py-4 text-center">{kpi.target}</td>
                  <td className="px-6 py-4 text-center">{kpi.realisasi}</td>
                  <td className="px-6 py-4 text-center font-bold text-primary">{kpi.capaian}%</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      kpi.capaian >= 100 ? 'bg-green-100 text-green-700' : 
                      kpi.capaian >= 80 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {kpi.capaian >= 100 ? 'Memenuhi' : kpi.capaian >= 80 ? 'Cukup' : 'Kurang'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}