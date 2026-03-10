/*
  functions_EGT.js
  Control e instrumento EGT con bug/marcador móvil de referencia.
*/

const EGT_MIN = 800;
const EGT_MAX = 1600;
const EGT_DEFAULT = 800;
const EGT_MIXTURE_MIN_PERCENT = 0;
const EGT_MIXTURE_MAX_PERCENT = 100;
const EGT_MIXTURE_DEFAULT_PERCENT = 45;
const EGT_BUG_DEFAULT = 1450;
const EGT_ANGLE_MIN = 270;
const EGT_ANGLE_MAX = 90;
const EGT_BUG_REFERENCE_VALUE = 1450;
const EGT_BUG_ANGLE_OFFSET = 0;

let currentEGTValue = EGT_DEFAULT;
let currentEGTBugValue = EGT_BUG_DEFAULT;
let currentEGTMixturePercent = EGT_MIXTURE_DEFAULT_PERCENT;

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
      updateEGTMixture(parseFloat(slider.value), true);
    });
  }

  if (btnMax) {
    btnMax.addEventListener('click', () => updateEGTMixture(EGT_MIXTURE_MAX_PERCENT, true));
  }

  if (btnMid) {
    btnMid.addEventListener('click', () => updateEGTMixture(EGT_MIXTURE_DEFAULT_PERCENT, true));
  }

  if (btnMin) {
    btnMin.addEventListener('click', () => updateEGTMixture(EGT_MIXTURE_MIN_PERCENT, true));
  }

  if (btnPlus) {
    btnPlus.addEventListener('click', () => updateEGTMixture(currentEGTMixturePercent + 1, true));
  }

  if (btnMinus) {
    btnMinus.addEventListener('click', () => updateEGTMixture(currentEGTMixturePercent - 1, true));
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
  updateEGTMixture(currentEGTMixturePercent, false);
}

function updateEGTMixture(mixturePercent, sendToESP = false) {
  const slider = document.getElementById('egt-slider');
  const sliderLabel = document.getElementById('egt-slider-value-label');

  if (mixturePercent === undefined || Number.isNaN(mixturePercent)) {
    mixturePercent = currentEGTMixturePercent;
  }

  const clampedPercent = clampEGTMixturePercent(mixturePercent);
  currentEGTMixturePercent = clampedPercent;

  if (!sendToESP && slider) {
    slider.value = clampedPercent;
  }

  if (sliderLabel) {
    sliderLabel.textContent = `${clampedPercent.toFixed(0)}%`;
  }

  if (sendToESP) {
    sendEGTMixtureToESP32(clampedPercent / 100.0);
  }
}

function updateEGT(egt, sendToESP = false) {
  const valueLabel = document.getElementById('egt-value');
  const needle = document.getElementById('egt_needle');

  if (egt === undefined || Number.isNaN(egt)) {
    egt = currentEGTValue;
  }

  const clamped = clampEGT(egt);
  currentEGTValue = clamped;

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
    const angle = egtBugToAngle(clamped);
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

function sendEGTMixtureToESP32(mixtureNormalized) {
  if (window.ws && window.ws.readyState === WebSocket.OPEN) {
    window.ws.send(JSON.stringify({ mixtureValue: mixtureNormalized }));
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
  return EGT_ANGLE_MIN + ((clamped - EGT_MIN) * (EGT_ANGLE_MIN - EGT_ANGLE_MAX)) / (EGT_MAX - EGT_MIN);
}

function egtBugToAngle(egtBug) {
  return egtToAngle(egtBug);
}

function clampEGT(value) {
  if (value < EGT_MIN) return EGT_MIN;
  if (value > EGT_MAX) return EGT_MAX;
  return value;
}

function clampEGTMixturePercent(value) {
  if (value < EGT_MIXTURE_MIN_PERCENT) return EGT_MIXTURE_MIN_PERCENT;
  if (value > EGT_MIXTURE_MAX_PERCENT) return EGT_MIXTURE_MAX_PERCENT;
  return value;
}

function toggleEGTBrokenCrystal() {
  const crystal = document.getElementById('egt_broken_crystal06');
  if (crystal) {
    crystal.classList.toggle('visible');
  }
}
