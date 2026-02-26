import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, UserCheck, FileText, Clock, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminApproval() {
  const [activeTab, setActiveTab] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [approvals, setApprovals] = useState([]);
  const [documentRequests, setDocumentRequests] = useState([]);

  // Fungsi ambil token (sesuaikan dengan key di localStorage lo)
  const getAuthHeader = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`, // Sesuaikan jika key-nya 'auth_token'
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  });

  // ==========================================
  // 1. FUNGSI NARIK DATA (Pake Header Authorization)
  // ==========================================
  const fetchSemuaAntrean = async () => {
    setIsLoading(true);
    try {
      // Fetch Antrean Perubahan Data
      const resData = await fetch('https://absensi-backend-production-6002.up.railway.app/api/admin/list-requests', {
        headers: getAuthHeader()
      });
      
      if (resData.ok) {
        const resultData = await resData.json();
        setApprovals(resultData);
      } else if (resData.status === 401) {
        toast.error("Sesi habis, silakan login ulang");
      }

      // Fetch Antrean Surat
      const resSurat = await fetch('https://absensi-backend-production-6002.up.railway.app/api/admin/pending-surat', {
        headers: getAuthHeader()
      });
      
      if (resSurat.ok) {
        const resultSurat = await resSurat.json();
        setDocumentRequests(resultSurat);
      }
    } catch (error) {
      console.error("Error Fetch:", error);
      toast.error('Gagal terhubung ke server');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSemuaAntrean();
  }, []);

  // ==========================================
  // 2. FUNGSI APPROVE (Update Profil)
  // ==========================================
  const handleApproveData = async (id, nama) => {
    const loadingToast = toast.loading(`Memproses update data ${nama}...`);
    try {
      const response = await fetch(`https://absensi-backend-production-6002.up.railway.app/api/admin/approve-update/${id}`, {
        method: 'POST',
        headers: getAuthHeader()
      });

      if (response.ok) {
        setApprovals(approvals.filter(item => item.id !== id));
        toast.success(`Profil ${nama} berhasil diperbarui!`, { id: loadingToast });
      } else {
        toast.error('Gagal memproses approval', { id: loadingToast });
      }
    } catch {
      toast.error('Koneksi bermasalah', { id: loadingToast });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-xl shadow-sm border flex items-center gap-3">
        <div className="p-3 bg-blue-50 text-primary rounded-xl"><UserCheck size={28} /></div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Approval Data & Surat</h2>
          <p className="text-gray-500 mt-1">Sistem Persetujuan Terpusat PT. BEST</p>
        </div>
      </div>

      {/* TABS MENU */}
      <div className="flex gap-4 border-b border-gray-200 px-2">
        <button onClick={() => setActiveTab(1)} className={`pb-3 px-4 font-bold transition-all text-sm flex items-center gap-2 ${activeTab === 1 ? 'border-b-4 border-primary text-primary' : 'text-gray-400'}`}>
          <UserCheck size={18} /> Antrean Perubahan Data 
          {!isLoading && approvals.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{approvals.length}</span>}
        </button>
        <button onClick={() => setActiveTab(2)} className={`pb-3 px-4 font-bold transition-all text-sm flex items-center gap-2 ${activeTab === 2 ? 'border-b-4 border-primary text-primary' : 'text-gray-400'}`}>
          <FileText size={18} /> Antrean Surat 
          {!isLoading && documentRequests.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{documentRequests.length}</span>}
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border min-h-75">
        {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p>Menghubungkan ke API...</p>
            </div>
        ) : (
          <>
            {/* TAB 1: PERUBAHAN DATA */}
            {activeTab === 1 && (
              <div className="overflow-x-auto border rounded-xl">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600 border-b">
                    <tr>
                      <th className="px-6 py-4">Karyawan</th>
                      <th className="px-6 py-4">Usulan Perubahan</th>
                      <th className="px-6 py-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {approvals.length === 0 ? (
                      <tr><td colSpan="3" className="text-center py-10 text-gray-400">Tidak ada antrean data.</td></tr>
                    ) : (
                      approvals.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            {/* NOTE BE: Langsung pake item.nama */}
                            <p className="font-bold text-gray-800">{item.nama || 'Tanpa Nama'}</p>
                            <p className="text-[10px] text-gray-500 font-mono">{item.nik_ktp}</p>
                          </td>
                          <td className="px-6 py-4">
                             <div className="text-[11px] space-y-1 text-blue-600 font-medium bg-blue-50/50 p-2 rounded-lg border border-blue-100">
                               {/* NOTE BE: Akses lewat proposed_data secara opsional */}
                               {item.proposed_data?.alamat_domisili && <p>🏠 Alamat: {item.proposed_data.alamat_domisili}</p>}
                               {item.proposed_data?.no_hp && <p>📞 HP: {item.proposed_data.no_hp}</p>}
                               {item.proposed_data?.nama_bank && <p>💳 Bank: {item.proposed_data.nama_bank}</p>}
                             </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex justify-center gap-2">
                              <button onClick={() => handleApproveData(item.id, item.nama)} className="p-2 text-white bg-green-500 hover:bg-green-600 rounded-lg shadow-sm" title="Setujui">
                                <CheckCircle size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 2: ANTREAN SURAT */}
            {activeTab === 2 && (
              <div className="overflow-x-auto border rounded-xl">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600 border-b">
                    <tr><th className="px-6 py-4">Pemohon</th><th className="px-6 py-4">Jenis Surat</th><th className="px-6 py-4 text-center">Aksi</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {documentRequests.length === 0 ? (
                      <tr><td colSpan="3" className="text-center py-10 text-gray-400">Tidak ada pengajuan surat.</td></tr>
                    ) : (
                      documentRequests.map((req) => (
                        <tr key={req.id}>
                          <td className="px-6 py-4 font-bold text-gray-800">{req.nama}</td>
                          <td className="px-6 py-4 font-medium text-gray-600">{req.jenis_surat}</td>
                          <td className="px-6 py-4 text-center">
                            <button className="px-3 py-1.5 text-white bg-primary rounded-lg text-xs font-bold flex items-center gap-1 mx-auto">
                              <Check size={14} /> Terbitkan
                            </button>
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