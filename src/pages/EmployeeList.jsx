import { useState, useEffect } from 'react';
import { Search, Filter, FileSpreadsheet, Eye, Edit, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function EmployeeList() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // State untuk Modal Detail
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);

  // 1. FUNGSI NARIK DATA DARI API (GET)
  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://absensi-backend-production-6002.up.railway.app/api/karyawan');
      const result = await response.json();

      if (response.ok) {
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

  useEffect(() => {
    fetchEmployees();
  }, []);

  // 2. FUNGSI PENCARIAN (SEARCH)
  const filteredEmployees = employees.filter((employee) => {
    const namaMatch = (employee.nama || '').toLowerCase().includes(searchTerm.toLowerCase());
    const nikMatch = (employee.nik_karyawan || '').includes(searchTerm) || (employee.nik_ktp || '').includes(searchTerm);
    return namaMatch || nikMatch;
  });

  // ==========================================
  // FUNGSI AKSI TOMBOL (VIEW, EDIT, DELETE)
  // ==========================================

  // A. Tombol Lihat Detail (Munculin Pop-up/Modal)
  const handleView = (emp) => {
    setSelectedEmp(emp);
    setIsModalOpen(true);
  };

  // B. Tombol Edit (Arahin ke halaman edit)
  const handleEdit = (id) => {
    // Kita arahin ke rute edit (Nanti kita bikin komponen EditEmployee-nya)
    navigate(`/edit-karyawan/${id}`);
  };

  // C. Tombol Hapus (Konfirmasi & Hapus API)
  const handleDelete = async (id, nama) => {
    const isConfirm = window.confirm(`Yakin mau hapus data karyawan: ${nama}?`);
    
    if (isConfirm) {
      // 1. Hapus langsung dari tampilan layar (Biar UI kerasa cepet)
      setEmployees(employees.filter(emp => emp.id !== id));
      
      // 2. Tembak API DELETE ke Backend
      try {
        const response = await fetch(`https://absensi-backend-production-6002.up.railway.app/api/karyawan/${id}`, {
          method: 'DELETE',
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          toast.success(`Data ${nama} berhasil dihapus!`);
        } else {
          // Kalau gagal di DB, kita panggil ulang datanya biar balik lagi ke layar
          toast.error('Gagal menghapus data di database.');
          fetchEmployees(); 
        }
      } catch (error) {
        console.error("Error deleting:", error);
        toast.error('Koneksi error saat menghapus data.');
        fetchEmployees();
      }
    }
  };

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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 font-medium">
            <Filter size={20} />
            <span className="hidden md:inline">Filter</span>
          </button>
        </div>

        {/* Kanan: Tombol Aksi Utama (Tombol Tambah Karyawan Dihapus) */}
        <div className="flex gap-2 w-full md:w-auto">
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium w-full md:w-auto shadow-sm">
            <FileSpreadsheet size={20} />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* --- BAGIAN TABEL --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
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
                    <div className="flex justify-center items-center gap-3">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <span className="font-medium">Mengambil data dari server...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredEmployees.length > 0 ? (
                /* TAMPILAN DATA KARYAWAN */
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-blue-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-800">{emp.nama}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-700">{emp.nik_karyawan !== '-' ? emp.nik_karyawan : 'N/A'}</span>
                          <span className="text-xs text-gray-400 font-mono mt-0.5">{emp.nik_ktp}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-medium">
                        {emp.jabatan_structural && emp.jabatan_structural !== '-' ? emp.jabatan_structural : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                          emp.status_pegawai === 'PKWTT' ? 'bg-green-100 text-green-700 border border-green-200' : 
                          emp.status_pegawai === 'PKWT' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 
                          'bg-orange-100 text-orange-700 border border-orange-200'
                        }`}>
                          {emp.status_pegawai || 'Internship'}                      
                        </span>
                      </td>
                      
                      {/* --- TOMBOL AKSI --- */}
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-3">
                          <button 
                            onClick={() => handleView(emp)}
                            className="text-gray-400 hover:text-blue-600 transition-colors" 
                            title="Lihat Detail"
                          >
                            <Eye size={20} />
                          </button>
                          <button 
                            onClick={() => handleEdit(emp.id)}
                            className="text-gray-400 hover:text-green-600 transition-colors" 
                            title="Edit Data"
                          >
                            <Edit size={20} />
                          </button>
                          <button 
                            onClick={() => handleDelete(emp.id, emp.nama)}
                            className="text-gray-400 hover:text-red-600 transition-colors" 
                            title="Hapus Karyawan"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </td>
                  </tr>
                ))
              ) : (
                /* TAMPILAN DATA KOSONG */
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-gray-100 rounded-full">
                        <Search size={32} className="text-gray-400" />
                      </div>
                      <p className="font-medium text-lg">Karyawan tidak ditemukan</p>
                      <p className="text-sm text-gray-400">Coba gunakan kata kunci pencarian yang lain.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Info */}
        <div className="px-6 py-4 border-t flex justify-between items-center text-sm text-gray-500 bg-gray-50/80">
          <p className="font-medium">Total data: <span className="text-gray-800">{filteredEmployees.length}</span> karyawan</p>
          <div className="flex gap-2">
            <button className="px-4 py-2 border bg-white rounded-lg hover:bg-gray-100 transition-colors font-medium">Sebelumnya</button>
            <button className="px-4 py-2 border bg-white rounded-lg hover:bg-gray-100 transition-colors font-medium">Selanjutnya</button>
          </div>
        </div>
      </div>

      {/* ==========================================
          MODAL DETAIL KARYAWAN (POP-UP)
          ========================================== */}
      {isModalOpen && selectedEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">Detail Karyawan</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              
              {/* Info Dasar */}
              <div className="flex items-center gap-4 pb-6 border-b">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold uppercase">
                  {selectedEmp.nama.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedEmp.nama}</h3>
                  <p className="text-gray-500">{selectedEmp.jabatan_structural !== '-' ? selectedEmp.jabatan_structural : 'Belum ada jabatan'}</p>
                </div>
              </div>

              {/* Grid Data */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status Pegawai</p>
                  <p className="font-semibold text-gray-800">{selectedEmp.status_pegawai || 'Internship'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">NIK KTP</p>
                  <p className="font-mono text-gray-800">{selectedEmp.nik_ktp}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">NIK Karyawan</p>
                  <p className="font-mono text-gray-800">{selectedEmp.nik_karyawan}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Jenis Kelamin</p>
                  <p className="font-semibold text-gray-800">{selectedEmp.jenis_kelamin}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Nomor HP</p>
                  <p className="font-semibold text-gray-800">{selectedEmp.no_hp}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Agama</p>
                  <p className="font-semibold text-gray-800">{selectedEmp.agama}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 mb-1">Alamat Domisili</p>
                  <p className="font-semibold text-gray-800">{selectedEmp.alamat_domisili}</p>
                </div>
              </div>
              
              {/* Note untuk data lain */}
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <p className="text-sm text-blue-800">
                  <strong>Catatan:</strong> Data finansial, karir, dan sertifikat disembunyikan dalam *view* cepat ini. Klik tombol <strong>Edit Data</strong> untuk melihat atau mengubah seluruh riwayat.
                </p>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors"
              >
                Tutup
              </button>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  handleEdit(selectedEmp.id);
                }}
                className="px-5 py-2 bg-primary text-white font-medium hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <Edit size={18} /> Edit Data Ini
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}