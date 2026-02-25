import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye, UserCheck, FileText, Clock, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminApproval() {
  const [activeTab, setActiveTab] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // State nampung data asli dari server
  const [approvals, setApprovals] = useState([]);
  const [documentRequests, setDocumentRequests] = useState([]);

  // ==========================================
  // 1. FUNGSI NARIK DATA DARI BACKEND (GET)
  // ==========================================
  const fetchSemuaAntrean = async () => {
    setIsLoading(true);
    try {
      // Narik Data Antrean Edit Profil
      // (Pastiin URL-nya sesuai sama yang dibikin BE ya)
      const resData = await fetch('https://absensi-backend-production-6002.up.railway.app/api/admin/list-requests');
      if (resData.ok) {
        const resultData = await resData.json();
        setApprovals(resultData.data || resultData);
      }

      // Narik Data Antrean Surat
      const resSurat = await fetch('https://absensi-backend-production-6002.up.railway.app/api/admin/pending-surat');
      if (resSurat.ok) {
        const resultSurat = await resSurat.json();
        setDocumentRequests(resultSurat.data || resultSurat);
      }
    } catch (error) {
      console.error("Gagal menarik data antrean:", error);
      toast.error('Gagal terhubung ke server.');
    } finally {
      setIsLoading(false);
    }
  };

  // Jalankan fetch pas halaman pertama kali dibuka
  useEffect(() => {
    fetchSemuaAntrean();
  }, []);

  // ==========================================
  // 2. FUNGSI AKSI TAB 1: PERUBAHAN DATA
  // ==========================================
  const handleApproveData = async (id, nama) => {
    const loadingToast = toast.loading(`Sedang ACC perubahan data ${nama}...`);
    try {
      const response = await fetch(`https://absensi-backend-production-6002.up.railway.app/api/admin/approve-update/${id}`, {
        method: 'POST',
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        setApprovals(approvals.filter(item => item.id !== id));
        toast.success(`Data ${nama} berhasil diupdate ke profil utama!`, { id: loadingToast });
      } else {
        toast.error('Gagal ACC data di server.', { id: loadingToast });
      }
    } catch {
      toast.error('Koneksi terputus.', { id: loadingToast });
    }
  };

  const handleRejectData = async (id, nama) => {
    const loadingToast = toast.loading(`Sedang menolak perubahan data ${nama}...`);
    try {
      const response = await fetch(`https://absensi-backend-production-6002.up.railway.app/api/admin/reject-update/${id}`, {
        method: 'POST',
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        setApprovals(approvals.filter(item => item.id !== id));
        toast.success(`Usulan ${nama} berhasil ditolak.`, { id: loadingToast });
      } else {
        toast.error('Gagal menolak data.', { id: loadingToast });
      }
    } catch {
      toast.error('Koneksi terputus.', { id: loadingToast });
    }
  };

  // ==========================================
  // 3. FUNGSI AKSI TAB 2: SURAT
  // ==========================================
  const handleApproveSurat = async (id, nama, jenis) => {
    const loadingToast = toast.loading(`Sedang menerbitkan ${jenis} untuk ${nama}...`);
    try {
      const response = await fetch(`https://absensi-backend-production-6002.up.railway.app/api/admin/approve-surat/${id}`, {
        method: 'POST',
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        setDocumentRequests(documentRequests.filter(req => req.id !== id));
        toast.success(`Surat berhasil diterbitkan! PDF siap diunduh.`, { id: loadingToast });
      } else {
        toast.error('Gagal ACC surat di server.', { id: loadingToast });
      }
    } catch {
      toast.error('Koneksi terputus.', { id: loadingToast });
    }
  };

  const handleRejectSurat = async (id, nama) => {
    const loadingToast = toast.loading(`Menolak pengajuan surat ${nama}...`);
    try {
      const response = await fetch(`https://absensi-backend-production-6002.up.railway.app/api/admin/reject-surat/${id}`, {
        method: 'POST',
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        setDocumentRequests(documentRequests.filter(req => req.id !== id));
        toast.success(`Pengajuan surat ditolak.`, { id: loadingToast });
      } else {
        toast.error('Gagal memproses penolakan.', { id: loadingToast });
      }
    } catch  {
      toast.error('Koneksi terputus.', { id: loadingToast });
    }
  };


  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header Info */}
      <div className="bg-white p-6 rounded-xl shadow-sm border flex items-center gap-3">
        <div className="p-3 bg-blue-50 text-primary rounded-xl">
          <UserCheck size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Approval Data & Surat</h2>
          <p className="text-gray-500 mt-1">Kelola antrean pengajuan perubahan profil dan permohonan surat dari karyawan.</p>
        </div>
      </div>

      {/* --- MENU TABS --- */}
      <div className="flex gap-4 border-b border-gray-200 px-2">
        <button 
          onClick={() => setActiveTab(1)}
          className={`pb-3 px-4 font-bold transition-all text-sm md:text-base flex items-center gap-2 ${
            activeTab === 1 
              ? 'border-b-4 border-primary text-primary' 
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <UserCheck size={18} /> Antrean Perubahan Data 
          {!isLoading && approvals.length > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{approvals.length}</span>
          )}
        </button>
        <button 
          onClick={() => setActiveTab(2)}
          className={`pb-3 px-4 font-bold transition-all text-sm md:text-base flex items-center gap-2 ${
            activeTab === 2 
              ? 'border-b-4 border-primary text-primary' 
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <FileText size={18} /> Antrean Pengajuan Surat
          {!isLoading && documentRequests.length > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{documentRequests.length}</span>
          )}
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border min-h-75">
        
        {isLoading ? (
           <div className="flex flex-col items-center justify-center py-16 text-gray-400">
             <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
             <p className="font-medium">Memuat data antrean dari server...</p>
           </div>
        ) : (
          <>
            {/* ==================== KONTEN TAB 1: PERUBAHAN DATA ==================== */}
            {activeTab === 1 && (
              <div className="animate-fade-in">
                {approvals.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <CheckCircle size={48} className="mx-auto mb-3 text-gray-200" />
                    <p>Hore! Semua pengajuan data sudah diproses.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto border rounded-xl">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                        <tr>
                          <th className="px-6 py-4">Nama & NIK</th>
                          <th className="px-6 py-4">Bagian yang Diubah</th>
                          <th className="px-6 py-4">Tanggal Pengajuan</th>
                          <th className="px-6 py-4 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {approvals.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              {/* Pastikan property dari API BE sesuai, misal item.user.nama atau item.nama */}
                              <p className="font-bold text-gray-800">{item.nama || item.nik_ktp}</p>
                              <p className="text-xs text-gray-500">{item.nik_karyawan}</p>
                            </td>
                            <td className="px-6 py-4 text-primary font-medium">{item.bagian_diubah || 'Perubahan Profil'}</td>
                            <td className="px-6 py-4 text-gray-600">{item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : '-'}</td>
                            <td className="px-6 py-4">
                              <div className="flex justify-center gap-2">
                                <button onClick={() => handleApproveData(item.id, item.nama)} className="p-2 text-white bg-green-500 hover:bg-green-600 rounded-lg shadow-sm" title="Setujui">
                                  <CheckCircle size={18} />
                                </button>
                                <button onClick={() => handleRejectData(item.id, item.nama)} className="p-2 text-white bg-red-500 hover:bg-red-600 rounded-lg shadow-sm" title="Tolak">
                                  <XCircle size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ==================== KONTEN TAB 2: PENGAJUAN SURAT ==================== */}
            {activeTab === 2 && (
              <div className="animate-fade-in">
                {documentRequests.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <CheckCircle size={48} className="mx-auto mb-3 text-gray-200" />
                    <p>Tidak ada antrean pengajuan surat baru.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto border rounded-xl">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                        <tr>
                          <th className="px-6 py-4">Nama Pemohon</th>
                          <th className="px-6 py-4">Jenis Surat</th>
                          <th className="px-6 py-4">Tanggal Pengajuan</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {documentRequests.map((req) => (
                          <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 font-bold text-gray-800">{req.nama || req.nik_ktp}</td>
                            <td className="px-6 py-4 font-medium text-gray-700">{req.jenis_surat}</td>
                            <td className="px-6 py-4 text-gray-600">{req.created_at ? new Date(req.created_at).toLocaleDateString('id-ID') : '-'}</td>
                            <td className="px-6 py-4">
                              <span className="flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-orange-100 text-orange-600 w-fit">
                                <Clock size={12} /> Pending
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex justify-center gap-2">
                                <button 
                                  onClick={() => handleApproveSurat(req.id, req.nama, req.jenis_surat)} 
                                  className="px-3 py-1.5 text-white bg-primary hover:brightness-110 rounded-lg shadow-sm flex items-center gap-1 font-medium text-xs" 
                                  title="Terbitkan Surat"
                                >
                                  <Check size={16} /> ACC & Terbitkan
                                </button>
                                <button 
                                  onClick={() => handleRejectSurat(req.id, req.nama)} 
                                  className="p-1.5 text-white bg-red-500 hover:bg-red-600 rounded-lg shadow-sm" 
                                  title="Tolak"
                                >
                                  <XCircle size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}