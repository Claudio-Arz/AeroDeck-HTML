/* 
  Sistema de Instrumentos para AeroDeck - Versión 0.03
  Autor: Claudio Arzamendia Systems
  Fecha: 2026-02-15 19:53:12

  Este módulo functions_airSpeed.js contiene la lógica para el instrumento de velocidad aérea (Air Speed).
  Funciones principales:
  - updateAirspeed(airspeed): Actualiza la aguja y los valores numéricos del instrumento según el valor de velocidad aérea recibido o el slider.
  - init(config): Inicializa las referencias a los elementos del DOM y configura los event listeners para los controles.



*/

function initAirSpeedControls() {
  // Aquí podríamos agregar event listeners para controles interactivos
  const slider = document.getElementById('as-slider');
  if (slider) {
    slider.addEventListener('input', () => {
      updateAirspeed();
    });
  } else {
    console.warn('No se encontró el slider de Air Speed en el DOM.');
  }
}
