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
  const simBtnRPM = document.getElementById('sim-btn-rpm');
  const brakeBtn = document.getElementById('rpm-brake-btn');

  if (!rpmSlider || !rpmSliderValue || !maxButton || !midButton || 
    !minButton || !rpmBtnPlus || !rpmBtnMinus || !startBtnRPM || !noiceBtnRPM || !simBtnRPM || !brakeBtn) {
    console.warn('No se encontraron los controles del RPM en el DOM.');
    return;
  }

  // Variables de estado para los toggles (no usar .value que convierte a string)
  let noiceState = false;
  let startState = (window.rpmStartState === true);
  let brakeState = false;

  function updateStartButtonUI(isStarted) {
    window.rpmStartState = isStarted === true;
    startBtnRPM.textContent = window.rpmStartState ? 'STOP' : 'START';
  }

  function isRPMSimOn() {
    return window.rpmSimModeState === true;
  }

  function updateRPMSimUI(isOn) {
    window.rpmSimModeState = isOn === true;
    if (window.rpmSimModeState) {
      simBtnRPM.style.background = '#0f0';
      simBtnRPM.style.color = '#111';
      simBtnRPM.textContent = 'SIM ON';
    } else {
      simBtnRPM.style.background = '#444';
      simBtnRPM.style.color = '#fff';
      simBtnRPM.textContent = 'MAN';
    }

    const lock = window.rpmSimModeState;
    rpmSlider.disabled = lock;
    maxButton.disabled = lock;
    midButton.disabled = lock;
    minButton.disabled = lock;
    rpmBtnPlus.disabled = lock;
    rpmBtnMinus.disabled = lock;
    startBtnRPM.disabled = lock;
  }

  function updateBrakeUI(isOn) {
    const brakeLabel = document.getElementById('rpm-brake-label');
    window.brakeOnState = isOn === true;
    if (typeof updateTurnCoordinatorBrakeUI === 'function') {
      updateTurnCoordinatorBrakeUI(window.brakeOnState);
    }
    if (typeof updateAttitudeBrakeUI === 'function') {
      updateAttitudeBrakeUI(window.brakeOnState);
    }
    if (isOn) {
      brakeBtn.classList.add('is-on');
      if (brakeLabel) brakeLabel.textContent = 'BRAKE ON';
    } else {
      brakeBtn.classList.remove('is-on');
      if (brakeLabel) brakeLabel.textContent = 'BRAKE OFF';
    }
  }

  brakeBtn.addEventListener('click', () => {
    brakeState = !brakeState;
    updateBrakeUI(brakeState);
    sendRPMToESP32('brakeOn', brakeState);
  });

  noiceBtnRPM.addEventListener('click', () => {
    if (isRPMSimOn()) return;
    noiceState = !noiceState;
    window._rpmNoiceActive = noiceState;
    noiceBtnRPM.style.background = noiceState ? '#0f0' : '#444';
    sendRPMToESP32("noiceBtnRPM", noiceState);
  });
  simBtnRPM.addEventListener('click', () => {
    const newState = !isRPMSimOn();
    updateRPMSimUI(newState);
    sendRPMToESP32("useSimulatedRPM", newState);
  });
  startBtnRPM.addEventListener('click', () => {
    if (isRPMSimOn()) return;
    startState = !startState;
    updateStartButtonUI(startState);
    if (startState && window.isSoundEnabled && window.isSoundEnabled()) {
      const startAudio = new Audio('https://claudio-arz.github.io/AeroDeck-HTML/Audio/Start32s.wav');
      startAudio.play();
    }
    if(ws.readyState === 1) {
      sendRPMToESP32("startBtnRPM", startState);
    }
  });
  rpmBtnPlus.addEventListener('click', () => {
    if (isRPMSimOn()) return;
    let currentValue = parseFloat(rpmSlider.value);
    rpmSlider.value = currentValue < 3000 ? currentValue + 1 : currentValue;
    rpmSliderValue.textContent = rpmSlider.value;
    sendRPMToESP32("rpmSlider", parseFloat(rpmSlider.value));
  });
  rpmBtnMinus.addEventListener('click', () => {
    if (isRPMSimOn()) return;
    let currentValue = parseFloat(rpmSlider.value);
    rpmSlider.value = currentValue > 0 ? currentValue - 1 : currentValue;
    rpmSliderValue.textContent = rpmSlider.value;
    sendRPMToESP32("rpmSlider", parseFloat(rpmSlider.value));
  });
  maxButton.addEventListener('click', () => {
    if (isRPMSimOn()) return;
    rpmSlider.value = parseFloat(3000);
    rpmSliderValue.textContent = 3000;
    sendRPMToESP32("rpmSlider", 3000.0);
  });
  midButton.addEventListener('click', () => {
    if (isRPMSimOn()) return;
    rpmSlider.value = parseFloat(1500);
    rpmSliderValue.textContent = 1500;
    sendRPMToESP32("rpmSlider", 1500.0);
  });
  minButton.addEventListener('click', () => {
    if (isRPMSimOn()) return;
    rpmSlider.value = parseFloat(0);
    rpmSliderValue.textContent = 0;
    sendRPMToESP32("rpmSlider", 0.0);
  });
  rpmSlider.addEventListener('input', () => {
    if (isRPMSimOn()) return;
    const value = parseFloat(rpmSlider.value);
    rpmSliderValue.textContent = value;
    sendRPMToESP32("rpmSlider", value);
  });

  updateStartButtonUI(startState);

  updateRPMSimUI(window.rpmSimModeState === true);

}

function updateRPMEngineState(isStarted) {
  const startBtnRPM = document.getElementById('start-btn-rpm');
  if (!startBtnRPM) return;

  window.rpmStartState = (isStarted === true);
  startBtnRPM.textContent = window.rpmStartState ? 'STOP' : 'START';
}

function updateRPMSimModeState(useSimulatedRPM) {
  const simBtnRPM = document.getElementById('sim-btn-rpm');
  const rpmSlider = document.getElementById('rpm-slider');
  const maxButton = document.getElementById('rpm-slider-max');
  const midButton = document.getElementById('rpm-slider-mid');
  const minButton = document.getElementById('rpm-slider-min');
  const rpmBtnPlus = document.getElementById('rpm-btn-plus');
  const rpmBtnMinus = document.getElementById('rpm-btn-minus');
  const startBtnRPM = document.getElementById('start-btn-rpm');

  window.rpmSimModeState = useSimulatedRPM === true;

  if (simBtnRPM) {
    if (window.rpmSimModeState) {
      simBtnRPM.style.background = '#0f0';
      simBtnRPM.style.color = '#111';
      simBtnRPM.textContent = 'SIM ON';
    } else {
      simBtnRPM.style.background = '#444';
      simBtnRPM.style.color = '#fff';
      simBtnRPM.textContent = 'MAN';
    }
  }

  const lock = window.rpmSimModeState;
  if (rpmSlider) rpmSlider.disabled = lock;
  if (maxButton) maxButton.disabled = lock;
  if (midButton) midButton.disabled = lock;
  if (minButton) minButton.disabled = lock;
  if (rpmBtnPlus) rpmBtnPlus.disabled = lock;
  if (rpmBtnMinus) rpmBtnMinus.disabled = lock;
  if (startBtnRPM) startBtnRPM.disabled = lock;
}

function updateBrakeState(brakeOn) {
  const brakeBtn = document.getElementById('rpm-brake-btn');
  const brakeLabel = document.getElementById('rpm-brake-label');
  if (!brakeBtn) return;
  window.brakeOnState = brakeOn === true;
  if (typeof updateTurnCoordinatorBrakeUI === 'function') {
    updateTurnCoordinatorBrakeUI(window.brakeOnState);
  }
  if (typeof updateAttitudeBrakeUI === 'function') {
    updateAttitudeBrakeUI(window.brakeOnState);
  }
  if (brakeOn) {
    brakeBtn.classList.add('is-on');
    if (brakeLabel) brakeLabel.textContent = 'BRAKE ON';
  } else {
    brakeBtn.classList.remove('is-on');
    if (brakeLabel) brakeLabel.textContent = 'BRAKE OFF';
  }
}

function sendRPMToESP32(DataVar, DataValue) {
  getWebSocketInstance(function(ws) {
    console.log('Enviando RPM al ESP32:', DataVar, DataValue);
    ws.send(JSON.stringify({ [DataVar]: DataValue }));
  });
}

function updateRPMAndValue(RPMValue, RPMNoise, varRPM) {
  // RPMValue = valor del slider/botones (valor base)
  // varRPM = RPMValue + ruido si RPMNoise está activo, RPMValue si está apagado
  // La aguja muestra varRPM, el drum-counter muestra horas de funcionamiento (se actualiza por separado)
  
  // Actualizar el valor numérico en el centro del instrumento con el valor del slider
  document.getElementById("rpm-value").textContent = Math.round(RPMValue);
  
  // Calcular el ángulo de la aguja en función de varRPM (solo el ruido)
  // 0 rpm = 225°, 3000 rpm = 495° (225° + 270°), recorre 270° antihorario
  let angle = 225 + (Math.max(0, Math.min(varRPM, 3000)) * 270) / 3000;
  document.getElementById("rpm-needle").style.transform =
    `translate(-50%, -50%) rotate(${angle}deg)`;
  
  // Actualizar el valor del slider si cambia
  const RPMSlider = document.getElementById("rpm-slider");
  if (RPMSlider && Math.abs(RPMSlider.value - RPMValue) > 1) {
    RPMSlider.value = RPMValue;
  }

  // Cambiar el color del boton Noice y crystal según el estado
  const noiceBtnRPM = document.getElementById('noice-btn-rpm');
  const rpmCrystal = document.getElementById('rpm-crystal');
  const noiceActive = (RPMNoise === true || RPMNoise === 1);
  if (noiceActive) {
    noiceBtnRPM.style.background = '#0f0';
    if (rpmCrystal) rpmCrystal.style.background = 'rgba(74, 252, 74, 0.08)';
  } else {
    noiceBtnRPM.style.background = '#444';
    if (rpmCrystal) rpmCrystal.style.background = '';
  }

  // Actualizar audio de motor según zona de RPM
  if (typeof window['updateRPMEngineAudio'] === 'function') {
    window['updateRPMEngineAudio'](RPMValue);
  }
  
}

// =============================================================
// Sistema de audio de motor con Web Audio API
//   SILENT : RPM = 0       → sin audio
//   IDLE   : RPM  1 – 550  → Ralenti8s.wav en loop (rate fijo 1.0)
//   RUN    : RPM 551 – 2700 → RPM1000.wav en loop, rate = RPM/1000
//            Cambios de pitch suavizados con setTargetAtTime (τ=0.05s)
// =============================================================
(function initRPMAudio() {
  const BASE = 'https://claudio-arz.github.io/AeroDeck-HTML/Audio/';

  let audioCtx    = null;
  let buffers     = {};     // cache de AudioBuffers decodificados
  let source      = null;   // AudioBufferSourceNode activo
  let currentFile = '';
  let currentZone = 0;      // 0=SILENT  1=IDLE  2=RUN

  function getCtx() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
  }

  async function loadBuffer(file) {
    if (buffers[file]) return buffers[file];
    const ctx = getCtx();
    const res = await fetch(BASE + file);
    const ab  = await res.arrayBuffer();
    buffers[file] = await ctx.decodeAudioData(ab);
    return buffers[file];
  }

  function stopSource() {
    if (source) {
      try { source.stop(); } catch(e) {}
      source.disconnect();
      source      = null;
      currentFile = '';
    }
  }

  async function playFile(file, rate) {
    const ctx = getCtx();
    if (ctx.state === 'suspended') await ctx.resume();

    const buf = await loadBuffer(file);

    // Mismo archivo ya sonando → solo suavizar el rate
    if (currentFile === file && source) {
      source.playbackRate.setTargetAtTime(rate, ctx.currentTime, 0.05);
      return;
    }

    // Archivo diferente → detener el anterior y arrancar el nuevo
    stopSource();
    const s = ctx.createBufferSource();
    s.buffer             = buf;
    s.loop               = true;
    s.playbackRate.value = rate;
    s.connect(ctx.destination);
    s.start();
    source      = s;
    currentFile = file;
  }

  function getZone(rpm) {
    if (rpm <= 0)   return 0;
    if (rpm <= 550) return 1;
    return 2;
  }

  window['updateRPMEngineAudio'] = function(rpm) {
    if (!window.isSoundEnabled || !window.isSoundEnabled()) {
      stopSource();
      currentZone = 0;
      return;
    }

    const zone = getZone(rpm);

    if (zone === 0) {
      stopSource();
    } else if (zone === 1) {
      playFile('Ralenti8s.wav', 1.0).catch(() => {});
    } else {
      const rate = Math.max(0.2, Math.min(4.0, rpm / 1000));
      playFile('RPM1000.wav', rate).catch(() => {});
    }

    currentZone = zone;
  };
}());

let drumDigits = 5;
let drumCounter = null;

function initDrumCounter() {
  drumCounter = document.getElementById('drum-counter');
  if (!drumCounter) {
    console.warn('No se encontró el elemento drum-counter en el DOM.');
    return;
  }
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
  // Inicializar con el valor por defecto
  setDrumValue(0);
}

function setDrumValue(varRPM) {
  const counter = document.getElementById('drum-counter');
  if (!counter) return;
  let value = String(Math.round(varRPM)).padStart(5, '0');
  [...counter.children].forEach((digit, i) => {
    const strip = digit.querySelector('.drum-strip');
    if (strip) {
      const num = parseInt(value[i]);
      strip.style.transform = `translateY(-${num * 20}px)`;
    }
  });
}

// Función para mostrar horas de funcionamiento en el drum-counter
// horas: 0-999, minutos: 0-59
// Formato: HHH MM (3 dígitos horas, 2 dígitos minutos)
function setDrumHours(horas, minutos) {
  const counter = document.getElementById('drum-counter');
  if (!counter) return;
  
  // Formatear: 3 dígitos para horas + 2 dígitos para minutos
  let horasStr = String(Math.min(999, Math.max(0, horas))).padStart(3, '0');
  let minutosStr = String(Math.min(59, Math.max(0, minutos))).padStart(2, '0');
  let value = horasStr + minutosStr; // "HHHMM"
  
  [...counter.children].forEach((digit, i) => {
    const strip = digit.querySelector('.drum-strip');
    if (strip) {
      const num = parseInt(value[i]);
      strip.style.transform = `translateY(-${num * 20}px)`;
    }
  });
}


// Alterna la visibilidad del cristal roto en el instrumento RPM
function toggleRPMBrokenCrystal() {
  const crystal = document.getElementById('rpm_broken_crystal09');
  if (crystal) {
    crystal.classList.toggle('visible');
  }
}
