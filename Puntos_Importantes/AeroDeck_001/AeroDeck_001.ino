/*
2026-02-08 14:50:47
Versión 003
Claudio Arzamendia Systems
Tablero completo con instrumental aeronáutico
para ajustar instrumentos analogicos.





Este sistema se basa en que .ino genera una página de internet y luego
 recibe y envía valores para actualizar la vista de los instrumentos. 
 El problema es que muevo el variometer, que tiene que enviar el valor 
 del slider al .ino, este programa tiene que calcular el valor  para el 
 altímetro, y transmitir los valores para el altimetro y el variómetro 
 para que se actualicen el la página web.

 2026-02-09 16:08:40
 Recuperando una caida, por cambios de librerías.

 2026-02-10 18:37:37
 Se volvió a usar ficheros .js esternos para funciones de actualización de instrumentos.
 Esta volviendo variometro y altimetro poco a poco a la vida.
 2026-02-11 21:08:03
 Ajustando por qué el slider no se refleja en el variómetro.
 2026-02-11 23:01:36
 Se agrega instrumento RPM, con su HTML y CSS. Se ajusta el código para cargarlo dinámicamente.
2026-02-12 17:57:48
  Se agrega lógica básica para manejar el instrumento RPM.



*/

#include <WiFi.h>
#include <WiFiManager.h> // https://github.com/tzapu/WiFiManager
#include <WebServer.h>
#include <WebSocketsServer.h>
#include <DNSServer.h>
#include <ArduinoJson.h>
// ===== HTML COMPLETO EMBEBIDO =====
#include "HTML/mainHTML.cpp"
// ===== OBJETOS =====
WebServer server(80);
WebSocketsServer ws(81);
DNSServer dnsServer;

// ===== VARIABLES GLOBALES =====
float verSpeedValue = 0.0f; // Velocidad vertical en pies por minuto mostrada por el variómetro
float altitudValue = 0.0f; // Altitud en pies mostrada por el altímetro
bool bandera_off = false; // Indica si el altímetro NO debe mostrar bandera_off
float RPMValue = 0.0f; // Valor de RPM mostrado por el instrumento RPM
float RPMBase = 0.0f; // Valor de RPM sin ruido, para cálculos internos
bool RPMNoice = false; // Indica si el instrumento RPM debe mostrar ruido (noice)
bool RPMStarted = false; // Indica si el motor está encendido (RPM > 0)
bool guardoRPMBase = false; // Indica si el valor base de RPM ha sido guardado
bool startRoutine = false; // Indica si la rutina automática de arranque está activa
unsigned long routineStart = 0; // Tiempo de inicio de la rutina
int routineStep = 0; // Paso actual de la rutina
float routineInitial = 0.0f; // Valor inicial de RPM para la rutina
float varRPM = 0.0f; // Valor variable de RPM durante la rutina


// ===== FUNCIONES WEBSOCKET =====
void onWsEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
  
  if (type == WStype_TEXT) {
    StaticJsonDocument<128> doc;
    DeserializationError error = deserializeJson(doc, payload, length);
    if (error) {
      // Si no es JSON válido, ignorar
      return;
    }
    varRPM = RPMValue;
    if (doc["verticalSpeed"].is<float>() || doc["verticalSpeed"].is<int>()) {
      verSpeedValue = doc["verticalSpeed"].as<float>();
    }

    if (doc["rpmSlider"].is<float>() || doc["rpmSlider"].is<int>()) {
       RPMValue = doc["rpmSlider"].as<float>();
    }
    if (doc["noiceBtnRPM"].is<bool>()) {
      RPMNoice = doc["noiceBtnRPM"].as<bool>();
    } else if (doc["noiceBtnRPM"].is<int>()) {
      RPMNoice = (doc["noiceBtnRPM"].as<int>() != 0);
    }
    if (doc["startBtnRPM"].is<bool>()) {
      RPMStarted = doc["startBtnRPM"].as<bool>();
      if (RPMValue == 0.0f && RPMStarted) {
        Serial.println("Iniciando rutina de arranque RPM...");
        varRPM = RPMValue;
        RPMStarted = true;
        startRoutine = true;
        routineStart = millis();
        routineStep = 0;
        routineInitial = varRPM;
      } else if (!RPMStarted) {
        Serial.println("Deteniendo rutina de arranque RPM...");
        RPMStarted = false;
        startRoutine = false;
      }
    }
  }


}


// ===== CONFIGURAR ACCESS POINT =====
const char* ap_ssid = "Intrumentos-ESP32";  // Nombre del AP servidor
const char* ap_pass = "12345678";   // mínimo 8 caracteres

// Puerto DNS estándar
const byte DNS_PORT = 53;

// IP fija del AP (típica 192.168.4.1)
IPAddress apIP(192, 168, 4, 1);
IPAddress netMsk(255, 255, 255, 0);



// ===== HANDLERS DEL SERVIDOR HTTP =====

// Página principal
void handleRoot() {
  String page = MAIN_page;
  page.replace("Cargando...", WiFi.localIP().toString());
  server.send(200, "text/html", page);
}


// ===== SETUP =====
void setup() {
  Serial.begin(115200);
  WiFiManager wifiManager;
  // wifiManager.resetSettings(); // Descomenta para forzar portal cada vez
  Serial.println("Iniciando WiFiManager...");
  if (!wifiManager.autoConnect("Instrumentos-ESP32")) {
    Serial.println("No se pudo conectar a WiFi. Reiniciando...");
    delay(3000);
    ESP.restart();
  }
  Serial.println("Conectado a WiFi!");
  Serial.print("IP asignada: ");
  Serial.println(WiFi.localIP());
  
  // ===== HTTP SERVER =====
  
  server.on("/", handleRoot);
  // server.onNotFound(handleNotFound); // Comentado porque handleNotFound está comentada
  server.begin();
  
  // ===== WEBSOCKET =====
  ws.begin();
  ws.onEvent(onWsEvent);
  

}


static unsigned long lastUpdate = 0; // usada en variometroAltimetro
float cuentaTiempo = 0.0f;

// ===== LOOP PRINCIPAL =====
void loop() {
  // Manejo de variómetro y altímetro
  variometroAltimetro();
  // Manejo de RPM
  manejoRPM();
  
  // Procesar DNS (muy importante para el portal cautivo)
  dnsServer.processNextRequest();
  // HTTP server
  server.handleClient();
  // WebSocket
  ws.loop();

  
  // Enviar valores de los dos instrumentos activos
  StaticJsonDocument<1000> doc;
  doc["verticalSpeed"] = verSpeedValue;
  doc["altitudValue"] = altitudValue;
  doc["bandera_off"] = bandera_off;
  doc["RPMValue"] = RPMValue;
  doc["varRPM"] = varRPM;
  doc["RPMNoice"] = RPMNoice;
  
  String output;
  serializeJson(doc, output);
  ws.broadcastTXT(output);
  
  
  cuentaTiempo += 0.05f; // Aproximadamente cada 50 ms
  if (cuentaTiempo >= 5.0f) {
    cuentaTiempo = 0.0f; // Reiniciar contador
    // Cuenta 5 segundos y puede hacer algo.
    Serial.println("Enviando datos: " + output);
    Serial.println("==============================");
    Serial.println("Estado actual:");
    Serial.print("Velocidad vertical: ");Serial.print(verSpeedValue);Serial.println(" ft/min");
    Serial.print("Altitud: ");Serial.print(altitudValue );Serial.println(" ft");
    Serial.print("Bandera off: ");Serial.println(bandera_off ? "Sí" : "No");
    Serial.print("varRPM: ");Serial.print(varRPM);Serial.println(" rpm");  
    Serial.print("RPMValue: ");Serial.print(RPMValue);Serial.println(" rpm");  
    Serial.print("Ruido en RPM: ");Serial.println(RPMNoice ? "Sí" : "No");
    Serial.print("Motor encendido: ");Serial.println(RPMStarted ? "Sí" : "No");
    Serial.println("==============================");
  }
  
  delay(50);
  
}

// Función para manejar variómetro y altímetro

void variometroAltimetro() {
  if (altitudValue < 19000.0f) {
    bandera_off = false; // Reiniciar bandera_off si altitud es menor a 19000 pies
  } else {
    bandera_off = true; // Activar bandera_off si altitud es 19000 pies o más
  }
  
  if (verSpeedValue != 0 ) {
    unsigned long now = millis();
    if (lastUpdate == 0) lastUpdate = now;
    float dt = (now - lastUpdate) / 60000.0f; // minutos
    lastUpdate = now;
    if (dt > 0) {
      altitudValue += verSpeedValue * dt;
    }
    if (altitudValue <= 0.0f) altitudValue = 0.0f;
  }
}

// Función para manejar lógica del instrumento RPM
void manejoRPM() {
  
  // Rutina automática de arranque
  if (startRoutine) {
    unsigned long t = millis() - routineStart;
    if (routineStep == 0) { // Subir a 1000 rpm en 1.5s
      float frac = min(1.0f, t / 1500.0f);
      varRPM = routineInitial + (1000 - routineInitial) * frac;
      if (frac >= 1.0f) {
        routineStep = 1;
        routineStart = millis();
      }
    } else if (routineStep == 1) { // Mantener 3s
      varRPM = 1000;
      if (t >= 3000) {
        routineStep = 2;
        routineStart = millis();
      }
    } else if (routineStep == 2) { // Bajar a 700 rpm en 3s
      float frac = min(1.0f, t / 3000.0f);
      varRPM = 1000 + (700 - 1000) * frac;
      if (frac >= 1.0f) {
        varRPM = 700;
        startRoutine = false;
      }
    }
  }

  float rpm_mostrar = varRPM;
  if (RPMNoice && varRPM > 0.0f) {

    int ruido = random(-5, 5); // de -5 a +5
    rpm_mostrar = varRPM + ruido;
    rpm_mostrar = max(0.0f, rpm_mostrar); // Asegurar que no sea menor a 0
    rpm_mostrar = min(3000.0f, rpm_mostrar); // Asegurar que no sea mayor a 3000
  }
  varRPM = rpm_mostrar;
}


