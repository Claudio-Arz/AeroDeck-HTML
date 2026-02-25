/*
HTML/mainHTML.cpp
Claudio Arzamendia Systems
Tablero completo con intrumental aeronáutico
para ajustar instrumentos analógicos.

2026-02-07 18:26:08
Versión 3.00

Logo:

En mainHTML.cpp declaramos un div con la clase logo-container, que contiene 
la imagen del logo y el slider para ajustar el color del drop-shadow. El
slider me gustaría que sea 600px de ancho, y la misma altura que el logo,
y que esté ubicado a la derecha del logo, con un espacio de 20px entre ambos.

El logo tiene que ocupar el ángulo superior izquierdo, con un tamaño de aproximadamente 350px de ancho,
y 27px de altura. 20px a la derecha tiene que mostar un slider para ajustar el color
del drop-shadow de los instrumentos, que se encuentra declarado en mainHTML.css
como .instrumento-grid - box-shadow: 0 0 20px 10px rgb(121, 171, 242); En lugar de ser un valor
fijo quiero que cambie dinámicamente según el valor del slider.


*/



#include <pgmspace.h>

const char MAIN_page[] PROGMEM = R"rawliteral(
<!DOCTYPE html >
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Benchmark & Calibration</title>


<link rel="stylesheet" href="https://claudio-arz.github.io/AeroDeck-HTML/CSS/mainHTML.css">
<script src="https://claudio-arz.github.io/AeroDeck-HTML/JS/functions_variometer.js"></script>
<script src="https://claudio-arz.github.io/AeroDeck-HTML/JS/functions_altimeter.js"></script>
<script src="https://claudio-arz.github.io/AeroDeck-HTML/JS/functions_rpm.js"></script>
<script src="https://claudio-arz.github.io/AeroDeck-HTML/JS/functions_Attitude.js"></script>
<script src="https://claudio-arz.github.io/AeroDeck-HTML/JS/functions_airSpeed.js"></script>
<script src="https://claudio-arz.github.io/AeroDeck-HTML/JS/functions_Gyro.js"></script>
<script src="https://claudio-arz.github.io/AeroDeck-HTML/JS/functions_TurnCoordinator.js"></script>
<script src="https://claudio-arz.github.io/AeroDeck-HTML/JS/functions_FuelFlow.js"></script>
<script src="https://claudio-arz.github.io/AeroDeck-HTML/JS/functions_Manifold.js"></script>
<script src="https://claudio-arz.github.io/AeroDeck-HTML/JS/functions_OilPress.js"></script>
<script src="https://claudio-arz.github.io/AeroDeck-HTML/JS/functions_OilTemp.js"></script>
<script src="https://claudio-arz.github.io/AeroDeck-HTML/JS/functions_CHT.js"></script>
<script src="https://claudio-arz.github.io/AeroDeck-HTML/JS/functions_FUEL.js"></script>
<script src="https://claudio-arz.github.io/AeroDeck-HTML/JS/functions_Reloj.js"></script>
<script src="https://claudio-arz.github.io/AeroDeck-HTML/JS/functions_VoltAmp.js"></script>


</head>

<body>
 

<h1 style="text-align:center; margin-top: 24px;">Benchmark & Calibration</h1>
<div class="logo-container">
    <img class="logo" id="logo" 
      src="https://claudio-arz.github.io/AeroDeck-HTML/Images/ClaudioArzamendiaSystems.png" 
      alt="Logo de Claudio Arzamendia Systems">

    <input type="range" min="0" max="360" value="220" step="1" 
      id="shadow-color" class="color-slider-input">
    
</div>

<div id="main-grid" class="grid-container">
  
  <div class="grid-item" id="inst04" style="grid-row: 1; grid-column: 2;">RPM</div>  
  <div class="grid-item" id="inst01" style="grid-row: 1; grid-column: 3;">Air Speed</div>  
  <div class="grid-item" id="inst02" style="grid-row: 1; grid-column: 4;">Attitude Control</div>  
  <div class="grid-item" id="inst03" style="grid-row: 1; grid-column: 5;">Altimeter</div>  
  
  <div class="grid-item" id="inst05" style="grid-row: 1; grid-column: 7;">Pitch & Roll Controls</div>  
  <div class="grid-item" id="inst06" style="grid-row: 1; grid-column: 9;">RPM Controls</div>  
  <div class="grid-item" id="inst08" style="grid-row: 1; grid-column: 8;">Air Speed Controls</div>  
  <div class="grid-item" id="inst12" style="grid-row: 2; grid-column: 1;">Fuel Flow Instrument</div>  
  <div class="grid-item" id="inst09" style="grid-row: 2; grid-column: 3;">Turn Coordinator</div>  
  <div class="grid-item" id="inst10" style="grid-row: 2; grid-column: 4;">Gyro</div>  
  <div class="grid-item" id="inst11" style="grid-row: 2; grid-column: 5;">Vertical Speed</div>  
  <div class="grid-item" id="inst14" style="grid-row: 2; grid-column: 6;">Vertical Speed Controls</div>  
  <div class="grid-item" id="inst07" style="grid-row: 2; grid-column: 7;">Gyro Controls</div>  
  <div class="grid-item" id="inst13" style="grid-row: 2; grid-column: 8;">Turn Coordinator Controls</div>  
  <div class="grid-item" id="inst15" style="grid-row: 2; grid-column: 10;">Fuel Flow Controls</div>  
  
  <div class="grid-item" id="inst23" style="grid-row: 3; grid-column: 1;">CHT Instrument</div>
  <div class="grid-item" id="inst21" style="grid-row: 3; grid-column: 2;">Oil Temp Instrument</div>
  <div class="grid-item" id="inst19" style="grid-row: 3; grid-column: 3;">Oil Press Instrument</div>
  <div class="grid-item" id="inst17" style="grid-row: 3; grid-column: 4;">Manifold Instrument</div>
  <div class="grid-item" id="inst25" style="grid-row: 3; grid-column: 5;">CHT Instrument</div>
  <div class="grid-item" id="inst26" style="grid-row: 3; grid-column: 6;">FUEL Controls</div>
  <div class="grid-item" id="inst18" style="grid-row: 3; grid-column: 7;">Manifold Controls</div>
  <div class="grid-item" id="inst20" style="grid-row: 3; grid-column: 8;">Oil Press Controls</div>
  <div class="grid-item" id="inst22" style="grid-row: 3; grid-column: 9;">Oil Temp Controls</div>
  <div class="grid-item" id="inst24" style="grid-row: 3; grid-column: 10;">CHT Controls</div>

  <div class="grid-item" id="inst28" style="grid-row: 4; grid-column: 1;">Volt/Amp Instrument</div>
  <div class="grid-item" id="inst27" style="grid-row: 4; grid-column: 5;">Clock</div>  
  <div class="grid-item" id="inst30" style="grid-row: 4; grid-column: 6;">Clock Controls</div>
  
  <div class="grid-item" id="inst29" style="grid-row: 4; grid-column: 10;">Volt/Amp Controls</div>
  

</div>

<!-- El contenido HTML principal se cargará aquí dinámicamente -->

</body>

<script>
// Ejecutar todo el JS solo cuando el DOM esté completamente cargado --
window.addEventListener('DOMContentLoaded', () => {
  // Inicialización del WebSocket para comunicación con el ESP32
  window.ws = new WebSocket('ws://' + location.hostname + ':81/');

  // === Funciones de actualización de instrumentos ===

  // Handler WebSocket: actualiza todos los instrumentos y botones según los datos recibidos
  ws.onmessage = (msg) => {
    let data = {};
    try {
      data = JSON.parse(msg.data);
    } catch (e) {
      return;
    }
    // --- Actualizar instrumentos ---
    if (data.relojValue !== undefined && typeof updateReloj === 'function') {
      updateReloj(data.relojValue);
    }
    if (data.verticalSpeed !== undefined && typeof updateVariometerAndValue === 'function') {
      updateVariometerAndValue(data.verticalSpeed);
    }
    if (data.altitudValue !== undefined && typeof updateAltimeterAndValue === 'function') {
      updateAltimeterAndValue(data.altitudValue, data.bandera_off);
    }
    if (data.RPMValue !== undefined && typeof updateRPMAndValue === 'function') {
      // console.log("Actualizando RPM: " + data.RPMValue + " Noice: " + data.RPMNoice + " varRPM: " + data.varRPM);
      updateRPMAndValue(data.RPMValue, data.RPMNoice, data.varRPM);
    }
    if (data.brakeOn !== undefined && typeof updateBrakeState === 'function') {
      updateBrakeState(data.brakeOn);
    }
    // Actualizar horas de funcionamiento en el Drum-Roll
    if (data.horasFuncionamiento !== undefined && typeof setDrumHours === 'function') {
      setDrumHours(data.horasFuncionamiento, data.minutosFuncionamiento);
    }
    if (data.pitchValue !== undefined && typeof updateAttitudeControl === 'function') {
      // console.log("Actualizando Pitch: " + data.pitchValue + " Roll: " + data.rollValue);
      updateAttitudeControl(data.pitchValue, data.rollValue);
    }
    // Sincronizar Roll value en ambos instrumentos (Attitude y Turn Coordinator)
    if (data.rollValue !== undefined) {
      // Actualizar Turn Coordinator slider y display cuando recibe rollValue desde Attitude
      const slider = document.getElementById('turncoordinator-slider');
      const sliderValue = document.getElementById('turncoordinator-slider-value');
      if (slider) slider.value = data.rollValue;
      if (sliderValue) sliderValue.textContent = data.rollValue;
      // Actualizar también el plano visual del Turn Coordinator
      if (typeof updateTurnCoordinatorPlane === 'function') {
        updateTurnCoordinatorPlane(data.rollValue, false); // false = no enviar de vuelta al ESP32
      }
    }
    if (data.airspeedValue !== undefined && typeof updateAirspeed === 'function') {
      // console.log("Actualizando Air Speed: " + data.airspeedValue);
      updateAirspeed(data.airspeedValue);
      }
      if (data.gyroValue !== undefined && typeof updateGyro === 'function') {
        // console.log("Actualizando Gyro: " + data.gyroValue);
      updateGyro(data.gyroValue);
    }
    // --- Turn Coordinator ---
    if (data['tc-rollValue'] !== undefined && typeof updateTurnCoordinatorPlane === 'function') {
      // console.log("Actualizando TC Avión: " + data['tc-rollValue']);
      updateTurnCoordinatorPlane(data['tc-rollValue']);
    }
    if (data['tc-pitchValue'] !== undefined && typeof updateTurnCoordinatorBall === 'function') {
      // console.log("Actualizando TC Péndulo: " + data['tc-pitchValue']);
      updateTurnCoordinatorBall(data['tc-pitchValue']);
    }
    if (data['tcBallValue'] !== undefined && typeof updateTurnCoordinatorBall === 'function') {
      // console.log("Actualizando TC Ball (Slip/Skid): " + data['tcBallValue']);
      updateTurnCoordinatorBall(data['tcBallValue']);
    }
    if (data['fuelFlowValue'] !== undefined && typeof updateFuelFlow === 'function') {
      // console.log("Actualizando Fuel Flow: " + data['fuelFlowValue']);
      updateFuelFlow(data['fuelFlowValue']);
    }
    if (data['useSimulatedFuelFlow'] !== undefined && typeof updateFuelFlowSimModeState === 'function') {
      updateFuelFlowSimModeState(data['useSimulatedFuelFlow']);
    }
    if (data['manifold'] !== undefined && typeof updateManifold === 'function') {
      // console.log("Actualizando Manifold: " + data['manifold']);
      updateManifold(data['manifold']);
    }
    if (data['oilPress'] !== undefined && typeof updateOilPress === 'function') {
      // console.log("Actualizando Oil Press: " + data['oilPress']);
      updateOilPress(data['oilPress']);
    }
    if (data['useSimulatedOilPress'] !== undefined && typeof updateOilPressSimModeState === 'function') {
      updateOilPressSimModeState(data['useSimulatedOilPress']);
    }

    if (data['oilTemp'] !== undefined && typeof updateOilTemp === 'function') {
      // console.log("Actualizando Oil Temp: " + data['oilTemp']);
      updateOilTemp(data['oilTemp']);
    }
    if (data['useSimulatedOilTemp'] !== undefined && typeof updateOilTempSimModeState === 'function') {
      updateOilTempSimModeState(data['useSimulatedOilTemp']);
    }

    if (data['chtValue'] !== undefined && typeof updateCHT === 'function') {
      // console.log("Actualizando CHT: " + data['chtValue']);
      updateCHT(data['chtValue']);
    }
    if (data['useSimulatedCHT'] !== undefined && typeof updateCHTSimModeState === 'function') {
      updateCHTSimModeState(data['useSimulatedCHT']);
    }

    if (data['fuelValueLeft'] !== undefined && typeof updateFUELLeft === 'function') {
      // console.log("Actualizando Fuel Left: " + data['fuelValueLeft']);
      updateFUELLeft(data['fuelValueLeft']);
    }
    if (data['fuelValueRight'] !== undefined && typeof updateFUELRight === 'function') {
      // console.log("Actualizando Fuel Right: " + data['fuelValueRight']);
      updateFUELRight(data['fuelValueRight']);
    }
    if (data['useSimulatedFuel'] !== undefined && typeof updateFuelSimModeState === 'function') {
      updateFuelSimModeState(data['useSimulatedFuel']);
    }
    if (data['activeTank'] !== undefined && typeof updateActiveTankIndicator === 'function') {
      updateActiveTankIndicator(data['activeTank']);
    }

    if (data['voltAmpValueLeft'] !== undefined && typeof updateVoltAmpLeft === 'function') {
      // console.log("Actualizando Volt/Amp Left: " + data['voltAmpValueLeft']);
      updateVoltAmpLeft(data['voltAmpValueLeft']);
    }
    if (data['useSimulatedVoltage'] !== undefined && typeof updateVoltageSimModeState === 'function') {
      updateVoltageSimModeState(data['useSimulatedVoltage']);
    }
    if (data['voltAmpValueRight'] !== undefined && typeof updateVoltAmpRight === 'function') {
      // console.log("Actualizando Volt/Amp Right: " + data['voltAmpValueRight']);
      updateVoltAmpRight(data['voltAmpValueRight']);
    }


  }
});



// Cargar el HTML del instrumento Volt/Amp de forma dinámica
window.addEventListener('DOMContentLoaded', () => {
  fetch("https://claudio-arz.github.io/AeroDeck-HTML/VoltAmp_Instrumento.html")
  .then(r => r.text())
  .then(html => {
    document.getElementById("inst28").innerHTML = html;
    });
});     

// Cargar el HTML de la caja de control del Volt/Amp de forma dinámica.
window.addEventListener('DOMContentLoaded', () => {
  fetch("https://claudio-arz.github.io/AeroDeck-HTML/VoltAmp_Control.html")
    .then(r => r.text())
    .then(html => {
      document.getElementById("inst29").innerHTML = html;
      // Inicializar controles del Volt/Amp después de insertar el HTML
      if (typeof initVoltAmpControls === 'function') {
        initVoltAmpControls();
      } else {
        // Si el script aún no está cargado, esperar y reintentar
        setTimeout(() => {
          if (typeof initVoltAmpControls === 'function') {
            initVoltAmpControls();
          }
        }, 200);
      }
    });
}); 
 
// Cargar el HTML del instrumento Reloj de forma dinámica
window.addEventListener('DOMContentLoaded', () => {
  fetch("https://claudio-arz.github.io/AeroDeck-HTML/Reloj_Instrumento.html")
  .then(r => r.text())
  .then(html => {
    document.getElementById("inst27").innerHTML = html;
    });
});

// Cargar el HTML de la caja de control del Reloj de forma dinámica
window.addEventListener('DOMContentLoaded', () => {
  fetch("https://claudio-arz.github.io/AeroDeck-HTML/Reloj_Control.html")
    .then(r => r.text())
    .then(html => {
      document.getElementById("inst30").innerHTML = html;
      // Inicializar controles del Reloj después de insertar el HTML
      if (typeof initRelojControls === 'function') {
        initRelojControls();
        startChronoTicker(); // Iniciar el ticker del cronómetro
      }
      // Escuchar cambios en el DOM para reinicializar controles si es necesario
      const observer = new MutationObserver(() => {
        if (document.getElementById('watch-mode-btn')) {
          if (typeof initRelojControls === 'function') {
            initRelojControls();
            startChronoTicker();
          }
          observer.disconnect();
        }
      });
      observer.observe(document.getElementById('inst30'), { childList: true, subtree: true });
    });
});     

// Cargar el HTML del instrumento FUEL de forma dinámica
window.addEventListener('DOMContentLoaded', () => {
  fetch("https://claudio-arz.github.io/AeroDeck-HTML/FUEL_Instrumento.html")
  .then(r => r.text())
  .then(html => {
    document.getElementById("inst25").innerHTML = html;
    });
});     

// Cargar el HTML de la caja de control del FUEL de forma dinámica.
window.addEventListener('DOMContentLoaded', () => {
  fetch("https://claudio-arz.github.io/AeroDeck-HTML/FUEL_Control.html")
    .then(r => r.text())
    .then(html => {
      document.getElementById("inst26").innerHTML = html;
      // Inicializar controles del FUEL después de insertar el HTML
      if (typeof initFUELControls === 'function') {
        initFUELControls();
      } else {
        // Si el script aún no está cargado, esperar y reintentar
        setTimeout(() => {
          if (typeof initFUELControls === 'function') {
            initFUELControls();
          }
        }, 200);
      }
    });
}); 
  

// Cargar el HTML del instrumento CHT de forma dinámica
window.addEventListener('DOMContentLoaded', () => {
  fetch("https://claudio-arz.github.io/AeroDeck-HTML/CHT_Instrumento.html")
  .then(r => r.text())
  .then(html => {
    document.getElementById("inst23").innerHTML = html;
    });
});     

// Cargar el HTML de la caja de control del CHT de forma dinámica.
window.addEventListener('DOMContentLoaded', () => {
  fetch("https://claudio-arz.github.io/AeroDeck-HTML/CHT_Control.html")
    .then(r => r.text())
    .then(html => {
      document.getElementById("inst24").innerHTML = html;
      // Inicializar controles del CHT después de insertar el HTML
      if (typeof initCHTControls === 'function') {
        initCHTControls();
      } else {
        // Si el script aún no está cargado, esperar y reintentar
        setTimeout(() => {
          if (typeof initCHTControls === 'function') {
            initCHTControls();
          }
        }, 200);
      }
    });
}); 
  

// Cargar el HTML del instrumento Oil Temp de forma dinámica
window.addEventListener('DOMContentLoaded', () => {
  fetch("https://claudio-arz.github.io/AeroDeck-HTML/OilTemp_Instrumento.html")
  .then(r => r.text())
  .then(html => {
    document.getElementById("inst21").innerHTML = html;
    });
});     

// Cargar el HTML de la caja de control del Oil Temp de forma dinámica.
window.addEventListener('DOMContentLoaded', () => {
  fetch("https://claudio-arz.github.io/AeroDeck-HTML/OilTemp_Control.html")
    .then(r => r.text())
    .then(html => {
      document.getElementById("inst22").innerHTML = html;
      // Inicializar controles del Oil Temp después de insertar el HTML
      if (typeof initOilTempControls === 'function') {
        initOilTempControls();
      } else {
        // Si el script aún no está cargado, esperar y reintentar
        setTimeout(() => {
          if (typeof initOilTempControls === 'function') {
            initOilTempControls();
          }
        }, 200);
      }
    });
}); 
  
// Cargar el HTML del instrumento Oil Press de forma dinámica
window.addEventListener('DOMContentLoaded', () => {
  fetch("https://claudio-arz.github.io/AeroDeck-HTML/OilPress_Instrumento.html")
  .then(r => r.text())
  .then(html => {
    document.getElementById("inst19").innerHTML = html;
    });
});     

// Cargar el HTML de la caja de control del Oil Press de forma dinámica.
window.addEventListener('DOMContentLoaded', () => {
  fetch("https://claudio-arz.github.io/AeroDeck-HTML/OilPress_Control.html")
    .then(r => r.text())
    .then(html => {
      document.getElementById("inst20").innerHTML = html;
      // Inicializar controles del Oil Press después de insertar el HTML
      if (typeof initOilPressControls === 'function') {
        initOilPressControls();
      } else {
        // Si el script aún no está cargado, esperar y reintentar
        setTimeout(() => {
          if (typeof initOilPressControls === 'function') {
            initOilPressControls();
          }
        }, 200);
      }
    });
}); 
  
// Cargar el HTML del instrumento Manifold de forma dinámica
window.addEventListener('DOMContentLoaded', () => {
  fetch("https://claudio-arz.github.io/AeroDeck-HTML/Manifold_Instrumento.html")
  .then(r => r.text())
  .then(html => {
    document.getElementById("inst17").innerHTML = html;
    });
});     

// Cargar el HTML de la caja de control del Manifold de forma dinámica.
window.addEventListener('DOMContentLoaded', () => {
  fetch("https://claudio-arz.github.io/AeroDeck-HTML/Manifold_Control.html")
    .then(r => r.text())
    .then(html => {
      document.getElementById("inst18").innerHTML = html;
      // Inicializar controles del Manifold después de insertar el HTML
      if (typeof initManifoldControls === 'function') {
        initManifoldControls();
      } else {
        // Si el script aún no está cargado, esperar y reintentar
        setTimeout(() => {
          if (typeof initManifoldControls === 'function') {
            initManifoldControls();
          }
        }, 200);
      }
    });
}); 

  
// Cargar el HTML del instrumento Fuel Flow de forma dinámica
window.addEventListener('DOMContentLoaded', () => {
  fetch("https://claudio-arz.github.io/AeroDeck-HTML/FuelFlow_Instrumento.html")
  .then(r => r.text())
  .then(html => {
    document.getElementById("inst12").innerHTML = html;
    });
});     

// Cargar el HTML de la caja de control del Fuel Flow de forma dinámica.
window.addEventListener('DOMContentLoaded', () => {
  fetch("https://claudio-arz.github.io/AeroDeck-HTML/FuelFlow_Control.html")
    .then(r => r.text())
    .then(html => {
      document.getElementById("inst15").innerHTML = html;
      // Inicializar controles del Fuel Flow después de insertar el HTML
      if (typeof initFuelFlowControls === 'function') {
        initFuelFlowControls();
      } else {
        // Si el script aún no está cargado, esperar y reintentar
        setTimeout(() => {
          if (typeof initFuelFlowControls === 'function') {
            initFuelFlowControls();
          }
        }, 200);
      }
    });
}); 

// Cargar el HTML del instrumento Turn Coordinator de forma dinámica
window.addEventListener('DOMContentLoaded', () => {
  fetch("https://claudio-arz.github.io/AeroDeck-HTML/turnCoordinator_Instrumento.html")
  .then(r => r.text())
  .then(html => {
    document.getElementById("inst09").innerHTML = html;
    });
});      

// Cargar el HTML de la caja de control del Turn Coordinator de forma dinámica.
window.addEventListener('DOMContentLoaded', () => {
  fetch("https://claudio-arz.github.io/AeroDeck-HTML/TurnCoordinator_Control.html")
    .then(r => {
      if (!r.ok) throw new Error('Error ' + r.status + ': ' + r.statusText);
      return r.text();
    })
    .then(html => {
      document.getElementById("inst13").innerHTML = html;
      // Inicializar controles del Turn Coordinator después de insertar el HTML
      if (typeof setupTurnCoordinatorControls === 'function') {
        setupTurnCoordinatorControls();
      } else {
        // Si el script aún no está cargado, esperar y reintentar
        setTimeout(() => {
          if (typeof setupTurnCoordinatorControls === 'function') {
            setupTurnCoordinatorControls();
          }
        }, 200);
      }
    })
    .catch(err => {
      console.error('Error cargando turnCoordinator_Control.html:', err);
      document.getElementById("inst13").innerHTML = '<div style="color:red;font-size:10px;">Error: ' + err.message + '</div>';
    });
});       

// Cargar el HTML del instrumento Gyro de forma dinámica
window.addEventListener('DOMContentLoaded', () => {
  fetch("https://claudio-arz.github.io/AeroDeck-HTML/gyro_Instrumento.html")
  .then(r => r.text())
  .then(html => {
    document.getElementById("inst10").innerHTML = html;
    });
});      

// Cargar el HTML de la caja de control del gyro de forma dinámica.
window.addEventListener('DOMContentLoaded', () => {
  fetch("https://claudio-arz.github.io/AeroDeck-HTML/Gyro_Control.html")
    .then(r => r.text())
    .then(html => {
      document.getElementById("inst07").innerHTML = html;
      // Inicializar controles del Gyro después de insertar el HTML
      if (typeof setupGyroControls === 'function') {
        setupGyroControls();
      } else {
        // Si el script aún no está cargado, esperar y reintentar
        setTimeout(() => {
          if (typeof setupGyroControls === 'function') {
            setupGyroControls();
          }
        }, 200);
      }
    });
});       

// Cargar el HTML del instrumento Attitude Control de forma dinámica
window.addEventListener('DOMContentLoaded', () => {
  fetch("https://claudio-arz.github.io/AeroDeck-HTML/AttitudeControl_Instrumento.html")
  .then(r => r.text())
  .then(html => {
    document.getElementById("inst02").innerHTML = html;
    });
});      

// Cargar el HTML de la caja de control del Air Speed de forma dinámica.
window.addEventListener('DOMContentLoaded', () => {
  fetch("https://claudio-arz.github.io/AeroDeck-HTML/airSpeed_Control.html")
    .then(r => r.text())
    .then(html => {
      document.getElementById("inst08").innerHTML = html;
      // Inicializar controles del Air Speed después de insertar el HTML
      if (typeof initAirSpeedControls === 'function') {
        initAirSpeedControls();
      } else {
        // Si el script aún no está cargado, esperar y reintentar
        setTimeout(() => {
          if (typeof initAirSpeedControls === 'function') {
            initAirSpeedControls();
          }
        }, 200);
      }
    });
});       

// Cargar el HTML del instrumento Air Speed de forma dinámica
window.addEventListener('DOMContentLoaded', () => {
  fetch("https://claudio-arz.github.io/AeroDeck-HTML/airSpeed_Instrumento.html")
  .then(r => r.text())
  .then(html => {
    document.getElementById("inst01").innerHTML = html;
    });
});      

// Cargar el HTML de la caja de control del Attitude Control de forma dinámica.
window.addEventListener('DOMContentLoaded', () => {
  fetch("https://claudio-arz.github.io/AeroDeck-HTML/AttitudeControl_Control.html")
    .then(r => r.text())
    .then(html => {
      document.getElementById("inst05").innerHTML = html;
      // Inicializar controles del Attitude Control después de insertar el HTML
      if (typeof initAttitudeControls === 'function') {
        initAttitudeControls();
      } else {
        // Si el script aún no está cargado, esperar y reintentar
        setTimeout(() => {
          if (typeof initAttitudeControls === 'function') {
            initAttitudeControls();
          }
        }, 200);
      }
    });
});       
// Cargar el HTML del instrumento RPM de forma dinámica
window.addEventListener('DOMContentLoaded', () => {
  fetch("https://claudio-arz.github.io/AeroDeck-HTML/RPM_Instrumento.html")
  .then(r => r.text())
  .then(html => {
    document.getElementById("inst04").innerHTML = html;
    });
});      

// Cargar el HTML de la caja de control del RPM de forma dinámica.
window.addEventListener('DOMContentLoaded', () => {
  fetch("https://claudio-arz.github.io/AeroDeck-HTML/RPM_Control.html")
    .then(r => r.text())
    .then(html => {
      document.getElementById("inst06").innerHTML = html;
      // Inicializar controles del RPM después de insertar el HTML
      if (typeof initRPMControls === 'function') {
        initRPMControls();
      } else {
        // Si el script aún no está cargado, esperar y reintentar
        setTimeout(() => {
          if (typeof initRPMControls === 'function') {
            initRPMControls();
          }
        }, 200);
      }
    });
});       
    
    
// Cargar el HTML del instrumento Variometer de forma dinámica
window.addEventListener('DOMContentLoaded', () => {  
  fetch("https://claudio-arz.github.io/AeroDeck-HTML/variometro_Instrumento.html")
    .then(r => r.text())
    .then(html => {
      document.getElementById("inst11").innerHTML = html;
    });
});

// Cargar el HTML del slider del  instrumento Variometer de forma dinámica
window.addEventListener('DOMContentLoaded', () => {
  fetch("https://claudio-arz.github.io/AeroDeck-HTML/variometro_Control.html")
    .then(r => r.text())
    .then(html => {
      document.getElementById("inst14").innerHTML = html;
      // Inicializar controles del variometer después de insertar el HTML
      if (typeof initVariometerControls === 'function') {
        initVariometerControls();
      } else {
        // Si el script aún no está cargado, esperar y reintentar
        setTimeout(() => {
          if (typeof initVariometerControls === 'function') {
            initVariometerControls();
          }
        }, 200);
      }
    });
});      

// Cargar el HTML del instrumento Altimeter de forma dinámica
window.addEventListener('DOMContentLoaded', () => {
  fetch("https://claudio-arz.github.io/AeroDeck-HTML/altimetro_Instrumento.html")
    .then(r => r.text())
    .then(html => {
      document.getElementById("inst03").innerHTML = html;
    });
});

// Control del slider para cambiar el color del box-shadow
window.addEventListener('DOMContentLoaded', () => {
  const slider = document.getElementById('shadow-color');
  const logo = document.getElementById('logo');
  let shadowEnabled = false; // Estado del shadow (APAGADO por defecto al arrancar)

  // Función para aplicar el color del box-shadow
  const applyShadowColor = (hue) => {
    if (!shadowEnabled) return; // No aplicar si está apagado
    const color = `hsl(${hue}, 60%, 70%)`;
    document.querySelectorAll('.instrumento-grid').forEach(el => {
      el.style.boxShadow = `0 0 20px 10px ${color}`;
    });
  };

  // Función para quitar el box-shadow
  const removeShadow = () => {
    document.querySelectorAll('.instrumento-grid').forEach(el => {
      el.style.boxShadow = 'none';
    });
  };

  // Inicializar el estado apagado al cargar la página
  if (logo) {
    logo.style.filter = 'grayscale(100%) brightness(0.5)';
  }
  if (slider) {
    slider.style.display = 'none'; // Ocultar slider inicialmente
  }
  removeShadow(); // Asegurar que las sombras estén apagadas

  // Toggle shadow al hacer click en el logo
  if (logo) {
    logo.style.cursor = 'pointer';
    logo.addEventListener('click', () => {
      shadowEnabled = !shadowEnabled;
      if (shadowEnabled) {
        applyShadowColor(slider ? slider.value : 220);
        logo.style.filter = 'drop-shadow(0 0 4px #fecfcf)';
        if (slider) slider.style.display = 'block';
      } else {
        removeShadow();
        logo.style.filter = 'grayscale(100%) brightness(0.5)';
        if (slider) slider.style.display = 'none';
      }
    });
  }

  if (slider) {
    // Escuchar cambios en el slider
    slider.addEventListener('input', (e) => {
      applyShadowColor(e.target.value);
    });
  }
});      

</script>
</html>
)rawliteral";








