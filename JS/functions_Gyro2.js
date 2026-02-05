// functions_Gyro2.js - Adaptado para integración con gyro_full.html y grilla experimental
// Basado en functions_Gyro.js

let isUserSlidingGyro = false;
let currentGyro = 0;
let targetGyro = 0;
let gyroAnimationFrame = null;

function animateDialGyro(newValue) {
  targetGyro = newValue;
  if (!gyroAnimationFrame) {
    function step() {
      currentGyro += (targetGyro - currentGyro) * 0.2;
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

function updateGyroDialAndValue(gyro) {
  let angle = (Math.max(0, Math.min(gyro, 360))) / 360;
  const gyroDial = document.getElementById("gyr-dial");
  if (gyroDial) {
    gyroDial.style.transform = `translate(-50%, -50%) rotate(${angle * 360}deg)`;
  }
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

function setupGyroControls(ws) {
  const gyroSlider = document.getElementById("gyr-slider");
  if (gyroSlider) {
    gyroSlider.addEventListener("input", function() {
      isUserSlidingGyro = true;
      animateDialGyro(Number(gyroSlider.value));
    });
    gyroSlider.addEventListener("change", function() {
      isUserSlidingGyro = false;
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
}

// Fin de functions_Gyro2.js
