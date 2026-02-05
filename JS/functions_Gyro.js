// Bandera para ignorar actualizaciones remotas mientras el usuario interactúa

// functions_Gyro.js - Lógica específica para el instrumento Gyro
// Autor: Claudio Arzamendia Systems
// Fecha: 2026-02-01 15:13:47

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

// Función para actualizar el dial del gyro y el valor numérico
// Parámetros:
//   gyro: número, valor del gyro (0 a 360).
function updateGyroDialAndValue(gyro) {
  let angle = (Math.max(0, Math.min(gyro, 360))) / 360;
  const gyroDial = document.getElementById("gyr-dial");
  if (gyroDial) {
    // Rotar el dial del gyro
    gyroDial.style.transform = `translate(-50%, -50%) rotate(${angle * 360}deg)`;
  }

  const gyroValueDiv = document.getElementById("gyro-value");
  if (gyroValueDiv) gyroValueDiv.textContent = Math.round(gyro);
  const gyroSlider = document.getElementById("gyr-slider");
  const gyroSliderValue = document.getElementById("gyr-slider-value-label");
  if (gyroSliderValue) gyroSliderValue.textContent = Math.round(gyro);
  // Solo actualizar el slider si el usuario NO está interactuando
  if (gyroSlider && !isUserSlidingGyro) {
    if (Math.abs(Number(gyroSlider.value) - gyro) > 1) {
      gyroSlider.value = gyro;
      if (gyroSliderValue) gyroSliderValue.textContent = Math.round(gyro);
    }
  }
  // Tiene que transmitir el valor al backend para sincronizar
  if(ws.readyState === 1) {
    ws.send(JSON.stringify({ setGyroHeading: Math.round(gyro) }));
  }
}


/*
  Configura los controles del Gyro: botón de ajuste rápido y slider del gyro.
  Parámetros:
    ws: WebSocket abierto y listo para enviar mensajes.

*/
function setupGyroControls(ws) {
  const gyroQuickBtns = [

    { id: "gyr-btn-0", value: 0 },
    { id: "gyr-btn-90", value: 90 },
    { id: "gyr-btn-180", value: 180 },
    { id: "gyr-btn-270", value: 270 }
  ];;

  gyroQuickBtns.forEach(btnInfo => {
    const btn = document.getElementById(btnInfo.id);
    if (btn) {
      btn.addEventListener("click", function() {
        animateDialGyro(btnInfo.value);
      });
    }
  });

}

// Función para animar el dial del gyro a un valor específico
// Parámetros:
//   newValue: número, valor objetivo del gyro (0 a 360).
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
    }
    gyroAnimationFrame = requestAnimationFrame(step);
  }
}






// Fin de functions_Gyro.js

