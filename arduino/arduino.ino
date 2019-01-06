#include <Adafruit_NeoPixel.h>
#include <SimpleDHT.h>

#define PIN 6
#define NUMBER 6
const int in1 = 2;    // les broches de signal
const int in2 = 4;

int PinAnalogiqueHumidite=0;       //Broche Analogique de mesure d'humidité
int PinNumeriqueHumidite=9;        //Broche Numérique mesure de l'humidité
int pinDHT11=3;
int pinLumiere=1;

int hsol;  //Humidite su sol, mesure analogique
int secheresse;  //0 ou 1 si seuil atteint

int lumiere;

SimpleDHT11 dht11;
Adafruit_NeoPixel strip = Adafruit_NeoPixel(6, PIN, NEO_GRB + NEO_KHZ800);


void setup()
{
  pinMode(in1, OUTPUT);
  pinMode(in2, OUTPUT);
  Serial.begin(115200);

  // on démarre moteur en avant et en roue libre
  pinMode(PinAnalogiqueHumidite, INPUT);       //pin A0 en entrée analogique
  pinMode(PinNumeriqueHumidite, INPUT);  //pin 3 en entrée numérique

  pinMode(pinLumiere, INPUT);       //pin A0 en entrée analogique
  
  strip.begin();
  strip.setBrightness(50);
  strip.show(); 
}

void loop()
{ 
  lights_on();
  arrosage_off();

  hsol = analogRead(PinAnalogiqueHumidite); // Lit la tension analogique
  secheresse = digitalRead(PinNumeriqueHumidite);

  lumiere = analogRead(pinLumiere); 
  Serial.print("Humidité:"); 
  Serial.println(hsol); // afficher la mesure
  Serial.print("Lumiere:"); 
  Serial.print(lumiere); // afficher la mesure
  delay(1000);

  byte temperature = 0;
  int err = SimpleDHTErrSuccess;
  if ((err = dht11.read(pinDHT11, &temperature, NULL, NULL)) != SimpleDHTErrSuccess) { 
    Serial.print("Read DHT11 failed, err=");
    Serial.println(err);delay(1000);
    return; 
  }
  Serial.print("Lecture OK: ");
  Serial.print(" TEMPERATURE ");
  Serial.print((int)temperature);
  Serial.print(" °C, "); 
}

void lights_on(){
  uint16_t i; 
  for(i=0; i<NUMBER; i++) {
    strip.setPixelColor(i, 255, 0, 255);
  }
  strip.show();
}

void lights_off(){
  uint16_t i; 
  for(i=0; i<NUMBER; i++) {
    strip.setPixelColor(i, 0, 0,0);
  }
  strip.show();
}

void arrosage_on(){
  digitalWrite(in1, HIGH);
  digitalWrite(in2, LOW);
}

void arrosage_off(){
  digitalWrite(in1, LOW);
  digitalWrite(in2, LOW);
}


