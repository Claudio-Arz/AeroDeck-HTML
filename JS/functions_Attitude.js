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