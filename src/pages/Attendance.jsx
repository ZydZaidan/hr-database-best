import { useState } from 'react';
import { CalendarCheck, Clock, MapPin, CheckCircle } from 'lucide-react';

export default function Attendance() {
  // Data dummy riwayat absen
  const [history] = useState([
    { tanggal: '2026-02-19', masuk: '07:55', pulang: '17:05', status: 'Hadir' },
    { tanggal: '2026-02-18', masuk: '08:00', pulang: '17:00', status: 'Hadir' },
    { tanggal: '2026-02-17', masuk: '-', pulang: '-', status: 'Sakit' },
  ]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Widget Absensi Hari Ini */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Absensi Hari Ini</h2>
          <p className="text-gray-500 mt-1 flex items-center gap-2">
            <CalendarCheck size={16} /> 19 Februari 2026
          </p>
        </div>


      {/* Tabel Riwayat Absen */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Riwayat Absensi Bulan Ini</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b">
              <tr>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Jam Masuk</th>
                <th className="px-6 py-4">Jam Pulang</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {history.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{item.tanggal}</td>
                  <td className="px-6 py-4 text-gray-600">{item.masuk}</td>
                  <td className="px-6 py-4 text-gray-600">{item.pulang}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.status === 'Hadir' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {item.status}
                    </span>
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