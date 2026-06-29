const STORAGE_KEY = "osilasi_data";

let isRunning = false;
let realtimeData = [];
let t0_ms = null;

/* ================= FUNGSI WIB ================= */
function getWIBTime() {
  const now = new Date();

  // konversi ke UTC
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);

  // tambah 7 jam untuk WIB
  const wib = new Date(utc + (7 * 60 * 60 * 1000));

  return wib.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }) + " WIB";
}

/* ================= LOAD SAAT REFRESH ================= */
window.addEventListener("DOMContentLoaded", () => {
  initRealtimeChart();

  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;

  realtimeData = JSON.parse(saved);
  renderFromData(realtimeData);

  setStatus("LOADED");
});

/* ================= START ================= */
function startRealtime() {
  isRunning = true;
  realtimeData = [];
  t0_ms = null;

  localStorage.removeItem(STORAGE_KEY);
  resetChart();

  sendCommand?.("S");
  setStatus("RUNNING");
}

/* ================= STOP ================= */
function stopRealtime() {
  isRunning = false;
  sendCommand?.("E");
  setStatus("STOPPED");
}

/* ================= DATA MASUK ================= */
function handleRealtimeData(time_ms, distance_cm) {
  if (!isRunning) return;

  if (t0_ms === null) t0_ms = time_ms;

  const t = (time_ms - t0_ms) / 1000; // DETIK
  const x = distance_cm;

  realtimeData.push({ t, x });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(realtimeData));

  updateChart(t, x);

  document.getElementById("xValue").textContent = x.toFixed(2);

  // ===== TIMESTAMP WIB DARI JS =====
  document.getElementById("timestamp").textContent = getWIBTime();
}

/* ================= CSV DOWNLOAD ================= */
function getRealtimeCSVData() {
  return realtimeData.map(p => ({
    time_s: p.t.toFixed(4),
    jarak_cm: p.x.toFixed(2)
  }));
}

window.startRealtime = startRealtime;
window.stopRealtime = stopRealtime;
window.handleRealtimeData = handleRealtimeData;
window.getRealtimeCSVData = getRealtimeCSVData;