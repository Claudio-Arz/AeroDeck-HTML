// functions_Attitude.js
/*
Lógica simple y modular para Attitude Indicator.
Cada función debe tener una buena documentación. Indicando en comienzo de la 
función qué hace, y en los parámetros qué espera y qué devuelve,
o que ejecuta.
*/


// Referencias a los sliders y valores (por id)
const rollSlider = document.getElementById("roll-slider");
const rollSliderValue = document.getElementById("roll-slider-value");
const pitchSlider = document.getElementById("pitch-slider");
const pitchSliderValue = document.getElementById("pitch-slider-value");

// Referencias a las imágenes por id (según AttitudeControl.html)
// Inicialización y WebSocket para Attitude Control
function setupAttitudeControls( ws ) {
  // Referencias a sliders e imágenes
  const rollSlider = document.getElementById("roll-slider");
  const rollSliderValue = document.getElementById("roll-slider-value");
  const pitchSlider = document.getElementById("pitch-slider");
  const pitchSliderValue = document.getElementById("pitch-slider-value");
  const fondoImg = document.getElementById("AttCon_fondo");
  const ballImg = document.getElementById("AttCon_ball");
  const dialImg = document.getElementById("AttCon_dial");
  
  function updateAttitudeInstrument(roll, pitch) {
    // Si no se pasan valores, tomar de sliders
    if (roll === undefined && rollSlider) roll = parseFloat(rollSlider.value);
    if (pitch === undefined && pitchSlider) pitch = parseInt(pitchSlider.value);
    if (fondoImg && roll !== undefined) fondoImg.style.transform = `rotate(${roll}deg)`;
    if (ballImg && roll !== undefined && pitch !== undefined) ballImg.style.transform = `rotate(${roll}deg) translateY(${pitch}px)`;
    if (dialImg && roll !== undefined) dialImg.style.transform = `rotate(${roll}deg)`;
  }
  
  // Sliders locales
  if (rollSlider && rollSliderValue) {
    rollSlider.addEventListener("input", function() {
      rollSliderValue.textContent = parseFloat(this.value).toFixed(1);
      updateAttitudeInstrument();
      // Enviar por WebSocket si es necesario
      if (ws && ws.readyState === 1) {
        ws.send(JSON.stringify({ roll: parseFloat(this.value) }));
      }
    });
    rollSliderValue.textContent = parseFloat(rollSlider.value).toFixed(1);
  }
  if (pitchSlider && pitchSliderValue) {
    pitchSlider.addEventListener("input", function() {
      pitchSliderValue.textContent = parseInt(this.value);
      updateAttitudeInstrument();
      // Enviar por WebSocket si es necesario
      if (ws && ws.readyState === 1) {
        ws.send(JSON.stringify({ pitch: parseInt(this.value) }));
      }
    });
    pitchSliderValue.textContent = parseInt(pitchSlider.value);
  }
  
  // Handler WebSocket para recibir valores de roll y pitch
  if (ws) {
    ws.addEventListener('message', function(event) {
      let data = {};
      try { data = JSON.parse(event.data); } catch (e) {}
      if (typeof data.roll !== 'undefined' || typeof data.pitch !== 'undefined') {
        updateAttitudeInstrument(data.roll, data.pitch);
        if (rollSlider && typeof data.roll !== 'undefined') rollSlider.value = data.roll;
        if (rollSliderValue && typeof data.roll !== 'undefined') rollSliderValue.textContent = parseFloat(data.roll).toFixed(1);
        if (pitchSlider && typeof data.pitch !== 'undefined') pitchSlider.value = data.pitch;
        if (pitchSliderValue && typeof data.pitch !== 'undefined') pitchSliderValue.textContent = parseInt(data.pitch);
      }
    });
  }
  
  // Inicializar instrumento
  updateAttitudeInstrument();
}
const fondoImg = document.getElementById("AttCon_fondo");
const ballImg = document.getElementById("AttCon_ball");
const dialImg = document.getElementById("AttCon_dial");

function updateAttitudeInstrument() {
  if (!rollSlider || !pitchSlider) return;
  const roll = parseFloat(rollSlider.value);
  const pitch = parseInt(pitchSlider.value);
  // Aplica rotación y desplazamiento
  if (fondoImg) {
    fondoImg.style.transform = `rotate(${roll}deg)`;
  }
  if (ballImg) {
    ballImg.style.transform = `rotate(${roll}deg) translateY(${pitch}px)`;
  }
  if (dialImg) {
    dialImg.style.transform = `rotate(${roll}deg)`;
  }
}

if (rollSlider && rollSliderValue) {
  rollSlider.addEventListener("input", function() {
    rollSliderValue.textContent = parseFloat(this.value).toFixed(1);
    updateAttitudeInstrument();
  });
  // Inicializar valor
  rollSliderValue.textContent = parseFloat(rollSlider.value).toFixed(1);
}

if (pitchSlider && pitchSliderValue) {
  pitchSlider.addEventListener("input", function() {
    pitchSliderValue.textContent = parseInt(this.value);
    updateAttitudeInstrument();
  });
  // Inicializar valor
  pitchSliderValue.textContent = parseInt(pitchSlider.value);
}

// Joystick para controlar roll y pitch

const container = document.getElementById('joystick');
const knob = document.getElementById('knob');
const coords = document.getElementById('coords');
const size = 200;
const knobSize = 20;
const radius = (size - knobSize) / 2;
let dragging = false;

let knobPos = {x: 0, y: 0};
function setKnob(x, y) {
  knobPos.x = x;
  knobPos.y = y;
  knob.style.left = `${x + size/2}px`;
  knob.style.top = `${y + size/2}px`;
  // Mapear x a roll (-30 a 30)
  const roll = Math.round((x / radius) * 30 * 10) / 10; // 1 decimal
  // Mapear y a pitch (-50 a 50)
  const pitchRaw = Math.round((y / radius) * 50 * 10) / 10; // -50 a 50
  // Convertir pitch a grados según escala: 25=10°, 12.5=5°, 50=20°
  // pitchGrados = pitchRaw * 0.4
  const pitchDeg = Math.round((pitchRaw * 0.4) * 10) / 10;
  coords.textContent = `roll: ${roll}°, pitch: ${pitchDeg}°`;
  // Enviar roll y pitch (en grados reales) por WebSocket
  if (ws && ws.readyState === 1) {
    ws.send(JSON.stringify({ roll: roll, pitch: pitchDeg }));
  }
}

function getRelativeCoords(e) {
  const rect = container.getBoundingClientRect();
  let clientX = e.touches ? e.touches[0].clientX : e.clientX;
  let clientY = e.touches ? e.touches[0].clientY : e.clientY;
  let x = clientX - rect.left - size/2;
  let y = clientY - rect.top - size/2;
  // Limitar dentro del círculo
  const dist = Math.sqrt(x*x + y*y);
  if (dist > radius) {
    x = x * radius / dist;
    y = y * radius / dist;
  }
  return {x: Math.round(x), y: Math.round(y)};
}

function onMove(e) {
  if (!dragging) return;
  e.preventDefault();
  const {x, y} = getRelativeCoords(e);
  setKnob(x, y);
}

function animateToCenter() {
  const start = {x: knobPos.x, y: knobPos.y};
  const duration = 4000; // ms
  const startTime = performance.now();
  function animate(now) {
    const elapsed = now - startTime;
    const t = Math.min(elapsed / duration, 1);
    // Ease-out
    const ease = 1 - Math.pow(1 - t, 2);
    const x = Math.round(start.x * (1 - ease));
    const y = Math.round(start.y * (1 - ease));
    setKnob(x, y);
    if (t < 1) {
      requestAnimationFrame(animate);
    } else {
      setKnob(0, 0);
    }
  }
  requestAnimationFrame(animate);
}
function onEnd() {
  dragging = false;
  animateToCenter();
  document.removeEventListener('mousemove', onMove);
  document.removeEventListener('mouseup', onEnd);
  document.removeEventListener('touchmove', onMove);
  document.removeEventListener('touchend', onEnd);
}

knob.addEventListener('mousedown', function(e) {
  dragging = true;
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onEnd);
});
knob.addEventListener('touchstart', function(e) {
  dragging = true;
  document.addEventListener('touchmove', onMove, {passive: false});
  document.addEventListener('touchend', onEnd);
});

// Inicializar en el centro
setKnob(0, 0);
