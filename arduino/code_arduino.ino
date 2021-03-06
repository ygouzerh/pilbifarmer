#include <Adafruit_NeoPixel.h>
#include <SimpleDHT.h>
#include <SoftwareSerial.h>

#define PIN 6
#define NUMBER 6
#define rxPin 11 // Broche 11 en tant que RX, à raccorder sur TX du HC-05
#define txPin 10 // Broche 10 en tant que TX, à raccorder sur RX du HC-05

SoftwareSerial mySerial(rxPin, txPin);

const int in1 = 2;    // les broches de signal
const int in2 = 4;

int PinAnalogiqueHumidite=0;       //Broche Analogique de mesure d'humidité
int PinNumeriqueHumidite=9;        //Broche Numérique mesure de l'humidité
int pinDHT11=3;
int pinLumiere=1;

int hsol;  //Humidite su sol, mesure analogique
int secheresse;  //0 ou 1 si seuil atteint

int lumiere;
bool automatedWater = false;
unsigned long lightTimeinMillis = 0;
unsigned long waterTimeinMillis = 0;
bool automatedLights = false;
SimpleDHT11 dht11;
Adafruit_NeoPixel strip = Adafruit_NeoPixel(6, PIN, NEO_GRB + NEO_KHZ800);


void setup()
{
  pinMode(in1, OUTPUT);
  pinMode(in2, OUTPUT);
  mySerial.begin(9600);
  Serial.begin(9600);


  // on démarre moteur en avant et en roue libre
  pinMode(PinAnalogiqueHumidite, INPUT);       //pin A0 en entrée analogique
  pinMode(PinNumeriqueHumidite, INPUT);  //pin 3 en entrée numérique

  pinMode(pinLumiere, INPUT);       //pin A0 en entrée analogique
  
  strip.begin();
  strip.setBrightness(50);
  strip.show(); 


}

void loopPerSec(){
  hsol = analogRead(PinAnalogiqueHumidite); // Lit la tension analogique
  secheresse = digitalRead(PinNumeriqueHumidite);
  lumiere = analogRead(pinLumiere);
  mySerial.print(hsol); // afficher la mesure
  mySerial.print("#"); 
  mySerial.print(lumiere); // afficher la mesure
  byte temperature = 0;
  int err = SimpleDHTErrSuccess;
  if ((err = dht11.read(pinDHT11, &temperature, NULL, NULL)) != SimpleDHTErrSuccess) { 
    return; 
  }
  mySerial.print("#");
  mySerial.print((int)temperature);
  mySerial.print("\n");
  mySerial.println();
  delay(1000);
}

void loop()
{ 
  if(automatedLights ){
    if(millis() >= lightTimeinMillis){
      lights_off();
      automatedLights = false;
    }
    else
      lights_on();
  }
  if(automatedWater ){
    if(millis() >= waterTimeinMillis){
      arrosage_off();
      automatedWater = false;
    }
    else
      arrosage_on();
  }
  int i = 0;
  char someChar[200] = {0};
  String cmd = "";


  loopPerSec();
  // when characters arrive over the serial port...
  if(Serial.available()) {
   do{
   someChar[i++] = Serial.read();
   delay(3000);
   }while (Serial.available() > 0);
   mySerial.println(someChar);
   Serial.println(someChar);
  }
  while(mySerial.available()){
   char ch = (char)mySerial.read();
   if( ch != '#' ) {
    cmd += ch;
   }
   else{
    long tmp = cmd.toInt();
    int action = tmp % 10;
    tmp = tmp / 10;
    int mode = tmp % 10;
    if(action == 1){
        
        if (mode == 1)
            lights_on();
        else if (mode == 3){
          tmp = tmp / 10 ; 
          int duree = tmp;
          unsigned long millisec = duree * 1000;
          lights_auto(millisec);
        }
        else
            lights_off();
    }
    if(action == 2){
        if (mode == 1)
            arrosage_on();
        else if (mode == 3){
          tmp = tmp / 10 ; 
          int duree = tmp;
          unsigned long millisec = duree * 1000;
          arrosage_auto(millisec);
        }
        else
            arrosage_off();
    }
   }
   
  }

}



void lights_on(){
  uint16_t i; 
  for(i=0; i<NUMBER; i++) {
    strip.setPixelColor(i, 255, 0, 255);
  }
  strip.show();
}

void lights_auto(unsigned long period){
  automatedLights = true;
  lightTimeinMillis = millis() + period;
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

void arrosage_auto(unsigned long period){
  automatedWater = true;
  waterTimeinMillis = millis() + period;
}
