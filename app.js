const KEY_CATCHES = "tanya_v75_catches";
const KEY_SPOTS = "tanya_v75_spots";
const BASE = { lat:-34.37, lon:20.85 };

let currentPos = null;
let lastWindDir = "—";
let routeChain = [];

function getJSON(key, fallback){
  try{
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  }catch{
    return fallback;
  }
}

function setJSON(key, value){
  localStorage.setItem(key, JSON.stringify(value));
}

function getAllSpots(){
  const custom = getJSON(KEY_SPOTS, []);
  const presetIds = new Set(DEFAULT_SPOTS.map(s => s.id));
  const cleanedCustom = custom.filter(s => !presetIds.has(s.id));
  return [...DEFAULT_SPOTS, ...cleanedCustom];
}

function getCustomSpots(){
  return getJSON(KEY_SPOTS, []);
}

function saveCustomSpots(spots){
  setJSON(KEY_SPOTS, spots);
}

function getCatches(){
  return getJSON(KEY_CATCHES, []);
}

function saveCatches(catches){
  setJSON(KEY_CATCHES, catches);
}

function showTab(id){
  document.querySelectorAll("section").forEach(s => s.style.display = "none");
  document.getElementById(id).style.display = "block";

  document.querySelectorAll(".navbtn").forEach(btn => btn.classList.remove("active"));
  const btnMap = {
    add:0, spots:1, drift:2, log:3, stats:4, guide:5
  };
  const buttons = document.querySelectorAll(".navbtn");
  if(buttons[btnMap[id]]) buttons[btnMap[id]].classList.add("active");

  if(id === "spots"){
    renderCurrentAreaBox();
    renderSpotsDropdowns();
    renderNearbySpots();
  }
  if(id === "drift") renderDrift();
  if(id === "log") renderLog();
  if(id === "stats") renderStats();
}

function toCoordString(lat, lon){
  return `${Number(lat).toFixed(6)},${Number(lon).toFixed(6)}`;
}

function parseCoordString(str){
  const parts = String(str).split(",");
  if(parts.length !== 2) return null;
  const lat = Number(parts[0]);
  const lon = Number(parts[1]);
  if(!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  return { lat, lon };
}

function distanceKm(lat1, lon1, lat2, lon2){
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function bearingDegrees(lat1, lon1, lat2, lon2){
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const λ1 = lon1 * Math.PI / 180;
  const λ2 = lon2 * Math.PI / 180;
  const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

function bearingToCompass(bearing){
  const dirs = ["N","NE","E","SE","S","SW","W","NW"];
  return dirs[Math.round(bearing / 45) % 8];
}

function degreesToCompass(deg){
  if(!Number.isFinite(deg)) return "—";
  return bearingToCompass(deg);
}

function oppositeCompass(dir){
  const map = {N:"S",NE:"SW",E:"W",SE:"NW",S:"N",SW:"NE",W:"E",NW:"SE","—":"—"};
  return map[dir] || "—";
}

function setBaitOptionsForSpecies(){
  const species = document.getElementById("species").value;
  const baitSelect = document.getElementById("bait");
  baitSelect.innerHTML = `<option value="">Choose...</option>`;
  const list = BAIT_BY_SPECIES[species] || ["Pilchard","Makriel","Chokka","Squid","Octopus"];
  list.forEach(b => {
    const opt = document.createElement("option");
    opt.value = b;
    opt.textContent = b;
    baitSelect.appendChild(opt);
  });
}

function populateLocalAreaOptions(){
  const areas = [...new Set(getAllSpots().map(s => s.name))].sort();
  const localArea = document.getElementById("localArea");
  const current = localArea.value;
  localArea.innerHTML = `<option value="">Choose area...</option>`;
  areas.forEach(a => {
    const opt = document.createElement("option");
    opt.value = a;
    opt.textContent = a;
    localArea.appendChild(opt);
  });
  if(areas.includes(current)) localArea.value = current;
}

function renderSpotsDropdowns(){
  const nextSpot = document.getElementById("nextSpot");
  const routeSpot = document.getElementById("routeSpot");
  const manualSpotPick = document.getElementById("manualSpotPick");
  const spots = getAllSpots().slice().sort((a,b) => a.name.localeCompare(b.name));

  const fill = (select, firstLabel) => {
    const current = select.value;
    select.innerHTML = `<option value="">${firstLabel}</option>`;
    spots.forEach(s => {
      const coord = toCoordString(s.lat, s.lon);
      const opt = document.createElement("option");
      opt.value = coord;
      opt.textContent = `${s.name} (${s.type}${s.preset ? " • Preset" : ""})`;
      select.appendChild(opt);
    });
    if([...select.options].some(o => o.value === current)) select.value = current;
  };

  fill(nextSpot, "Choose next spot...");
  fill(routeSpot, "Add spot to route chain...");
  fill(manualSpotPick, "Choose saved spot / area");
  populateLocalAreaOptions();
}

async function estimateConditions(lat, lon){
  const chipWind = document.getElementById("chipWind");
  const chipSwell = document.getElementById("chipSwell");
  const chipTemp = document.getElementById("chipTemp");
  const chipCurrent = document.getElementById("chipCurrent");

  chipWind.textContent = "Wind: loading...";
  chipSwell.textContent = "Swell: loading...";
  chipTemp.textContent = "Sea Temp: loading...";
  chipCurrent.textContent = "Current: loading...";

  try{
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=wind_speed_10m,wind_direction_10m&timezone=Africa%2FJohannesburg`;
    const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&current=wave_height,swell_wave_height,sea_surface_temperature&timezone=Africa%2FJohannesburg`;

    const [wr, mr] = await Promise.all([fetch(weatherUrl), fetch(marineUrl)]);
    if(!wr.ok || !mr.ok) throw new Error("fetch failed");

    const w = await wr.json();
    const m = await mr.json();

    const wind = Number(w?.current?.wind_speed_10m || 0);
    const windDirDeg = Number(w?.current?.wind_direction_10m || 0);
    const swell = Number(m?.current?.swell_wave_height || 0);
    const wave = Number(m?.current?.wave_height || 0);
    const seaTemp = Number(m?.current?.sea_surface_temperature || 0);

    lastWindDir = degreesToCompass(windDirDeg);

    chipWind.textContent = `Wind: ${wind.toFixed(0)} km/h ${lastWindDir}`;
    chipSwell.textContent = `Swell: ${swell.toFixed(2)} m`;
    chipTemp.textContent = `Sea Temp: ${seaTemp.toFixed(1)} °C`;

    let current = 0.2 + wind * 0.015 + wave * 0.18 + swell * 0.12;
    chipCurrent.textContent = `Current: ${current.toFixed(2)} kt`;
  }catch{
    chipWind.textContent = "Wind: unavailable";
    chipSwell.textContent = "Swell: unavailable";
    chipTemp.textContent = "Sea Temp: unavailable";
    chipCurrent.textContent = "Current: unavailable";
    lastWindDir = "—";
  }

  renderDrift();
}

function renderCurrentAreaBox(){
  const box = document.getElementById("currentAreaBox");
  const coords = currentPos ? toCoordString(currentPos.lat, currentPos.lon) : "No current location yet";
  const area = document.getElementById("localArea").value || "Unknown area";
  box.innerHTML = `Current: ${coords}<br>Area: ${area}`;
}

function nearestSpotTo(lat, lon){
  let best = null;
  let bestDist = Infinity;
  getAllSpots().forEach(s => {
    const d = distanceKm(lat, lon, s.lat, s.lon);
    if(d < bestDist){
      best = s;
      bestDist = d;
    }
  });
  return { spot: best, km: bestDist };
}

function getNearbySpots(){
  if(!currentPos) return [];
  return getAllSpots()
    .map(s => ({ ...s, km: distanceKm(currentPos.lat, currentPos.lon, s.lat, s.lon) }))
    .filter(s => s.km <= 12)
    .sort((a,b) => a.km - b.km);
}

function renderNearbySpots(){
  const box = document.getElementById("spotsList");
  const nearby = getNearbySpots();

  if(!currentPos){
    box.innerHTML = `<div class="spotCard mini">No nearby spots within 12 km yet. Get current location first.</div>`;
    return;
  }

  if(!nearby.length){
    box.innerHTML = `<div class="spotCard mini">No nearby spots within 12 km.</div>`;
    return;
  }

  box.innerHTML = "";
  nearby.forEach(s => {
    const div = document.createElement("div");
    div.className = "spotCard";
    const coord = toCoordString(s.lat, s.lon);
    div.innerHTML = `
      <div class="spotTitle">${s.name}</div>
      <div class="spotSub">${s.type} • ${s.km.toFixed(2)} km away</div>
      <div class="mini">${coord}</div>
      <div class="row" style="margin-top:8px;">
        <button onclick="useSpotInCatch('${coord}','${encodeURIComponent(s.name)}','${encodeURIComponent(s.type)}')">Use in Catch</button>
        <button class="dark" onclick="navigateToSpot('${coord}')">Navigate</button>
        <button class="dark" onclick="openGoogleMaps('${coord}')">Google Maps</button>
      </div>
    `;
    box.appendChild(div);
  });
}

function useSpotInCatch(coordStr, nameEncoded, typeEncoded){
  const name = decodeURIComponent(nameEncoded);
  const type = decodeURIComponent(typeEncoded);
  document.getElementById("coords").value = coordStr;
  document.getElementById("localArea").value = name;
  document.getElementById("whereCaught").value = `Deep Sea • ${type} • ${name}`;
  showTab("add");
}

function getGPSForCatch(){
  navigator.geolocation.getCurrentPosition(async pos => {
    currentPos = { lat: pos.coords.latitude, lon: pos.coords.longitude };
    const coordStr = toCoordString(currentPos.lat, currentPos.lon);
    document.getElementById("coords").value = coordStr;

    const nearest = nearestSpotTo(currentPos.lat, currentPos.lon);
    if(nearest.spot && nearest.km <= 12){
      document.getElementById("localArea").value = nearest.spot.name;
      document.getElementById("whereCaught").value = `Deep Sea • ${nearest.spot.type} • ${nearest.spot.name}`;
    } else {
      document.getElementById("whereCaught").value = "Deep Sea";
    }

    await estimateConditions(currentPos.lat, currentPos.lon);
    renderCurrentAreaBox();
    renderNearbySpots();
  }, () => {
    alert("Could not get GPS location.");
  }, { enableHighAccuracy:true, timeout:10000 });
}

function setCurrentLocation(){
  navigator.geolocation.getCurrentPosition(async pos => {
    currentPos = { lat: pos.coords.latitude, lon: pos.coords.longitude };
    const nearest = nearestSpotTo(currentPos.lat, currentPos.lon);
    if(nearest.spot && nearest.km <= 12){
      document.getElementById("localArea").value = nearest.spot.name;
      document.getElementById("whereCaught").value = `Deep Sea • ${nearest.spot.type} • ${nearest.spot.name}`;
      document.getElementById("coords").value = toCoordString(currentPos.lat, currentPos.lon);
    }
    await estimateConditions(currentPos.lat, currentPos.lon);
    renderCurrentAreaBox();
    renderNearbySpots();
  }, () => {
    alert("Could not get current location.");
  }, { enableHighAccuracy:true, timeout:10000 });
}

function openGoogleMaps(coordStr){
  const c = parseCoordString(coordStr);
  if(!c) return;
  window.open(`https://www.google.com/maps?q=${c.lat},${c.lon}`, "_blank");
}

function startNavigation(){
  if(!currentPos){
    alert("Use Current Location first.");
    return;
  }
  const coordStr = document.getElementById("nextSpot").value;
  const speed = Number(document.getElementById("boatSpeed").value || 0);
  const c = parseCoordString(coordStr);
  if(!c){
    alert("Choose next spot first.");
    return;
  }

  const d = distanceKm(currentPos.lat, currentPos.lon, c.lat, c.lon);
  const bearing = bearingDegrees(currentPos.lat, currentPos.lon, c.lat, c.lon);
  const eta = speed > 0 ? (d / speed) : 0;
  const hours = Math.floor(eta);
  const mins = Math.round((eta - hours) * 60);

  document.getElementById("navResult").innerHTML =
    `Distance: ${d.toFixed(2)} km<br>` +
    `Bearing: ${bearing.toFixed(0)}° (${bearingToCompass(bearing)})<br>` +
    `ETA: ${hours > 0 ? `${hours}h ` : ""}${mins}m<br><br>` +
    `<button onclick="openGoogleMaps('${coordStr}')">Open in Google Maps</button>`;
}

function navigateToSpot(coordStr){
  document.getElementById("nextSpot").value = coordStr;
  startNavigation();
}

function addRouteSpot(){
  const coordStr = document.getElementById("routeSpot").value;
  if(!coordStr) return;
  const c = parseCoordString(coordStr);
  if(!c) return;
  const spot = getAllSpots().find(s => toCoordString(s.lat, s.lon) === coordStr);
  if(!spot) return;
  routeChain.push(spot);
  renderRouteChain();
}

function renderRouteChain(){
  const box = document.getElementById("routeChainBox");
  if(!routeChain.length){
    box.innerHTML = "No route chain added yet.";
    return;
  }
  box.innerHTML = routeChain.map((s, i) => `${i+1}. ${s.name}`).join("<br>");
}

function startRouteChain(){
  if(!routeChain.length){
    alert("Add route chain spots first.");
    return;
  }
  const first = routeChain[0];
  document.getElementById("nextSpot").value = toCoordString(first.lat, first.lon);
  startNavigation();
}

function clearRouteChain(){
  routeChain = [];
  renderRouteChain();
  document.getElementById("navResult").innerHTML = "";
}

function saveCatch(){
  const species = document.getElementById("species").value;
  const bait = document.getElementById("bait").value;
  const localArea = document.getElementById("localArea").value;
  const coords = document.getElementById("coords").value;
  const whereCaught = document.getElementById("whereCaught").value;

  if(!species || !coords){
    alert("Choose species and get coordinates first.");
    return;
  }

  const catches = getCatches();
  catches.unshift({
    id: Date.now(),
    species,
    bait,
    localArea,
    coords,
    whereCaught,
    savedAt: new Date().toISOString()
  });
  saveCatches(catches);

  document.getElementById("saveMsg").textContent = "Catch saved.";
  setTimeout(() => {
    document.getElementById("saveMsg").textContent = "";
  }, 1800);

  renderLog();
  renderStats();
}

function renderLog(){
  const box = document.getElementById("logBox");
  const catches = getCatches();
  if(!catches.length){
    box.innerHTML = `<div class="card mini">No catches saved yet.</div>`;
    return;
  }

  box.innerHTML = "";
  catches.forEach(c => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <b>${c.species}</b><br>
      <span class="mini">Bait: ${c.bait || "—"}</span><br>
      <span class="mini">Area: ${c.localArea || "—"}</span><br>
      <span class="mini">${c.coords}</span><br>
      <span class="mini">${new Date(c.savedAt).toLocaleString()}</span><br>
      <div class="row" style="margin-top:8px;">
        <button class="dark" onclick="openGoogleMaps('${c.coords}')">Google Maps</button>
      </div>
    `;
    box.appendChild(div);
  });
}

function clearLog(){
  if(!confirm("Delete all catches?")) return;
  saveCatches([]);
  renderLog();
  renderStats();
}

function renderStats(){
  const box = document.getElementById("statsBox");
  const catches = getCatches();

  if(!catches.length){
    box.innerHTML = "No catches yet.";
    return;
  }

  const bySpecies = {};
  const byArea = {};

  catches.forEach(c => {
    bySpecies[c.species] = (bySpecies[c.species] || 0) + 1;
    const area = c.localArea || "Unknown";
    byArea[area] = (byArea[area] || 0) + 1;
  });

  let html = "<b>Species Summary</b><br>";
  Object.entries(bySpecies).forEach(([k,v]) => {
    html += `${k}: ${v}<br>`;
  });

  html += "<br><b>Hottest Areas</b><br>";
  Object.entries(byArea)
    .sort((a,b) => b[1] - a[1])
    .slice(0,5)
    .forEach(([k,v]) => {
      html += `${k}: ${v}<br>`;
    });

  box.innerHTML = html;
}

function renderDrift(){
  const box = document.getElementById("driftBox");
  if(lastWindDir === "—"){
    box.innerHTML = "Get current location or wait for conditions to load first.";
    return;
  }
  const driftDir = oppositeCompass(lastWindDir);
  const currentText = document.getElementById("chipCurrent").textContent;
  box.innerHTML =
    `Wind Direction: ${lastWindDir}<br>` +
    `Likely Drift: ${driftDir}<br>` +
    `${currentText}<br><br>` +
    `Start slightly up-current from your target reef so the boat drifts across the strike zone.`;
}

function saveCurrentSpot(){
  const coordStr = document.getElementById("coords").value;
  const localArea = document.getElementById("localArea").value;
  if(!coordStr){
    alert("Get current location first.");
    return;
  }
  const c = parseCoordString(coordStr);
  if(!c) return;

  const custom = getCustomSpots();
  const exists = getAllSpots().some(s => toCoordString(s.lat, s.lon) === coordStr);
  if(exists){
    alert("This spot already exists.");
    return;
  }

  custom.push({
    id: "c" + Date.now(),
    name: localArea || `Spot ${coordStr}`,
    lat: c.lat,
    lon: c.lon,
    type: "Spot",
    preset: false
  });

  saveCustomSpots(custom);
  renderSpotsDropdowns();
  renderNearbySpots();
  alert("Spot saved.");
}

function refreshAllConditions(){
  const use = currentPos || BASE;
  estimateConditions(use.lat, use.lon);
  renderCurrentAreaBox();
  renderNearbySpots();
}

document.getElementById("species").addEventListener("change", setBaitOptionsForSpecies);
document.getElementById("localArea").addEventListener("change", () => {
  const area = document.getElementById("localArea").value;
  if(area){
    const spot = getAllSpots().find(s => s.name === area);
    if(spot){
      document.getElementById("whereCaught").value = `Deep Sea • ${spot.type} • ${spot.name}`;
      document.getElementById("coords").value = toCoordString(spot.lat, spot.lon);
    } else {
      document.getElementById("whereCaught").value = `Deep Sea • ${area}`;
    }
  } else {
    document.getElementById("whereCaught").value = "Deep Sea";
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  setBaitOptionsForSpecies();
  renderSpotsDropdowns();
  renderRouteChain();
  renderLog();
  renderStats();
  await estimateConditions(BASE.lat, BASE.lon);
});
