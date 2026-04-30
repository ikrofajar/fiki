const SUPABASE_URL = "https://bryjpjzvsadfvjwqgwak.supabase.co/rest/v1/fiki";
const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyeWpwanp2c2FkZnZqd3Fnd2FrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0MzA0MDUsImV4cCI6MjA3NDAwNjQwNX0.1iWQJhtE02t4JTcutIPkzxmn2qyx-Z7JCKFDQ8itCw8";

let globalData = [];
let modalChart;
let currentType = "";
let chartInterval;

// ===== UPDATE VALUE =====
function smoothUpdate(id, value) {
  const el = document.getElementById(id);
  el.style.opacity = "0.5";
  setTimeout(() => {
    el.innerText = value.toFixed(2);
    el.style.opacity = "1";
  }, 120);
}

// ===== FETCH DATA =====
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

// ===== OPEN MODAL (SPRING) =====
const sheet = document.getElementById("sheetContent");

function openModal(type) {
  currentType = type;

  const modal = document.getElementById("sheet");
  modal.classList.add("active");

  document.getElementById("sheetTitle").innerText = type;

  sheet.style.transition = "none";
  sheet.style.transform = "translateY(100%)";

  requestAnimationFrame(() => {
    sheet.style.transition = "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)";
    sheet.style.transform = "translateY(0)";
  });

  if (navigator.vibrate) navigator.vibrate(10);

  renderChart();
  chartInterval = setInterval(renderChart, 3000);
}

// ===== RENDER CHART =====
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
        data: values,
        borderColor: "#0071e3",
        backgroundColor: "rgba(0,113,227,0.1)",
        fill: true,
        tension: 0.4
      }]
    }
  });
}

// ===== GESTURE + INERTIA =====
let startY = 0;
let currentY = 0;
let velocity = 0;
let lastY = 0;
let lastTime = 0;

sheet.addEventListener("touchstart", e => {
  startY = e.touches[0].clientY;
  lastY = startY;
  lastTime = Date.now();
  sheet.style.transition = "none";
});

sheet.addEventListener("touchmove", e => {
  currentY = e.touches[0].clientY;
  let diff = currentY - startY;

  let now = Date.now();
  velocity = (currentY - lastY) / (now - lastTime);

  lastY = currentY;
  lastTime = now;

  if (diff > 0) {
    sheet.style.transform = `translateY(${diff}px)`;
  }
});

sheet.addEventListener("touchend", () => {
  let diff = currentY - startY;

  if (diff > 120 || velocity > 0.5) {
    closeModal(true);
  } else {
    sheet.style.transition = "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)";
    sheet.style.transform = "translateY(0)";
  }
});

// ===== CLOSE MODAL =====
function closeModal(haptic = false) {
  const modal = document.getElementById("sheet");

  sheet.style.transition = "transform 0.4s cubic-bezier(0.55, 0, 0.1, 1)";
  sheet.style.transform = "translateY(100%)";

  setTimeout(() => {
    modal.classList.remove("active");
  }, 300);

  clearInterval(chartInterval);

  if (haptic && navigator.vibrate) {
    navigator.vibrate([10, 20, 10]);
  }
}

// klik background close
document.getElementById("sheet").onclick = function(e) {
  if (e.target.id === "sheet") closeModal(true);
};

// refresh data
setInterval(ambilData, 3000);
ambilData();
