import { useState, useEffect } from 'react';
import { PieChart, BarChart, Users, GraduationCap, Briefcase } from 'lucide-react';

export default function RekapAnalisis() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    gender: { L: 0, P: 0 },
    pendidikan: { SMA: 0, DIPLOMA: 0, S1: 0, S2: 0, Lainnya: 0 },
    status: { PKWTT: 0, PKWT: 0, Internship: 0, THL: 0 }
  });

  useEffect(() => {
    const fetchAndCalculateData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('https://absensi-backend-production-6002.up.railway.app/api/karyawan');
        const result = await response.json();

        if (response.ok) {
          const employees = result.data || result;
          const total = employees.length;

          // Bikin keranjang buat ngitung
          let gender = { L: 0, P: 0 };
          let pendidikan = { SMA: 0, DIPLOMA: 0, S1: 0, S2: 0, Lainnya: 0 };
          let status = { PKWTT: 0, PKWT: 0, Internship: 0, THL: 0 };

          employees.forEach(emp => {
            // 1. Hitung Gender
            if (emp.jenis_kelamin === 'Laki-laki' || emp.jenis_kelamin === 'L') gender.L++;
            else if (emp.jenis_kelamin === 'Perempuan' || emp.jenis_kelamin === 'P') gender.P++;

            // 2. Hitung Pendidikan
            const edu = emp.jenjang_pendidikan || '';
            if (edu.includes('SMA') || edu.includes('SMK')) pendidikan.SMA++;
            else if (edu.includes('DIPLOMA') || edu.includes('D3') || edu.includes('D4')) pendidikan.DIPLOMA++;
            else if (edu === 'S1') pendidikan.S1++;
            else if (edu === 'S2') pendidikan.S2++;
            else pendidikan.Lainnya++; // SD, SMP, S3, dll

            // 3. Hitung Status
            const stat = emp.status_pegawai || 'Internship';
            if (stat === 'PKWTT') status.PKWTT++;
            else if (stat === 'PKWT') status.PKWT++;
            else if (stat === 'THL') status.THL++;
            else status.Internship++;
          });

          setStats({ total, gender, pendidikan, status });
        }
      } catch (error) {
        console.error("Gagal memuat data analisis", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndCalculateData();
  }, []);

  // Fungsi buat ngitung persentase (biar bar chart-nya akurat)
  const getPercent = (value, total) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center font-bold text-gray-500 gap-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p>Memproses Data Analisis...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <PieChart className="text-primary" size={28} /> Rekap & Analisis Data
          </h1>
          <p className="text-gray-500 mt-1">Laporan demografi dan statistik karyawan PT. BEST.</p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-sm text-gray-500 font-medium">Total Karyawan Terdata</p>
          <p className="text-3xl font-extrabold text-primary">{stats.total} <span className="text-lg text-gray-400 font-medium">Orang</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ================= CARD 1: DEMOGRAFI GENDER ================= */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-6 border-b pb-2">
            <Users className="text-blue-500" size={20} /> Demografi Gender
          </h2>
          
          <div className="flex justify-center items-center gap-8 mb-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-2 border-4 border-white shadow-md">
                {getPercent(stats.gender.L, stats.total)}%
              </div>
              <p className="font-semibold text-gray-700">Laki-laki</p>
              <p className="text-sm text-gray-500">{stats.gender.L} Orang</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-2 border-4 border-white shadow-md">
                {getPercent(stats.gender.P, stats.total)}%
              </div>
              <p className="font-semibold text-gray-700">Perempuan</p>
              <p className="text-sm text-gray-500">{stats.gender.P} Orang</p>
            </div>
          </div>

          {/* Visual Bar Gender */}
          <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden flex">
            <div style={{ width: `${getPercent(stats.gender.L, stats.total)}%` }} className="bg-blue-500 h-full transition-all duration-1000"></div>
            <div style={{ width: `${getPercent(stats.gender.P, stats.total)}%` }} className="bg-pink-500 h-full transition-all duration-1000"></div>
          </div>
        </div>

        {/* ================= CARD 2: STATUS PEGAWAI ================= */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-6 border-b pb-2">
            <Briefcase className="text-indigo-500" size={20} /> Sebaran Status Pegawai
          </h2>
          
          <div className="space-y-4">
            {[
              { label: 'Pegawai Tetap (PKWTT)', count: stats.status.PKWTT, color: 'bg-green-500' },
              { label: 'Pegawai Kontrak (PKWT)', count: stats.status.PKWT, color: 'bg-blue-500' },
              { label: 'Magang / Internship', count: stats.status.Internship, color: 'bg-orange-500' },
              { label: 'Tenaga Harian Lepas (THL)', count: stats.status.THL, color: 'bg-purple-500' },
            ].map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-sm font-medium mb-1">
                  <span className="text-gray-700">{item.label}</span>
                  <span className="text-gray-600">{item.count} Orang ({getPercent(item.count, stats.total)}%)</span>
                </div>
                <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    style={{ width: `${getPercent(item.count, stats.total)}%` }} 
                    className={`${item.color} h-full rounded-full transition-all duration-1000`}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ================= CARD 3: TINGKAT PENDIDIKAN ================= */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-6 border-b pb-2">
            <GraduationCap className="text-teal-500" size={20} /> Tingkat Pendidikan Terakhir
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {[
                { label: 'Sarjana (S1)', count: stats.pendidikan.S1, color: 'bg-teal-500' },
                { label: 'Magister (S2)', count: stats.pendidikan.S2, color: 'bg-teal-700' },
                { label: 'Diploma (D3/D4)', count: stats.pendidikan.DIPLOMA, color: 'bg-teal-400' },
              ].map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-sm font-medium mb-1">
                    <span className="text-gray-700">{item.label}</span>
                    <span className="text-gray-600">{item.count} Orang</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div style={{ width: `${getPercent(item.count, stats.total)}%` }} className={`${item.color} h-full rounded-full transition-all duration-1000`}></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              {[
                { label: 'SMA / SMK Sederajat', count: stats.pendidikan.SMA, color: 'bg-teal-300' },
                { label: 'Lainnya (SD/SMP)', count: stats.pendidikan.Lainnya, color: 'bg-gray-400' },
              ].map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-sm font-medium mb-1">
                    <span className="text-gray-700">{item.label}</span>
                    <span className="text-gray-600">{item.count} Orang</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div style={{ width: `${getPercent(item.count, stats.total)}%` }} className={`${item.color} h-full rounded-full transition-all duration-1000`}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}