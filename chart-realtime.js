// =====================================================
// REALTIME CHART
// =====================================================

let realtimeChart = null;

const MAX_POINTS = 800;

/* =====================================================
   INIT CHART
   ===================================================== */

function initRealtimeChart() {

  const canvas =
    document.getElementById(
      "realtimeChart"
    );

  if (!canvas) {

    console.error(
      "Canvas realtimeChart tidak ditemukan"
    );

    return;
  }

  /* CEGAH DOUBLE CHART */
  if (realtimeChart) return;

  const ctx =
    canvas.getContext("2d");

  realtimeChart = new Chart(ctx, {

    type: "line",

    data: {

      datasets: [

        {

          label: "Simpangan (cm)",

          data: [],

          /* ================= GARIS BIRU ================= */

          borderColor:
            "rgba(37,99,235,1)",

          borderWidth: 3,

          /* ================= TANPA AREA BIRU ================= */

          fill: false,

          /* ================= GARIS HALUS ================= */

          tension: 0.25,

          /* ================= HILANGKAN TITIK ================= */

          pointRadius: 0,

          pointHoverRadius: 4

        }

      ]

    },

    options: {

      responsive: true,

      maintainAspectRatio: false,

      animation: false,

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

        /* ================= LEGEND ================= */

        legend: {

          display: true

        },

        /* ================= TOOLTIP ================= */

        tooltip: {

          mode: "nearest",

          intersect: false,

          callbacks: {

            title: items =>

              `t = ${items[0].parsed.x.toFixed(3)} s`,

            label: ctx =>

              `x = ${ctx.parsed.y.toFixed(3)} cm`

          }

        }

      }

    }

  });

}

/* =====================================================
   UPDATE CHART
   ===================================================== */

function updateChart(t, x) {

  if (!realtimeChart) return;

  const data =
    realtimeChart
      .data
      .datasets[0]
      .data;

  data.push({

    x: t,

    y: x

  });

  /* LIMIT DATA */

  if (data.length > MAX_POINTS) {

    data.shift();
  }

  realtimeChart.update("none");
}

/* =====================================================
   RESET CHART
   ===================================================== */

function resetChart() {

  if (!realtimeChart) return;

  realtimeChart
    .data
    .datasets[0]
    .data
    .length = 0;

  realtimeChart.update("none");
}

/* =====================================================
   RENDER DATA
   ===================================================== */

function renderFromData(dataArray) {

  if (
    !realtimeChart ||
    !Array.isArray(dataArray)
  ) return;

  resetChart();

  dataArray.forEach(p => {

    realtimeChart
      .data
      .datasets[0]
      .data
      .push({

        x: p.t,

        y: p.x

      });

  });

  realtimeChart.update("none");
}

/* =====================================================
   EXPORT GLOBAL
   ===================================================== */

window.initRealtimeChart =
  initRealtimeChart;

window.updateChart =
  updateChart;

window.resetChart =
  resetChart;

window.renderFromData =
  renderFromData;