import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { FileSignature, Send, Clock, CheckCircle, XCircle, Download } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DocumentRequest() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const nikKtp = localStorage.getItem('nik_ktp');
  const token = localStorage.getItem('auth_token');

  // ==========================================
  // 1. FUNGSI AMBIL RIWAYAT (Sesuai IzinController@historySurat)
  // ==========================================
  const fetchRiwayat = useCallback(async () => {
  setIsLoading(true);
  try {
    const response = await fetch(`https://absensi-backend-production-6002.up.railway.app/api/history-surat`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    const result = await response.json();
    if (response.ok && result.success) {
      setRequests(result.data); 
    }
  } catch (error) {
    console.error("Gagal memuat riwayat:", error);
  } finally {
    setIsLoading(false);
  }
}, [token]);

  useEffect(() => {
    fetchRiwayat();
  }, [fetchRiwayat]);

  // ==========================================
  // 2. FUNGSI KIRIM PENGAJUAN (Sesuai IzinController@storeSurat)
  // ==========================================
  const onSubmit = async (data) => {
    const loadingToast = toast.loading('Mengirim pengajuan...');
    try {
      const response = await fetch('https://absensi-backend-production-6002.up.railway.app/api/pengajuan-surat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          // Field wajib sesuai validasi BE: SKP, MAGANG, atau CV
          jenis_surat: data.jenisSurat, 
          // Input FE 'keperluan' dikirim sebagai 'alasan' agar BE simpan ke admin_note
          alasan: data.keperluan 
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(result.message, { id: loadingToast });
        reset();
        fetchRiwayat(); // Refresh tabel setelah kirim
      } else {
        // Tampilkan error spesifik dari BE (misal: NIK KTP kosong)
        toast.error(result.message || 'Gagal mengirim pengajuan', { id: loadingToast });
      }
    } catch {
      toast.error('Koneksi bermasalah', { id: loadingToast });
    }
  };

  // ==========================================
  // 3. FUNGSI DOWNLOAD (Link Cetak Surat di BE)
  // ==========================================
  const handleDownload = (jenisSurat) => {
    // Sesuaikan endpoint berdasarkan jenis surat
    let endpoint = 'download-cv'; 
    if (jenisSurat === 'SKP') endpoint = 'download-skp';
    if (jenisSurat === 'MAGANG') endpoint = 'download-magang';

    const downloadUrl = `https://absensi-backend-production-6002.up.railway.app/api/karyawan/${endpoint}/${nikKtp}`;
    window.open(downloadUrl, '_blank');
  };

  const StatusBadge = ({ status }) => {
    switch(status?.toLowerCase()) {
      case 'approved': 
        return <span className="flex items-center gap-1 text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium"><CheckCircle size={12}/> Disetujui</span>;
      case 'rejected': 
        return <span className="flex items-center gap-1 text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full font-medium"><XCircle size={12}/> Ditolak</span>;
      default: 
        return <span className="flex items-center gap-1 text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full font-medium"><Clock size={12}/> Pending</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <div className="flex items-center gap-3 border-b pb-4 mb-4">
          <FileSignature className="text-primary" size={24} />
          <h2 className="text-xl font-bold text-gray-800">Pengajuan Surat Keterangan</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Jenis Surat</label>
              <select {...register('jenisSurat', { required: true })} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm">
                <option value="">-- Pilih Jenis Surat --</option>
                <option value="CV">Curriculum Vitae (CV) Otomatis</option>
                <option value="SKP">Surat Keterangan Penghasilan (SKP)</option>
                <option value="MAGANG">Surat Keterangan Magang</option>
              </select>
              {errors.jenisSurat && <span className="text-xs text-red-500">Wajib dipilih</span>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tujuan / Keperluan</label>
              <input {...register('keperluan', { required: true })} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm" placeholder="Contoh: Bank / KPR / Visa" />
              {errors.keperluan && <span className="text-xs text-red-500">Wajib diisi</span>}
            </div>
          </div>
          
          <div className="flex justify-end pt-2">
            <button type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:brightness-110 font-bold shadow-md transition-all">
              <Send size={18} /> Kirim Pengajuan
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">Riwayat Pengajuan</h3>
          {isLoading && <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-bold border-b">
              <tr>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Jenis Surat</th>
                <th className="px-6 py-4">Keperluan</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requests.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-10 text-gray-400 italic">Belum ada riwayat pengajuan.</td></tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-500">
                      {req.created_at ? new Date(req.created_at).toLocaleDateString('id-ID') : '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-800 font-bold">{req.jenis_surat}</td>
                    {/* Mengambil alasan dari kolom admin_note sesuai storeSurat di BE */}
                    <td className="px-6 py-4 text-gray-600 italic">{req.admin_note || '-'}</td>
                    <td className="px-6 py-4"><StatusBadge status={req.status} /></td>
                    <td className="px-6 py-4 text-center">
                      {req.status?.toLowerCase() === 'approved' && (
                        <button 
                          onClick={() => handleDownload(req.jenis_surat)}
                          className="flex items-center gap-1 mx-auto px-3 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded-md hover:bg-blue-600 hover:text-white transition-all text-xs font-bold shadow-sm"
                        >
                          <Download size={14}/> Unduh PDF
                        </button>
                      )}
                    </td>
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