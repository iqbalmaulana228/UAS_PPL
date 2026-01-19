import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';

import {
  Home,
  Clock,
  User,
  MapPin,
  History,
  LogOut,
  Users,
  FileText,
  Bell,
  Check,
  X,
  ShieldCheck,
  Upload,
  Download,
  Filter
} from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [role, setRole] = useState('employee'); // 'employee' atau 'admin'
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [duration, setDuration] = useState("0 jam 0 menit");
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [filterStartDate, setFilterStartDate] = useState(null);
  const [filterEndDate, setFilterEndDate] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');

  // Simulasi Data User
  const user = {
    name: "Muhammad Iqbal Maulana",
    position: "Staff IT",
    nim: "20230801352",
    email: "iqbal.maulana@esaunggul.ac.id",
    dept: "Teknik Informatika"
  };

  // State untuk Izin/Cuti (Request Time-Off)
  const [timeOffRequests, setTimeOffRequests] = useState([
    { id: 101, user: "Muhammad Iqbal Maulana", type: "Izin Sakit", date: "15 Okt 2025", reason: "Demam tinggi", status: "Approved", attachment: true },
    { id: 102, user: "Ananda Dimas", type: "Cuti Tahunan", date: "20 Okt 2025", reason: "Acara Keluarga", status: "Pending", attachment: false },
  ]);

  // Simulasi Data Riwayat Absensi
  const logs = [
    { date: "28 Okt 2025", day: "Senin", in: "08:00", out: "17:00", duration: "9 jam 0 menit", status: "COMPLETED" },
    { date: "29 Okt 2025", day: "Selasa", in: "07:55", out: "17:05", duration: "9 jam 10 menit", status: "COMPLETED" },
    { date: "30 Okt 2025", day: "Rabu", in: "08:10", out: "17:00", duration: "8 jam 50 menit", status: "COMPLETED" },
    { date: "31 Okt 2025", day: "Kamis", in: "07:50", out: "17:10", duration: "9 jam 20 menit", status: "COMPLETED" },
    { date: "01 Nov 2025", day: "Jumat", in: "08:05", out: "17:00", duration: "8 jam 55 menit", status: "COMPLETED" },
  ];

  // Simulasi Live Attendance (Admin/Karyawan View)
  const liveKaryawan = [
    { id: 1, name: "Ananda Dimas Sucianto", time: "07:55", duration: "7 jam 28 menit", initial: "AD", status: "WORKING" },
    { id: 2, name: "Muhammad Filzah Tresnadi", time: "08:00", duration: "7 jam 23 menit", initial: "MF", status: "WORKING" },
    { id: 3, name: "Siti Nurhaliza", time: "08:15", duration: "7 jam 08 menit", initial: "SN", status: "WORKING" },
  ];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isClockedIn && clockInTime) {
      const updateDuration = () => {
        const diff = new Date() - clockInTime;
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        setDuration(`${hours} jam ${minutes} menit`);
      };
      const durationTimer = setInterval(updateDuration, 60000);
      updateDuration();
      return () => clearInterval(durationTimer);
    }
  }, [isClockedIn, clockInTime]);

  const handleClockAction = () => {
    if (!isClockedIn) {
      setIsGpsLoading(true);
      // Simulasi validasi GPS (Requirements 2.2)
      setTimeout(() => {
        setIsGpsLoading(false);
        setIsClockedIn(true);
        setClockInTime(new Date());
      }, 1500);
    } else {
      setIsClockedIn(false);
      setClockInTime(null);
      setDuration("0 jam 0 menit");
    }
  };

  const handleProcessRequest = (id, newStatus) => {
    setTimeOffRequests(prev => prev.map(req => req.id === id ? {...req, status: newStatus} : req));
  };

  // Function to filter logs based on date and status
  const getFilteredLogs = () => {
    return logs.filter(log => {
      const [, monthYear] = log.date.split(' ');
      const [date, month, year] = monthYear.split(' ');
      const monthMap = { 'Okt': '10', 'Nov': '11', 'Des': '12', 'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'Mei': '05', 'Jun': '06', 'Jul': '07', 'Ags': '08', 'Sep': '09' };
      const logDate = new Date(`${year}-${monthMap[month]}-${date.padStart(2, '0')}`);
      const startMatch = !filterStartDate || logDate >= filterStartDate;
      const endMatch = !filterEndDate || logDate <= filterEndDate;
      const statusMatch = !filterStatus || log.status === filterStatus;
      return startMatch && endMatch && statusMatch;
    });
  };

  // Function to download logs as Excel
  const downloadExcel = () => {
    const filteredLogs = getFilteredLogs();
    const worksheet = XLSX.utils.json_to_sheet(filteredLogs);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Logs");
    XLSX.writeFile(workbook, "attendance_logs.xlsx");
  };

  // Function to download logs as PDF
  const downloadPDF = () => {
    const filteredLogs = getFilteredLogs();
    const doc = new jsPDF();
    doc.text("Rekap Data Absensi", 20, 10);
    const tableColumn = ["Tanggal", "Hari", "Masuk", "Keluar", "Durasi", "Status"];
    const tableRows = filteredLogs.map(log => [log.date, log.day, log.in, log.out, log.duration, log.status]);
    // Simple table without autoTable for compatibility
    let y = 30;
    tableColumn.forEach((col, index) => {
      doc.text(col, 20 + index * 30, y);
    });
    y += 10;
    tableRows.forEach(row => {
      row.forEach((cell, index) => {
        doc.text(cell, 20 + index * 30, y);
      });
      y += 10;
    });
    doc.save("attendance_logs.pdf");
  };

  // Function to submit time-off request
  const handleSubmitTimeOff = () => {
    const newRequest = {
      id: timeOffRequests.length + 101,
      user: user.name,
      type: document.querySelector('select').value,
      date: document.querySelectorAll('input[type="date"]')[0].value + ' - ' + document.querySelectorAll('input[type="date"]')[1].value,
      reason: document.querySelector('textarea').value,
      status: 'Pending',
      attachment: false
    };
    setTimeOffRequests(prev => [...prev, newRequest]);
    // Reset form
    document.querySelector('select').value = 'Izin Sakit';
    document.querySelectorAll('input[type="date"]').forEach(input => input.value = '');
    document.querySelector('textarea').value = '';
    alert('Pengajuan izin berhasil dikirim!');
  };

  const renderContent = () => {
    if (role === 'admin' && activeTab === 'home') {
      return (
        <div className="space-y-6 animate-in fade-in duration-500">
           <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-lg">
              <h2 className="text-xl font-bold mb-1">Admin Dashboard</h2>
              <p className="text-blue-100 text-xs">Monitoring Kehadiran Global & Persetujuan</p>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-white/10 p-3 rounded-xl border border-white/20">
                  <p className="text-[10px] uppercase opacity-70">Total Karyawan</p>
                  <p className="text-2xl font-bold">128</p>
                </div>
                <div className="bg-white/10 p-3 rounded-xl border border-white/20">
                  <p className="text-[10px] uppercase opacity-70">Hadir Hari Ini</p>
                  <p className="text-2xl font-bold">115</p>
                </div>
              </div>
           </div>

           {/* Pending Requests Section (Halaman 10 PDF) */}
           <div>
              <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                <FileText size={18} className="mr-2 text-blue-600" />
                Persetujuan Izin Pending
              </h3>
              <div className="space-y-3">
                {timeOffRequests.filter(r => r.status === 'Pending').map(req => (
                  <div key={req.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-sm text-gray-800">{req.user}</p>
                        <p className="text-xs text-blue-600 font-medium">{req.type} • {req.date}</p>
                      </div>
                      <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-bold">PENDING</span>
                    </div>
                    <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded">"{req.reason}"</p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleProcessRequest(req.id, 'Approved')}
                        className="flex-1 bg-green-600 text-white text-xs py-2 rounded-lg font-bold flex items-center justify-center space-x-1"
                      >
                        <Check size={14} /> <span>Setujui</span>
                      </button>
                      <button
                        onClick={() => handleProcessRequest(req.id, 'Rejected')}
                        className="flex-1 bg-red-50 text-red-600 text-xs py-2 rounded-lg font-bold flex items-center justify-center space-x-1"
                      >
                        <X size={14} /> <span>Tolak</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
           </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'home':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Profil Singkat */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
                  MI
                </div>
                <div>
                  <h2 className="text-md font-bold text-gray-800">{user.name}</h2>
                  <p className="text-xs text-gray-500">{user.position} • {user.nim}</p>
                </div>
              </div>
              <div className="relative">
                <Bell size={20} className="text-gray-400" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </div>
            </div>

            {/* Status Kehadiran Card */}
            <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Clock size={120} />
              </div>
              <p className="text-blue-100 text-xs font-medium mb-1">Status Kehadiran Hari Ini</p>
              <h3 className="text-2xl font-bold mb-6 flex items-center">
                {isClockedIn ? "BEKERJA (AKTIF)" : "BELUM ABSEN"}
                <span className={`ml-2 w-3 h-3 rounded-full ${isClockedIn ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></span>
              </h3>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
                  <p className="text-[10px] text-blue-200 mb-1 uppercase tracking-wider">Clock-In</p>
                  <p className="text-sm font-semibold">{isClockedIn ? clockInTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'} WIB</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
                  <p className="text-[10px] text-blue-200 mb-1 uppercase tracking-wider">Durasi Kerja</p>
                  <p className="text-sm font-semibold">{isClockedIn ? duration : '0 jam 0 menit'}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-xs text-blue-100 mb-6 bg-blue-800/40 w-fit px-3 py-1.5 rounded-full">
                <MapPin size={14} />
                <span>Kantor Pusat Jakarta (GPS Terverifikasi)</span>
              </div>

              <button
                onClick={handleClockAction}
                disabled={isGpsLoading}
                className={`w-full py-4 rounded-2xl font-bold text-lg transition-all transform active:scale-95 shadow-lg flex items-center justify-center space-x-2 ${
                  isClockedIn
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-white hover:bg-blue-50 text-blue-900'
                }`}
              >
                {isGpsLoading ? (
                  <><div className="w-5 h-5 border-2 border-blue-900 border-t-transparent animate-spin rounded-full"></div> <span>Validasi GPS...</span></>
                ) : (
                  <span>{isClockedIn ? 'CLOCK-OUT' : 'CLOCK-IN'}</span>
                )}
              </button>
            </div>

            {/* Quick Actions (Fitur Izin) */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setActiveTab('timeoff')}
                className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center space-y-2 hover:bg-blue-50 transition-colors"
              >
                <div className="p-2 bg-orange-50 text-orange-600 rounded-xl">
                  <FileText size={20} />
                </div>
                <span className="text-xs font-bold text-gray-700">Ajukan Izin</span>
              </button>
              <button
                onClick={() => setActiveTab('log')}
                className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center space-y-2 hover:bg-blue-50 transition-colors"
              >
                <div className="p-2 bg-green-50 text-green-600 rounded-xl">
                  <History size={20} />
                </div>
                <span className="text-xs font-bold text-gray-700">Riwayat</span>
              </button>
            </div>
          </div>
        );
      case 'timeoff':
        return (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <h2 className="text-xl font-bold text-gray-800">Pengajuan Izin/Cuti</h2>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Jenis Pengajuan</label>
                <select className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                  <option>Izin Sakit</option>
                  <option>Cuti Tahunan</option>
                  <option>Keperluan Mendesak</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Tanggal Mulai</label>
                  <input type="date" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Tanggal Selesai</label>
                  <input type="date" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Alasan</label>
                <textarea rows="3" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Tuliskan alasan detail..."></textarea>
              </div>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center space-y-2 text-gray-400">
                <Upload size={24} />
                <span className="text-xs font-medium">Upload Bukti (Opsional)</span>
              </div>
              <button className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-blue-700 active:scale-95 transition-all">
                Kirim Pengajuan
              </button>
            </div>

            <div>
              <h3 className="font-bold text-gray-800 mb-3">Status Pengajuan Terakhir</h3>
              {timeOffRequests.map(req => (
                <div key={req.id} className="bg-white p-4 rounded-xl border border-gray-100 mb-2 flex justify-between items-center shadow-sm">
                  <div>
                    <p className="font-bold text-sm text-gray-800">{req.type}</p>
                    <p className="text-[10px] text-gray-400">{req.date}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${
                    req.status === 'Approved' ? 'bg-green-100 text-green-700' : 
                    req.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {req.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      case 'log':
        const filteredLogs = getFilteredLogs();
        return (
          <div className="space-y-4 animate-in slide-in-from-right duration-300">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Log Kehadiran Bulanan</h2>

            {/* Filter Section */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
              <div className="flex items-center space-x-2 mb-2">
                <Filter size={16} className="text-blue-600" />
                <span className="text-sm font-bold text-gray-700">Filter Riwayat Absensi</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Tanggal Mulai</label>
                  <DatePicker
                    selected={filterStartDate}
                    onChange={setFilterStartDate}
                    dateFormat="dd/MM/yyyy"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholderText="Pilih tanggal mulai"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Tanggal Akhir</label>
                  <DatePicker
                    selected={filterEndDate}
                    onChange={setFilterEndDate}
                    dateFormat="dd/MM/yyyy"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholderText="Pilih tanggal akhir"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Semua Status</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="PENDING">PENDING</option>
                </select>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setFilterStartDate(null);
                    setFilterEndDate(null);
                    setFilterStatus('');
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 text-xs py-2 rounded-lg font-bold hover:bg-gray-300 transition-colors"
                >
                  Reset Filter
                </button>
              </div>
            </div>

            {/* Download Buttons */}
            <div className="flex space-x-2">
              <button
                onClick={downloadExcel}
                className="flex-1 bg-green-600 text-white text-xs py-3 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-green-700 transition-colors"
              >
                <Download size={14} />
                <span>Download Excel</span>
              </button>
              <button
                onClick={downloadPDF}
                className="flex-1 bg-red-600 text-white text-xs py-3 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-red-700 transition-colors"
              >
                <Download size={14} />
                <span>Download PDF</span>
              </button>
            </div>

            {/* Logs List */}
            {filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <History size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-sm">Tidak ada data absensi yang sesuai dengan filter.</p>
              </div>
            ) : (
              filteredLogs.map((log, i) => (
                <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-bold text-gray-800 text-sm">{log.day}, {log.date}</span>
                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${
                      log.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {log.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                      <p className="text-[9px] text-gray-400 uppercase font-bold">In</p>
                      <p className="text-xs font-bold">{log.in}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                      <p className="text-[9px] text-gray-400 uppercase font-bold">Out</p>
                      <p className="text-xs font-bold">{log.out}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                      <p className="text-[9px] text-gray-400 uppercase font-bold">Total</p>
                      <p className="text-xs font-bold">{log.duration}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        );
      case 'live':
        return (
          <div className="space-y-4 animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-end mb-2">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Live Monitor</h2>
                <p className="text-sm text-gray-500">Daftar Karyawan Aktif Bekerja</p>
              </div>
              <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold animate-pulse">
                REAL-TIME
              </div>
            </div>
            <div className="space-y-3">
              {liveKaryawan.map((k) => (
                <div key={k.id} className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center font-bold text-blue-600 border border-blue-100">
                      {k.initial}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-800">{k.name}</p>
                      <p className="text-[10px] text-green-600 font-bold tracking-tight">{k.status}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-gray-400">In: {k.time} WIB</p>
                    <p className="text-xs font-bold text-gray-700">{k.duration}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="text-center py-6">
              <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-xl mx-auto mb-4 border-4 border-white">
                MI
              </div>
              <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
              <p className="text-gray-500 text-sm">{user.nim}</p>
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => {
                    setRole(role === 'employee' ? 'admin' : 'employee');
                    setActiveTab('home');
                  }}
                  className="flex items-center space-x-2 bg-slate-800 text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-slate-700 transition-colors"
                >
                  <ShieldCheck size={14} />
                  <span>Switch to {role === 'employee' ? 'Admin View' : 'Employee View'}</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-50">
                <p className="text-[10px] text-gray-400 mb-1 font-bold uppercase">Posisi / Jabatan</p>
                <p className="font-semibold text-gray-800 text-sm">{user.position}</p>
              </div>
              <div className="p-4 border-b border-gray-50">
                <p className="text-[10px] text-gray-400 mb-1 font-bold uppercase">Email Institusi</p>
                <p className="font-semibold text-gray-800 text-sm">{user.email}</p>
              </div>
              <div className="p-4 border-b border-gray-50">
                <p className="text-[10px] text-gray-400 mb-1 font-bold uppercase">Departemen</p>
                <p className="font-semibold text-gray-800 text-sm">{user.dept}</p>
              </div>
              <div className="p-4 bg-red-50 cursor-pointer flex items-center justify-center space-x-2 text-red-600 font-bold text-sm">
                <LogOut size={18} />
                <span>Keluar Aplikasi</span>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24 text-slate-900 flex justify-center">
      <div className="w-full max-w-md bg-slate-50 min-h-screen shadow-2xl relative">
        {/* Header */}
        <header className="bg-white px-6 py-4 sticky top-0 z-30 shadow-sm border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-xs">EU</span>
            </div>
            <div>
              <h1 className="text-sm font-bold leading-tight">Absensi Mobile</h1>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Univ. Esa Unggul</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-black text-gray-800">{currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} WIB</p>
            <p className="text-[9px] text-gray-400 font-bold uppercase">{currentTime.toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})}</p>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          {renderContent()}
        </main>

        {/* Bottom Navigation */}
        <nav className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-40">
          <div className="flex justify-between items-center">
            <NavButton
              active={activeTab === 'home'}
              icon={<Home size={22} />}
              label="Home"
              onClick={() => setActiveTab('home')}
            />
            <NavButton
              active={activeTab === 'log'}
              icon={<History size={22} />}
              label="Riwayat"
              onClick={() => setActiveTab('log')}
            />
            <NavButton
              active={activeTab === 'live'}
              icon={<Users size={22} />}
              label="Live"
              onClick={() => setActiveTab('live')}
            />
            <NavButton
              active={activeTab === 'profile'}
              icon={<User size={22} />}
              label="Profil"
              onClick={() => setActiveTab('profile')}
            />
          </div>
        </nav>
      </div>
    </div>
  );
};

const NavButton = ({ active, icon, label, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center space-y-1 transition-all ${active ? 'text-blue-600 translate-y-[-2px]' : 'text-gray-400 hover:text-gray-600'}`}
  >
    <div className={`transition-all duration-300 ${active ? 'bg-blue-50 p-2 rounded-2xl' : ''}`}>
      {icon}
    </div>
    <span className={`text-[9px] font-black uppercase tracking-widest ${active ? 'opacity-100' : 'opacity-60'}`}>{label}</span>
  </button>
);

export default App;
