import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, UserCheck, FileText, Clock, Check, Activity, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminApproval() {
  const [activeTab, setActiveTab] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [approvals, setApprovals] = useState([]);
  const [documentRequests, setDocumentRequests] = useState([]);
  const [performanceRequests, setPerformanceRequests] = useState([]); // State baru untuk Kinerja

  // ==========================================
  // 1. FUNGSI NARIK DATA (Ditambah Fetch Kinerja)
  // ==========================================
  const fetchSemuaAntrean = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('auth_token');

      // Ambil Antrean Perubahan Data
      const resData = await fetch('https://absensi-backend-production-6002.up.railway.app/api/admin/list-requests', {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      if (resData.ok) setApprovals(await resData.json());

      // Ambil Antrean Surat
      const resSurat = await fetch('https://absensi-backend-production-6002.up.railway.app/api/admin/pending-surat', {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      if (resSurat.ok) setDocumentRequests(await resSurat.json());

      // Ambil Antrean Kinerja (Endpoint baru sesuai instruksi BE)
      const resKinerja = await fetch('https://absensi-backend-production-6002.up.railway.app/api/admin/pending-performance', {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      if (resKinerja.ok) setPerformanceRequests(await resKinerja.json());

    } catch (error) {
      console.error("Gagal menarik data:", error);
      toast.error('Gagal terhubung ke server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSemuaAntrean();
  }, []);

  // --- Fungsi Handle Approve Kinerja ---
  const handleApprovePerformance = async (id, nama) => {
    const loading = toast.loading(`Menyetujui capaian kinerja ${nama}...`);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`https://absensi-backend-production-6002.up.railway.app/api/admin/approve-performance/${id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });

      if (response.ok) {
        setPerformanceRequests(performanceRequests.filter(req => req.id !== id));
        toast.success(`Kinerja ${nama} disetujui!`, { id: loading });
      } else {
        toast.error('Gagal memproses.', { id: loading });
      }
    } catch { toast.error('Koneksi terputus.', { id: loading }); }
  };

  // --- Fungsi Handle Reject Kinerja ---
  const handleRejectPerformance = async (id, nama) => {
    const reason = prompt(`Alasan penolakan kinerja ${nama}:`);
    if (!reason) return;

    const loading = toast.loading('Menolak eviden kinerja...');
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`https://absensi-backend-production-6002.up.railway.app/api/admin/reject-performance/${id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });

      if (response.ok) {
        setPerformanceRequests(performanceRequests.filter(req => req.id !== id));
        toast.success('Kinerja ditolak.', { id: loading });
      }
    } catch { toast.error('Gagal terhubung.', { id: loading }); }
  };

  // --- Fungsi Handle Approve/Reject Data & Surat (Tetap Sama) ---
  const handleApproveData = async (id, nama) => {
    const loadingToast = toast.loading(`Sedang ACC perubahan data ${nama}...`);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`https://absensi-backend-production-6002.up.railway.app/api/admin/approve-update/${id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      if (response.ok) {
        setApprovals(approvals.filter(item => item.id !== id));
        toast.success(`Data ${nama} berhasil diupdate!`, { id: loadingToast });
      } else { toast.error('Gagal ACC.', { id: loadingToast }); }
    } catch { toast.error('Koneksi terputus.', { id: loadingToast }); }
  };

  const handleApproveSurat = async (id, namaKaryawan, jenisSurat) => {
    const loading = toast.loading(`Menghasilkan ${jenisSurat}...`);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`https://absensi-backend-production-6002.up.railway.app/api/admin/approve-surat/${id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Surat_${jenisSurat}_${namaKaryawan}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        setDocumentRequests(documentRequests.filter(req => req.id !== id));
        toast.success('Surat Terbit!', { id: loading });
      }
    } catch { toast.error('Error sistem.', { id: loading }); }
  };

  const handleRejectSurat = async (id, nama) => {
    const note = prompt(`Masukkan alasan penolakan untuk ${nama}:`);
    if (!note) return;
    const loading = toast.loading('Menolak pengajuan...');
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`https://absensi-backend-production-6002.up.railway.app/api/admin/reject-surat/${id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ note })
      });
      if (response.ok) {
        setDocumentRequests(documentRequests.filter(req => req.id !== id));
        toast.success(`Ditolak.`, { id: loading });
      }
    } catch { toast.error('Error.', { id: loading }); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-xl shadow-sm border flex items-center gap-3">
        <div className="p-3 bg-blue-50 text-primary rounded-xl"><UserCheck size={28} /></div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Approval System</h2>
          <p className="text-gray-500 mt-1">Kelola semua antrean pengajuan PT. BEST dalam satu pintu.</p>
        </div>
      </div>

      {/* TABS (Ditambah Tab 3) */}
      <div className="flex gap-2 border-b border-gray-200 px-2 overflow-x-auto">
        <button onClick={() => setActiveTab(1)} className={`pb-3 px-4 font-bold transition-all text-sm flex items-center gap-2 whitespace-nowrap ${activeTab === 1 ? 'border-b-4 border-primary text-primary' : 'text-gray-400'}`}>
          <UserCheck size={18} /> Data Pribadi 
        </button>
        <button onClick={() => setActiveTab(2)} className={`pb-3 px-4 font-bold transition-all text-sm flex items-center gap-2 whitespace-nowrap ${activeTab === 2 ? 'border-b-4 border-primary text-primary' : 'text-gray-400'}`}>
          <FileText size={18} /> Pengajuan Surat
        </button>
        <button onClick={() => setActiveTab(3)} className={`pb-3 px-4 font-bold transition-all text-sm flex items-center gap-2 whitespace-nowrap ${activeTab === 3 ? 'border-b-4 border-primary text-primary' : 'text-gray-400'}`}>
          <Activity size={18} /> Eviden Kinerja
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border min-h-75">
        {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div><p>Sinkronisasi data...</p></div>
        ) : (
          <>
            {/* TAB 1 & 2 Tetap Sama */}
            {activeTab === 1 && (
              <div className="overflow-x-auto border rounded-xl">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600 border-b font-medium">
                    <tr><th className="px-6 py-4">Karyawan</th><th className="px-6 py-4">Detail Perubahan</th><th className="px-6 py-4 text-center">Aksi</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {approvals.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4"><p className="font-bold">{item.nama}</p><p className="text-xs text-gray-400">{item.nik_ktp}</p></td>
                        <td className="px-6 py-4">
                            <div className="bg-blue-50 p-2 rounded text-[10px] text-blue-700">
                                {item.proposed_data && Object.keys(item.proposed_data).length > 0 ? "Terdapat perubahan data profil" : "Tidak ada detail"}
                            </div>
                        </td>
                        <td className="px-6 py-4 text-center"><button onClick={() => handleApproveData(item.id, item.nama)} className="p-2 text-white bg-green-500 rounded-lg"><CheckCircle size={18} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 2 && (
              <div className="overflow-x-auto border rounded-xl">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600 border-b font-medium">
                    <tr><th className="px-6 py-4">Pemohon</th><th className="px-6 py-4">Jenis Surat</th><th className="px-6 py-4 text-center">Aksi</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {documentRequests.map((req) => (
                      <tr key={req.id}>
                        <td className="px-6 py-4 font-bold">{req.nama}</td>
                        <td className="px-6 py-4">{req.jenis_surat}</td>
                        <td className="px-6 py-4 text-center flex justify-center gap-2">
                            <button onClick={() => handleApproveSurat(req.id, req.nama, req.jenis_surat)} className="px-3 py-1 bg-primary text-white rounded text-xs">ACC</button>
                            <button onClick={() => handleRejectSurat(req.id, req.nama)} className="p-1 text-red-500 border border-red-200 rounded"><XCircle size={16}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 3: PENGAJUAN EVIDEN KINERJA (BARU) */}
            {activeTab === 3 && (
              <div className="overflow-x-auto border rounded-xl animate-fade-in">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600 border-b font-bold">
                    <tr>
                      <th className="px-6 py-4">Karyawan</th>
                      <th className="px-6 py-4">Bulan</th>
                      <th className="px-6 py-4 text-center">Target</th>
                      <th className="px-6 py-4 text-center">Realisasi</th>
                      <th className="px-6 py-4 text-center">Capaian</th>
                      <th className="px-6 py-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {performanceRequests.length === 0 ? (
                      <tr><td colSpan="6" className="text-center py-10 text-gray-400 italic">Tidak ada antrean kinerja.</td></tr>
                    ) : (
                      performanceRequests.map((perf) => (
                        <tr key={perf.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4"><p className="font-bold text-gray-800">{perf.nama}</p></td>
                          <td className="px-6 py-4 font-medium text-gray-600">{perf.bulan}</td>
                          <td className="px-6 py-4 text-center text-gray-500">{perf.target}</td>
                          <td className="px-6 py-4 text-center text-gray-500 font-bold">{perf.realisasi}</td>
                          <td className="px-6 py-4 text-center">
                            <span className="px-2 py-1 bg-blue-50 text-primary rounded font-black">{perf.capaian}%</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex justify-center gap-2">
                              <button onClick={() => handleApprovePerformance(perf.id, perf.nama)} className="p-2 bg-green-500 text-white rounded-lg shadow-sm hover:bg-green-600"><Check size={18}/></button>
                              <button onClick={() => handleRejectPerformance(perf.id, perf.nama)} className="p-2 bg-red-50 text-red-500 border border-red-200 rounded-lg hover:bg-red-500 hover:text-white transition-all"><XCircle size={18}/></button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}