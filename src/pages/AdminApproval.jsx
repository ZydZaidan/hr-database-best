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
    <div className="space-y-6 animate-fade-in p-2">
      {/* 1. HEADER */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className="p-3.5 bg-primary/10 text-primary rounded-2xl">
          <UserCheck size={32} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-800 tracking-tight">Pusat Persetujuan</h2>
          <p className="text-gray-500 text-sm font-medium">Validasi antrean administrasi PT. BEST</p>
        </div>
      </div>

      {/* 2. TAB NAVIGATION (Gaya Modern) */}
      <div className="flex bg-gray-100/50 p-1.5 rounded-xl w-fit border border-gray-200">
        {[
          { id: 'data', label: 'Data Pribadi', icon: UserCheck },
          { id: 'surat', label: 'Pengajuan Surat', icon: FileText },
          { id: 'kinerja', label: 'Eviden Kinerja', icon: Activity },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === tab.id 
                ? 'bg-white text-primary shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon size={18} /> {tab.label}
          </button>
        ))}
      </div>

      {/* 3. MAIN TABLE CONTAINER (Hanya 1 Card untuk semua) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                {/* Header Dinamis berdasarkan Tab */}
                <th className="px-6 py-4 text-xs uppercase tracking-widest text-gray-400 font-black">Identitas Karyawan</th>
                {activeTab === 'data' && <th className="px-6 py-4 text-xs uppercase tracking-widest text-gray-400 font-black">Detail Perubahan</th>}
                {activeTab === 'surat' && <th className="px-6 py-4 text-xs uppercase tracking-widest text-gray-400 font-black">Jenis Dokumen</th>}
                {activeTab === 'kinerja' && (
                  <>
                    <th className="px-6 py-4 text-xs uppercase tracking-widest text-gray-400 font-black text-center">Periode</th>
                    <th className="px-6 py-4 text-xs uppercase tracking-widest text-gray-400 font-black text-center">Capaian KPI</th>
                  </>
                )}
                <th className="px-6 py-4 text-xs uppercase tracking-widest text-gray-400 font-black text-center">Aksi Keputusan</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="py-20 text-center text-gray-400 animate-pulse font-medium">
                    Sinkronisasi basis data PT. BEST...
                  </td>
                </tr>
              ) : (
                <>
                  {/* ISI TAB DATA PRIBADI */}
                  {activeTab === 'data' && approvals.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-5">
                        <p className="font-black text-gray-800">{item.nama}</p>
                        <p className="text-[10px] font-mono text-gray-400">{item.nik_ktp}</p>
                      </td>
                      <td className="px-6 py-5 text-xs text-blue-600 font-bold bg-blue-50/30">Pembaruan Profil Karyawan</td>
                      <td className="px-6 py-5 text-center">
                        <button onClick={() => handleApproveData(item.id, item.nama)} className="p-2.5 bg-green-500 text-white rounded-xl shadow-lg shadow-green-100 hover:scale-110 transition-transform"><CheckCircle size={20}/></button>
                      </td>
                    </tr>
                  ))}

                  {/* ISI TAB SURAT */}
                  {activeTab === 'surat' && documentRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-5 font-black text-gray-800">{req.nama}</td>
                      <td className="px-6 py-5 font-bold text-gray-500">{req.jenis_surat}</td>
                      <td className="px-6 py-5 text-center flex justify-center gap-3">
                        <button onClick={() => handleApproveSurat(req.id, req.nama, req.jenis_surat)} className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-black shadow-md">TERBITKAN</button>
                        <button onClick={() => handleRejectSurat(req.id, req.nama)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><XCircle size={20}/></button>
                      </td>
                    </tr>
                  ))}

                  {/* ISI TAB KINERJA */}
                  {activeTab === 'kinerja' && performanceRequests.map((perf) => (
                    <tr key={perf.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-5 font-black text-gray-800">{perf.nama}</td>
                      <td className="px-6 py-5 text-center font-bold text-gray-400 italic">{perf.bulan}</td>
                      <td className="px-6 py-5 text-center">
                        <span className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-black text-xs">{perf.capaian}%</span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handleApprovePerformance(perf.id, perf.nama)} className="p-2 bg-green-500 text-white rounded-xl"><Check size={20}/></button>
                          <button onClick={() => handleRejectPerformance(perf.id, perf.nama)} className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><XCircle size={20}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {/* EMPTY STATE (Jika data kosong di tab aktif) */}
                  {((activeTab === 'data' && approvals.length === 0) || 
                    (activeTab === 'surat' && documentRequests.length === 0) || 
                    (activeTab === 'kinerja' && performanceRequests.length === 0)) && (
                    <tr>
                      <td colSpan="5" className="py-20 text-center text-gray-400 italic font-medium">
                        Tidak ada antrean tertunda untuk kategori ini.
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}