import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Target, TrendingUp, Save, Activity, Clock, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Performance() {
  const { register, handleSubmit, watch, reset } = useForm();
  const [kpiData, setKpiData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const token = localStorage.getItem('auth_token');
  const targetVal = watch('target', 0);
  const realisasiVal = watch('realisasi', 0);
  
  // Rumus Capaian
  const capaianPersen = targetVal > 0 
    ? ((parseFloat(realisasiVal) / parseFloat(targetVal)) * 100).toFixed(1) 
    : 0;

  // ==========================================
  // 1. Ambil Riwayat dari BE (Optimasi Memoization)
  // ==========================================
  const fetchPerformance = useCallback(async () => {
    // Hindari fetch jika token kosong (user belum login sempurna)
    if (!token) {
        setIsLoading(false);
        return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('https://absensi-backend-production-6002.up.railway.app/api/performance/history', {
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json' 
        }
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setKpiData(result.data);
      }
    } catch (error) {
      console.error("Gagal load data kinerja:", error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPerformance();
  }, [fetchPerformance]);

  // ==========================================
  // 2. Simpan Data ke BE
  // ==========================================
  const onSubmit = async (data) => {
    const loadingToast = toast.loading('Menyimpan eviden...');
    try {
      const response = await fetch('https://absensi-backend-production-6002.up.railway.app/api/performance', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          bulan: data.bulan,
          target: parseFloat(data.target),
          realisasi: parseFloat(data.realisasi),
          capaian: parseFloat(capaianPersen)
        })
      });

      const result = await response.json();
      if (response.ok && result.success) {
        toast.success('Eviden berhasil dikirim ke Admin!', { id: loadingToast });
        reset();
        fetchPerformance(); // Refresh tabel setelah submit sukses
      } else {
        toast.error(result.message || 'Gagal menyimpan', { id: loadingToast });
      }
    } catch {
      toast.error('Koneksi server bermasalah', { id: loadingToast });
    }
  };

  const StatusBadge = ({ status }) => {
    switch(status?.toLowerCase()) {
      case 'approved': 
        return <span className="flex items-center gap-1 text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-bold"><CheckCircle size={12}/> Disetujui</span>;
      case 'rejected': 
        return <span className="flex items-center gap-1 text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full font-bold"><XCircle size={12}/> Ditolak</span>;
      default: 
        return <span className="flex items-center gap-1 text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full font-bold"><Clock size={12}/> Pending</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <div className="flex items-center gap-3 border-b pb-4 mb-4">
          <Activity className="text-primary" size={24} />
          <h2 className="text-xl font-bold text-gray-800">Update Eviden Kinerja Bulanan</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">Bulan & Tahun</label>
            <input type="month" {...register('bulan', { required: true })} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 flex items-center gap-1 text-gray-600"><Target size={14}/> Target KPI</label>
            <input type="number" {...register('target', { required: true })} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all" placeholder="Contoh: 100" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 flex items-center gap-1 text-gray-600"><TrendingUp size={14}/> Realisasi</label>
            <input type="number" {...register('realisasi', { required: true })} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all" placeholder="Contoh: 95" />
          </div>
          <button type="submit" className="flex items-center justify-center gap-2 w-full p-2.5 bg-primary text-white rounded-lg hover:brightness-110 font-bold shadow-md transition-all active:scale-95">
            <Save size={18} /> Simpan Eviden
          </button>
        </form>

        {/* Perbaikan Typo bg-linear-to-r menjadi bg-gradient-to-r */}
        <div className="mt-6 p-4 bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl flex justify-between items-center shadow-sm">
          <div>
            <p className="text-sm font-bold text-blue-800">Simulasi Capaian Kinerja:</p>
            <p className="text-xs text-blue-600 mt-0.5">Automatis dihitung berdasarkan Realisasi / Target</p>
          </div>
          <div className="text-right px-4 py-2 bg-white rounded-lg border border-blue-200 shadow-inner text-2xl font-black text-primary">
            {capaianPersen}%
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
          <h3 className="text-lg font-bold text-gray-800">Riwayat Kinerja Saya</h3>
          {isLoading && <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white text-gray-500 font-bold border-b text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Bulan</th>
                <th className="px-6 py-4 text-center">Target</th>
                <th className="px-6 py-4 text-center">Realisasi</th>
                <th className="px-6 py-4 text-center">Pencapaian</th>
                <th className="px-6 py-4 text-center">Status Approval</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {kpiData.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-12 text-gray-400 italic">Belum ada data kinerja yang dikirim.</td></tr>
              ) : (
                kpiData.map((kpi) => (
                  <tr key={kpi.id} className="hover:bg-blue-50/30 transition-colors">
                    {/* Hapus formatting tanggal manual, pakai format dari BE */}
                    <td className="px-6 py-4 font-bold text-gray-700">{kpi.bulan}</td>
                    <td className="px-6 py-4 text-center font-medium text-gray-600">{kpi.target}</td>
                    <td className="px-6 py-4 text-center font-medium text-gray-600">{kpi.realisasi}</td>
                    <td className="px-6 py-4 text-center font-black text-primary bg-blue-50/50">{kpi.capaian}%</td>
                    <td className="px-6 py-4 flex justify-center"><StatusBadge status={kpi.status} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}