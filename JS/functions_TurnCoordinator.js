/*
    Librería de funciones para el instrumento Turn Coordinator.
    Contiene:
    - animateDialTurnCoordinator(value): Anima la aguja del Turn Coordinator hacia el valor objetivo.
    - initTurnCoordinatorControls(): Configura los event listeners para los controles del Turn Coordinator.
    - sendTurnCoordinatorToESP32(value): Envía el valor del Turn Coordinator al ESP32 vía WebSocket.
    El Turn Coordinator muestra la tasa de giro del avión. El valor se representa en grados por segundo (°/s) 
    y se muestra en una escala que va de -30°/s a +30°/s. El instrumento tiene una aguja que se mueve hacia 
    la izquierda para giros a la izquierda y hacia la derecha para giros a la derecha. En el centro, el avión 
    está volando recto sin giro.

    El control del Turn Coordinator se puede ajustar mediante un slider o botones predefinidos para valores 
    comunes de giro. Al cambiar el valor, se anima la aguja del instrumento y se envía el nuevo valor al 
    ESP32 para que lo refleje en el instrumento físico y en todas las terminales conectadas.

    Rangos:
    - Turn Coordinator: -30°/s a +30°/s (±50px en el slider)



*/
// Variables globales para el Turn Coordinator
let currentTurnCoordinator = 0;
let targetTurnCoordinator = 0;
let turnCoordinatorAnimationFrame = null;

function clampTurnCoordinatorValue(value, fallback = 0) {
    const parsed = Number.parseFloat(value);
    if (!Number.isFinite(parsed)) {
        return fallback;
    }
    return Math.max(-30, Math.min(30, parsed));
}

function renderTurnCoordinatorPlane(value) {
    const plane = document.getElementById('tc_front');
    if (!plane) {
        return;
    }
    const rotation = clampTurnCoordinatorValue(value, 0);
    plane.style.transform = `rotate(${rotation}deg)`;
}


// Función para animar la aguja del Turn Coordinator hacia el valor objetivo
function animateDialTurnCoordinator(value) {
    targetTurnCoordinator = clampTurnCoordinatorValue(value, currentTurnCoordinator);
    if (!turnCoordinatorAnimationFrame) {
        turnCoordinatorAnimationFrame = requestAnimationFrame(updateTurnCoordinator);
    }
}

// Función para actualizar la animación del Turn Coordinator
function updateTurnCoordinator() {
    const delta = targetTurnCoordinator - currentTurnCoordinator;
    if (Math.abs(delta) < 0.1) {
        currentTurnCoordinator = targetTurnCoordinator;
        renderTurnCoordinatorPlane(currentTurnCoordinator);
        turnCoordinatorAnimationFrame = null;
        return;
    }
    currentTurnCoordinator += delta * 0.1;
    renderTurnCoordinatorPlane(currentTurnCoordinator);
    turnCoordinatorAnimationFrame = requestAnimationFrame(updateTurnCoordinator);
}

// Función para actualizar el avión del Turn Coordinator desde WebSocket
function updateTurnCoordinatorPlane(value, sendToESP = false) {
    const safeValue = clampTurnCoordinatorValue(value, currentTurnCoordinator);
    animateDialTurnCoordinator(safeValue);
    if (sendToESP) {
        sendTurnCoordinatorToESP32('tc-rollValue', safeValue);
    }
    // Sincronizar slider si el dato viene del ESP32
    if (!sendToESP) {
        const slider = document.getElementById('turncoordinator-slider');
        const sliderValue = document.getElementById('turncoordinator-slider-value');
        if (slider) slider.value = safeValue;
        if (sliderValue) sliderValue.textContent = safeValue;
    }
}

// Función para actualizar el péndulo (bola) del Turn Coordinator
function updateTurnCoordinatorBall(value) {
    const safeValue = clampTurnCoordinatorValue(value, currentRudder);
    const ball = document.getElementById('tc_ball');
    if (ball) {
        // Mover el péndulo horizontalmente: -30° a +30° se traduce en -30° a +30° de movimiento horizontal
        const angle = safeValue; // Ajusta el factor de movimiento según el diseño del instrumento
        ball.style.transform = `rotate(${angle}deg)`;
    }
    // Sincronizar variable local
    currentRudder = safeValue;
}
// Variable global para el valor del rudder
let currentRudder = 0;

function setupTurnCoordinatorControls() {
    const controlRoot = document.querySelector('.turncoordinator-control-cell');
    if (controlRoot && controlRoot.dataset.tcInitialized === 'true') {
        return;
    }
    if (controlRoot) {
        controlRoot.dataset.tcInitialized = 'true';
    }

    // Configurar slider del Turn Coordinator
    const slider = document.getElementById('turncoordinator-slider');
    const sliderValue = document.getElementById('turncoordinator-slider-value');
    
    if (slider) {
        slider.addEventListener('input', () => {
            const value = clampTurnCoordinatorValue(slider.value, currentTurnCoordinator);
            slider.value = value;
            if (sliderValue) sliderValue.textContent = value;
            updateTurnCoordinatorPlane(value, true);
        });
    }
    
    // Botones de valor predefinido
    const btnMax = document.getElementById('turncoordinator-slider-max');
    const btnMid = document.getElementById('turncoordinator-slider-mid');
    const btnMin = document.getElementById('turncoordinator-slider-min');
    const btnPlus = document.getElementById('turncoordinator-btn-plus');
    const btnMinus = document.getElementById('turncoordinator-btn-minus');
 
    if (btnMax) {
        btnMax.addEventListener('click', () => {
            if (slider) slider.value = 30;
            if (sliderValue) sliderValue.textContent = 30;
            updateTurnCoordinatorPlane(30, true);
        });
    }
    if (btnMid) {
        btnMid.addEventListener('click', () => {
            if (slider) slider.value = 0;
            if (sliderValue) sliderValue.textContent = 0;
            updateTurnCoordinatorPlane(0, true);
        });
    }
    if (btnMin) {
        btnMin.addEventListener('click', () => {
            if (slider) slider.value = -30;
            if (sliderValue) sliderValue.textContent = -30;
            updateTurnCoordinatorPlane(-30, true);
        });
    }
    if (btnPlus) {
        btnPlus.addEventListener('click', () => {
            const sliderCurrent = slider ? clampTurnCoordinatorValue(slider.value, targetTurnCoordinator) : targetTurnCoordinator;
            const newValue = Math.min(30, sliderCurrent + 1);
            if (slider) slider.value = newValue;
            if (sliderValue) sliderValue.textContent = newValue;
            updateTurnCoordinatorPlane(newValue, true);
        });
    }
    if (btnMinus) {
        btnMinus.addEventListener('click', () => {
            const sliderCurrent = slider ? clampTurnCoordinatorValue(slider.value, targetTurnCoordinator) : targetTurnCoordinator;
            const newValue = Math.max(-30, sliderCurrent - 1);
            if (slider) slider.value = newValue;
            if (sliderValue) sliderValue.textContent = newValue;
            updateTurnCoordinatorPlane(newValue, true);
        });
    }
    
    // Botones de Rudder (+/- 1°)
    const rudderLeft = document.getElementById('tc-rudder-left');
    const rudderRight = document.getElementById('tc-rudder-right');
    
    if (rudderLeft) {
        rudderLeft.addEventListener('click', () => {
            currentRudder = Math.max(-30, currentRudder - 1); // -1° (izquierda)
            sendTurnCoordinatorToESP32('tc-pitchValue', currentRudder);
            console.log('Rudder Left:', currentRudder);
        });
    }
    if (rudderRight) {
        rudderRight.addEventListener('click', () => {
            currentRudder = Math.min(30, currentRudder + 1); // +1° (derecha)
            sendTurnCoordinatorToESP32('tc-pitchValue', currentRudder);
            console.log('Rudder Right:', currentRudder);
        });
    }
}

function sendTurnCoordinatorToESP32(dataVar, dataValue) {
    if (window.ws && window.ws.readyState === WebSocket.OPEN) {
        const data = JSON.stringify({ [dataVar]: dataValue });
        window.ws.send(data);
        console.log(`Enviando Turn Coordinator al ESP32: ${dataVar} = ${dataValue}`);
    } else {
        console.warn('WebSocket no está conectado.');
    }
}

// Alterna la visibilidad del cristal roto en el instrumento Turn Coordinator
function toggleTurnCoorBrokenCrystal() {
  const crystal = document.getElementById('turn_coor_broken_crystal06');
  if (crystal) {
    crystal.classList.toggle('visible');
  }
}