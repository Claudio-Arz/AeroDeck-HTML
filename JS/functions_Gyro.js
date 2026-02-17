
// functions_Gyro.js - Lógica específica para el instrumento Gyro
// Autor: Claudio Arzamendia Systems
// Fecha: 2026-02-01 15:13:47

// Variables globales
let currentGyro = 0;
let targetGyro = 0;
let gyroAnimationFrame = null;


// Animación del dial
function animateDialGyro(newValue) {
  targetGyro = newValue;
  if (!gyroAnimationFrame) {
    function step() {
      currentGyro += (targetGyro - currentGyro) * 0.2; // 0.2
      if (Math.abs(targetGyro - currentGyro) < 0.5) {
        currentGyro = targetGyro;
        gyroAnimationFrame = null;
      } else {
        gyroAnimationFrame = requestAnimationFrame(step);
      }
      updateGyroDialAndValue(currentGyro);
    }
    gyroAnimationFrame = requestAnimationFrame(step);
  }
}

// Actualiza el dial y el valor numérico
function updateGyroDialAndValue(gyro) {
  let angle = -(Math.max(0, Math.min(gyro, 360))) / 360;
  const gyroDial = document.getElementById("gyr-dial");

  gyroDial.style.transform = `translate(-50%, -50%) rotate(${angle * 360}deg)`;

  const gyroValueDiv = document.getElementById("gyr-value");
  if (gyroValueDiv) gyroValueDiv.textContent = Math.round(gyro);
  const gyroSlider = document.getElementById("gyr-slider");
  const gyroSliderValue = document.getElementById("gyr-slider-value-label");
  if (gyroSliderValue) gyroSliderValue.textContent = Math.round(gyro);
  if (gyroSlider && !isUserSlidingGyro) {
    if (Math.abs(Number(gyroSlider.value) - gyro) > 1) {
      gyroSlider.value = gyro;
      if (gyroSliderValue) gyroSliderValue.textContent = Math.round(gyro);
    }
  }
  if(ws && ws.readyState === 1) {
    ws.send(JSON.stringify({ setGyroHeading: Math.round(gyro) }));
  }
}

// Configura los controles del Gyro
function setupGyroControls(ws) {
  
  const gyroSlider = document.getElementById("gyr-slider");
  if (gyroSlider) {
    gyroSlider.addEventListener("input", function() {
      isUserSlidingGyro = true;
      animateDialGyro(Number(gyroSlider.value));
    });
  }
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
        animateDialGyro(btnInfo.value);
      });
    }
  });
  
  // Botones +/- para sumar o restar 1 grado
  const gyrBtnPlus = document.getElementById("gyr-btn-plus");
  const gyrBtnMinus = document.getElementById("gyr-btn-minus");
  
  if (gyrBtnPlus) {
    gyrBtnPlus.addEventListener("click", function() {
      let newValue = (currentGyro + 1) % 360;
      if (newValue < 0) newValue += 360;
      animateDialGyro(newValue);
    });
  }
  
  if (gyrBtnMinus) {
    gyrBtnMinus.addEventListener("click", function() {
      let newValue = (currentGyro - 1) % 360;
      if (newValue < 0) newValue += 360;
      animateDialGyro(newValue);
    });
  }
  
}


function sendGyroToESP32(gyroValue) {
  // Enviar el valor del gyro al ESP32 vía WebSocket
  if (window.ws && window.ws.readyState === WebSocket.OPEN) {
    const data = JSON.stringify({ gyroValue: gyroValue });
    window.ws.send(data);
    console.log(`Enviando valor del gyro al ESP32: ${gyroValue}°`);
  } else {
    console.warn('WebSocket no está conectado.');
  }
}
// Fin de functions_Gyro.js


