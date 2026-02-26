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
      {/* 1. Header Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border flex items-center gap-4">
        <div className="p-3 bg-blue-50 text-primary rounded-xl ring-4 ring-blue-50/50">
          <UserCheck size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Approval System</h2>
          <p className="text-gray-500 text-sm font-medium">Kelola semua antrean pengajuan PT. BEST dalam satu pintu.</p>
        </div>
      </div>

      {/* 2. Tab Navigation (Lebih Rapi) */}
      <div className="flex gap-2 border-b border-gray-100 px-4 bg-white rounded-t-xl border-t border-x overflow-x-auto scrollbar-hide">
        {[
          { id: 1, label: 'Data Pribadi', icon: UserCheck, count: approvals.length },
          { id: 2, label: 'Pengajuan Surat', icon: FileText, count: documentRequests.length },
          { id: 3, label: 'Eviden Kinerja', icon: Activity, count: performanceRequests.length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 py-4 px-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
              activeTab === tab.id 
                ? 'border-primary text-primary bg-blue-50/30' 
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
            {tab.count > 0 && (
              <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 3. Main Content Card (Tabel Konsisten) */}
      <div className="bg-white rounded-b-xl shadow-sm border-x border-b overflow-hidden min-h-100">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 text-gray-400">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="font-medium animate-pulse">Sinkronisasi data server...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/50 text-gray-500 font-bold border-b text-xs uppercase tracking-wider">
                <tr>
                  {/* Kondisional Header Berdasarkan Tab */}
                  <th className="px-6 py-4">Karyawan / Pemohon</th>
                  {activeTab === 1 && <th className="px-6 py-4">Detail Perubahan</th>}
                  {activeTab === 2 && <th className="px-6 py-4">Jenis Surat</th>}
                  {activeTab === 3 && (
                    <>
                      <th className="px-6 py-4 text-center">Bulan</th>
                      <th className="px-6 py-4 text-center">Pencapaian</th>
                    </>
                  )}
                  <th className="px-6 py-4 text-center">Aksi Approval</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {/* --- TAB 1: DATA PRIBADI --- */}
                {activeTab === 1 && approvals.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-800">{item.nama}</p>
                      <p className="text-xs text-gray-400 font-medium">NIK: {item.nik_ktp}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="bg-blue-50 p-2 rounded-lg text-[10px] text-blue-700 font-bold inline-block border border-blue-100">
                        Usulan Perubahan Profil
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => handleApproveData(item.id, item.nama)} className="p-2.5 text-white bg-green-500 rounded-xl hover:bg-green-600 shadow-sm active:scale-95 transition-all">
                        <Check size={18} />
                      </button>
                    </td>
                  </tr>
                ))}

                {/* --- TAB 2: PENGAJUAN SURAT --- */}
                {activeTab === 2 && documentRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-800">{req.nama}</td>
                    <td className="px-6 py-4"><span className="px-2 py-1 bg-gray-100 rounded-md text-gray-600 font-bold text-xs">{req.jenis_surat}</span></td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleApproveSurat(req.id, req.nama, req.jenis_surat)} className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:brightness-110 shadow-sm transition-all active:scale-95">ACC & CETAK</button>
                        <button onClick={() => handleRejectSurat(req.id, req.nama)} className="p-2 text-red-500 bg-red-50 hover:bg-red-500 hover:text-white rounded-lg border border-red-100 transition-all"><XCircle size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}

                {/* --- TAB 3: EVIDEN KINERJA --- */}
                {activeTab === 3 && performanceRequests.map((perf) => (
                  <tr key={perf.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-800">{perf.nama}</td>
                    <td className="px-6 py-4 text-center font-medium text-gray-500">{perf.bulan}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-3 py-1 bg-blue-50 text-primary rounded-full font-black text-xs border border-blue-100">{perf.capaian}%</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleApprovePerformance(perf.id, perf.nama)} className="p-2.5 text-white bg-green-500 rounded-xl shadow-sm hover:bg-green-600 active:scale-95 transition-all"><Check size={18}/></button>
                        <button onClick={() => handleRejectPerformance(perf.id, perf.nama)} className="p-2.5 text-red-500 bg-red-50 rounded-xl hover:bg-red-500 hover:text-white transition-all"><XCircle size={18}/></button>
                      </div>
                    </td>
                  </tr>
                ))}

                {/* Empty State Dinamis */}
                {((activeTab === 1 && approvals.length === 0) || (activeTab === 2 && documentRequests.length === 0) || (activeTab === 3 && performanceRequests.length === 0)) && (
                  <tr>
                    <td colSpan="5" className="py-20 text-center">
                      <div className="flex flex-col items-center text-gray-400 gap-2">
                        <Clock size={40} className="opacity-20" />
                        <p className="italic font-medium text-sm">Tidak ada antrean pengajuan pada kategori ini.</p>
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