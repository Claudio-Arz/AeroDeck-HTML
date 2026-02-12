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


  noiceBtnRPM.addEventListener('click', () => {
    noiceBtnRPM.value = noiceBtnRPM.value === 1 ?  0 : 1;
    sendRPMToESP32("noiceBtnRPM", noiceBtnRPM.value);
  });
  startBtnRPM.addEventListener('click', () => {
    startBtnRPM.value = startBtnRPM.value === 1 ?  0 : 1;
    sendRPMToESP32("startBtnRPM", startBtnRPM.value);
  });
  rpmBtnPlus.addEventListener('click', () => {
    rpmSlider.value += rpmSlider.value < 3000 ?  parseFloat(1) : parseFloat(0);
    rpmSliderValue.textContent = rpmSlider.value;
    sendRPMToESP32("rpmSlider", rpmSlider.value);
  });
  rpmBtnMinus.addEventListener('click', () => {
    rpmSlider.value -= rpmSlider.value > 0 ?  parseFloat(1) : parseFloat(0);
    rpmSliderValue.textContent = rpmSlider.value;
    sendRPMToESP32("rpmSlider", rpmSlider.value);
  });
  maxButton.addEventListener('click', () => {
    rpmSlider.value = parseFloat(3000);
    rpmSliderValue.textContent = 3000;
    sendRPMToESP32("rpmSlider", 3000);
  });
  midButton.addEventListener('click', () => {
    rpmSlider.value = parseFloat(1500);
    rpmSliderValue.textContent = 1500;
    sendRPMToESP32("rpmSlider", 1500);
  });
  minButton.addEventListener('click', () => {
    rpmSlider.value = parseFloat(0);
    rpmSliderValue.textContent = 0;
    sendRPMToESP32("rpmSlider", 0);
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

function updateRMPAndValue(RPMValue, RPMNoice) {
  // Actualizar el valor numérico en el centro del instrumento
  document.getElementById("rpm-value").textContent = Math.round(RPMValue);
  // Calcular los ángulos de las agujas en función de la altitud
  // 0 rpm = 225°, 3000 rpm = 495° (225° + 270°), recorre 270° antihorario
  let angle = 225 + (Math.max(0, Math.min(RPMValue, 3000)) * 270) / 3000;
  document.getElementById("rpm-needle").style.transform =
    `translate(-50%, -50%) rotate(${angle}deg)`;
  document.getElementById("rpm-value").textContent = Math.round(RPMValue);
  // Actualizar el valor del slider y su display si cambia por rutina automática
  const RPMValor = document.getElementById("rpm-value");
  const   RPMSlider = document.getElementById("rpm-slider");
  if (RPMSlider && Math.abs(RPMSlider.value - RPMValue) > 1) {
    RPMSlider.value = RPMValue;
    RPMSlider.textContent = Math.round(RPMValue);
  }

  // Cambiar el color del boton Noice según el estado
  const noiceBtnRPM = document.getElementById('noice-btn-rpm');
  if (RPMNoice == 1) {
    noiceBtnRPM.style.background = '#0f0';  
  } else {
    noiceBtnRPM.style.background = '#444';  
  }
  
}