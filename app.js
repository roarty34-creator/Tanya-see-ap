function showTab(id){

document.querySelectorAll("section").forEach(s=>s.style.display="none")

document.getElementById(id).style.display="block"

}

function setCurrentLocation(){

navigator.geolocation.getCurrentPosition(pos=>{

const lat=pos.coords.latitude
const lon=pos.coords.longitude

document.getElementById("coords").value=lat+","+lon

loadWeather(lat,lon)

})

}

async function loadWeather(lat,lon){

try{

const w=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=wind_speed_10m`)

const m=await fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&current=wave_height,swell_wave_height,sea_surface_temperature`)

const weather=await w.json()
const marine=await m.json()

document.getElementById("conditions").innerHTML=

"Wind: "+weather.current.wind_speed_10m+" km/h<br>"+
"Swell: "+marine.current.swell_wave_height+" m<br>"+
"Sea Temp: "+marine.current.sea_surface_temperature+" °C"

}catch{

document.getElementById("conditions").innerHTML="Weather unavailable"

}

}

function startNavigation(){

const speed=document.getElementById("boatSpeed").value
const coords=document.getElementById("nextSpot").value

if(!coords)return

const [lat,lon]=coords.split(",")

navigator.geolocation.getCurrentPosition(pos=>{

const dist=distance(pos.coords.latitude,pos.coords.longitude,lat,lon)

const eta=dist/speed

document.getElementById("navResult").innerHTML=

"Distance: "+dist.toFixed(2)+" km<br>"+
"ETA: "+eta.toFixed(2)+" h"

})

}

function distance(a,b,c,d){

const R=6371

const dLat=(c-a)*Math.PI/180
const dLon=(d-b)*Math.PI/180

const x=

Math.sin(dLat/2)**2+

Math.cos(a*Math.PI/180)*

Math.cos(c*Math.PI/180)*

Math.sin(dLon/2)**2

return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x))

}

function saveCatch(){

alert("Catch Saved")

}
