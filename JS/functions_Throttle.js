/*
  functions_Throttle.js
  Control de Throttle para simulación Cessna 172 (hélice fija)
*/

function sendThrottleToESP32(value) {
  if (window.ws && window.ws.readyState === WebSocket.OPEN) {
    window.ws.send(JSON.stringify({ throttleValue: value }));
  }
}

function updateThrottleControl(value, sendToESP = false) {
  const throttleSlider = document.getElementById('throttle-slider');
  const throttleValueLabel = document.getElementById('throttle-slider-value');
  const clamped = Math.max(0, Math.min(100, Math.round(parseFloat(value) || 0)));

  if (throttleSlider) throttleSlider.value = clamped;
  if (throttleValueLabel) throttleValueLabel.textContent = clamped + '%';

  if (sendToESP) {
    sendThrottleToESP32(clamped);
  }
}

function initThrottleControls() {
  const throttleSlider = document.getElementById('throttle-slider');
  const throttleBtnMax = document.getElementById('throttle-btn-max');
  const throttleBtnMid = document.getElementById('throttle-btn-mid');
  const throttleBtnMin = document.getElementById('throttle-btn-min');

  if (!throttleSlider) {
    return;
  }

  if (throttleSlider.dataset.initialized === 'true') {
    return;
  }
  throttleSlider.dataset.initialized = 'true';

  throttleSlider.addEventListener('input', () => {
    updateThrottleControl(throttleSlider.value, true);
  });

  if (throttleBtnMax) {
    throttleBtnMax.addEventListener('click', () => updateThrottleControl(100, true));
  }
  if (throttleBtnMid) {
    throttleBtnMid.addEventListener('click', () => updateThrottleControl(65, true));
  }
  if (throttleBtnMin) {
    throttleBtnMin.addEventListener('click', () => updateThrottleControl(0, true));
  }

  updateThrottleControl(throttleSlider.value, false);
}
