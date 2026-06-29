/* =====================================================
   FITTING.JS
   Halaman: fitting.html
   Fungsi: Menampilkan hasil fitting sinus dari data mentah
   ===================================================== */

console.log("fitting.js berhasil terpanggil");

window.addEventListener("load", loadFittingPage);

let analysisChart;

/* =====================================================
   LOAD HALAMAN FITTING
   ===================================================== */
function loadFittingPage() {
  console.log("===== HALAMAN FITTING DIBUKA =====");

  const saved = localStorage.getItem("osilasiData");

  console.log("Isi osilasiData dari localStorage =", saved);

  if (!saved) {
    alert("Data belum tersedia. Silakan upload data terlebih dahulu di halaman Analysis.");
    window.location.href = "analysis.html";
    return;
  }

  let data;

  try {
    data = JSON.parse(saved);
  } catch (error) {
    console.error("Data localStorage gagal dibaca:", error);
    alert("Data rusak. Silakan upload ulang file.");
    window.location.href = "analysis.html";
    return;
  }

  console.log("Data berhasil dibaca =", data);

  jalankanFitting(data);
}

/* =====================================================
   JALANKAN FITTING
   ===================================================== */
function jalankanFitting(data) {
  console.log("===== JALANKAN FITTING =====");

  if (!Array.isArray(data) || data.length < 5) {
    alert("Data tidak valid atau terlalu sedikit.");
    window.location.href = "analysis.html";
    return;
  }

  // ================= BERSIHKAN DATA =================
  const cleanData = data
    .map(d => ({
      t: Number(d.t),
      x: Number(d.x)
    }))
    .filter(d =>
      !isNaN(d.t) &&
      !isNaN(d.x) &&
      isFinite(d.t) &&
      isFinite(d.x)
    );

  console.log("Data bersih =", cleanData);
  console.log("Jumlah data bersih =", cleanData.length);

  if (cleanData.length < 5) {
    alert("Data angka tidak valid atau terlalu sedikit.");
    window.location.href = "analysis.html";
    return;
  }

  // ================= NORMALISASI =================
  const x0 =
    cleanData.reduce((s, d) => s + d.x, 0) / cleanData.length;

  const normalized = cleanData.map(d => ({
    t: d.t,
    x: d.x - x0
  }));

  console.log("x0 =", x0);
  console.log("Data normalisasi =", normalized);

  // ================= FITTING SINUS =================
  const hasil = fitSinusLeastSquares(normalized);

  console.log("Hasil fitting =", hasil);

  if (
    !hasil ||
    isNaN(hasil.A) ||
    isNaN(hasil.T) ||
    isNaN(hasil.omega) ||
    isNaN(hasil.rms)
  ) {
    alert("Fitting gagal. Periksa data waktu dan simpangan.");
    return;
  }

  // ================= TAMPILKAN HASIL KE HTML =================
  const periodEl = document.getElementById("periodAvg");
  const ampEl = document.getElementById("ampVal");
  
  if (periodEl) {
    periodEl.innerText = hasil.T.toFixed(3);
  }

  if (ampEl) {
    ampEl.innerText = Math.abs(hasil.A).toFixed(3);
  }

  // ================= GRAFIK FITTING =================
  drawSinusChart(hasil.sinus);

  // ================= CONSOLE HASIL AKHIR =================
  console.log("===== HASIL FITTING AKHIR =====");
  console.log("x0 =", x0.toFixed(4), "cm");
  console.log("A =", hasil.A.toFixed(4), "cm");
  console.log("T_fit =", hasil.T.toFixed(4), "s");
  console.log("ω =", hasil.omega.toFixed(4), "rad/s");
  console.log("φ =", hasil.phi.toFixed(4), "rad");
  console.log("dA terbaik =", hasil.dA);
  console.log("dW terbaik =", hasil.dW);
  console.log("Total Error Minimum =", hasil.totalError.toFixed(6));
  console.log("RMS error =", hasil.rms.toFixed(4), "cm");
}

/* =====================================================
   FITTING SINUS
   ===================================================== */
function fitSinusLeastSquares(data) {
  const t = data.map(d => Number(d.t));
  const x = data.map(d => Number(d.x));

  // ================= ESTIMASI AWAL AMPLITUDO =================
  const xmax = Math.max(...x);
  const xmin = Math.min(...x);

  const A0 = (xmax - xmin) / 2;

  // ================= CARI PEAK =================
  const peaks = [];

  for (let i = 1; i < x.length - 1; i++) {
    if (
      x[i] > x[i - 1] &&
      x[i] > x[i + 1]
    ) {
      peaks.push(t[i]);
    }
  }

  // ================= ESTIMASI AWAL PERIODE =================
  let T0 =
    (t[t.length - 1] - t[0]) / 3;

  if (peaks.length >= 2) {
    let jumlahSelisihPeak = 0;

    for (let i = 1; i < peaks.length; i++) {
      jumlahSelisihPeak += peaks[i] - peaks[i - 1];
    }

    T0 = jumlahSelisihPeak / (peaks.length - 1);
  }

  // Jika T0 tidak valid, gunakan fallback sederhana
  if (!isFinite(T0) || T0 <= 0) {
    T0 = 1;
  }

  const omega0 = 2 * Math.PI / T0;

  // ================= CONSOLE ESTIMASI AWAL =================
  console.log("===== ESTIMASI AWAL =====");
  console.log("Jumlah Peak =", peaks.length);
  console.log("Peak =", peaks);
  console.log("A0 =", A0);
  console.log("T0 =", T0);
  console.log("Omega Awal =", omega0);

  // ================= PARAMETER TERBAIK =================
  let best = {
    err: Infinity,
    A: A0,
    omega: omega0,
    phi: 0,
    dA: 1,
    dW: 1
  };

  // ================= GRID SEARCH =================
  for (let dA = 0.7; dA <= 1.3; dA += 0.05) {
    for (let dW = 0.7; dW <= 1.3; dW += 0.05) {
      for (
        let phi = -Math.PI;
        phi <= Math.PI;
        phi += Math.PI / 16
      ) {
        const A = A0 * dA;
        const omega = omega0 * dW;

        let err = 0;

        for (let i = 0; i < t.length; i++) {
          const model =
            A *
            Math.sin(
              omega * t[i] + phi
            );

          err += Math.pow(x[i] - model, 2);
        }

        if (err < best.err) {
          best = {
            err,
            A,
            omega,
            phi,
            dA,
            dW
          };
        }
      }
    }
  }

  // ================= CONSOLE HASIL OPTIMASI =================
  console.log("===== HASIL OPTIMASI =====");
  console.log("dA =", best.dA);
  console.log("dW =", best.dW);
  console.log("A =", best.A);
  console.log("Omega =", best.omega);
  console.log("Phi =", best.phi);
  console.log("Total Error =", best.err);

  // ================= DATA GRAFIK FITTING =================
  const sinus = t.map(time => ({
    x: time,
    y:
      best.A *
      Math.sin(
        best.omega * time + best.phi
      )
  }));

  const rms =
    Math.sqrt(best.err / t.length);

  const T =
    2 * Math.PI / best.omega;

  return {
    A: best.A,
    omega: best.omega,
    T,
    phi: best.phi,
    rms,
    sinus,
    dA: best.dA,
    dW: best.dW,
    totalError: best.err,
    A0,
    T0,
    peaks
  };
}

/* =====================================================
   GRAFIK FITTING SINUS
   ===================================================== */
function drawSinusChart(sinusData) {
  const canvas = document.getElementById("analysisChart");

  if (!canvas) {
    console.error("Canvas dengan id analysisChart tidak ditemukan.");
    return;
  }

  if (typeof Chart === "undefined") {
    console.error("Chart.js belum terbaca. Cek script Chart.js di fitting.html.");
    return;
  }

  const ctx = canvas.getContext("2d");

  if (analysisChart) {
    analysisChart.destroy();
  }

  analysisChart = new Chart(ctx, {
    type: "line",

    data: {
      datasets: [{
        label: "Hasil Fitting Sinus x(t)",

        data: sinusData,

        borderColor: "rgb(38,105,220)",
        borderWidth: 2,
        tension: 0.45,
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
            text: "Simpangan Normalisasi (cm)"
          }
        }
      },

      plugins: {
        tooltip: {
          callbacks: {
            title: item =>
              `x = ${item[0].parsed.x.toFixed(3)} s`,

            label: context =>
              `y = ${context.parsed.y.toFixed(3)} cm`
          }
        }
      }
    }
  });
}