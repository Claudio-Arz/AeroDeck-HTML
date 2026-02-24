/*
  Sistema AeroDeck
  Claudio Arzamendia Systems
  Tablero completo con intrumental aeronáutico
  para ajustar instrumentos analógicos.

  2026-02-21 01:52:52
  Este es un reloj que recibe la hora en formato HH:MM:SS desde el ESP32 y actualiza 
  las agujas del reloj en consecuencia.

  Al hacer clic en el instrumento, se alterna la visibilidad de un cristal roto 
  para simular daños en el instrumento.

  Mejoras para el reloj:
  
                +---------------------+
                |  Watch Control      |
                +---------------------+
                |                     |
                |  Clock/Chronograph  |   
                |                     |
                +---------------------+
                |                     |
                |     Start/Stop      |
                |                     |
                +---------------------+
                |                     |
                |          Reset      |
                |                     |
                +---------------------+

                Quisiera un control para el reloj. 
                    Tres botones. 
                        Boton superior va a 
                        mostrar "Cronograph" cuando esté funcionando como Reloj, y va a decir 
                        "Clock" cuando esté funcionando el Chronograph. Cuando se conecta el 
                        chronograph las agujas de hora, minutos, y segundero hace un giro en 
                        sentido horario, hasta llegar a las 12.

                        El botón del medio es el Start/Stop. Cuando se presiona, el reloj
                        comienza a funcionar como un cronómetro, y el botón del medio cambia 
                        a "Stop". Al presionar "Stop", el cronómetro se detiene, y el botón 
                        vuelve a decir "Start". Las agujas de minutos y horas se convierten 
                        en contadores de minutos y horas del cronómetro, mientras que el
                        segundero sigue funcionando en modo cronómetro.

                        El botón inferior es el Reset. Cuando se presiona, el cronómetro se
                        reinicia a cero, y las agujas vuelven a la posición de las 12
                        independientemente de si el cronómetro está en marcha o detenido. 
                        El movimiento de las agujas al resetear el cronómetro deve ser
                        rapido, sin rebotes, y sin animaciones.


                En el programa AeroDeck_001.ino, la función manejoReloj() se encarga de
                todo lo relacionado con el reloj, incluyendo la actualización de la hora
                 y el manejo del cronómetro.
                
                La función manejoReloj() también se encarga de retraer las agujas cuando se
                presiona el botón Clock/Chronograph, y reponer la hora actual con una animación
                suave. Además, maneja el inicio, detención, y reinicio del cronómetro, actualizando las
                agujas en consecuencia.

                La función manejoReloj() va a usar el formato de hora HH:MM:SS para enviar 
                los datos a la función updateReloj() en el frontend, que se encargará de 
                actualizar las agujas del reloj.

*/


// Función para actualizar el reloj con el valor recibido
function updateReloj(horaValue) {
  // Guardar siempre la última hora recibida
  lastClockTime = horaValue;
  
  // Si está en modo cronómetro, ignorar la hora del ESP32
  if (watchMode === 'chronograph') {
    return;
  }
  
  // Actualizar la hora en el instrumento
  applyClockTime(horaValue);
}

// Aplicar una hora específica a las agujas del reloj
function applyClockTime(horaValue) {
  const [horas, minutos, segundos] = horaValue.split(':').map(Number);
  const hora = horas % 12; // Convertir a formato de 12 horas
  const minutosNorm = minutos / 60;
  const segundosNorm = segundos / 60;
  const anguloHoras = (hora + minutosNorm) * 30; // 360 / 12 = 30 grados por hora
  const anguloMinutos = (minutos + segundosNorm) * 6; // 360 / 60 = 6 grados por minuto
  const anguloSegundos = segundos * 6; // 360 / 60 = 6 grados por segundo

  // Rotar las agujas según los ángulos calculados
  const hoursNeedle = document.getElementById("aguja_horas");
  const minutesNeedle = document.getElementById("aguja_minutos");
  const secondsNeedle = document.getElementById("aguja_segundos");
  
  if (hoursNeedle) hoursNeedle.style.transform = `translate(-50%, -50%) rotate(${anguloHoras}deg)`;
  if (minutesNeedle) minutesNeedle.style.transform = `translate(-50%, -50%) rotate(${anguloMinutos}deg)`;
  if (secondsNeedle) secondsNeedle.style.transform = `translate(-50%, -50%) rotate(${anguloSegundos}deg)`;
  
  // Actualizar display si existe
  const display = document.getElementById('watch-display');
  if (display) {
    const h = String(horas).padStart(2, '0');
    const m = String(minutos).padStart(2, '0');
    const s = String(segundos).padStart(2, '0');
    display.textContent = `${h}:${m}:${s}`;
  }
}

// Alterna la visibilidad del cristal roto en el instrumento  Reloj
function toggleRelojBrokenCrystal() {
  const crystal = document.getElementById('reloj_broken_crystal14');
  if (crystal) {
    crystal.classList.toggle('visible');
  }
}

// ===== CONTROL DEL RELOJ/CRONÓMETRO =====

// Variables de estado del cronómetro
let watchMode = 'clock';        // 'clock' o 'chronograph'
let chronoRunning = false;      // Si el cronómetro está corriendo
let chronoSeconds = 0;          // Segundos del cronómetro
let chronoMinutes = 0;          // Minutos del cronómetro
let chronoHours = 0;            // Horas del cronómetro
let lastClockTime = null;       // Última hora del reloj antes de cambiar a cronómetro
let transitionAnimating = false; // Si está animando la transición

// Inicializar controles del reloj
function initRelojControls() {
  const modeBtn = document.getElementById('watch-mode-btn');
  const modeText = document.getElementById('watch-mode-text');
  const startStopBtn = document.getElementById('watch-startstop-btn');
  const startStopText = document.getElementById('watch-startstop-text');
  const resetBtn = document.getElementById('watch-reset-btn');
  const display = document.getElementById('watch-display');
  
  if (!modeBtn || !startStopBtn || !resetBtn) {
    console.warn('No se encontraron los controles del reloj en el DOM');
    return;
  }
  
  // Botón Mode: Clock/Chronograph
  modeBtn.addEventListener('click', () => {
    if (transitionAnimating) return;
    
    if (watchMode === 'clock') {
      // Cambiar a cronómetro - animar agujas a las 12
      watchMode = 'chronograph';
      modeText.textContent = 'Clock';
      modeBtn.classList.add('active');
      
      // Animar agujas a las 12 (posición 0)
      animateNeedlesToTwelve(() => {
        // Una vez en posición, mostrar cronómetro
        updateChronoDisplay();
      });
      
      // Enviar cambio de modo al ESP32
      sendWatchModeToESP32('chronograph');
      
    } else {
      // Cambiar a reloj
      watchMode = 'clock';
      modeText.textContent = 'Chronograph';
      modeBtn.classList.remove('active');
      
      // Detener cronómetro si está corriendo
      if (chronoRunning) {
        chronoRunning = false;
        startStopText.textContent = 'Start';
        startStopBtn.querySelector('.watch-btn-icon').textContent = '▶';
        startStopBtn.classList.remove('running');
      }
      
      // Restaurar la hora del reloj si tenemos la última hora guardada
      if (lastClockTime) {
        applyClockTime(lastClockTime);
      }
      
      // Enviar cambio de modo al ESP32
      sendWatchModeToESP32('clock');
    }
  });
  
  // Botón Start/Stop
  startStopBtn.addEventListener('click', () => {
    if (watchMode !== 'chronograph') {
      // Si está en modo reloj, cambiar primero a cronómetro
      modeBtn.click();
      return;
    }
    
    if (transitionAnimating) return;
    
    if (chronoRunning) {
      // Detener cronómetro
      chronoRunning = false;
      startStopText.textContent = 'Start';
      startStopBtn.querySelector('.watch-btn-icon').textContent = '▶';
      startStopBtn.classList.remove('running');
    } else {
      // Iniciar cronómetro
      chronoRunning = true;
      startStopText.textContent = 'Stop';
      startStopBtn.querySelector('.watch-btn-icon').textContent = '⏸';
      startStopBtn.classList.add('running');
    }
    
    // Enviar estado al ESP32
    sendChronoStateToESP32(chronoRunning);
  });
  
  // Botón Reset
  resetBtn.addEventListener('click', () => {
    if (watchMode !== 'chronograph') return;
    
    // Reiniciar cronómetro
    chronoSeconds = 0;
    chronoMinutes = 0;
    chronoHours = 0;
    
    // Poner agujas en las 12 inmediatamente (sin animación)
    setNeedlesToTwelve();
    updateChronoDisplay();
    
    // Enviar reset al ESP32
    sendChronoResetToESP32();
  });
}

// Animar agujas hacia las 12 en sentido horario
function animateNeedlesToTwelve(callback) {
  transitionAnimating = true;
  
  const hoursNeedle = document.getElementById('aguja_horas');
  const minutesNeedle = document.getElementById('aguja_minutos');
  const secondsNeedle = document.getElementById('aguja_segundos');
  
  if (!hoursNeedle || !minutesNeedle || !secondsNeedle) {
    transitionAnimating = false;
    if (callback) callback();
    return;
  }
  
  // Añadir transición suave
  hoursNeedle.style.transition = 'transform 1s ease-out';
  minutesNeedle.style.transition = 'transform 1s ease-out';
  secondsNeedle.style.transition = 'transform 0.8s ease-out';
  
  // Rotar a 360 grados (completa una vuelta hasta las 12)
  hoursNeedle.style.transform = 'translate(-50%, -50%) rotate(360deg)';
  minutesNeedle.style.transform = 'translate(-50%, -50%) rotate(360deg)';
  secondsNeedle.style.transform = 'translate(-50%, -50%) rotate(360deg)';
  
  // Después de la animación, resetear a 0 grados
  setTimeout(() => {
    hoursNeedle.style.transition = 'none';
    minutesNeedle.style.transition = 'none';
    secondsNeedle.style.transition = 'none';
    
    hoursNeedle.style.transform = 'translate(-50%, -50%) rotate(0deg)';
    minutesNeedle.style.transform = 'translate(-50%, -50%) rotate(0deg)';
    secondsNeedle.style.transform = 'translate(-50%, -50%) rotate(0deg)';
    
    transitionAnimating = false;
    if (callback) callback();
  }, 1000);
}

// Poner agujas en las 12 inmediatamente
function setNeedlesToTwelve() {
  const hoursNeedle = document.getElementById('aguja_horas');
  const minutesNeedle = document.getElementById('aguja_minutos');
  const secondsNeedle = document.getElementById('aguja_segundos');
  
  if (hoursNeedle) {
    hoursNeedle.style.transition = 'none';
    hoursNeedle.style.transform = 'translate(-50%, -50%) rotate(0deg)';
  }
  if (minutesNeedle) {
    minutesNeedle.style.transition = 'none';
    minutesNeedle.style.transform = 'translate(-50%, -50%) rotate(0deg)';
  }
  if (secondsNeedle) {
    secondsNeedle.style.transition = 'none';
    secondsNeedle.style.transform = 'translate(-50%, -50%) rotate(0deg)';
  }
}

// Actualizar el display del cronómetro
function updateChronoDisplay() {
  const display = document.getElementById('watch-display');
  if (display) {
    const h = String(chronoHours).padStart(2, '0');
    const m = String(chronoMinutes).padStart(2, '0');
    const s = String(chronoSeconds).padStart(2, '0');
    display.textContent = `${h}:${m}:${s}`;
  }
}

// Actualizar cronómetro (llamar cada segundo cuando está corriendo)
function tickChrono() {
  if (!chronoRunning || watchMode !== 'chronograph') return;
  
  chronoSeconds++;
  if (chronoSeconds >= 60) {
    chronoSeconds = 0;
    chronoMinutes++;
    if (chronoMinutes >= 60) {
      chronoMinutes = 0;
      chronoHours++;
      if (chronoHours >= 12) {
        chronoHours = 0;
      }
    }
  }
  
  // Actualizar display
  updateChronoDisplay();
  
  // Actualizar agujas
  const anguloSegundos = chronoSeconds * 6;
  const anguloMinutos = chronoMinutes * 6;
  const anguloHoras = chronoHours * 30 + (chronoMinutes / 2);
  
  const hoursNeedle = document.getElementById('aguja_horas');
  const minutesNeedle = document.getElementById('aguja_minutos');
  const secondsNeedle = document.getElementById('aguja_segundos');
  
  if (hoursNeedle) hoursNeedle.style.transform = `translate(-50%, -50%) rotate(${anguloHoras}deg)`;
  if (minutesNeedle) minutesNeedle.style.transform = `translate(-50%, -50%) rotate(${anguloMinutos}deg)`;
  if (secondsNeedle) secondsNeedle.style.transform = `translate(-50%, -50%) rotate(${anguloSegundos}deg)`;
}

// Enviar modo al ESP32
function sendWatchModeToESP32(mode) {
  getWebSocketInstance(function(ws) {
    ws.send(JSON.stringify({ watchMode: mode }));
  });
}

// Enviar estado del cronómetro al ESP32
function sendChronoStateToESP32(running) {
  getWebSocketInstance(function(ws) {
    ws.send(JSON.stringify({ chronoRunning: running }));
  });
}

// Enviar reset del cronómetro al ESP32
function sendChronoResetToESP32() {
  getWebSocketInstance(function(ws) {
    ws.send(JSON.stringify({ chronoReset: true }));
  });
}

// Iniciar el tick del cronómetro (llamar desde el main)
let chronoInterval = null;
function startChronoTicker() {
  if (chronoInterval) clearInterval(chronoInterval);
  chronoInterval = setInterval(tickChrono, 1000);
}

// Detener el tick del cronómetro
function stopChronoTicker() {
  if (chronoInterval) {
    clearInterval(chronoInterval);
    chronoInterval = null;
  }
}
