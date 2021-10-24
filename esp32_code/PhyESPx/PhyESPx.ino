#include <WiFi.h>
#include <WiFiClient.h>
#include <WebServer.h>
#include <Adafruit_NeoPixel.h>
#include "SPIFFS.h"

const char *ssid = "AP_01";

const int buttonPin = 18;

const int trigPin = 22;
const int echoPin = 21;

WebServer server(80);
Adafruit_NeoPixel pixel(1, 19, NEO_GRB + NEO_KHZ800);

String serverArg = "clear";
double startTime, lastSessionDuration;
double lastPing;


void handleRoot() {
  handleFileRequest("/index.html");
  serverArg = "clear";
}

bool handleFileRequest(String path) {
  Serial.print("Reading file: " + path + " from internal memory");
  String contentType = getContentType(path);
  if (SPIFFS.exists(path)) {
    File file = SPIFFS.open(path, "r");
    if(!path.equals("/index.html")){
      server.sendHeader("Cache-Control"," max-age=3600"); 
      Serial.print(" (cache) ");
    }
    size_t sent = server.streamFile(file, contentType);
    file.close();
    Serial.println(String ("  --  \"") + path + ("\" sent succesfully") );
    return true;
  }
  Serial.println(String(" --  Error during reading \"") + path + ("\" from internal memory"));   // If the file doesn't exist, return false
  return false;
}

void handleControl() {
  if (server.argName(0).equals("cmd")) {
    serverArg = server.arg(0);
    serverArg.trim();
  }
  server.send(200, "application/json", "{\"result\": true}");
  Serial.print("Client request: /control  Command: ");
  Serial.println(serverArg);
}

void handleGet() {
  lastPing = millis();

  if (serverArg == "start") {

    if(startTime == 0){
      startTime = millis(); //set the start timestamp to the current time
    }
    
    String dataJson = "{\"data\":{\"illum\":";
    dataJson  += measureDistance();  
    dataJson  += ",\"illum_time\":";
    dataJson  += (millis() - startTime + lastSessionDuration) / 1000;  
    dataJson  += "},\"measuring\":\"true\"}";
    server.send(200, "application/json", dataJson );
    
  } else if (serverArg == "stop") {

    if(startTime != 0){
    lastSessionDuration = millis() - startTime + lastSessionDuration;
    startTime = 0;
    }
    server.send(200, "application/json", "{\"data\":{},\"measuring\":false}");
    
  } else if (serverArg == "clear") {

    startTime = 0;
    lastSessionDuration = 0;
    server.send(200, "application/json", "{\"data\":{},\"measuring\":false}");
    
  }
}

long lastInterrupt;
void IRAM_ATTR toggleMeasuring() {
if(millis()-lastInterrupt > 1000){
  if(serverArg == "start"){
    serverArg = "stop";
  }else{
    serverArg = "start";
  }
  lastInterrupt = millis();
}
}

String getContentType(String filename) {
  if (filename.endsWith(".htm")) return "text/html";
  else if (filename.endsWith(".html")) return "text/html";
  else if (filename.endsWith(".css")) return "text/css";
  else if (filename.endsWith(".js")) return "application/javascript";
  else if (filename.endsWith(".png")) return "image/png";
  else if (filename.endsWith(".ico")) return "image/x-icon";
  return "text/plain";
}


int oldMeasurementVal;
int measureDistance(){
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  int result = pulseIn(echoPin, HIGH) * 0.034 / 2;
  if(result < 120){
    return result; 
    oldMeasurementVal = result;
  }else{ 
    return oldMeasurementVal;
  }
}

void setStatusLedColor(int r, int g, int b){
pixel.setPixelColor(0, pixel.Color(r, g, b));
pixel.show();  
}

void updateStatusLed(){
  if(millis() - lastPing > 1000){ //if there is no client available
    setStatusLedColor(255,200,0);  //make the led go yellow
    serverArg = "stop"; //stop the experiment
  }else if(serverArg == "start"){
    setStatusLedColor(0,255,0);
  }else{
    setStatusLedColor(0,0,255);
  }
}


IPAddress local_IP(192, 168, 178, 24);

IPAddress gateway(192, 168, 178, 1);

IPAddress subnet(255, 255, 255, 0);

void setup() {
  Serial.begin(115200);

  if (!WiFi.config(local_IP, gateway, subnet)) {
    Serial.println("STA Failed to configure");
  }
  
  WiFi.mode(WIFI_STA);
  
  WiFi.begin(ssid);
  
  pixel.begin();
  
  Serial.println("");

  while (WiFi.status() != WL_CONNECTED) {
    for(int i = 0; i < 20; i++){
    setStatusLedColor(i*7,i*6,0);
    delay(25);
    }
    for(int i = 20; i > 0; i--){
    setStatusLedColor(i*7,i*6,0);
    delay(25);
    }
    Serial.print(".");
  }
  setStatusLedColor(5,3,0);
  Serial.println("");
  Serial.print("Connected to ");
  Serial.println(ssid);
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());

  SPIFFS.begin();

  server.on("/", handleRoot);
  
  server.on("/get", handleGet);
  
  server.on("/control", handleControl);
  
  server.onNotFound([]() {
    Serial.print("Client request: "); Serial.println(server.uri());
    if (!handleFileRequest(server.uri())) {
      server.send(404, "text/plain", "Error (404)");
    }
  });
  
  server.begin();
  
  Serial.println("HTTP server started");

  pinMode(buttonPin, INPUT_PULLUP);
  attachInterrupt(buttonPin, toggleMeasuring, FALLING);

  pinMode(trigPin, OUTPUT); // Sets the trigPin as an Output
  pinMode(echoPin, INPUT); // Sets the echoPin as an Input
  
  setStatusLedColor(255,200,0);
}

double lastStatusLedUpdate;

void loop() {
  server.handleClient();
  
  if(millis()-lastStatusLedUpdate > 500){
  updateStatusLed();
  lastStatusLedUpdate = millis();  
  }

}
