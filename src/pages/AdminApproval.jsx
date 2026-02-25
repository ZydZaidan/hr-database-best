import { useState } from 'react';
import { CheckCircle, XCircle, Eye, UserCheck, FileText, Clock, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminApproval() {
  // State untuk Tab Aktif (1 = Perubahan Data, 2 = Surat)
  const [activeTab, setActiveTab] = useState(1);

  // --- DUMMY DATA TAB 1: PERUBAHAN DATA ---
  // Nanti diisi pakai useEffect fetch dari BE: GET /api/admin/list-requests
  const [approvals, setApprovals] = useState([
    { id: 1, nama: 'Siti Aminah', nik_karyawan: '0987654321', tanggal: '2026-02-20', bagian: 'Alamat & No HP', status: 'pending' },
    { id: 2, nama: 'Andi Pratama', nik_karyawan: '1122334455', tanggal: '2026-02-19', bagian: 'Rekening Bank', status: 'pending' },
  ]);

  // --- DUMMY DATA TAB 2: PENGAJUAN SURAT ---
  // Nanti diisi pakai useEffect fetch dari BE: GET /api/admin/pending-surat
  const [documentRequests, setDocumentRequests] = useState([
    { id: 101, nama: 'Zidanol', jenis_surat: 'Surat Keterangan Penghasilan', tanggal: '2026-02-25', status: 'pending' },
    { id: 102, nama: 'Muh. Cholish', jenis_surat: 'Curriculum Vitae (CV)', tanggal: '2026-02-25', status: 'pending' },
  ]);

  // === FUNGSI AKSI TAB 1 (DATA) ===
  const handleApproveData = (id, nama) => {
    // TODO: Ganti dengan fetch POST API ke BE (approve-update)
    setApprovals(approvals.filter(item => item.id !== id));
    toast.success(`Perubahan data ${nama} disetujui! Database utama diupdate.`);
  };

  const handleRejectData = (id, nama) => {
    // TODO: Ganti dengan fetch POST API ke BE (reject-update)
    setApprovals(approvals.filter(item => item.id !== id));
    toast.error(`Pengajuan perubahan ${nama} ditolak.`);
  };

  // === FUNGSI AKSI TAB 2 (SURAT) ===
  const handleApproveSurat = (id, nama, jenis) => {
    // TODO: Ganti dengan fetch POST API ke BE (approve-surat)
    setDocumentRequests(documentRequests.filter(req => req.id !== id));
    toast.success(`Pengajuan ${jenis} untuk ${nama} berhasil di-ACC! PDF siap diunduh karyawan.`);
  };

  const handleRejectSurat = (id, nama) => {
    // TODO: Ganti dengan fetch POST API ke BE (reject-surat)
    setDocumentRequests(documentRequests.filter(req => req.id !== id));
    toast.error(`Pengajuan surat untuk ${nama} ditolak.`);
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
          {approvals.length > 0 && (
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
          {documentRequests.length > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{documentRequests.length}</span>
          )}
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border">
        
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
                          <p className="font-bold text-gray-800">{item.nama}</p>
                          <p className="text-xs text-gray-500">{item.nik_karyawan}</p>
                        </td>
                        <td className="px-6 py-4 text-primary font-medium">{item.bagian}</td>
                        <td className="px-6 py-4 text-gray-600">{item.tanggal}</td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Lihat Perbandingan Data">
                              <Eye size={18} />
                            </button>
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
                        <td className="px-6 py-4 font-bold text-gray-800">{req.nama}</td>
                        <td className="px-6 py-4 font-medium text-gray-700">{req.jenis_surat}</td>
                        <td className="px-6 py-4 text-gray-600">{req.tanggal}</td>
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

      </div>
    </div>
  );
}