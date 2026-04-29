const SUPABASE_URL = "https://bryjpjzvsadfvjwqgwak.supabase.co/rest/v1/fiki";
const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyeWpwanp2c2FkZnZqd3Fnd2FrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0MzA0MDUsImV4cCI6MjA3NDAwNjQwNX0.1iWQJhtE02t4JTcutIPkzxmn2qyx-Z7JCKFDQ8itCw8";

let chart;

// ambil data dari supabase
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

    if (data.length > 0) {
      let latest = data[data.length - 1];

      document.getElementById("tegangan").innerText = latest.Tegangan.toFixed(2) + " V";
      document.getElementById("arus").innerText = latest.Arus.toFixed(2) + " A";
      document.getElementById("daya").innerText = latest.daya.toFixed(2) + " W";
    }

    let labels = data.map(d => new Date(d.Waktu).toLocaleTimeString());
    let tegangan = data.map(d => d.Tegangan);
    let arus = data.map(d => d.Arus);
    let daya = data.map(d => d.Daya);

    updateChart(labels, tegangan, arus, daya);

  } catch (err) {
    console.error("Error:", err);
  }
}

// update grafik
function updateChart(labels, tegangan, arus, daya) {
  if (chart) {
    chart.data.labels = labels;
    chart.data.datasets[0].data = tegangan;
    chart.data.datasets[1].data = arus;
    chart.data.datasets[2].data = daya;
    chart.update();
    return;
  }

  const ctx = document.getElementById("chart").getContext("2d");

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Tegangan (V)",
          data: tegangan,
          borderColor: "cyan",
          fill: false
        },
        {
          label: "Arus (A)",
          data: arus,
          borderColor: "yellow",
          fill: false
        },
        {
          label: "Daya (W)",
          data: daya,
          borderColor: "red",
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: "white"
          }
        }
      },
      scales: {
        x: {
          ticks: { color: "white" }
        },
        y: {
          ticks: { color: "white" }
        }
      }
    }
  });
}

// refresh tiap 5 detik
setInterval(ambilData, 5000);
ambilData();
