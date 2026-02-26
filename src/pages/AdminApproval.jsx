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
      {/* Header Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border flex items-center gap-4">
        <div className="p-3 bg-blue-50 text-primary rounded-xl">
          <UserCheck size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Approval System</h2>
          <p className="text-gray-500 text-sm">Kelola semua antrean pengajuan PT. BEST dalam satu pintu.</p>
        </div>
      </div>

      {/* TABS Section */}
      <div className="flex gap-2 border-b border-gray-200 px-2 overflow-x-auto bg-white rounded-t-xl">
        <button onClick={() => setActiveTab(1)} className={`pb-3 px-6 font-bold transition-all text-sm flex items-center gap-2 whitespace-nowrap ${activeTab === 1 ? 'border-b-4 border-primary text-primary' : 'text-gray-400 hover:text-gray-600'}`}>
          <UserCheck size={18} /> Data Pribadi 
        </button>
        <button onClick={() => setActiveTab(2)} className={`pb-3 px-6 font-bold transition-all text-sm flex items-center gap-2 whitespace-nowrap ${activeTab === 2 ? 'border-b-4 border-primary text-primary' : 'text-gray-400 hover:text-gray-600'}`}>
          <FileText size={18} /> Pengajuan Surat
        </button>
        <button onClick={() => setActiveTab(3)} className={`pb-3 px-6 font-bold transition-all text-sm flex items-center gap-2 whitespace-nowrap ${activeTab === 3 ? 'border-b-4 border-primary text-primary' : 'text-gray-400 hover:text-gray-600'}`}>
          <Activity size={18} /> Eviden Kinerja
        </button>
      </div>

      {/* MAIN CONTENT CARD */}
      <div className="bg-white rounded-b-xl shadow-sm border-x border-b min-h-[400px] overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 text-gray-400">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="font-medium animate-pulse">Sinkronisasi data server...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              {/* TABLE HEAD - Disesuaikan per Tab */}
              <thead className="bg-gray-50 text-gray-600 border-b uppercase text-[11px] tracking-wider font-bold">
                {activeTab === 1 && (
                  <tr>
                    <th className="px-6 py-4">Karyawan</th>
                    <th className="px-6 py-4">Detail Perubahan</th>
                    <th className="px-6 py-4 text-center">Aksi</th>
                  </tr>
                )}
                {activeTab === 2 && (
                  <tr>
                    <th className="px-6 py-4">Pemohon</th>
                    <th className="px-6 py-4">Jenis Surat</th>
                    <th className="px-6 py-4 text-center">Aksi</th>
                  </tr>
                )}
                {activeTab === 3 && (
                  <tr>
                    <th className="px-6 py-4">Karyawan</th>
                    <th className="px-6 py-4">Bulan</th>
                    <th className="px-6 py-4 text-center">Target</th>
                    <th className="px-6 py-4 text-center">Realisasi</th>
                    <th className="px-6 py-4 text-center">Capaian</th>
                    <th className="px-6 py-4 text-center">Aksi</th>
                  </tr>
                )}
              </thead>

              {/* TABLE BODY - Render Kondisional berdasarkan State */}
              <tbody className="divide-y divide-gray-100">
                {/* TAB 1: DATA PRIBADI */}
                {activeTab === 1 && approvals.length > 0 && approvals.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-800">{item.nama}</p>
                      <p className="text-[10px] text-gray-400 font-mono uppercase">{item.nik_ktp}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="bg-blue-50 px-3 py-1.5 rounded-lg text-[11px] text-blue-700 border border-blue-100 inline-block font-medium">
                        {item.proposed_data && Object.keys(item.proposed_data).length > 0 ? "⚠️ Perubahan Profil Baru" : "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => handleApproveData(item.id, item.nama)} className="p-2.5 text-white bg-green-500 rounded-xl hover:bg-green-600 shadow-sm transition-all active:scale-95">
                        <CheckCircle size={18} />
                      </button>
                    </td>
                  </tr>
                ))}

                {/* TAB 2: PENGAJUAN SURAT */}
                {activeTab === 2 && documentRequests.length > 0 && documentRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-800">{req.nama}</td>
                    <td className="px-6 py-4 font-medium text-gray-600">{req.jenis_surat}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-3">
                        <button onClick={() => handleApproveSurat(req.id, req.nama, req.jenis_surat)} className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:brightness-110 shadow-sm transition-all active:scale-95 flex items-center gap-1">
                          <Check size={14} /> ACC
                        </button>
                        <button onClick={() => handleRejectSurat(req.id, req.nama)} className="p-2 text-red-500 border border-red-100 bg-red-50 hover:bg-red-500 hover:text-white rounded-xl transition-all active:scale-95">
                          <XCircle size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {/* TAB 3: EVIDEN KINERJA */}
                {activeTab === 3 && performanceRequests.length > 0 && performanceRequests.map((perf) => (
                  <tr key={perf.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-800">{perf.nama}</td>
                    <td className="px-6 py-4 text-gray-600">{perf.bulan}</td>
                    <td className="px-6 py-4 text-center">{perf.target}</td>
                    <td className="px-6 py-4 text-center font-bold">{perf.realisasi}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2.5 py-1 bg-blue-50 text-primary rounded-lg font-black text-xs border border-blue-100">{perf.capaian}%</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-3">
                        <button onClick={() => handleApprovePerformance(perf.id, perf.nama)} className="p-2.5 bg-green-500 text-white rounded-xl hover:bg-green-600 shadow-sm transition-all active:scale-95">
                          <Check size={18} />
                        </button>
                        <button onClick={() => handleRejectPerformance(perf.id, perf.nama)} className="p-2.5 bg-red-50 text-red-500 border border-red-100 hover:bg-red-500 hover:text-white rounded-xl transition-all active:scale-95">
                          <XCircle size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {/* EMPTY STATE - Jika data kosong di tab manapun */}
                {((activeTab === 1 && approvals.length === 0) || 
                  (activeTab === 2 && documentRequests.length === 0) || 
                  (activeTab === 3 && performanceRequests.length === 0)) && (
                  <tr>
                    <td colSpan="6" className="text-center py-24 text-gray-400 italic bg-gray-50/30">
                      <div className="flex flex-col items-center gap-2">
                        <Clock size={32} className="opacity-20" />
                        <p>Belum ada antrean masuk untuk bagian ini.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}