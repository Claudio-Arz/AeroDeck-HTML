// Variables globales para los elementos del instrumento
let fondoImg, ballImg, dialImg;
// functions_Attitude.js
/*
Lógica simple y modular para Attitude Indicator.
Cada función debe tener una buena documentación. Indicando en comienzo de la 
función qué hace, y en los parámetros qué espera y qué devuelve,
o que ejecuta.
*/


// ws será asignada desde updateAttitudeControl, no se redeclara aquí si ya existe
function updateAttitudeControl() {

  fondoImg = document.getElementById('AttCon_fondo');
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
    const offsetX = 4; // px a la derecha
    const offsetY = 4; // px abajo
    knob.style.left = `${x + size/2 + offsetX}px`;
    knob.style.top = `${y + size/2 + offsetY}px`;
    // Mapear x a roll (-30 a 30)
    const roll = Math.round((x / radius) * 30 * 10) / 10;
    // Mapear y a pitch (-50 a 50)
    const pitchRaw = Math.round((y / radius) * 50 * 10) / 10;
    const pitchDeg = Math.round((pitchRaw * 0.4) * 10) / 10;
    coords.textContent = `roll: ${roll}°, pitch: ${pitchDeg}°`;
    if (fondoImg) fondoImg.style.transform = `rotate(${roll}deg)`;
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
    const start = {x: knobPos.x, y: knobPos.y};
    const duration = 4000;
    const startTime = performance.now();
    function animate(now) {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - t, 2);
      const x = Math.round(start.x * (1 - ease));
      const y = Math.round(start.y * (1 - ease));
      setKnob(x, y);
      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        setKnob(0, 0);
      }
    }
    requestAnimationFrame(animate);
  }
  function onEnd() {
    dragging = false;
    animateToCenter();
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
    if (fondoImg) fondoImg.style.transform = `rotate(${roll}deg)`;
    if (ballImg) ballImg.style.transform = `rotate(${roll}deg) translateY(${pitch * 2.5}px)`;
    if (dialImg) dialImg.style.transform = `rotate(${roll}deg)`;
    if (coords) coords.textContent = `roll: ${roll}°, pitch: ${pitch}°`;
  }

  // Inicializar en el centro
  setKnob(0, 0);
}
