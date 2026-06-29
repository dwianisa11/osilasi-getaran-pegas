/* ================= THEME ================= */

// saat halaman dibuka
(function initTheme() {
  const html = document.documentElement;
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme) {
    html.dataset.theme = savedTheme;
  } else {
    html.dataset.theme = "dark"; // default
  }
})();

function toggleTheme() {
  const html = document.documentElement;
  const nextTheme =
    html.dataset.theme === "dark" ? "light" : "dark";

  html.dataset.theme = nextTheme;
  localStorage.setItem("theme", nextTheme);
}

/* ================= SIDEBAR ================= */

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  if (!sidebar) return;

  sidebar.classList.toggle("collapsed");
}
