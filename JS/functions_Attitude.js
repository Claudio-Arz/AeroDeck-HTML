/*

Autor: Claudio Arzamendia Systems
Fecha: 2026-02-15 04:00:08


functions_Attitude.js - Funciones para actualizar el instrumento de actitud (horizonte artificial)
Envia los datos de actitud (pitch, roll) al ESP32 para que los refleje en el horizonte artificial,
y en todas las otras terminales.  

Rangos:
- Roll: -30° a +30°
- Pitch: -20° a +20° (±50px en el joystick)

*/ 

// Variables globales para el joystick
let joystickDragging = false;
let joystickCenterX = 100;
let joystickCenterY = 100;
let joystickRadius = 70; // Radio máximo de movimiento del knob
let zeroActive = false;

function setupAttitudeControls() {
  const knob = document.getElementById('knob');
  const joystick = document.getElementById('joystick');
  const coordsDisplay = document.getElementById('coords');
  const zeroBtn = document.getElementById('atti-zero-btn');
  const armLine = document.getElementById('joystick-arm-line');

  if (!knob || !joystick) {
    console.warn('No se encontró el joystick en el DOM');
    return;
  }

  // Centrar el knob inicialmente
  updateKnobPosition(joystickCenterX, joystickCenterY);

  // Botón Zero
  if (zeroBtn) {
    zeroBtn.addEventListener('click', () => {
      zeroActive = !zeroActive;
      zeroBtn.textContent = zeroActive ? 'Zero: ON' : 'Zero: OFF';
      zeroBtn.style.background = zeroActive ? '#0f0' : '#444';
      
      if (zeroActive) {
        // Resetear a cero
        updateKnobPosition(joystickCenterX, joystickCenterY);
        sendAttitudeToESP32("pitchValue", 0);
        sendAttitudeToESP32("rollValue", 0);
        if (coordsDisplay) coordsDisplay.textContent = 'roll: 0°, pitch: 0°';
      }
    });
  }

  // Eventos del joystick
  knob.addEventListener('mousedown', startDrag);
  knob.addEventListener('touchstart', startDrag, { passive: false });
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('touchmove', onDrag, { passive: false });
  document.addEventListener('mouseup', endDrag);
  document.addEventListener('touchend', endDrag);

  function startDrag(e) {
    if (zeroActive) return; // No mover si Zero está activo
    joystickDragging = true;
    knob.style.cursor = 'grabbing';
    e.preventDefault();
  }

  function onDrag(e) {
    if (!joystickDragging || zeroActive) return;
    e.preventDefault();

    const rect = joystick.getBoundingClientRect();
    let clientX, clientY;
    
    if (e.touches) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    // Posición relativa al centro del joystick
    let x = clientX - rect.left - joystickCenterX;
    let y = clientY - rect.top - joystickCenterY;

    // Limitar al radio máximo
    const dist = Math.sqrt(x * x + y * y);
    if (dist > joystickRadius) {
      x = (x / dist) * joystickRadius;
      y = (y / dist) * joystickRadius;
    }

    // Actualizar posición visual
    updateKnobPosition(joystickCenterX + x, joystickCenterY + y);

    // Calcular ángulos
    // Roll: x → -30° a +30° (joystickRadius = ±30°)
    // Pitch: y → -20° a +20° (50px = 20°, entonces joystickRadius(70) limitamos a ±50)
    const rollDeg = (x / joystickRadius) * 30;
    const pitchPx = Math.max(-50, Math.min(50, y));
    const pitchDeg = (pitchPx / 50) * 20;

    // Enviar al ESP32
    sendAttitudeToESP32("pitchValue", pitchDeg);
    sendAttitudeToESP32("rollValue", rollDeg);

    // Mostrar coordenadas
    if (coordsDisplay) {
      coordsDisplay.textContent = `roll: ${rollDeg.toFixed(1)}°, pitch: ${pitchDeg.toFixed(1)}°`;
    }
  }

  function endDrag() {
    if (joystickDragging) {
      joystickDragging = false;
      knob.style.cursor = 'grab';
    }
  }

  function updateKnobPosition(x, y) {
    if (knob) {
      knob.style.left = (x - 15) + 'px'; // -15 para centrar el knob de 30px
      knob.style.top = (y - 15) + 'px';
    }
    if (armLine) {
      armLine.setAttribute('x2', x);
      armLine.setAttribute('y2', y);
    }
  }
}

function sendAttitudeToESP32(DataVar, DataValue) {
  getWebSocketInstance(function(ws) {
    console.log('Enviando actitud al ESP32:', DataVar, DataValue);
    ws.send(JSON.stringify({ [DataVar]: DataValue }));
  });
}   

function updateAttitudeControl(pitchValue, rollValue) {
  // Actualizar el instrumento visualmente
  const ball = document.getElementById('AttCon_ball');
  const dial = document.getElementById('AttCon_dial');
  
  if (ball) {
    // Pitch: mover verticalmente (±50px para ±20°)
    const pitchPx = (pitchValue / 20) * 50;
    // Roll: rotar el dial
    ball.style.transform = `translateY(${pitchPx}px)`;
  }
  
  if (dial) {
    // Roll: rotar (±30°)
    dial.style.transform = `rotate(${rollValue}deg)`;
  }

  // Actualizar display de coordenadas si existe
  const coordsDisplay = document.getElementById('coords');
  if (coordsDisplay) {
    coordsDisplay.textContent = `roll: ${rollValue.toFixed(1)}°, pitch: ${pitchValue.toFixed(1)}°`;
  }
}

function initializeAttitudeControls() {
  setupAttitudeControls();}

// Alias para compatibilidad con mainHTML.cpp
function initAttitudeControls() {
  setupAttitudeControls();
}