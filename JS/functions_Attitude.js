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

// Inicializar instrumento si existen sliders
if (rollSlider && pitchSlider) {
  updateAttitudeInstrument();
}