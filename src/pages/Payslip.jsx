import { useState } from 'react';
import { Download, Wallet, Building2, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Payslip() {
// Data dummy slip gaji (Format disamakan dengan Backend)
  const [slipData] = useState({
    bulan: 'Februari 2026',
    nama: 'Muh. Cholish',
    nik_karyawan: '1234567890',
    jabatan_structural: 'Frontend Developer',
    pendapatan: {
      gaji_p1: 5000000,
      gaji_p2: 1500000,
      thr_bonus: 500000,
    },
    potongan: {
      bpjs_kesehatan: 50000,
      bpjs_ketenagakerjaan: 100000,
      pajak: 150000,
    }
  });

  // Karena key-nya ganti, jangan lupa pas dipanggil di HTML bawahnya juga disesuaikan ya:
  // Contoh: {formatRp(slipData.pendapatan.gaji_p1)}

  // Hitung total otomatis
  const totalPendapatan = Object.values(slipData.pendapatan).reduce((a, b) => a + b, 0);
  const totalPotongan = Object.values(slipData.potongan).reduce((a, b) => a + b, 0);
  const takeHomePay = totalPendapatan - totalPotongan;

  // Format ke Rupiah
  const formatRp = (angka) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(angka);

  const handleDownload = () => {
    const loading = toast.loading('Menyiapkan PDF...');
    setTimeout(() => {
      toast.dismiss(loading);
      toast.success('Slip Gaji berhasil diunduh!');
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Wallet className="text-primary" /> Slip Gaji Bulanan
          </h2>
          <p className="text-gray-500 mt-1">Pilih bulan untuk melihat riwayat gaji</p>
        </div>
        <select className="p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none">
          <option>Februari 2026</option>
          <option>Januari 2026</option>
          <option>Desember 2025</option>
        </select>
      </div>

      {/* Kertas Slip Gaji */}
      <div className="bg-white p-8 rounded-xl shadow-md border-t-4 border-primary">
        {/* Header Kop Surat */}
        <div className="flex justify-between items-center border-b pb-6 mb-6">
          <div className="flex items-center gap-3">
            <Building2 size={40} className="text-primary" />
            <div>
              <h1 className="text-xl font-bold text-gray-800">PT. BEST</h1>
              <p className="text-xs text-gray-500">Jl. Jend. Sudirman No. 123, Jakarta</p>
            </div>
          </div>
          <div className="text-right">
            <h3 className="text-lg font-bold text-gray-700 uppercase">Slip Gaji</h3>
            <p className="text-sm font-medium text-primary flex items-center justify-end gap-1">
              <Calendar size={14} /> {slipData.bulan}
            </p>
          </div>
        </div>

        {/* Info Karyawan */}
        <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
          <div>
            <p className="text-gray-500">Nama Lengkap</p>
            <p className="font-semibold text-gray-800">{slipData.nama}</p>
          </div>
          <div>
            <p className="text-gray-500">NIK</p>
            <p className="font-semibold text-gray-800">{slipData.nik_karyawan}</p>
          </div>
          <div>
            <p className="text-gray-500">Jabatan</p>
            <p className="font-semibold text-gray-800">{slipData.jabatan_structural}</p>
          </div>
        </div>

        {/* Rincian Finansial */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Kolom Pendapatan */}
          <div>
            <h4 className="font-bold text-gray-800 border-b pb-2 mb-3">Penerimaan</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><p>Gaji Pokok (P1)</p><p>{formatRp(slipData.pendapatan.gaji_p1)}</p></div>
              <div className="flex justify-between"><p>Tunjangan (P2)</p><p>{formatRp(slipData.pendapatan.gaji_p2)}</p></div>
              <div className="flex justify-between"><p>THR & Bonus</p><p>{formatRp(slipData.pendapatan.thr_bonus)}</p></div>
            </div>
            <div className="flex justify-between font-bold text-primary border-t mt-3 pt-2">
              <p>Total Penerimaan</p><p>{formatRp(totalPendapatan)}</p>
            </div>
          </div>

          {/* Kolom Potongan */}
          <div>
            <h4 className="font-bold text-gray-800 border-b pb-2 mb-3">Potongan</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><p>BPJS Kesehatan</p><p className="text-red-500">- {formatRp(slipData.potongan.bpjs_kesehatan)}</p></div>
              <div className="flex justify-between"><p>BPJS Ketenagakerjaan</p><p className="text-red-500">- {formatRp(slipData.potongan.bpjs_ketenagakerjaan)}</p></div>
              <div className="flex justify-between"><p>Pajak (PPh 21)</p><p className="text-red-500">- {formatRp(slipData.potongan.pajak)}</p></div>
            </div>
            <div className="flex justify-between font-bold text-danger border-t mt-3 pt-2">
              <p>Total Potongan</p><p>- {formatRp(totalPotongan)}</p>
            </div>
          </div>
        </div>

        {/* Take Home Pay */}
        <div className="bg-blue-50 p-4 rounded-lg flex justify-between items-center border border-blue-100 mb-6">
          <p className="text-sm font-bold text-gray-700">TAKE HOME PAY</p>
          <p className="text-2xl font-black text-primary">{formatRp(takeHomePay)}</p>
        </div>

        {/* Tombol Aksi */}
        <div className="flex justify-end pt-4 border-t border-dashed">
          <button 
            onClick={handleDownload}
            className="flex items-center gap-2 px-6 py-2 bg-secondary text-white rounded-lg hover:brightness-110 font-medium"
          >
            <Download size={18} /> Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}