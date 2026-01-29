// functions_Attitude.js
/*
  Lógica simple y modular para Attitude Indicator.
  Cada función debe tener una buena documentación. Indicando en comienzo de la 
  función qué hace, y en los parámetros qué espera y qué devuelve,
  o que ejecuta.
*/

// Referencias a los sliders y valores
const vsSlider = document.getElementById("vs-slider");
const varManifold = document.getElementById("vs-slider-value");
const rollSlider = document.getElementById("roll-slider");
const rollSliderValue = document.getElementById("roll-slider-value");
const pitchSlider = document.getElementById("pitch-slider");
const pitchSliderValue = document.getElementById("pitch-slider-value");

// Referencias a las imágenes
const fondoImg = document.querySelector('img[alt="Fondo Attitude"]');
const ballImg = document.querySelector('img[alt="Ball Attitude"]');
const dialImg = document.querySelector('img[alt="Dial Attitude"]');

// Roll
rollSlider.addEventListener("input", function() {
  rollSliderValue.textContent = parseFloat(this.value).toFixed(1);
  updateAttitudeInstrument();
});

// Pitch
pitchSlider.addEventListener("input", function() {
  pitchSliderValue.textContent = parseInt(this.value);
  updateAttitudeInstrument();
});

function updateAttitudeInstrument() {
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

// Inicializar valores
rollSliderValue.textContent = parseFloat(rollSlider.value).toFixed(1);
pitchSliderValue.textContent = parseInt(pitchSlider.value);
updateAttitudeInstrument();