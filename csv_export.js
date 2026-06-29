// csv_export.js
window.exportCSV = function () {
  // cek fungsi data
  if (typeof window.getRealtimeCSVData !== "function") {
    alert("Data realtime belum siap");
    return;
  }

  const data = window.getRealtimeCSVData();
  if (!Array.isArray(data) || data.length === 0) {
    alert("Data kosong");
    return;
  }

  /* ================= FORMAT DATA (DETIK) ================= */
  const sheetData = [
    ["time_s", "jarak_cm"], // HEADER RESMI
    ...data.map(d => [
      Number(d.time_s),
      Number(d.jarak_cm)
    ])
  ];

  /* ================= BUAT SHEET ================= */
  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

  // format kolom supaya rapi di Excel
  worksheet["!cols"] = [
    { wch: 12 }, // time_s
    { wch: 12 }  // jarak_cm
  ];

  /* ================= WORKBOOK ================= */
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Osilasi Pegas");

  /* ================= DOWNLOAD ================= */
  XLSX.writeFile(workbook, "osilasi_pegas.xlsx");
};
