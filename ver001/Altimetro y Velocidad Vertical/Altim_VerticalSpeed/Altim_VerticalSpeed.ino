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


// ===== WEBSOCKET EVENTOS =====
int vsSliderValue = 0;
void onWsEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
  if (type == WStype_TEXT) {
    String msg = (const char*)payload;
    if (msg.indexOf("setVerticalSpeed") >= 0) {
      int start = msg.indexOf(":");
      int end = msg.indexOf("}", start);
      if (start > 0 && end > start) {
        String val = msg.substring(start + 1, end);
        vsSliderValue = val.toInt();
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
float heading = 0.0f;
float verticalSpeed = 0.0f;

float vsVar = 0.0f;
void loop() {
  // Procesar DNS (muy importante para el portal cautivo)
  dnsServer.processNextRequest();

  // HTTP server
  server.handleClient();

  // WebSocket
  ws.loop();

  // Lectura y envío del heading
  static unsigned long lastUpdate = millis();
  unsigned long now = millis();
  float dt = (now - lastUpdate) / 60000.0f; // minutos
  lastUpdate = now;
  // heading += alturaVar; // Reemplazar con la lectura real del compás
  heading += vsVar * 1000.0f * dt; // vsVar en 1000 pies/minuto * minutos = pies
  if (heading >= 20000.0f) heading = 20000.0f;
  if (heading <= 0.0f) heading = 0.0f;

  if (verticalSpeed != vsSliderValue) {
    verticalSpeed = vsSliderValue; // Reemplazar con la lectura real de velocidad vertical
    // Mapear de 127 a -127 a 2 a -2
    vsVar = (verticalSpeed / 127.0f) * 2.0f;
    Serial.print("verticalSpeed: ");
    Serial.print(verticalSpeed);
    Serial.print("  vsVar: ");
    Serial.println(vsVar);
  }
  char buffer[128];
  sprintf(buffer, "{\"heading\":%.2f,\"verticalSpeed\":%.2f,\"vsSliderValue\":%d}", heading, vsVar, vsSliderValue);
  ws.broadcastTXT(buffer);

  delay(50);
}
