import { useState, useEffect, useCallback } from 'react';
import { Download, Wallet, Building2, Calendar, Loader2, MinusCircle, PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Payslip() {
  const [slipData, setSlipData] = useState(null);
  const [periode, setPeriode] = useState(''); 
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false); // State baru untuk loading download

  const token = localStorage.getItem('auth_token');

  const fetchPayslip = useCallback(async () => {
    if (!periode) return;
    setIsLoading(true);
    try {
      const res = await fetch(`https://absensi-backend-production-6002.up.railway.app/api/karyawan/get-payslip?bulan=${periode}`, {
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
        }
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setSlipData(result.data);
      } else {
        setSlipData(null);
        toast.error(result.message || 'Data gaji periode ini belum tersedia.');
      }
    } catch { toast.error('Koneksi terputus'); }
    finally { setIsLoading(false); }
  }, [token, periode]);

  useEffect(() => {
    fetchPayslip();
  }, [fetchPayslip]);

  const formatRp = (angka) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka || 0);

  // ==========================================
  // FUNGSI DOWNLOAD PDF DENGAN TOKEN OTORISASI
  // ==========================================
  const handleDownloadPDF = async () => {
    if (!slipData?.id) return;
    setIsDownloading(true);
    const loadingToast = toast.loading('Menyiapkan file PDF...');
    
    try {
      const response = await fetch(`https://absensi-backend-production-6002.up.railway.app/api/admin/cetak-payslip/${slipData.id}`, {
        method: 'GET',
        headers: { 
            'Authorization': `Bearer ${token}` 
        } // Token otorisasi disisipkan di sini
      });

      if (!response.ok) throw new Error('Gagal mengunduh');

      // Ubah response menjadi blob (file binary PDF)
      const blob = await response.blob();
      
      // Buat URL sementara untuk blob tersebut
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Slip_Gaji_${periode}.pdf`); // Nama file saat didownload
      document.body.appendChild(link);
      link.click();
      
      // Bersihkan URL sementara dari memory
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Slip Gaji berhasil diunduh!', { id: loadingToast });
    } catch (error) {
      console.error(error);
      toast.error('Gagal mengunduh Slip Gaji.', { id: loadingToast });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex justify-between items-end mb-6 bg-white p-6 rounded-xl border shadow-sm">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-primary">
            <Wallet size={24} /> Riwayat Slip Gaji Digital
          </h2>
          <p className="text-xs text-gray-500 font-medium">Silakan pilih periode bulan untuk melihat rincian gaji Anda.</p>
        </div>
        <input 
          type="month" 
          value={periode} 
          onChange={(e) => setPeriode(e.target.value)}
          className="p-2.5 border-2 border-gray-100 rounded-lg focus:border-primary outline-none text-sm font-bold text-gray-700 transition-all"
        />
      </div>

      {!slipData ? (
        <div className="bg-white p-20 text-center rounded-xl border border-dashed text-gray-400">
          {isLoading ? <Loader2 className="animate-spin mx-auto mb-2" /> : <Calendar className="mx-auto mb-2 opacity-10" size={64} />}
          <p className="font-bold">{isLoading ? 'Menghubungkan ke server PT. BEST...' : 'Belum ada periode yang dipilih.'}</p>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-xl shadow-xl border-t-8 border-primary animate-fade-in">
          {/* Kop Surat */}
          <div className="flex justify-between items-start border-b-2 border-gray-50 pb-8 mb-8">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 rounded-2xl text-primary"><Building2 size={32} /></div>
                <div>
                  <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tighter">PT. BEST</h1>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Payroll Information System</p>
                </div>
             </div>
             <div className="text-right">
                <h3 className="text-sm font-black text-gray-400 uppercase mb-1">Periode Gaji</h3>
                <p className="px-4 py-1 bg-primary text-white rounded-full text-xs font-bold inline-block">{periode}</p>
             </div>
          </div>

          {/* Grid Rincian */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-10">
            {/* Pendapatan */}
            <div className="space-y-4">
              <h4 className="flex items-center gap-2 font-black text-gray-800 border-b pb-2 text-sm uppercase tracking-wider">
                <PlusCircle size={16} className="text-green-500" /> Penerimaan
              </h4>
              <div className="space-y-3 text-sm font-medium text-gray-600">
                <div className="flex justify-between"><span>Gaji Pokok (P1)</span><span className="text-gray-900 font-bold">{formatRp(slipData.gaji_p1)}</span></div>
                <div className="flex justify-between"><span>Tunjangan (P2)</span><span className="text-gray-900 font-bold">{formatRp(slipData.gaji_p2)}</span></div>
              </div>
            </div>

            {/* Potongan */}
            <div className="space-y-4">
              <h4 className="flex items-center gap-2 font-black text-gray-800 border-b pb-2 text-sm uppercase tracking-wider">
                <MinusCircle size={16} className="text-red-500" /> Potongan
              </h4>
              <div className="space-y-3 text-sm font-medium text-gray-600">
                <div className="flex justify-between"><span>BPJS Kesehatan/TK</span><span className="text-red-500 font-bold">-{formatRp(slipData.potongan_bpjs)}</span></div>
                <div className="flex justify-between"><span>Pajak (PPh 21)</span><span className="text-red-500 font-bold">-{formatRp(slipData.potongan_pajak)}</span></div>
              </div>
            </div>
          </div>
          
          {/* Hasil Akhir */}
          <div className="bg-blue-900 p-8 rounded-2xl flex justify-between items-center shadow-lg shadow-blue-100 mb-8 transition-transform hover:scale-[1.01]">
              <div>
                <p className="text-[10px] font-black text-blue-300 tracking-[0.2em] uppercase mb-1">Take Home Pay</p>
                <p className="text-sm text-white font-medium opacity-80 italic">Sudah termasuk potongan pajak & BPJS</p>
              </div>
              <p className="text-4xl font-black text-white">{formatRp(slipData.total_bersih)}</p>
          </div>
          
          {/* Aksi: Ganti tag <a> menjadi <button> dan gunakan handleDownloadPDF */}
          <button 
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className={`w-full py-4 rounded-xl font-black flex items-center justify-center gap-3 transition-all shadow-lg ${isDownloading ? 'bg-gray-400 cursor-not-allowed' : 'bg-secondary text-white hover:brightness-110 shadow-green-100'}`}
          >
            {isDownloading ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
            {isDownloading ? 'MENGUNDUH...' : 'DOWNLOAD SLIP GAJI (PDF)'}
          </button>
        </div>
      )}
    </div>
  );
}