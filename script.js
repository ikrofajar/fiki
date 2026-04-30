const SUPABASE_URL = "https://bryjpjzvsadfvjwqgwak.supabase.co/rest/v1/fiki";
const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyeWpwanp2c2FkZnZqd3Fnd2FrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0MzA0MDUsImV4cCI6MjA3NDAwNjQwNX0.1iWQJhtE02t4JTcutIPkzxmn2qyx-Z7JCKFDQ8itCw8";

let globalData = [];
let modalChart;
let currentType = "";
let chartInterval;

// update angka
function smoothUpdate(id, value) {
  const el = document.getElementById(id);
  el.style.opacity = "0.5";
  setTimeout(() => {
    el.innerText = value.toFixed(2);
    el.style.opacity = "1";
  }, 150);
}

// ambil data
async function ambilData() {
  try {
    let res = await fetch(`${SUPABASE_URL}?select=*&order=id.desc&limit=20`, {
      headers: {
        apikey: API_KEY,
        Authorization: "Bearer " + API_KEY
      }
    });

    let data = await res.json();
    data.reverse();
    globalData = data;

    if (data.length > 0) {
      let latest = data[data.length - 1];
      smoothUpdate("tegangan", latest.Tegangan);
      smoothUpdate("arus", latest.Arus);
      smoothUpdate("daya", latest.Daya);
    }

  } catch (err) {
    console.error(err);
  }
}

// buka modal
function openModal(type) {
  currentType = type;

  document.getElementById("sheet").classList.add("active");
  document.getElementById("sheetTitle").innerText = type;

  renderChart();

  // auto update chart tiap 3 detik
  chartInterval = setInterval(() => {
    renderChart();
  }, 3000);
}

// render chart
function renderChart() {
  let labels = globalData.map(d =>
    new Date(d.Waktu).toLocaleTimeString()
  );

  let values;
  if (currentType === "Tegangan") values = globalData.map(d => d.Tegangan);
  if (currentType === "Arus") values = globalData.map(d => d.Arus);
  if (currentType === "Daya") values = globalData.map(d => d.Daya);

  const ctx = document.getElementById("modalChart").getContext("2d");

  if (modalChart) modalChart.destroy();

  modalChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: currentType,
        data: values,
        borderColor: "#0071e3",
        backgroundColor: "rgba(0,113,227,0.1)",
        fill: true,
        tension: 0.4
      }]
    }
  });
}

// ===== swipe gesture =====
let startY = 0;
const sheet = document.getElementById("sheetContent");

sheet.addEventListener("touchstart", e => {
  startY = e.touches[0].clientY;
});

sheet.addEventListener("touchmove", e => {
  let currentY = e.touches[0].clientY;
  let diff = currentY - startY;

  if (diff > 0) {
    sheet.style.transform = `translateY(${diff}px)`;
  }
});

sheet.addEventListener("touchend", e => {
  let endY = e.changedTouches[0].clientY;
  let diff = endY - startY;

  if (diff > 100) {
    closeModal();
  } else {
    sheet.style.transform = `translateY(0)`;
  }
});

// close modal
function closeModal() {
  document.getElementById("sheet").classList.remove("active");
  sheet.style.transform = `translateY(0)`;
  clearInterval(chartInterval);
}

// klik background close
document.getElementById("sheet").onclick = function(e) {
  if (e.target.id === "sheet") closeModal();
};

// refresh utama
setInterval(ambilData, 3000);
ambilData();
