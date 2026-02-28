/*
  functions_EGT.js
  Control e instrumento EGT con bug/marcador móvil de referencia.
*/

const EGT_MIN = 800;
const EGT_MAX = 1600;
const EGT_DEFAULT = 800;
const EGT_BUG_DEFAULT = 1450;
const EGT_ANGLE_MIN = 270;
const EGT_ANGLE_MAX = 90;

let currentEGTValue = EGT_DEFAULT;
let currentEGTBugValue = EGT_BUG_DEFAULT;

function initEGTControls() {
  const slider = document.getElementById('egt-slider');
  const btnMax = document.getElementById('egt-slider-max');
  const btnMid = document.getElementById('egt-slider-mid');
  const btnMin = document.getElementById('egt-slider-min');
  const btnPlus = document.getElementById('egt-btn-plus');
  const btnMinus = document.getElementById('egt-btn-minus');
  const simToggle = document.getElementById('egt-sim-toggle');

  const bugSlider = document.getElementById('egt-bug-slider');
  const setPeakBtn = document.getElementById('egt-bug-set-peak');
  const resetBugBtn = document.getElementById('egt-bug-reset');

  if (slider) {
    slider.addEventListener('input', () => {
      updateEGT(parseFloat(slider.value), true);
    });
  }

  if (btnMax) {
    btnMax.addEventListener('click', () => updateEGT(EGT_MAX, true));
  }

  if (btnMid) {
    btnMid.addEventListener('click', () => updateEGT(1200, true));
  }

  if (btnMin) {
    btnMin.addEventListener('click', () => updateEGT(EGT_MIN, true));
  }

  if (btnPlus) {
    btnPlus.addEventListener('click', () => updateEGT(currentEGTValue + 10, true));
  }

  if (btnMinus) {
    btnMinus.addEventListener('click', () => updateEGT(currentEGTValue - 10, true));
  }

  if (simToggle) {
    simToggle.addEventListener('click', () => {
      const isSimulated = simToggle.classList.contains('active');
      updateEGTSimModeState(!isSimulated, true);
    });
  }

  if (bugSlider) {
    bugSlider.addEventListener('input', () => {
      updateEGTBug(parseFloat(bugSlider.value), true);
    });
  }

  if (setPeakBtn) {
    setPeakBtn.addEventListener('click', () => {
      updateEGTBug(currentEGTValue, true);
    });
  }

  if (resetBugBtn) {
    resetBugBtn.addEventListener('click', () => {
      updateEGTBug(EGT_BUG_DEFAULT, true);
    });
  }

  updateEGT(currentEGTValue, false);
  updateEGTBug(currentEGTBugValue, false);
}

function updateEGT(egt, sendToESP = false) {
  const slider = document.getElementById('egt-slider');
  const valueLabel = document.getElementById('egt-value');
  const sliderLabel = document.getElementById('egt-slider-value-label');
  const needle = document.getElementById('egt_needle');

  if (egt === undefined || Number.isNaN(egt)) {
    egt = currentEGTValue;
  }

  const clamped = clampEGT(egt);
  currentEGTValue = clamped;

  if (!sendToESP && slider) {
    slider.value = clamped;
  }

  if (sliderLabel) {
    sliderLabel.textContent = clamped.toFixed(0);
  }

  if (valueLabel) {
    valueLabel.textContent = clamped.toFixed(0);
  }

  if (needle) {
    const angle = egtToAngle(clamped);
    needle.style.transform = `rotate(${angle}deg)`;
  }

  if (sendToESP) {
    sendEGTToESP32(clamped);
  }
}

function updateEGTBug(egtBug, sendToESP = false) {
  const bug = document.getElementById('egt_bug');
  const bugSlider = document.getElementById('egt-bug-slider');
  const bugLabel = document.getElementById('egt-bug-value-label');

  if (egtBug === undefined || Number.isNaN(egtBug)) {
    egtBug = currentEGTBugValue;
  }

  const clamped = clampEGT(egtBug);
  currentEGTBugValue = clamped;

  if (!sendToESP && bugSlider) {
    bugSlider.value = clamped;
  }

  if (bugLabel) {
    bugLabel.textContent = clamped.toFixed(0);
  }

  if (bug) {
    const angle = egtToAngle(clamped);
    bug.style.transform = `rotate(${angle}deg)`;
  }

  if (sendToESP) {
    sendEGTBugToESP32(clamped);
  }
}

function updateEGTSimModeState(simulated, sendToESP = false) {
  const simToggle = document.getElementById('egt-sim-toggle');
  if (!simToggle) {
    return;
  }

  const isSimulated = !!simulated;
  simToggle.classList.toggle('active', isSimulated);
  simToggle.textContent = isSimulated ? 'SIM' : 'MAN';
  simToggle.title = isSimulated ? 'EGT Simulado activo' : 'EGT Manual activo';

  if (sendToESP) {
    sendEGTSimModeToESP32(isSimulated);
  }
}

function sendEGTToESP32(egt) {
  if (window.ws && window.ws.readyState === WebSocket.OPEN) {
    window.ws.send(JSON.stringify({ egtValue: egt }));
  }
}

function sendEGTBugToESP32(egtBug) {
  if (window.ws && window.ws.readyState === WebSocket.OPEN) {
    window.ws.send(JSON.stringify({ egtBugValue: egtBug }));
  }
}

function sendEGTSimModeToESP32(simulated) {
  if (window.ws && window.ws.readyState === WebSocket.OPEN) {
    window.ws.send(JSON.stringify({ useSimulatedEGT: simulated }));
  }
}

function egtToAngle(egt) {
  const clamped = clampEGT(egt);
  return EGT_ANGLE_MIN - ((clamped - EGT_MIN) * (EGT_ANGLE_MIN - EGT_ANGLE_MAX)) / (EGT_MAX - EGT_MIN);
}

function clampEGT(value) {
  if (value < EGT_MIN) return EGT_MIN;
  if (value > EGT_MAX) return EGT_MAX;
  return value;
}

function toggleEGTBrokenCrystal() {
  const crystal = document.getElementById('egt_broken_crystal07');
  if (crystal) {
    crystal.classList.toggle('visible');
  }
}
