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


// Función para animar la aguja del Turn Coordinator hacia el valor objetivo
function animateDialTurnCoordinator(value) {
    targetTurnCoordinator = value;
    if (!turnCoordinatorAnimationFrame) {
        turnCoordinatorAnimationFrame = requestAnimationFrame(updateTurnCoordinator);
    }
}

// Función para actualizar la animación del Turn Coordinator
function updateTurnCoordinator() {
    const delta = targetTurnCoordinator - currentTurnCoordinator;
    if (Math.abs(delta) < 0.1) {
        currentTurnCoordinator = targetTurnCoordinator;
        turnCoordinatorAnimationFrame = null;
        return;
    }
    currentTurnCoordinator += delta * 0.1;
    // Rotar el avión (tc_front)
    const plane = document.getElementById('tc_front');
    if (plane) {
        // Convertir valor del slider (-30 a 30) a grados de rotación (-30° a 30°)
        const rotation = (currentTurnCoordinator / 30) * 30;
        plane.style.transform = `rotate(${rotation}deg)`;
    }
    turnCoordinatorAnimationFrame = requestAnimationFrame(updateTurnCoordinator);
}

// Función para actualizar el avión del Turn Coordinator desde WebSocket
function updateTurnCoordinatorPlane(value, sendToESP = false) {
    animateDialTurnCoordinator(value);
    // Sincronizar slider si el dato viene del ESP32
    if (!sendToESP) {
        const slider = document.getElementById('turncoordinator-slider');
        const sliderValue = document.getElementById('turncoordinator-slider-value');
        if (slider) slider.value = value;
        if (sliderValue) sliderValue.textContent = value;
    }
}

// Función para actualizar el péndulo (bola) del Turn Coordinator
function updateTurnCoordinatorBall(value) {
    const ball = document.getElementById('tc_ball');
    if (ball) {
        // Mover el péndulo horizontalmente: -30° a +30° se traduce en -30° a +30° de movimiento horizontal
        const angle = (value / 30) * 30; // Ajusta el factor de movimiento según el diseño del instrumento
        ball.style.transform = `rotate(${angle}deg)`;
    }
    // Sincronizar variable local
    currentRudder = value;
}
// Variable global para el valor del rudder
let currentRudder = 0;

function setupTurnCoordinatorControls() {
    // Configurar slider del Turn Coordinator
    const slider = document.getElementById('turncoordinator-slider');
    const sliderValue = document.getElementById('turncoordinator-slider-value');
    
    if (slider) {
        slider.addEventListener('input', () => {
            const value = parseFloat(slider.value);
            if (sliderValue) sliderValue.textContent = value;
            animateDialTurnCoordinator(value);
            sendTurnCoordinatorToESP32('tc-rollValue', value);
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
            animateDialTurnCoordinator(30);
            sendTurnCoordinatorToESP32('tc-rollValue', 30);
        });
    }
    if (btnMid) {
        btnMid.addEventListener('click', () => {
            if (slider) slider.value = 0;
            if (sliderValue) sliderValue.textContent = 0;
            animateDialTurnCoordinator(0);
            sendTurnCoordinatorToESP32('tc-rollValue', 0);
        });
    }
    if (btnMin) {
        btnMin.addEventListener('click', () => {
            if (slider) slider.value = -30;
            if (sliderValue) sliderValue.textContent = -30;
            animateDialTurnCoordinator(-30);
            sendTurnCoordinatorToESP32('tc-rollValue', -30);
        });
    }
    if (btnPlus) {
        btnPlus.addEventListener('click', () => {
            const newValue = Math.min(30, parseFloat(slider.value) + 1);
            if (slider) slider.value = newValue;
            if (sliderValue) sliderValue.textContent = newValue;
            animateDialTurnCoordinator(newValue);
            sendTurnCoordinatorToESP32('tc-rollValue', newValue);
        });
    }
    if (btnMinus) {
        btnMinus.addEventListener('click', () => {
            const newValue = Math.max(-30, parseFloat(slider.value) - 1);
            if (slider) slider.value = newValue;
            if (sliderValue) sliderValue.textContent = newValue;
            animateDialTurnCoordinator(newValue);
            sendTurnCoordinatorToESP32('tc-rollValue', newValue);
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