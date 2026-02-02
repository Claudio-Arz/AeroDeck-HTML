// Variables globales para los elementos del instrumento y control
let ballImg, dialImg;
let attiZeroActive = false;
let container, knob, coords;
let size = 200;
let knobSize = 30;
let radius = (size - knobSize) / 2;
let dragging = false;
let knobPos = {x: 0, y: 0};
// functions_Attitude.js
/*
Lógica simple y modular para Attitude Indicator.
Cada función debe tener una buena documentación. Indicando en comienzo de la 
función qué hace, y en los parámetros qué espera y qué devuelve,
o que ejecuta.
*/


// ws será asignada desde updateAttitudeControl, no se redeclara aquí si ya existe
function updateAttitudeControl() {

  const attiZeroBtn = document.getElementById("atti-zero-btn");
  if (attiZeroBtn) {
    attiZeroBtn.addEventListener("click", function() {
      attiZeroActive = true;
      attiZeroBtn.textContent = "Zero: ON";
      // Centrar el joystick y luego desactivar Zero automáticamente
      animateToCenter(function() {
        attiZeroActive = false;
        attiZeroBtn.textContent = "Zero: OFF";
        // Enviar por WebSocket el estado actualizado
        if (typeof ws !== 'undefined' && ws && ws.readyState === 1) {
          ws.send(JSON.stringify({ atti_zero: false }));
        }
      });
      // Enviar por WebSocket el estado para sincronizar con otros clientes (ON)
      if (typeof ws !== 'undefined' && ws && ws.readyState === 1) {
        ws.send(JSON.stringify({ atti_zero: true }));
      }
    });
  }

  ballImg = document.getElementById('AttCon_ball');
  dialImg = document.getElementById('AttCon_dial');

  // Joystick: buscar elementos y asignar eventos SOLO cuando existen
  container = document.getElementById('joystick');
  knob = document.getElementById('knob');
  coords = document.getElementById('coords');
  // size, knobSize, radius, dragging, knobPos ya están globales

  function setKnob(x, y) {
    knobPos.x = x;
    knobPos.y = y;
    if (!knob) return;
    // Offset visual para centrar el knob
    const offsetX = -9; // px a la derecha
    const offsetY = -9; // px abajo
    knob.style.left = `${x + size/2 + offsetX}px`;
    knob.style.top = `${y + size/2 + offsetY}px`;
    // Mapear x a roll (-30 a 30)
    const roll = Math.round((x / radius) * 30 * 10) / 10;
    // Mapear y a pitch (-50 a 50)
    const pitchRaw = Math.round((y / radius) * 50 * 10) / 10;
    const pitchDeg = Math.round((pitchRaw * 0.4) * 10) / 10;
    if (coords) coords.textContent = `roll: ${roll.toFixed(1)}°, pitch: ${pitchDeg.toFixed(1)}°`;
    if (ballImg) ballImg.style.transform = `rotate(${roll}deg) translateY(${pitchDeg * 2.5}px)`;
    if (dialImg) dialImg.style.transform = `rotate(${roll}deg)`;
    if (typeof ws !== 'undefined' && ws && ws.readyState === 1) {
      ws.send(JSON.stringify({ roll: roll, pitch: pitchDeg }));
    }
  }

  function getRelativeCoords(e) {
    const rect = container.getBoundingClientRect();
    let clientX = e.touches ? e.touches[0].clientX : e.clientX;
    let clientY = e.touches ? e.touches[0].clientY : e.clientY;
    let x = clientX - rect.left - size/2;
    let y = clientY - rect.top - size/2;
    const dist = Math.sqrt(x*x + y*y);
    if (dist > radius) {
      x = x * radius / dist;
      y = y * radius / dist;
    }
    return {x: Math.round(x), y: Math.round(y)};
  }

  function onMove(e) {
    if (!dragging) return;
    e.preventDefault();
    const {x, y} = getRelativeCoords(e);
    setKnob(x, y);
  }

  function animateToCenter(callback) {
    // El knob solo vuelve al centro cuando se suelta Y attiZeroActive está en ON
    if (!attiZeroActive) {
      if (typeof callback === 'function') callback();
      return;
    }
    function loop() {
      // Si ya está en el centro, no hacer nada
      if (Math.abs(knobPos.x) < 1 && Math.abs(knobPos.y) < 1) {
        setKnob(0, 0);
        if (typeof callback === 'function') callback();
      } else {
        // Animar suavemente hacia el centro
        knobPos.x *= 0.85;
        knobPos.y *= 0.85;
        setKnob(knobPos.x, knobPos.y);
        requestAnimationFrame(loop);
      }
    }
    loop();
  }

  function onEnd() {
    dragging = false;
    if (attiZeroActive) {
      animateToCenter();
    }
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onEnd);
    document.removeEventListener('touchmove', onMove);
    document.removeEventListener('touchend', onEnd);
  }

  if (knob) {
    knob.addEventListener('mousedown', function(e) {
      dragging = true;
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onEnd);
    });
    knob.addEventListener('touchstart', function(e) {
      dragging = true;
      document.addEventListener('touchmove', onMove, {passive: false});
      document.addEventListener('touchend', onEnd);
    });
  }

  // Exponer función global para actualizar el instrumento desde mainHTML.cpp
  window.updateAttitudeInstrument = function(roll, pitch, isDragging) {
    if (dragging && isDragging !== true) return; // Solo actualizar si no se está arrastrando, o si se fuerza
    if (ballImg) ballImg.style.transform = `rotate(${roll}deg) translateY(${pitch * 2.5}px)`;
    if (dialImg) dialImg.style.transform = `rotate(${roll}deg)`;
    if (coords) coords.textContent = `roll: ${Number(roll).toFixed(1)}°, pitch: ${Number(pitch).toFixed(1)}°`;
  }

  // Inicializar en el centro
  setKnob(0, 0);
}

// Inicializar automáticamente el instrumento al cargar la librería
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', updateAttitudeControl);
} else {
  updateAttitudeControl();
}

