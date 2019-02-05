#include <Time.h>
#include <TimeLib.h>      //para gestionar las fechas y tiempos de arduino
#include <ArduinoJson.h>  //para usar json
#include <SPI.h>
#include <SD.h>           //para manejar archivos de la SD del shiel Ethernet
#include <Ethernet.h>     //para usar shield ethernet
#include <PubSubClient.h> //para usar mqtt
#include <MemoryFree.h>   //para ver la memoria disponible del arduino

//---------- Ethernet ----------//
  //Setear la mac del arduino
  byte mac[]    = {  0xDE, 0xED, 0xBA, 0xFE, 0xFE, 0xED };
  //Setear el ip del arduino
  IPAddress ip(192, 168, 0, 105); //192.168.1.130
  //setear la ip del server (broker) 192.168.1.100
  IPAddress server(192, 168, 0, 102);

//---------- JSON ----------
  StaticJsonBuffer<200> jsonBuffer;
  StaticJsonBuffer<200> jsonBufferPub;
  char jsonData[150] = "";
  JsonObject& jsonPub = jsonBufferPub.createObject();
//---------- MQTT ----------
  EthernetClient ethClient;
  PubSubClient client(ethClient);

//variables para no usar delay
long millisMas1 = 0;
long reconcet5s = 0;

bool dateTimeSeteado = false;

void setup(){
  Serial.begin(9600);

  //---------- MQTT ----------//
    Ethernet.begin(mac, ip);
    // Espera a que el hardware se configure
    delay(3000);

  //---------- MQTT ----------
    //server: ip del broker, 1883: numero del puerto del broker de mosquitto
    client.setServer(server, 1883);
    client.setCallback(callback);

  //---------- SD ----------
    if (SD.begin(4))  Serial.println("Tarjeta SD OK");
    else  Serial.println("Error: Fallo al iniciar la tarjta SD");

  pinMode(A10, INPUT);
  millisMas1 = millis() + 1000;
}

void loop(){
  //se debe conectar una vez al broker y setear el dataTime para iniciar el resto del programa
  if(!dateTimeSeteado){
    if(!reconectar())
    {
      delay(3000);
    }
  }
  else
  {
    //si no esta conectado al broker y si paso mas de 5 segundos desde el ultimo intento de conexion intentara conectarce al broker
    if (!client.connected() and millis() >= reconcet5s ){
        reconectar();
        reconcet5s = millis() + 3000;
    }
    
    //si paso mas de 1 segundo desde la ultima ves que senso
    if(millis() >= millisMas1){
  //      //crea un array de chars
  //      char mensajeCaracter[10];
  //      //ingresa un caracter del mensaje a cada slot del array
  //      dtostrf(analogRead(A10), 0, 0, mensajeCaracter); 
  
      //Asignar valores a un Json
        jsonPub["idBoya"] = 1;
        jsonPub["idCompetidor"] = 2;
        jsonPub["cantVueltas"] = 4;
        jsonPub["tiempo"] = millis();
        jsonPub["velocidad"] = 111;
        jsonPub["dia"] = day();
        jsonPub["mes"] = month();
        jsonPub["ano"] = year();
        jsonPub["hora"] = hour();
        jsonPub["minutos"] = minute();
        jsonPub["segundos"] = second();
      //convertirlo a un array de Chars
      jsonPub.printTo(jsonData, sizeof(jsonData));
      Serial.println(jsonData);
  
        
      //guarda el valor sensado en el TXT correspondiente
      guardatTxt(jsonData, "olimpiadas.txt");
  
      //publica el mensanje en el topic boya
      if(client.publish("/boya",jsonData))  Serial.println("boya Subido");
      else  Serial.println("boya Error al subir Subido");
      
      //muestra la cantidad de memoria dispoonible del arduino
      Serial.print("Memoria Disponible: ");
      Serial.println(freeMemory());
      
      //lo setea 2 segundos mas
      millisMas1 = millis() + 2000;
    }
  }

  //permitir que el cliente procese los mensajes entrantes y mantenga su conexiÃ³n con el servidor
  client.loop();
}

//cuando recive un mensaje de una de sus suscripciones
void callback(char* topic, byte* payload, unsigned int length){
  //convierte el topic en un string
  String topico = "";
  for (int j=0; j < 10 ; j++) {
    topico += topic[j];
  }
  //convierte el mensaje en un string
  String mensaje = "";
  for (int i=0;i<length;i++) {
    mensaje += (char)payload[i];
    //Serial.print((char)payload[i]);
  }
  
  Serial.print("Topic: [");
  Serial.print(topico);
  Serial.print("] mensaje: ");
  Serial.println(mensaje);

  if(topico == "/dateTime")
  {
    setFechaHora(mensaje);
  }
}

bool reconectar(){ 
  Serial.print("conectando al broker... ");
  //si se conecta con el broker
  if (client.connect("arduinoClient")) {
    Serial.println("conectado");
    //se susribe al topic dataTime para recibir la fecha y tiempo del server
    client.subscribe("/dateTime");
    //enviar mensaje al topic /getDateTime para que el server lo reciva y mande el dateTime
    client.publish("/getDateTime","getDateTimeArduino");
    dateTimeSeteado = true;
    return true;
  } 
  else {
    Serial.print("Error al conectar");

    switch(client.state())
    {
      case -4:
        Serial.println("El server no respondio en el tiempo dado");
        break;
      case -3:
        Serial.println("La conexion de red se rompio");
        break;
      case -2:
        Serial.println("la conexion de red fallo");
        break;
      case -1:
        Serial.println("-1");
        break;
    }
    
    Serial.println(client.state());
    Serial.println("reintentando en 5 segundos");
    return false;
  }
}

void guardatTxt(char* jsonData, String nombreTxt){
  //abre el archivo TXT y lo asigna a lavariable a "archivoTxt"
  File archivoTxt = SD.open(nombreTxt, FILE_WRITE);
  
  //si se pudo abrir el TXT
  if (archivoTxt) {
      Serial.print("Escribiendo en ");
      Serial.print(nombreTxt);
      Serial.print(": ");
      Serial.println(jsonData);
      //Escribir el json al archivo txt
      archivoTxt.println(jsonData);
      // se cierra el archivo txt
      archivoTxt.close();
  }
  else {
    Serial.print("Error: no se pudo abrir el archivo ");
    Serial.println(nombreTxt);
  }
}

//setea la fecha y hora del arduino con la data enviada por el server
void setFechaHora(String fechaHora){
  JsonObject& dateTime = jsonBuffer.parseObject(fechaHora);
  //si se convirtio a json correctamente
  if(dateTime.success())
  {
    int ano = dateTime["ano"];
    int mes = dateTime["mes"];
    int dia = dateTime["dia"];
    int hora = dateTime["hora"];
    int minutos = dateTime["minutos"];
    int segundos = dateTime["segundos"];
    setTime(hora, minutos, segundos, dia, mes, ano);
    Serial.println("Fecha y Hora Seteado");
    dateTimeSeteado = true;
  }
  else Serial.println("JSON DateTime FALLO");
}
