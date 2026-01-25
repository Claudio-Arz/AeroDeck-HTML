
/*
  1/17/2026
  Arzamendia Systems
  Este programa es para ajustar un 
  instrumento analógico Attitude Control aeronáutico

  Despues de ingrezar ssid y pass
  Se conecta a 192.168.100.34
  

*/
#include <WiFi.h>
#include <WiFiManager.h> // https://github.com/tzapu/WiFiManager
#include <WebServer.h>
#include <WebSocketsServer.h>
#include <DNSServer.h>

// ===== OBJETOS =====
WebServer server(80);
WebSocketsServer ws(81);
DNSServer dnsServer;

// ===== CONFIGURAR ACCESS POINT =====
const char* ap_ssid = "Intrumentos-ESP32";  // Nombre del AP servidor
const char* ap_pass = "12345678";   // mínimo 8 caracteres

// Puerto DNS estándar
const byte DNS_PORT = 53;

// IP fija del AP (típica 192.168.4.1)
IPAddress apIP(192, 168, 4, 1);
IPAddress netMsk(255, 255, 255, 0);
// ===== HTML COMPLETO EMBEBIDO =====
#include "mainHTML.cpp"



// ===== WEBSOCKET EVENTOS SOLO ROLL Y PITCH =====
float roll = 0.0f;
float pitch = 0.0f;
void onWsEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
  if (type == WStype_TEXT) {
    String msg = (const char*)payload;
    // Recibir valor de roll
    if (msg.indexOf("setRoll") >= 0) {
      int start = msg.indexOf(":");
      int end = msg.indexOf("}", start);
      if (start > 0 && end > start) {
        String val = msg.substring(start + 1, end);
        roll = val.toFloat();
      }
    }
    // Recibir valor de pitch
    if (msg.indexOf("setPitch") >= 0) {
      int start = msg.indexOf(":");
      int end = msg.indexOf("}", start);
      if (start > 0 && end > start) {
        String val = msg.substring(start + 1, end);
        pitch = val.toFloat();
      }
    }
  }
}

// ===== HANDLERS DEL SERVIDOR HTTP =====

// Página principal
void handleRoot() {
  String page = MAIN_page;
  page.replace("Cargando...", WiFi.localIP().toString());
  server.send(200, "text/html", page);
}

// Redirección genérica: cualquier path te manda al compás
void handleNotFound() {
  server.sendHeader("Location", String("http://") + apIP.toString(), true);
  server.send(302, "text/plain", "");
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
  server.onNotFound(handleNotFound);
  server.begin();

  // ===== WEBSOCKET =====
  ws.begin();
  ws.onEvent(onWsEvent);

}

// ===== LOOP =====

void loop() {

  // Procesar DNS (muy importante para el portal cautivo)
  dnsServer.processNextRequest();
  // HTTP server
  server.handleClient();
  // WebSocket
  ws.loop();

  // Enviar solo roll y pitch
  char buffer[80];
  sprintf(buffer, "{\"roll\":%.2f,\"pitch\":%.2f}", roll, pitch);
  ws.broadcastTXT(buffer);

  delay(50);
}
