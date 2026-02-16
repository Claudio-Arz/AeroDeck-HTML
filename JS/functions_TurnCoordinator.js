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
    // Actualizar la visualización del Turn Coordinator aquí
    // Por ejemplo: document.getElementById("turnCoordinatorDial").style.transform = `rotate(${currentTurnCoordinator}deg)`;
    turnCoordinatorAnimationFrame = requestAnimationFrame(updateTurnCoordinator);
}
function setupTurnCoordinatorControls() {
    // Configurar los event listeners para los controles del Turn Coordinator aquí
}