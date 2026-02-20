import { useState } from 'react';
import { Search, Filter, Plus, FileSpreadsheet, Eye, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmployeeList() {
// 1. Data Dummy (Sesuaikan key-nya dengan database Backend)
  const [employees] = useState([
    { id: 1, nama: 'Budi Santoso', nik_karyawan: '1234567890', jabatan_structural: 'Frontend Dev', status_pegawai: 'PKWTT' },
    { id: 2, nama: 'Siti Aminah', nik_karyawan: '0987654321', jabatan_structural: 'UI/UX Designer', status_pegawai: 'PKWT' },
    { id: 3, nama: 'Andi Pratama', nik_karyawan: '1122334455', jabatan_structural: 'Backend Dev', status_pegawai: 'PKWTT' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  // 2. Fungsi Filter Sederhana (Ganti .nik jadi .nik_karyawan)
  const filteredEmployees = employees.filter((employee) =>
    employee.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.nik_karyawan.includes(searchTerm)
  );

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
            to="/tambah-karyawan" 
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
                <th className="px-6 py-4">NIK</th>
                <th className="px-6 py-4">Jabatan</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{emp.nama}</td>
                      {/* Ubah 3 baris di bawah ini */}
                      <td className="px-6 py-4 text-gray-500">{emp.nik_karyawan}</td>
                      <td className="px-6 py-4 text-gray-500">{emp.jabatan_structural}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          emp.status_pegawai === 'PKWTT' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {emp.status_pegawai}                      
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button className="p-2 text-gray-500 hover:text-primary hover:bg-blue-50 rounded-lg" title="Lihat Detail">
                          <Eye size={18} />
                        </button>
                        <button className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg" title="Edit Data">
                          <Edit size={18} />
                        </button>
                        <button className="p-2 text-gray-500 hover:text-danger hover:bg-red-50 rounded-lg" title="Hapus">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                /* --- TAMPILAN JIKA DATA KOSONG --- */
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
        <div className="px-6 py-4 border-t flex justify-between items-center text-sm text-gray-500">
          <p>Menampilkan 1-3 dari 3 karyawan</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 border rounded hover:bg-gray-50" disabled>Previous</button>
            <button className="px-3 py-1 border rounded hover:bg-gray-50" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}