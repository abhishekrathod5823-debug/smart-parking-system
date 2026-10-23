// Smart Parking System - Wokwi + Arduino Uno
// ENTER increments count; EXIT decrements count.
// 4 green LEDs show occupied slots. Red=FULL, Blue=EMPTY.

const byte ENTER_PIN = 2;
const byte EXIT_PIN = 3;
const byte slotLeds[4] = {4, 5, 6, 7};
const byte FULL_LED = 8;
const byte EMPTY_LED = 9;
const byte CAPACITY = 4;
byte carsParked = 0;

bool lastEnter = HIGH, stableEnter = HIGH;
bool lastExit = HIGH, stableExit = HIGH;
unsigned long enterChangedAt = 0, exitChangedAt = 0;
const unsigned long DEBOUNCE_MS = 35;

void updateOutputs() {
  for (byte i = 0; i < CAPACITY; i++)
    digitalWrite(slotLeds[i], carsParked > i ? HIGH : LOW);

  digitalWrite(FULL_LED, carsParked == CAPACITY ? HIGH : LOW);
  digitalWrite(EMPTY_LED, carsParked == 0 ? HIGH : LOW);

  Serial.print("Cars parked: ");
  Serial.print(carsParked);
  Serial.print(" | Available spaces: ");
  Serial.println(CAPACITY - carsParked);
}

void setup() {
  pinMode(ENTER_PIN, INPUT_PULLUP);
  pinMode(EXIT_PIN, INPUT_PULLUP);
  for (byte i = 0; i < CAPACITY; i++) pinMode(slotLeds[i], OUTPUT);
  pinMode(FULL_LED, OUTPUT);
  pinMode(EMPTY_LED, OUTPUT);
  Serial.begin(9600);
  Serial.println("Smart Parking System started");
  updateOutputs();
}

void loop() {
  unsigned long now = millis();

  bool enterReading = digitalRead(ENTER_PIN);
  if (enterReading != lastEnter) {
    lastEnter = enterReading;
    enterChangedAt = now;
  }
  if (now - enterChangedAt > DEBOUNCE_MS && enterReading != stableEnter) {
    stableEnter = enterReading;
    if (stableEnter == LOW) {
      if (carsParked < CAPACITY) {
        carsParked++;
        Serial.println("ENTER: car accepted");
      } else Serial.println("ENTER: parking FULL");
      updateOutputs();
    }
  }

  bool exitReading = digitalRead(EXIT_PIN);
  if (exitReading != lastExit) {
    lastExit = exitReading;
    exitChangedAt = now;
  }
  if (now - exitChangedAt > DEBOUNCE_MS && exitReading != stableExit) {
    stableExit = exitReading;
    if (stableExit == LOW) {
      if (carsParked > 0) {
        carsParked--;
        Serial.println("EXIT: car left");
      } else Serial.println("EXIT: parking already EMPTY");
      updateOutputs();
    }
  }
}
