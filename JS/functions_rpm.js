/*
  Tablero AeroDeck
  Claudio Arzamendia Systems
  Tablero completo con intrumental aeronáutico
  para ajustar instrumentos analógicos.

  2026-01-24 19:37:12
  En el sistema vamos a usar librerías estándar de JS y CSS.
  El código JS se divide en módulos lógicos por instrumento.
  Cada módulo tiene funciones para actualizar la UI y
  configurar los controles. El WebSocket se maneja en mainHTML.html
  y los mensajes se distribuyen a los módulos según el contenido.

  functions_rpm.js: lógica simple y modular para RPM. Cada función
  debe tener una buena documentación. Indicando en comienzo de la 
  función qué hace, y en los parámetros qué espera y qué devuelve,
  o que ejecuta.




*/


/*
  Actualiza la aguja del tacómetro y el valor numérico de RPM.
  Parámetros:
    rpm: número, valor de RPM entre 0 y 3000.
    noice: booleano o número, indica si el modo "noice" está activo (true/1) o no (false/0).
*/ 
function initRPMControls() {
  // Aquí podríamos agregar event listeners para controles interactivos
  const rpmSlider = document.getElementById('rpm-slider');
  const rpmSliderValue = document.getElementById('rpm-slider-value');
  const maxButton = document.getElementById('rpm-slider-max');
  const midButton = document.getElementById('rpm-slider-mid');
  const minButton = document.getElementById('rpm-slider-min');
  const rpmBtnPlus = document.getElementById('rpm-btn-plus');
  const rpmBtnMinus = document.getElementById('rpm-btn-minus');
  const startBtnRPM = document.getElementById('start-btn-rpm');
  const noiceBtnRPM = document.getElementById('noice-btn-rpm');

  if (!rpmSlider || !rpmSliderValue || !maxButton || !midButton || 
    !minButton || !rpmBtnPlus || !rpmBtnMinus || !startBtnRPM || !noiceBtnRPM  ) {
    console.warn('No se encontraron los controles del RPM en el DOM.');
    return;
  }

  // Variables de estado para los toggles (no usar .value que convierte a string)
  let noiceState = false;
  let startState = false;

  noiceBtnRPM.addEventListener('click', () => {
    noiceState = !noiceState;
    sendRPMToESP32("noiceBtnRPM", noiceState);
  });
  startBtnRPM.addEventListener('click', () => {
    if(ws.readyState === 1) {
      sendRPMToESP32("startBtnRPM", true);
    }
  });
  rpmBtnPlus.addEventListener('click', () => {
    let currentValue = parseFloat(rpmSlider.value);
    rpmSlider.value = currentValue < 3000 ? currentValue + 1 : currentValue;
    rpmSliderValue.textContent = rpmSlider.value;
    sendRPMToESP32("rpmSlider", parseFloat(rpmSlider.value));
  });
  rpmBtnMinus.addEventListener('click', () => {
    let currentValue = parseFloat(rpmSlider.value);
    rpmSlider.value = currentValue > 0 ? currentValue - 1 : currentValue;
    rpmSliderValue.textContent = rpmSlider.value;
    sendRPMToESP32("rpmSlider", parseFloat(rpmSlider.value));
  });
  maxButton.addEventListener('click', () => {
    rpmSlider.value = parseFloat(3000);
    rpmSliderValue.textContent = 3000;
    sendRPMToESP32("rpmSlider", 3000.0);
  });
  midButton.addEventListener('click', () => {
    rpmSlider.value = parseFloat(1500);
    rpmSliderValue.textContent = 1500;
    sendRPMToESP32("rpmSlider", 1500.0);
  });
  minButton.addEventListener('click', () => {
    rpmSlider.value = parseFloat(0);
    rpmSliderValue.textContent = 0;
    sendRPMToESP32("rpmSlider", 0.0);
  });
  rpmSlider.addEventListener('input', () => {
    const value = parseFloat(rpmSlider.value);
    rpmSliderValue.textContent = value;
    sendRPMToESP32("rpmSlider", value);
  });

}

function sendRPMToESP32(DataVar, DataValue) {
  getWebSocketInstance(function(ws) {
    console.log('Enviando RPM al ESP32:', DataVar, DataValue);
    ws.send(JSON.stringify({ [DataVar]: DataValue }));
  });
}

function updateRPMAndValue(RPMValue, RPMNoice, varRPM) {

  // Actualizar el valor numérico en el centro del instrumento
  document.getElementById("rpm-value").textContent = Math.round(RPMValue);
  // Calcular el ángulo de la aguja en función del valor de RPM
  // 0 rpm = 225°, 3000 rpm = 495° (225° + 270°), recorre 270° antihorario
  let angle = 225 + (Math.max(0, Math.min(varRPM, 3000)) * 270) / 3000;
  document.getElementById("rpm-needle").style.transform =
    `translate(-50%, -50%) rotate(${angle}deg)`;
  document.getElementById("rpm-value").textContent = Math.round(varRPM);
  // Actualizar el valor del slider y su display si cambia por rutina automática
  const RPMValor = document.getElementById("rpm-value");
  const   RPMSlider = document.getElementById("rpm-slider");
  if (RPMSlider && Math.abs(RPMSlider.value - RPMValue) > 1) {
    RPMSlider.value = RPMValue;
    RPMSlider.textContent = Math.round(RPMValue);
  }

  // Cambiar el color del boton Noice y crystal según el estado
  const noiceBtnRPM = document.getElementById('noice-btn-rpm');
  const rpmCrystal = document.getElementById('rpm-crystal');
  const noiceActive = (RPMNoice === true || RPMNoice === 1);
  if (noiceActive) {
    noiceBtnRPM.style.background = '#0f0';
    if (rpmCrystal) rpmCrystal.style.background = 'rgba(74, 252, 74, 0.08)';
  } else {
    noiceBtnRPM.style.background = '#444';
    if (rpmCrystal) rpmCrystal.style.background = '';
  }
  
}

const drumDigits = 5;
const drumCounter = document.getElementById('drum-counter');
// Create digit drums
for (let i = 0; i < drumDigits; i++) {
  const digit = document.createElement('div');
  digit.className = 'drum-digit';
  const strip = document.createElement('div');
  strip.className = 'drum-strip';
  for (let n = 0; n < 10; n++) {
    const num = document.createElement('div');
    num.className = 'drum-number';
    num.textContent = n;
    strip.appendChild(num);
  }
  digit.appendChild(strip);
  drumCounter.appendChild(digit);
}
function setDrumValue(varRPM) {
  let value = String(Math.round(varRPM)).padStart(drumDigits, '0');
  [...drumCounter.children].forEach((digit, i) => {
    const strip = digit.querySelector('.drum-strip');
    const num = parseInt(value[i]);
    strip.style.transform = `translateY(-${num * 10}px)`;
  });
}
// Inicializar con el valor por defecto
setDrumValue(0);


