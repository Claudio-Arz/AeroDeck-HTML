// Variables globales para los elementos del instrumento
let ballImg, dialImg;
let attiZeroActive = false;
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
      attiZeroActive = !attiZeroActive;
      attiZeroBtn.textContent = attiZeroActive ? "Zero: ON" : "Zero: OFF";
      if (attiZeroActive) {
        animateToCenter();
      }
      // Enviar por WebSocket el estado para sincronizar con otros clientes
      if (typeof ws !== 'undefined' && ws && ws.readyState === 1) {
        ws.send(JSON.stringify({ atti_zero: attiZeroActive }));
      }
    });
  }

  ballImg = document.getElementById('AttCon_ball');
  dialImg = document.getElementById('AttCon_dial');

  // Joystick: buscar elementos y asignar eventos SOLO cuando existen
  const container = document.getElementById('joystick');
  const knob = document.getElementById('knob');
  const coords = document.getElementById('coords');

  const size = 200;
  const knobSize = 30;
  const radius = (size - knobSize) / 2;
  let dragging = false;
  let knobPos = {x: 0, y: 0};

  function setKnob(x, y) {
    knobPos.x = x;
    knobPos.y = y;
    // Offset visual para centrar el knob
    const offsetX = 0; // px a la derecha
    const offsetY = 0; // px abajo
    knob.style.left = `${x + size/2 + offsetX}px`;
    knob.style.top = `${y + size/2 + offsetY}px`;
    // Actualizar el brazo SVG
    const armLine = document.getElementById('joystick-arm-line');
    if (armLine) {
      armLine.setAttribute('x2', (x + size/2).toString());
      armLine.setAttribute('y2', (y + size/2).toString());
    }
    // Mapear x a roll (-30 a 30)
    const roll = Math.round((x / radius) * 30 * 10) / 10;
    // Mapear y a pitch (-50 a 50)
    const pitchRaw = Math.round((y / radius) * 50 * 10) / 10;
    const pitchDeg = Math.round((pitchRaw * 0.4) * 10) / 10;
    coords.textContent = `roll: ${roll.toFixed(1)}°, pitch: ${pitchDeg.toFixed(1)}°`;
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

  function animateToCenter() {
    // El knob solo vuelve al centro cuando se suelta Y attiZeroActive está en ON
    if (!attiZeroActive) return;
    function loop() {
      // Si ya está en el centro, no hacer nada
      if (Math.abs(knobPos.x) < 1 && Math.abs(knobPos.y) < 1) {
        setKnob(0, 0);
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
