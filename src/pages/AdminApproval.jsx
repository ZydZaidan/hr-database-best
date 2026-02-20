import { useState } from 'react';
import { CheckCircle, XCircle, Eye, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminApproval() {
  const [approvals, setApprovals] = useState([
    { id: 1, nama: 'Siti Aminah', nik_karyawan: '0987654321', tanggal: '2026-02-20', bagian: 'Alamat & No HP', status: 'pending' },
    { id: 2, nama: 'Andi Pratama', nik_karyawan: '1122334455', tanggal: '2026-02-19', bagian: 'Rekening Bank', status: 'pending' },
  ]);

  const handleApprove = (id, nama) => {
    setApprovals(approvals.filter(item => item.id !== id));
    toast.success(`Perubahan data ${nama} disetujui! Database diupdate.`);
  };

  const handleReject = (id, nama) => {
    setApprovals(approvals.filter(item => item.id !== id));
    toast.error(`Pengajuan perubahan ${nama} ditolak.`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-xl shadow-sm border flex items-center gap-3">
        <UserCheck className="text-primary" size={28} />
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Approval Perubahan Data</h2>
          <p className="text-gray-500 mt-1">Kelola antrean pengajuan perubahan data dari karyawan.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border">
        {approvals.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <CheckCircle size={48} className="mx-auto mb-3 text-gray-200" />
            <p>Hore! Semua pengajuan sudah diproses.</p>
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
                  <tr key={item.id} className="hover:bg-gray-50">
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
                        <button onClick={() => handleApprove(item.id, item.nama)} className="p-2 text-white bg-green-500 hover:bg-green-600 rounded-lg shadow-sm" title="Setujui">
                          <CheckCircle size={18} />
                        </button>
                        <button onClick={() => handleReject(item.id, item.nama)} className="p-2 text-white bg-red-500 hover:bg-red-600 rounded-lg shadow-sm" title="Tolak">
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
    </div>
  );
}