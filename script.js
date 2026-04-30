const SUPABASE_URL = "https://bryjpjzvsadfvjwqgwak.supabase.co/rest/v1/fiki";
const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyeWpwanp2c2FkZnZqd3Fnd2FrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0MzA0MDUsImV4cCI6MjA3NDAwNjQwNX0.1iWQJhtE02t4JTcutIPkzxmn2qyx-Z7JCKFDQ8itCw8";

let globalData = [];
let modalChart;

// animasi halus (Apple style)
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
        "apikey": API_KEY,
        "Authorization": "Bearer " + API_KEY
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
    document.querySelector(".status").innerText = "Offline";
  }
}

// buka modal
function openModal(type) {
  document.getElementById("modal").style.display = "block";
  document.getElementById("modalTitle").innerText = "Grafik " + type;

  let labels = globalData.map(d =>
    new Date(d.Waktu).toLocaleTimeString()
  );

  let values;

  if (type === "Tegangan") values = globalData.map(d => d.Tegangan);
  if (type === "Arus") values = globalData.map(d => d.Arus);
  if (type === "Daya") values = globalData.map(d => d.Daya);

  renderChart(labels, values, type);
}

// render chart
function renderChart(labels, data, label) {
  const ctx = document.getElementById("modalChart").getContext("2d");

  if (modalChart) modalChart.destroy();

  modalChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: label,
        data: data,
        borderColor: "#0071e3",
        backgroundColor: "rgba(0,113,227,0.1)",
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      plugins: {
        legend: {
          labels: {
            color: "#333"
          }
        }
      }
    }
  });
}

// close modal
document.querySelector(".close").onclick = function () {
  document.getElementById("modal").style.display = "none";
};

// refresh tiap 3 detik
setInterval(ambilData, 3000);
ambilData();
