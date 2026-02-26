import { useState, useEffect, useCallback } from 'react';
import { Download, Wallet, Building2, Calendar, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Payslip() {
  const [slipData, setSlipData] = useState(null);
  const [periode, setPeriode] = useState(''); // Contoh: 2026-02
  const [isLoading, setIsLoading] = useState(false);

  const nikKtp = localStorage.getItem('nik_ktp');
  const token = localStorage.getItem('auth_token');

  const fetchPayslip = useCallback(async () => {
    if (!periode) return;
    setIsLoading(true);
    try {
      const res = await fetch(`https://absensi-backend-production-6002.up.railway.app/api/karyawan/get-payslip?nik=${nikKtp}&bulan=${periode}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setSlipData(result.data);
      } else {
        setSlipData(null);
        toast.error('Data gaji periode ini belum tersedia.');
      }
    } catch { toast.error('Koneksi terputus'); }
    finally { setIsLoading(false); }
  }, [nikKtp, token, periode]);

  useEffect(() => {
    fetchPayslip();
  }, [fetchPayslip]);

  const formatRp = (angka) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka || 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex justify-between items-end mb-6 bg-white p-4 rounded-xl border shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Wallet className="text-primary" /> Riwayat Slip Gaji
          </h2>
          <p className="text-xs text-gray-500">Pilih periode untuk mencetak dokumen</p>
        </div>
        <input 
          type="month" 
          value={periode} 
          onChange={(e) => setPeriode(e.target.value)}
          className="p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm font-bold text-gray-700"
        />
      </div>

      {!slipData ? (
        <div className="bg-white p-20 text-center rounded-xl border border-dashed text-gray-400">
          {isLoading ? <Loader2 className="animate-spin mx-auto mb-2" /> : <Calendar className="mx-auto mb-2 opacity-20" size={48} />}
          <p className="font-medium">{isLoading ? 'Menarik data gaji...' : 'Silakan pilih periode bulan di atas.'}</p>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-xl shadow-md border-t-4 border-primary animate-fade-in">
          {/* Header & Content yang sudah Anda buat sebelumnya tetap sama */}
          {/* Gunakan data dari: slipData.gaji_p1, slipData.potongan_bpjs, dll */}
          <div className="flex justify-between items-center border-b pb-6 mb-6">
             <div className="flex items-center gap-3">
                <Building2 size={40} className="text-primary" />
                <div>
                  <h1 className="text-xl font-bold text-gray-800 uppercase tracking-tight">PT. BEST</h1>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Human Resource Information System</p>
                </div>
             </div>
             <div className="text-right">
                <h3 className="text-lg font-black text-gray-700 uppercase">Slip Gaji Digital</h3>
                <p className="text-sm font-bold text-primary">{periode}</p>
             </div>
          </div>
          
          {/* ... Detail Pendapatan & Potongan menggunakan formatRp(slipData.gaji_p1) ... */}
          <div className="bg-blue-50 p-6 rounded-xl flex justify-between items-center border border-blue-100 mb-6">
              <p className="text-sm font-black text-blue-900 tracking-widest">TAKE HOME PAY</p>
              <p className="text-3xl font-black text-primary">{formatRp(slipData.total_bersih)}</p>
          </div>
          
          <button className="w-full py-3 bg-secondary text-white rounded-xl font-bold flex items-center justify-center gap-2">
            <Download size={20} /> Cetak Slip Gaji (PDF)
          </button>
        </div>
      )}
    </div>
  );
}