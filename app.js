import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js";

const $ = id => document.getElementById(id);
const state = { lat:-2.170998, lon:-79.922359, place:"Guayaquil", temp:28, humidity:75, water:75, weather:null };
const fmtDate = d => new Intl.DateTimeFormat("es-EC",{weekday:"short",day:"2-digit",month:"short"}).format(d);
$("todayDate").textContent = new Intl.DateTimeFormat("es-EC",{day:"numeric",month:"long",year:"numeric"}).format(new Date());

function weatherDescription(code){
  if(code===0)return ["Despejado","☀️"]; if([1,2].includes(code))return ["Parcialmente nublado","🌤️"];
  if(code===3)return ["Nublado","☁️"]; if([45,48].includes(code))return ["Niebla","🌫️"];
  if([51,53,55,56,57].includes(code))return ["Llovizna","🌦️"];
  if([61,63,65,66,67,80,81,82].includes(code))return ["Lluvia","🌧️"];
  if([71,73,75,77,85,86].includes(code))return ["Nieve / granizo","🌨️"];
  if([95,96,99].includes(code))return ["Tormenta","⛈️"]; return ["Condición variable","🌤️"];
}
function setBar(id,val,max){$(id).style.width=Math.max(2,Math.min(100,val/max*100))+"%";}
function climateReading(t,h,r,w){
  const notes=[];
  if(t>32) notes.push("Temperatura elevada: vigila estrés por calor y humedad del suelo.");
  else if(t<20) notes.push("Temperatura fresca: el crecimiento puede ralentizarse.");
  else notes.push("Temperatura dentro de un rango cálido generalmente favorable.");
  if(h>=85) notes.push("Humedad alta: aumenta la vigilancia de Sigatoka negra y la ventilación del follaje.");
  else if(h<55) notes.push("Humedad baja: revisa la disponibilidad de agua y el estado del suelo.");
  if(r>2) notes.push("Lluvia reciente: comprueba drenajes y evita encharcamientos.");
  if(w>30) notes.push("Viento fuerte: revisa el riesgo de volcamiento y el soporte de plantas.");
  return notes.join(" ");
}
async function loadWeather(){
  $("weatherText").textContent="Actualizando…";
  const url=`https://api.open-meteo.com/v1/forecast?latitude=${state.lat}&longitude=${state.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,cloud_cover,wind_speed_10m,weather_code&hourly=relative_humidity_2m,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=auto&forecast_days=7`;
  try{
    const res=await fetch(url); if(!res.ok) throw new Error("No se pudo consultar el servicio meteorológico.");
    const data=await res.json(); const c=data.current; state.weather=c;
    const [desc,icon]=weatherDescription(c.weather_code);
    $("weatherText").textContent=desc; $("weatherIcon").textContent=icon;
    $("temperature").textContent=Math.round(c.temperature_2m);
    $("feelsLike").textContent=Math.round(c.apparent_temperature)+"°";
    $("cloudCover").textContent=c.cloud_cover+"%"; $("rainNow").textContent=c.precipitation+" mm";
    $("humidity").innerHTML=`${c.relative_humidity_2m}<i>%</i>`;
    $("rain").innerHTML=`${c.precipitation}<i> mm</i>`;
    $("wind").innerHTML=`${Math.round(c.wind_speed_10m)}<i> km/h</i>`;
    $("humidityHint").textContent=c.relative_humidity_2m>=85?"Humedad elevada":c.relative_humidity_2m<55?"Humedad baja":"Humedad moderada";
    $("windHint").textContent=c.wind_speed_10m>30?"Viento fuerte: revisar soporte":"Velocidad actual del viento";
    setBar("humidityMeter",c.relative_humidity_2m,100);setBar("rainMeter",c.precipitation,10);setBar("windMeter",c.wind_speed_10m,60);
    $("climateAdvice").innerHTML=`<span>✦</span><div><b>Lectura agrícola orientativa</b><p>${climateReading(c.temperature_2m,c.relative_humidity_2m,c.precipitation,c.wind_speed_10m)} Estas mediciones corresponden al punto meteorológico, no necesariamente al microclima de tu parcela.</p></div>`;
    $("updatedAt").textContent="Actualizado: "+new Intl.DateTimeFormat("es-EC",{hour:"2-digit",minute:"2-digit"}).format(new Date());
    $("forecast").innerHTML=data.daily.time.map((day,i)=>{const [d,ic]=weatherDescription(data.daily.weather_code[i]);return `<div class="forecast-day"><b>${fmtDate(new Date(day+"T12:00:00"))}</b><div class="f-icon">${ic}</div><strong>${Math.round(data.daily.temperature_2m_max[i])}° / ${Math.round(data.daily.temperature_2m_min[i])}°</strong><small>☂ ${data.daily.precipitation_probability_max[i]??0}% · ${data.daily.precipitation_sum[i]} mm</small></div>`}).join("");
    state.temp=Math.round(c.temperature_2m);state.humidity=c.relative_humidity_2m;updateScenarioFromWeather();
  }catch(err){
    $("weatherText").textContent="Datos no disponibles";
    $("climateAdvice").innerHTML=`<span>!</span><div><b>No se pudo actualizar el clima</b><p>Comprueba tu conexión a internet. El resto de la información de Bananapp sigue disponible. ${err.message}</p></div>`;
    $("updatedAt").textContent="Sin conexión meteorológica";
  }
}
$("locationSelect").addEventListener("change",e=>{const [lat,lon,name]=e.target.value.split(",");state.lat=+lat;state.lon=+lon;state.place=name;$("placeName").textContent=name;loadWeather();});
$("refreshWeather").addEventListener("click",loadWeather);

// 3D plant: illustrative pseudostem, broad leaves and banana bunch.
const mount=$("plant3d");
const scene=new THREE.Scene();scene.background=new THREE.Color(0xe4eee0);
const camera=new THREE.PerspectiveCamera(38,mount.clientWidth/390,.1,100);camera.position.set(5.2,4.2,8);
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(mount.clientWidth,390);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;mount.appendChild(renderer.domElement);
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.target.set(0,2.5,0);controls.maxPolarAngle=Math.PI*.48;controls.minDistance=4;controls.maxDistance=13;
scene.add(new THREE.HemisphereLight(0xffffff,0x728d63,2));
const sun=new THREE.DirectionalLight(0xffffff,2.1);sun.position.set(5,9,6);sun.castShadow=true;scene.add(sun);
const ground=new THREE.Mesh(new THREE.CircleGeometry(4.5,64),new THREE.MeshStandardMaterial({color:0x9db58a,roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.y=-.08;ground.receiveShadow=true;scene.add(ground);
const plant=new THREE.Group();scene.add(plant);
const stemMat=new THREE.MeshStandardMaterial({color:0x82a94f,roughness:.9});
const stem=new THREE.Mesh(new THREE.CylinderGeometry(.34,.48,3.4,20,1),stemMat);stem.position.y=1.65;stem.castShadow=true;plant.add(stem);
for(let i=0;i<7;i++){const ring=new THREE.Mesh(new THREE.TorusGeometry(.37-i*.009,.018,5,28),new THREE.MeshStandardMaterial({color:0xa8bd70}));ring.rotation.x=Math.PI/2;ring.position.y=.35+i*.42;plant.add(ring);}
const leafMat=new THREE.MeshStandardMaterial({color:0x318447,side:THREE.DoubleSide,roughness:.85});
const leafLight=new THREE.MeshStandardMaterial({color:0x5b9b4e,side:THREE.DoubleSide,roughness:.85});
const leafGroup=new THREE.Group();plant.add(leafGroup);
function makeLeaf(angle,tilt,len,width,mat){
 const shape=new THREE.Shape();shape.moveTo(0,0);shape.quadraticCurveTo(len*.25,width,len*.55,width*.62);shape.quadraticCurveTo(len*.88,width*.2,len,0);shape.quadraticCurveTo(len*.65,-width*.5,len*.35,-width*.35);shape.quadraticCurveTo(len*.12,-width*.15,0,0);
 const geo=new THREE.ShapeGeometry(shape,20);const mesh=new THREE.Mesh(geo,mat);mesh.rotation.set(tilt,angle,0);mesh.position.set(0,3.1+Math.random()*.28,0);mesh.castShadow=true;leafGroup.add(mesh);
 const vein=new THREE.Mesh(new THREE.CylinderGeometry(.012,.018,len,5),new THREE.MeshStandardMaterial({color:0xb2c77a}));vein.rotation.z=Math.PI/2;vein.position.set(0,3.12,0);vein.scale.set(1,.5,.5);leafGroup.add(vein);
}
for(let i=0;i<9;i++)makeLeaf(i*Math.PI*2/9,(-.15+Math.random()*.38),2.3+Math.random()*.8,.42,i%2?leafMat:leafLight);
// hanging fruit bunch
const bunch=new THREE.Group();bunch.position.set(.1,2.8,.25);plant.add(bunch);
const stalk=new THREE.Mesh(new THREE.CylinderGeometry(.06,.09,.75,8),new THREE.MeshStandardMaterial({color:0x547e35}));stalk.position.y=-.36;bunch.add(stalk);
const bananaMat=new THREE.MeshStandardMaterial({color:0xd8c94b,roughness:.55});
for(let row=0;row<3;row++){for(let j=0;j<6-row;j++){const fruit=new THREE.Mesh(new THREE.CapsuleGeometry(.095,.62,5,10),bananaMat);fruit.rotation.z=(j%2?-.2:.2);fruit.rotation.x=(row-1)*.15;fruit.position.set((j-(5-row)/2)*.18,-.63-row*.32,.04+row*.06);fruit.castShadow=true;bunch.add(fruit);}}
const soil=new THREE.Mesh(new THREE.CylinderGeometry(.65,.85,.18,32),new THREE.MeshStandardMaterial({color:0x765b3b}));soil.position.y=.02;plant.add(soil);
let rotating=true;
$("rotateBtn").onclick=()=>{rotating=!rotating;$("rotateBtn").classList.toggle("active",rotating);};
$("resetView").onclick=()=>{camera.position.set(5.2,4.2,8);controls.target.set(0,2.5,0);controls.update();plant.rotation.y=0;};
function resize(){const w=mount.clientWidth;renderer.setSize(w,390);camera.aspect=w/390;camera.updateProjectionMatrix();}
new ResizeObserver(resize).observe(mount);
function animate(){requestAnimationFrame(animate);if(rotating)plant.rotation.y+=.0025;controls.update();renderer.render(scene,camera);}animate();

function assessScenario(t,h,w){
 let title="Condiciones de referencia",desc="Escenario ilustrativo favorable. Mantén el monitoreo de campo.",color="#79a64c";
 if(t>32||t<20||h>90||h<50||w<30){title="Requiere atención";color="#c58b3b";const risks=[];if(t>32)risks.push("calor elevado");if(t<20)risks.push("temperatura fresca");if(h>90)risks.push("humedad muy alta");if(h<50)risks.push("humedad ambiental baja");if(w<30)risks.push("poca disponibilidad de agua");desc="Revisa "+risks.join(", ")+". Evalúa suelo, drenaje y estado de hojas antes de actuar.";}
 if(w<15){title="Riesgo de estrés hídrico";color="#c65d4e";desc="La disponibilidad de agua simulada es baja. Comprueba humedad del suelo y planifica riego según la demanda real.";}
 if(h>90&&w>80){title="Vigilar exceso de humedad";color="#c58b3b";desc="El escenario puede favorecer problemas foliares y saturación. Refuerza monitoreo de Sigatoka y drenajes.";}
 $("plantStatus").innerHTML=`<span class="status-dot" style="background:${color}"></span><div><b>${title}</b><p>${desc}</p></div>`;
}
function updateScenario(){state.temp=+$("tempRange").value;state.humidity=+$("humidityRange").value;state.water=+$("waterRange").value;$("tempValue").textContent=state.temp+" °C";$("humidityValue").textContent=state.humidity+" %";$("waterValue").textContent=state.water+" %";assessScenario(state.temp,state.humidity,state.water);}
["tempRange","humidityRange","waterRange"].forEach(id=>$(id).addEventListener("input",updateScenario));
function updateScenarioFromWeather(){if(!state.weather)return;$("tempRange").value=Math.max(15,Math.min(38,Math.round(state.weather.temperature_2m)));$("humidityRange").value=state.weather.relative_humidity_2m;$("waterRange").value=Math.max(0,Math.min(100,Math.round(100-state.weather.precipitation*5)));updateScenario();}
$("useWeather").onclick=()=>{if(state.weather){$("tempRange").value=Math.max(15,Math.min(38,Math.round(state.weather.temperature_2m)));$("humidityRange").value=state.weather.relative_humidity_2m;$("waterRange").value=Math.max(0,Math.min(100,Math.round(100-state.weather.precipitation*5)));updateScenario();}};
updateScenario();loadWeather();
