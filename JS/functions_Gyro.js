
/**
* Gyro Instrument Functions
* @fileoverview Lógica específica para el instrumento Gyro
* @author Claudio Arzamendia Systems
* @date 2026-02-20
* 
* Lógica del sistema:
* - Event listeners (slider, botones) → sendGyroToESP32() → envía al ESP32
* - ESP32 recibe y retransmite a todas las terminales
* - mainHTML.cpp recibe vía WebSocket → llama updateGyro() → actualiza vista
*/

// Variables globales para animación
let currentGyro = 0;
let targetGyro = 0;
let gyroAnimationFrame = null;

// Normaliza un angulo a 0-360
function normalizeGyroAngle(angle) {
  let normalized = angle % 360;
  if (normalized < 0) normalized += 360;
  return normalized;
}

// Delta mas corto entre dos angulos (en grados)
function shortestGyroDelta(fromAngle, toAngle) {
  let delta = normalizeGyroAngle(toAngle) - normalizeGyroAngle(fromAngle);
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;
  return delta;
}

/**
* Actualiza la vista del instrumento Gyro (dial, valor numérico, slider)
* Llamada desde mainHTML.cpp cuando se recibe datos del ESP32
* @param {number} gyro - Valor del gyro en grados (0-360)
*/
function updateGyro(gyro) {
  const delta = shortestGyroDelta(currentGyro, gyro);
  targetGyro = currentGyro + delta;
  
  // Animación suave del dial
  if (!gyroAnimationFrame) {
    function step() {
      currentGyro += (targetGyro - currentGyro) * 0.2;
      if (Math.abs(targetGyro - currentGyro) < 0.5) {
        currentGyro = targetGyro;
        gyroAnimationFrame = null;
      } else {
        gyroAnimationFrame = requestAnimationFrame(step);
      }
      updateGyroView(currentGyro);
    }
    gyroAnimationFrame = requestAnimationFrame(step);
  }
}

/**
* Actualiza los elementos visuales del gyro (función interna)
* @param {number} gyro - Valor del gyro en grados
*/
function updateGyroView(gyro) {
  // Actualizar dial
  const gyroDial = document.getElementById("gyr-dial");
  if (gyroDial) {
    const angle = -gyro;
    gyroDial.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
  }
  
  // Actualizar valor numérico en el instrumento
  const gyroValueDiv = document.getElementById("gyr-value");
  if (gyroValueDiv) gyroValueDiv.textContent = Math.round(normalizeGyroAngle(gyro));
  
  // Actualizar slider y su etiqueta
  const gyroSlider = document.getElementById("gyr-slider");
  const gyroSliderValue = document.getElementById("gyr-slider-value-label");
  
  const displayValue = Math.round(normalizeGyroAngle(gyro));
  if (gyroSlider) gyroSlider.value = displayValue;
  if (gyroSliderValue) gyroSliderValue.textContent = displayValue;
}

/**
* Envía valor del gyro al ESP32 vía WebSocket
* @param {number} gyro - Valor del gyro en grados (0-360)
*/
function sendGyroToESP32(gyro) {
  if (window.ws && window.ws.readyState === WebSocket.OPEN) {
    const data = JSON.stringify({ gyroValue: Math.round(gyro) });
    window.ws.send(data);
  }
}

/**
* Configura los event listeners de los controles del Gyro
* Los controles solo envían al ESP32, no actualizan la vista directamente
*/
function setupGyroControls() {
  // Slider
  const gyroSlider = document.getElementById("gyr-slider");
  if (gyroSlider) {
    gyroSlider.addEventListener("input", function() {
      sendGyroToESP32(Number(gyroSlider.value));
    });
  }
  
  // Botones de valores presets (0°, 90°, 180°, 270°)
  const gyroQuickBtns = [
    { id: "gyr-btn-0", value: 0 },
    { id: "gyr-btn-90", value: 90 },
    { id: "gyr-btn-180", value: 180 },
    { id: "gyr-btn-270", value: 270 }
  ];
  gyroQuickBtns.forEach(btnInfo => {
    const btn = document.getElementById(btnInfo.id);
    if (btn) {
      btn.addEventListener("click", function() {
        sendGyroToESP32(btnInfo.value);
      });
    }
  });
  
  // Botones +/- para incrementar/decrementar 1 grado
  const gyrBtnPlus = document.getElementById("gyr-btn-plus");
  const gyrBtnMinus = document.getElementById("gyr-btn-minus");
  
  if (gyrBtnPlus) {
    gyrBtnPlus.addEventListener("click", function() {
      let newValue = normalizeGyroAngle(currentGyro + 1);
      sendGyroToESP32(newValue);
    });
  }
  
  if (gyrBtnMinus) {
    gyrBtnMinus.addEventListener("click", function() {
      let newValue = normalizeGyroAngle(currentGyro - 1);
      sendGyroToESP32(newValue);
    });
  }
}


// Alterna la visibilidad del cristal roto en el instrumento Gyro
function toggleGyroBrokenCrystal() {
  const crystal = document.getElementById('gyro_broken_crystal01');
  if (crystal) {
    crystal.classList.toggle('visible');
  }
}
// Fin de functions_Gyro.js


