document.addEventListener("DOMContentLoaded", () => {
  setupTabs();
  loadSpots();
  loadWeather();
});

function setupTabs(){
  const buttons = document.querySelectorAll(".tab-btn");
  const tabs = document.querySelectorAll(".tab");

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      buttons.forEach(btn => btn.classList.remove("active"));
      tabs.forEach(tab => tab.classList.remove("active"));

      button.classList.add("active");
      document.getElementById(button.dataset.tab).classList.add("active");
    });
  });
}

function loadSpots(){
  const box = document.getElementById("spotsList");
  if(!box) return;

  box.innerHTML = "";

  fishingSpots.forEach(spot => {
    const div = document.createElement("div");
    div.className = "spot-item";
    div.innerHTML = `
      <strong>${spot.name}</strong><br>
      Depth: ${spot.depth}<br>
      Fish: ${spot.fish}<br>
      Coords: ${spot.lat}, ${spot.lng}
    `;
    box.appendChild(div);
  });
}

function loadWeather(){
  const weatherBox = document.getElementById("weatherBox");
  if(!weatherBox) return;

  weatherBox.textContent = "Wind: -- | Swell: -- | Sea Temp: --";
}

function testApp(){
  alert("Fishing app werk!");
}
