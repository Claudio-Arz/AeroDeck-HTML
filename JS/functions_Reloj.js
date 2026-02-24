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
  // Guardar la última hora recibida para la animación de transición
  const [horas, minutos, segundos] = horaValue.split(':').map(Number);
  lastReceivedHour = { horas, minutos, segundos };
  
  // Si está en modo cronómetro o animando transición, ignorar la actualización visual
  if (watchMode === 'chronograph' || transitionAnimating) {
    return;
  }
  
  // Aplicar offset de zona horaria si hay una seleccionada
  let adjustedHours = horas + timezoneOffset;
  
  // Manejar valores negativos y mayores a 24
  while (adjustedHours < 0) adjustedHours += 24;
  adjustedHours = adjustedHours % 24;
  
  const hora = adjustedHours % 12; // Convertir a formato de 12 horas
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
    const h = String(Math.floor(adjustedHours)).padStart(2, '0');
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
let chronoSeconds = 0;          // Segundos del cronómetro (calculado)
let chronoMinutes = 0;          // Minutos del cronómetro (calculado)
let chronoHours = 0;            // Horas del cronómetro (calculado)
let transitionAnimating = false; // Si está animando la transición
let relojControlsInitialized = false; // Evitar inicialización múltiple

// Variables para tiempo real del cronómetro
let chronoStartTime = 0;        // Timestamp de inicio (Date.now())
let chronoAccumulatedMs = 0;    // Milisegundos acumulados (al pausar)

// Última hora recibida del ESP32 (para animación de transición)
let lastReceivedHour = { horas: 0, minutos: 0, segundos: 0 };

// Variables de zona horaria
let selectedTimezone = null;    // Zona horaria seleccionada (null = hora local del ESP32)
let timezoneOffset = 0;         // Offset en horas respecto a la hora del ESP32 (que es UTC-3)
const ESP32_UTC_OFFSET = -3;    // El ESP32 está en UTC-3 (Paraguay)

// Lista de ciudades con sus offsets UTC
const WORLD_CITIES = [
  { name: 'Local', offset: -3 },
  { name: 'New York', offset: -5 },
  { name: 'Los Angeles', offset: -8 },
  { name: 'Chicago', offset: -6 },
  { name: 'Miami', offset: -5 },
  { name: 'Toronto', offset: -5 },
  { name: 'Vancouver', offset: -8 },
  { name: 'Mexico City', offset: -6 },
  { name: 'São Paulo', offset: -3 },
  { name: 'Buenos Aires', offset: -3 },
  { name: 'Lima', offset: -5 },
  { name: 'Bogotá', offset: -5 },
  { name: 'Santiago', offset: -3 },
  { name: 'London', offset: 0 },
  { name: 'Paris', offset: 1 },
  { name: 'Berlin', offset: 1 },
  { name: 'Madrid', offset: 1 },
  { name: 'Rome', offset: 1 },
  { name: 'Amsterdam', offset: 1 },
  { name: 'Moscow', offset: 3 },
  { name: 'Dubai', offset: 4 },
  { name: 'Mumbai', offset: 5.5 },
  { name: 'New Delhi', offset: 5.5 },
  { name: 'Bangkok', offset: 7 },
  { name: 'Singapore', offset: 8 },
  { name: 'Hong Kong', offset: 8 },
  { name: 'Beijing', offset: 8 },
  { name: 'Shanghai', offset: 8 },
  { name: 'Tokyo', offset: 9 },
  { name: 'Seoul', offset: 9 },
  { name: 'Sydney', offset: 11 },
  { name: 'Auckland', offset: 13 }
];

// Inicializar controles del reloj
function initRelojControls() {
  // Evitar inicialización múltiple
  if (relojControlsInitialized) return;
  
  const modeBtn = document.getElementById('watch-mode-btn');
  const modeText = document.getElementById('watch-mode-text');
  const startStopBtn = document.getElementById('watch-startstop-btn');
  const startStopText = document.getElementById('watch-startstop-text');
  const resetBtn = document.getElementById('watch-reset-btn');
  const zoneBtn = document.getElementById('watch-zone-btn');
  const zoneOverlay = document.getElementById('zone-list-overlay');
  const zoneListScroll = document.getElementById('zone-list-scroll');
  const zoneCloseBtn = document.getElementById('zone-close-btn');
  const display = document.getElementById('watch-display');
  
  if (!modeBtn || !startStopBtn || !resetBtn) {
    console.warn('No se encontraron los controles del reloj en el DOM');
    return;
  }
  
  relojControlsInitialized = true;
  
  // Ocultar botones Start/Stop y Reset inicialmente (modo clock)
  startStopBtn.style.display = 'none';
  resetBtn.style.display = 'none';
  
  // Poblar la lista de ciudades
  if (zoneListScroll) {
    zoneListScroll.innerHTML = '';
    WORLD_CITIES.forEach((city, index) => {
      const item = document.createElement('div');
      item.className = 'zone-item' + (index === 0 ? ' selected' : '');
      item.dataset.offset = city.offset;
      item.dataset.name = city.name;
      const sign = city.offset >= 0 ? '+' : '';
      item.textContent = `${city.name} (UTC${sign}${city.offset})`;
      item.addEventListener('click', () => selectTimezone(city, item));
      zoneListScroll.appendChild(item);
    });
  }
  
  // Botón Zone: mostrar lista de ciudades
  if (zoneBtn) {
    zoneBtn.addEventListener('click', () => {
      if (zoneOverlay) {
        zoneOverlay.classList.add('visible');
      }
    });
  }
  
  // Cerrar lista de zonas
  if (zoneCloseBtn) {
    zoneCloseBtn.addEventListener('click', () => {
      if (zoneOverlay) {
        zoneOverlay.classList.remove('visible');
      }
    });
  }
  
  // Cerrar al hacer click fuera del contenedor
  if (zoneOverlay) {
    zoneOverlay.addEventListener('click', (e) => {
      if (e.target === zoneOverlay) {
        zoneOverlay.classList.remove('visible');
      }
    });
  }
  
  // Botón Mode: Clock/Chronograph
  modeBtn.addEventListener('click', () => {
    if (transitionAnimating) return;
    
    if (watchMode === 'clock') {
      // Cambiar a cronómetro - animar agujas a las 12
      watchMode = 'chronograph';
      modeText.textContent = 'Clock';
      modeBtn.classList.add('active');
      
      // Resetear tiempo del cronómetro al entrar en modo cronógrafo
      chronoSeconds = 0;
      chronoMinutes = 0;
      chronoHours = 0;
      chronoAccumulatedMs = 0;
      chronoStartTime = Date.now();
      
      // Animar agujas a las 12 (posición 0)
      animateNeedlesToTwelve(() => {
        // Una vez en posición, mostrar cronómetro
        updateChronoDisplay();
      });
      
      // Mostrar botones Start/Stop y Reset, ocultar Zone
      startStopBtn.style.display = 'flex';
      resetBtn.style.display = 'flex';
      if (zoneBtn) zoneBtn.style.display = 'none';
      
      // Enviar cambio de modo al ESP32
      sendWatchModeToESP32('chronograph');
      
    } else {
      // Cambiar a reloj
      watchMode = 'clock';
      
      // Ocultar botones Start/Stop y Reset, mostrar Zone
      startStopBtn.style.display = 'none';
      resetBtn.style.display = 'none';
      if (zoneBtn) zoneBtn.style.display = 'flex';
      modeText.textContent = 'Chronograph';
      modeBtn.classList.remove('active');
      
      // Detener cronómetro si está corriendo - acumular tiempo
      if (chronoRunning) {
        chronoAccumulatedMs += Date.now() - chronoStartTime;
        chronoRunning = false;
        startStopText.textContent = 'Start';
        startStopBtn.querySelector('.watch-btn-icon').textContent = '▶';
        startStopBtn.classList.remove('running');
      }
      
      // Animar agujas desde las 12 hasta la hora actual
      animateNeedlesToCurrentTime();
      
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
      // Detener cronómetro - acumular el tiempo transcurrido
      chronoAccumulatedMs += Date.now() - chronoStartTime;
      chronoRunning = false;
      startStopText.textContent = 'Start';
      startStopBtn.querySelector('.watch-btn-icon').textContent = '▶';
      startStopBtn.classList.remove('running');
    } else {
      // Iniciar cronómetro - guardar timestamp de inicio
      chronoStartTime = Date.now();
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
    
    // Reiniciar cronómetro - resetear tiempo real
    chronoSeconds = 0;
    chronoMinutes = 0;
    chronoHours = 0;
    chronoAccumulatedMs = 0;
    chronoStartTime = Date.now();  // Reiniciar timestamp si está corriendo
    
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

// Animar agujas desde las 12 hasta la hora actual (rotación horaria)
function animateNeedlesToCurrentTime() {
  const hoursNeedle = document.getElementById('aguja_horas');
  const minutesNeedle = document.getElementById('aguja_minutos');
  const secondsNeedle = document.getElementById('aguja_segundos');
  
  if (!hoursNeedle || !minutesNeedle || !secondsNeedle) return;
  
  transitionAnimating = true;
  
  // Calcular ángulos objetivo basados en la última hora recibida con offset de zona
  let adjustedHours = lastReceivedHour.horas + timezoneOffset;
  while (adjustedHours < 0) adjustedHours += 24;
  adjustedHours = adjustedHours % 24;
  
  const hora = adjustedHours % 12;
  const minutosNorm = lastReceivedHour.minutos / 60;
  const segundosNorm = lastReceivedHour.segundos / 60;
  
  const anguloHoras = (hora + minutosNorm) * 30;      // 360 / 12 = 30 grados por hora
  const anguloMinutos = (lastReceivedHour.minutos + segundosNorm) * 6;  // 360 / 60 = 6 grados por minuto
  const anguloSegundos = lastReceivedHour.segundos * 6;  // 360 / 60 = 6 grados por segundo
  
  // Las agujas están en 0 (las 12), rotar en sentido horario hasta la hora actual
  // Usar transición CSS para la animación suave
  hoursNeedle.style.transition = 'transform 1.2s cubic-bezier(0.4, 0, 0.2, 1)';
  minutesNeedle.style.transition = 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)';
  secondsNeedle.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
  
  // Rotar a la posición de la hora actual
  hoursNeedle.style.transform = `translate(-50%, -50%) rotate(${anguloHoras}deg)`;
  minutesNeedle.style.transform = `translate(-50%, -50%) rotate(${anguloMinutos}deg)`;
  secondsNeedle.style.transform = `translate(-50%, -50%) rotate(${anguloSegundos}deg)`;
  
  // Después de la animación, quitar transición y permitir actualizaciones normales
  setTimeout(() => {
    hoursNeedle.style.transition = 'none';
    minutesNeedle.style.transition = 'none';
    secondsNeedle.style.transition = 'none';
    transitionAnimating = false;
  }, 1200);
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
  
  // Calcular tiempo transcurrido basado en tiempo real
  const now = Date.now();
  const totalMs = chronoAccumulatedMs + (now - chronoStartTime);
  const totalSeconds = Math.floor(totalMs / 1000);
  
  chronoSeconds = totalSeconds % 60;
  chronoMinutes = Math.floor(totalSeconds / 60) % 60;
  chronoHours = Math.floor(totalSeconds / 3600) % 12;
  
  // Actualizar display
  updateChronoDisplay();
  
  // Actualizar agujas del cronómetro:
  // - Segundero: vuelta completa cada 60 segundos
  // - Minutero: vuelta completa cada 60 minutos (acumula 1 hora)
  // - Horario: marca solo horas completas (salta cuando minutero completa vuelta)
  const anguloSegundos = chronoSeconds * 6;           // 360° en 60 segundos
  const anguloMinutos = chronoMinutes * 6;            // 360° en 60 minutos
  const anguloHoras = chronoHours * 30;               // 30° por cada hora completa
  
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

// Seleccionar zona horaria
function selectTimezone(city, element) {
  // Actualizar selección visual
  const items = document.querySelectorAll('.zone-item');
  items.forEach(item => item.classList.remove('selected'));
  element.classList.add('selected');
  
  // Guardar zona horaria seleccionada
  selectedTimezone = city;
  timezoneOffset = city.offset - ESP32_UTC_OFFSET; // Diferencia respecto al ESP32
  
  // Actualizar nombre de ciudad en el instrumento
  const cityNameEl = document.getElementById('reloj-city-name');
  if (cityNameEl) {
    cityNameEl.textContent = city.name === 'Local' ? '' : city.name;
  }
  
  // Cerrar el overlay
  const zoneOverlay = document.getElementById('zone-list-overlay');
  if (zoneOverlay) {
    zoneOverlay.classList.remove('visible');
  }
  
  // Forzar actualización visual inmediata si estamos en modo reloj
  if (watchMode === 'clock' && !transitionAnimating) {
    applyTimezoneToDisplay();
  }
}

// Aplicar zona horaria a la visualización actual
function applyTimezoneToDisplay() {
  const { horas, minutos, segundos } = lastReceivedHour;
  
  // Calcular hora ajustada
  let adjustedHours = horas + timezoneOffset;
  
  // Manejar valores negativos y mayores a 24
  while (adjustedHours < 0) adjustedHours += 24;
  adjustedHours = adjustedHours % 24;
  
  const hora = adjustedHours % 12;
  const minutosNorm = minutos / 60;
  const segundosNorm = segundos / 60;
  const anguloHoras = (hora + minutosNorm) * 30;
  const anguloMinutos = (minutos + segundosNorm) * 6;
  const anguloSegundos = segundos * 6;

  const hoursNeedle = document.getElementById("aguja_horas");
  const minutesNeedle = document.getElementById("aguja_minutos");
  const secondsNeedle = document.getElementById("aguja_segundos");
  
  if (hoursNeedle) hoursNeedle.style.transform = `translate(-50%, -50%) rotate(${anguloHoras}deg)`;
  if (minutesNeedle) minutesNeedle.style.transform = `translate(-50%, -50%) rotate(${anguloMinutos}deg)`;
  if (secondsNeedle) secondsNeedle.style.transform = `translate(-50%, -50%) rotate(${anguloSegundos}deg)`;
  
  // Actualizar display
  const display = document.getElementById('watch-display');
  if (display) {
    const h = String(Math.floor(adjustedHours)).padStart(2, '0');
    const m = String(minutos).padStart(2, '0');
    const s = String(segundos).padStart(2, '0');
    display.textContent = `${h}:${m}:${s}`;
  }
}
