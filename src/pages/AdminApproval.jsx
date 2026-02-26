import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, UserCheck, FileText, Clock, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminApproval() {
  const [activeTab, setActiveTab] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [approvals, setApprovals] = useState([]);
  const [documentRequests, setDocumentRequests] = useState([]);

  // ==========================================
  // 1. FUNGSI NARIK DATA (URL Sesuai Instruksi BE)
  // ==========================================
const fetchSemuaAntrean = async () => {
    setIsLoading(true);
    try {
      // Ambil token dari localStorage
      const token = localStorage.getItem('auth_token'); // Pastikan key-nya sesuai saat lo simpan pas login

      // Poin 1 & 2: Tambah Header Authorization & Endpoint URL
      const resData = await fetch('https://absensi-backend-production-6002.up.railway.app/api/admin/list-requests', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (resData.ok) {
        const resultData = await resData.json();
        setApprovals(resultData); 
      }

      const resSurat = await fetch('https://absensi-backend-production-6002.up.railway.app/api/admin/pending-surat', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (resSurat.ok) {
        const resultSurat = await resSurat.json();
        setDocumentRequests(resultSurat);
      }
    } catch (error) {
      console.error("Gagal menarik data:", error);
      toast.error('Gagal terhubung ke server.');
    } finally {
      setIsLoading(false);
    }
  };

  // Pastikan dependency array kosong [] agar tidak looping!
  useEffect(() => {
    fetchSemuaAntrean();
  }, []);

// --- Fungsi Handle Approve/Reject ---
  const handleApproveData = async (id, nama) => {
    const loadingToast = toast.loading(`Sedang ACC perubahan data ${nama}...`);
    try {
      const token = localStorage.getItem('auth_token');

      const response = await fetch(`https://absensi-backend-production-6002.up.railway.app/api/admin/approve-update/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        setApprovals(approvals.filter(item => item.id !== id));
        toast.success(`Data ${nama} berhasil diupdate!`, { id: loadingToast });
      } else { 
        toast.error('Gagal ACC. Cek izin akses admin.', { id: loadingToast }); 
      }
    } catch {
      toast.error('Koneksi terputus.', { id: loadingToast });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Info */}
      <div className="bg-white p-6 rounded-xl shadow-sm border flex items-center gap-3">
        <div className="p-3 bg-blue-50 text-primary rounded-xl"><UserCheck size={28} /></div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Approval Data & Surat</h2>
          <p className="text-gray-500 mt-1">Kelola antrean pengajuan PT. BEST.</p>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-4 border-b border-gray-200 px-2">
        <button onClick={() => setActiveTab(1)} className={`pb-3 px-4 font-bold transition-all text-sm flex items-center gap-2 ${activeTab === 1 ? 'border-b-4 border-primary text-primary' : 'text-gray-400'}`}>
          <UserCheck size={18} /> Antrean Perubahan Data 
        </button>
        <button onClick={() => setActiveTab(2)} className={`pb-3 px-4 font-bold transition-all text-sm flex items-center gap-2 ${activeTab === 2 ? 'border-b-4 border-primary text-primary' : 'text-gray-400'}`}>
          <FileText size={18} /> Antrean Pengajuan Surat
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border min-h-75">
        {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 animate-pulse">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p>Menghubungkan ke server...</p>
            </div>
        ) : (
          <>
            {/* TAB 1: PERUBAHAN DATA */}
            {activeTab === 1 && (
              <div className="overflow-x-auto border rounded-xl">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600 border-b font-medium">
                    <tr><th className="px-6 py-4">Nama Karyawan</th><th className="px-6 py-4">Proposed Data</th><th className="px-6 py-4 text-center">Aksi</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {approvals.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          {/* Poin 1: Mapping Nama Langsung dari item.nama */}
                          <p className="font-bold text-gray-800">{item.nama}</p> 
                          <p className="text-xs text-gray-500 font-mono">{item.nik_ktp}</p>
                        </td>
                        <td className="px-6 py-4 text-xs">
                          <div className="bg-blue-50 p-3 rounded-xl text-primary border border-blue-100 space-y-2">
                            {item.proposed_data && Object.entries(item.proposed_data).length > 0 ? (
                              Object.entries(item.proposed_data).map(([key, value]) => {
                                // Kita filter supaya field teknis atau yang kosong nggak tampil
                                if (!value || key === 'nik_ktp' || key === 'id') return null;

                                return (
                                  <div key={key} className="flex flex-col border-b border-blue-200 last:border-0 pb-1 mb-1">
                                    <span className="font-bold uppercase text-[9px] text-blue-400">
                                      {key.replace(/_/g, ' ')} {/* Ganti underscore jadi spasi biar rapi */}
                                    </span>
                                    <span className="text-gray-700">
                                      {/* Cek kalau isinya array/object (seperti riwayat karir), kita tampilkan jumlahnya saja */}
                                      {typeof value === 'object' 
                                        ? `${Array.isArray(value) ? value.length : 1} Data Baru ditambahkan` 
                                        : value}
                                    </span>
                                  </div>
                                );
                              })
                            ) : (
                              <span className="text-gray-400 italic">Tidak ada detail perubahan</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button onClick={() => handleApproveData(item.id, item.nama)} className="p-2 text-white bg-green-500 rounded-lg"><CheckCircle size={18} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 2: PENGAJUAN SURAT */}
            {activeTab === 2 && (
              <div className="overflow-x-auto border rounded-xl">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600 border-b font-medium">
                    <tr><th className="px-6 py-4">Nama Pemohon</th><th className="px-6 py-4">Jenis Surat</th><th className="px-6 py-4 text-center">Aksi</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {documentRequests.map((req) => (
                      <tr key={req.id}>
                        {/* Poin 1: Mapping Nama Langsung dari req.nama */}
                        <td className="px-6 py-4 font-bold text-gray-800">{req.nama}</td>
                        <td className="px-6 py-4 font-medium text-gray-700">{req.jenis_surat}</td>
                        <td className="px-6 py-4 text-center">
                          <button className="px-3 py-1.5 text-white bg-primary rounded-lg text-xs font-bold"><Check size={16} /> Terbitkan</button>
                        </td>
                      </tr>
                    ))}
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