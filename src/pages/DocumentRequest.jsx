import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FileSignature, Send, Clock, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DocumentRequest() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  
  // Data riwayat pengajuan dummy
  const [requests, setRequests] = useState([
    { id: 1, tanggal: '2026-02-15', jenis: 'Surat Keterangan Kerja', keperluan: 'Pembuatan Visa', status: 'Disetujui' },
    { id: 2, tanggal: '2026-02-10', jenis: 'Slip Gaji Legalisir', keperluan: 'KPR', status: 'Ditolak' },
  ]);

  const onSubmit = (data) => {
    const newRequest = {
      id: crypto.randomUUID(),      tanggal: new Date().toISOString().split('T')[0],
      jenis: data.jenisSurat,
      keperluan: data.keperluan,
      status: 'Pending'
    };
    
    setRequests([newRequest, ...requests]);
    toast.success('Pengajuan surat berhasil dikirim ke Admin HR!');
    reset();
  };

  const StatusBadge = ({ status }) => {
    switch(status) {
      case 'Disetujui': return <span className="flex items-center gap-1 text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium"><CheckCircle size={12}/> Disetujui</span>;
      case 'Ditolak': return <span className="flex items-center gap-1 text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full font-medium"><XCircle size={12}/> Ditolak</span>;
      default: return <span className="flex items-center gap-1 text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full font-medium"><Clock size={12}/> Pending</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Form Pengajuan */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <div className="flex items-center gap-3 border-b pb-4 mb-4">
          <FileSignature className="text-primary" size={24} />
          <h2 className="text-xl font-bold text-gray-800">Pengajuan Surat Keterangan</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Jenis Surat</label>
              <select {...register('jenisSurat', { required: true })} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none">
                <option value="">-- Pilih Jenis Surat --</option>
                <option value="Surat Keterangan Kerja">Surat Keterangan Kerja</option>
                <option value="Slip Gaji Legalisir">Slip Gaji Legalisir</option>
                <option value="Surat Keterangan Domisili">Surat Rekomendasi</option>
              </select>
              {errors.jenisSurat && <span className="text-xs text-red-500">Wajib dipilih</span>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tujuan / Keperluan</label>
              <input {...register('keperluan', { required: true })} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="Contoh: Pengajuan KPR / Pembuatan Visa" />
              {errors.keperluan && <span className="text-xs text-red-500">Wajib diisi</span>}
            </div>
          </div>
          
          <div className="flex justify-end pt-2">
            <button type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:brightness-110 font-medium">
              <Send size={18} /> Kirim Pengajuan
            </button>
          </div>
        </form>
      </div>

      {/* Tabel Riwayat Pengajuan */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Riwayat Pengajuan Saya</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b">
              <tr>
                <th className="px-6 py-4">Tanggal Pengajuan</th>
                <th className="px-6 py-4">Jenis Surat</th>
                <th className="px-6 py-4">Keperluan</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{req.tanggal}</td>
                  <td className="px-6 py-4 text-gray-700">{req.jenis}</td>
                  <td className="px-6 py-4 text-gray-600">{req.keperluan}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={req.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}