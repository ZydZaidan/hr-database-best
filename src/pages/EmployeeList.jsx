import { useState, useEffect } from 'react';
import { Search, Filter, Plus, FileSpreadsheet, Eye, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. FUNGSI NARIK DATA DARI API (BACKEND)
  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://absensi-backend-production-6002.up.railway.app/api/karyawan');
      const result = await response.json();

      if (response.ok) {
        // Antisipasi format response dari BE (bisa aja { data: [...] } atau langsung array [...])
        setEmployees(result.data || result);
      } else {
        toast.error('Gagal memuat data karyawan');
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error('Koneksi ke server terputus');
    } finally {
      setIsLoading(false);
    }
  };

  // Jalanin fungsi fetch pas halaman pertama kali dibuka
  useEffect(() => {
    fetchEmployees();
  }, []);

  // 2. FUNGSI FILTER SEARCH (Pencarian)
  const filteredEmployees = employees.filter((employee) => {
    const namaMatch = (employee.nama || '').toLowerCase().includes(searchTerm.toLowerCase());
    const nikMatch = (employee.nik_karyawan || '').includes(searchTerm) || (employee.nik_ktp || '').includes(searchTerm);
    return namaMatch || nikMatch;
  });

  return (
    <div className="space-y-6">
      
      {/* --- BAGIAN HEADER & KONTROL --- */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Kiri: Search & Filter */}
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            <input 
              type="text"
              placeholder="Cari Nama atau NIK..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 text-gray-600">
            <Filter size={20} />
            <span className="hidden md:inline">Filter</span>
          </button>
        </div>

        {/* Kanan: Tombol Aksi Utama */}
        <div className="flex gap-2 w-full md:w-auto">
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg hover:brightness-90 transition-all w-full md:w-auto">
            <FileSpreadsheet size={20} />
            <span>Export Excel</span>
          </button>
          
          <Link 
            to="/add-employee" // <-- Sesuaikan dengan route AddEmployee lo
            className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:brightness-110 transition-all w-full md:w-auto"
          >
            <Plus size={20} />
            <span>Tambah Karyawan</span>
          </Link>
        </div>
      </div>

      {/* --- BAGIAN TABEL --- */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b">
              <tr>
                <th className="px-6 py-4">Nama Karyawan</th>
                <th className="px-6 py-4">NIK (KTP / Karyawan)</th>
                <th className="px-6 py-4">Jabatan</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                /* TAMPILAN LOADING */
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      Mengambil data dari server...
                    </div>
                  </td>
                </tr>
              ) : filteredEmployees.length > 0 ? (
                /* TAMPILAN DATA KARYAWAN */
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{emp.nama}</td>
                      <td className="px-6 py-4 text-gray-500">
                        <div className="flex flex-col">
                          <span>{emp.nik_karyawan !== '-' ? emp.nik_karyawan : 'N/A'}</span>
                          <span className="text-xs text-gray-400">{emp.nik_ktp}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{emp.jabatan_structural !== '-' ? emp.jabatan_structural : 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          emp.status_pegawai === 'PKWTT' 
                            ? 'bg-green-100 text-green-700' 
                            : emp.status_pegawai === 'PKWT'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-yellow-100 text-yellow-700' // Magang / Konsultan
                        }`}>
                          {emp.status_pegawai}                      
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => toast('Otw dibikin bro halamannya! 🚧')} className="p-2 text-gray-500 hover:text-primary hover:bg-blue-50 rounded-lg" title="Lihat Detail">
                            <Eye size={18} />
                          </button>
                          <button className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg" title="Edit Data">
                            <Edit size={18} />
                          </button>
                          <button className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg" title="Hapus">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                  </tr>
                ))
              ) : (
                /* TAMPILAN DATA KOSONG */
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <Search size={40} className="text-gray-200" />
                      <p>Karyawan tidak ditemukan.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Dummy */}
        <div className="px-6 py-4 border-t flex justify-between items-center text-sm text-gray-500 bg-gray-50">
          <p>Total data: {filteredEmployees.length} karyawan</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 border bg-white rounded hover:bg-gray-100 transition-colors">Sebelumnya</button>
            <button className="px-3 py-1 border bg-white rounded hover:bg-gray-100 transition-colors">Selanjutnya</button>
          </div>
        </div>
      </div>
    </div>
  );
}