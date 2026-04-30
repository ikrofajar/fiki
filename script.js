const SUPABASE_URL = "https://bryjpjzvsadfvjwqgwak.supabase.co/rest/v1/fiki";
const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyeWpwanp2c2FkZnZqd3Fnd2FrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0MzA0MDUsImV4cCI6MjA3NDAwNjQwNX0.1iWQJhtE02t4JTcutIPkzxmn2qyx-Z7JCKFDQ8itCw8";

// animasi angka smooth
function animateValue(id, value, unit) {
  const el = document.getElementById(id);

  el.style.transform = "scale(1.15)";
  el.style.transition = "0.2s";

  el.innerText = value.toFixed(2) + " " + unit;

  setTimeout(() => {
    el.style.transform = "scale(1)";
  }, 200);
}

// indikator warna (biar kelihatan pintar)
function setIndicator(id, value, type) {
  const el = document.getElementById(id);

  if (type === "tegangan") {
    if (value < 200) el.style.color = "orange";
    else if (value > 240) el.style.color = "red";
    else el.style.color = "#38bdf8";
  }

  if (type === "arus") {
    el.style.color = value > 2 ? "red" : "#38bdf8";
  }

  if (type === "daya") {
    el.style.color = value > 500 ? "red" : "#38bdf8";
  }
}

// status koneksi
function setStatus(text, color) {
  const status = document.querySelector(".status");
  if (status) {
    status.innerText = "● " + text;
    status.style.color = color;
  }
}

// ambil data
async function ambilData() {
  try {
    setStatus("Loading...", "orange");

    let res = await fetch(`${SUPABASE_URL}?select=*&order=id.desc&limit=1`, {
      headers: {
        "apikey": API_KEY,
        "Authorization": "Bearer " + API_KEY
      }
    });

    let data = await res.json();

    if (data.length > 0) {
      let latest = data[0];

      let t = latest.Tegangan;
      let a = latest.Arus;
      let d = latest.Daya; // <-- fix bug (huruf besar)

      animateValue("tegangan", t, "V");
      animateValue("arus", a, "A");
      animateValue("daya", d, "W");

      setIndicator("tegangan", t, "tegangan");
      setIndicator("arus", a, "arus");
      setIndicator("daya", d, "daya");

      setStatus("Online", "#4ade80");
    } else {
      setStatus("No Data", "gray");
    }

  } catch (err) {
    console.error("Error:", err);
    setStatus("Offline", "red");
  }
}

// refresh realtime
setInterval(ambilData, 3000);
ambilData();
