const fileInput = document.getElementById("csvInput");
const fitBtn = document.getElementById("fitBtn");

if (fileInput) {
  fileInput.addEventListener("change", handleFile);
}

if (fitBtn) {
  fitBtn.addEventListener("click", function () {
    const saved = localStorage.getItem("osilasiData");

    if (!saved) {
      alert("Data belum tersedia. Silakan upload file terlebih dahulu.");
      return;
    }

    window.location.href = "fitting.html";
  });
}

window.addEventListener("load", loadSavedData);

let rawChart;

/* =====================================================
   FILE HANDLER
   ===================================================== */
function handleFile(e) {
  const file = e.target.files[0];

  if (!file) return;

  localStorage.setItem("lastFileName", file.name);

  showSavedFileName();

  const ext = file.name.split(".").pop().toLowerCase();

  const reader = new FileReader();

  if (ext === "csv") {
    reader.onload = () => parseCSV(reader.result);
    reader.readAsText(file);
  } 
  
  else if (ext === "xlsx") {
    reader.onload = () => parseXLSX(reader.result);
    reader.readAsArrayBuffer(file);
  } 
  
  else {
    alert("Format file tidak didukung. Gunakan CSV atau Excel.");
  }
}

/* =====================================================
   TAMPILKAN NAMA FILE TERAKHIR
   ===================================================== */
function showSavedFileName() {
  const savedName = localStorage.getItem("lastFileName");

  const el = document.getElementById("savedFileName");

  if (!el) return;

  if (savedName) {
    el.innerText = `File terakhir: ${savedName}`;
  } else {
    el.innerText = "";
  }
}

/* =====================================================
   SIMPAN DATA
   ===================================================== */
function saveData(data) {
  localStorage.setItem("osilasiData", JSON.stringify(data));
}

/* =====================================================
   LOAD DATA SAAT REFRESH
   ===================================================== */
function loadSavedData() {
  showSavedFileName();

  const saved = localStorage.getItem("osilasiData");

  if (!saved) return;

  const data = JSON.parse(saved);

  tampilkanDataMentah(data);
}

/* =====================================================
   PARSE CSV
   ===================================================== */
function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);

  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(",");

    if (row.length < 2) continue;

    const t = Number(row[0]);
    const x = Number(row[1]);

    if (!isNaN(t) && !isNaN(x)) {
      data.push({ t, x });
    }
  }

  tampilkanDataMentah(data);
}

/* =====================================================
   PARSE XLSX
   ===================================================== */
function parseXLSX(buffer) {
  const wb = XLSX.read(buffer, {
    type: "array"
  });

  const sheet = wb.Sheets[wb.SheetNames[0]];

  const rows = XLSX.utils.sheet_to_json(sheet, {
    header: 1
  });

  const data = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];

    if (!row || row.length < 2) continue;

    const t = Number(row[0]);
    const x = Number(row[1]);

    if (!isNaN(t) && !isNaN(x)) {
      data.push({ t, x });
    }
  }

  tampilkanDataMentah(data);
}

/* =====================================================
   TAMPILKAN DATA MENTAH
   ===================================================== */
function tampilkanDataMentah(data) {
  if (!Array.isArray(data) || data.length < 5) {
    alert("Data tidak valid atau terlalu sedikit.");
    return;
  }

  saveData(data);

  drawRawChart(data);

  const dataStatus = document.getElementById("dataStatus");
  const dataCount = document.getElementById("dataCount");

  if (dataStatus) {
    dataStatus.innerText = "Sudah dimuat";
  }

  if (dataCount) {
    dataCount.innerText = data.length;
  }

  if (fitBtn) {
    fitBtn.disabled = false;
  }

  console.log("===== DATA MENTAH DIMUAT =====");
  console.log("Jumlah data =", data.length);
  console.log("Data =", data);
}

/* =====================================================
   GRAFIK DATA MENTAH
   ===================================================== */
function drawRawChart(rawData) {
  const canvas = document.getElementById("rawChart");

  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  if (rawChart) {
    rawChart.destroy();
  }

  rawChart = new Chart(ctx, {
    type: "line",

    data: {
      datasets: [{
        label: "Data Mentah x(t)",

        data: rawData.map(d => ({
          x: d.t,
          y: d.x
        })),

        borderColor: "rgb(38,105,220)",
        borderWidth: 1.5,
        tension: 0.25,
        fill: false,
        pointRadius: 0,
        showLine: true
      }]
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,
      parsing: false,

      interaction: {
        mode: "nearest",
        intersect: false
      },

      scales: {
        x: {
          type: "linear",
          title: {
            display: true,
            text: "Waktu (s)"
          }
        },

        y: {
          title: {
            display: true,
            text: "Simpangan (cm)"
          }
        }
      },

      plugins: {
        tooltip: {
          callbacks: {
            title: i =>
              `x = ${i[0].parsed.x.toFixed(3)} s`,

            label: c =>
              `y = ${c.parsed.y.toFixed(3)} cm`
          }
        }
      }
    }
  });
}