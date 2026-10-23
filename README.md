Bhai, bilkul! 😊 Main tumhare Smart Parking System ke sirf `sketch.ino` code ko line-by-line simple Hinglish mein samjhaunga — code mein kya use kiya hai, uska kya kaam hai, aur humne wahi kyon use kiya.

Sabse pehle project ka basic logic samajh lo:

- ENTER button: Car parking mein aayegi, to count `+1` hoga.
- EXIT button: Car bahar jayegi, to count `-1` hoga.
- 4 green LEDs: Jitni cars parked hain, utni green LEDs ON hongi.
- Red LED: Parking full hone par ON hogi.
- Blue LED: Parking empty hone par ON hogi.
- Maximum capacity: 4 cars. Count kabhi `0` se kam ya `4` se zyada nahi hoga.

## 1. Sabse pehle complete `sketch.ino` code

```
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
```

## 2. Code ki starting lines — comments

```
// Smart Parking System - Wokwi + Arduino Uno
// ENTER increments count; EXIT decrements count.
// 4 green LEDs show occupied slots. Red=FULL, Blue=EMPTY.
```

Ye lines comments hain.

- `//` ka matlab hai comment shuru ho raha hai.
- Compiler in lines ko execute nahi karta.
- Ye programmer ko batati hain ki code ka purpose kya hai.

Humne kyon use kiya? Taaki tum, teacher, ya koi doosra programmer code padhkar jaldi samajh sake ki project kya karta hai. Comments likhna compulsory nahi hai, lekin code samajhne mein helpful hai.

## 3. Pins define karna

```
const byte ENTER_PIN = 2;
const byte EXIT_PIN = 3;
```

Pehli line:

- `const` ka matlab value ko fixed rakhna.
- `byte` ek chhota data type hai jo `0` se `255` tak ki unsigned value store kar sakta hai.
- `ENTER_PIN` variable ka naam hai.
- `= 2` batata hai ki ENTER button Arduino ke digital pin `2` se connected hai.

Doosri line: EXIT button digital pin `3` par connected hai.

Humne kyon use kiya? Taaki har jagah pin number `2` aur `3` directly likhne ke bajaye meaningful names use kar saken. Agar pin badalna ho, to definition change karna easy hai.

```
const byte slotLeds[4] = {4, 5, 6, 7};
```

Is line ko parts mein samjho:

- `slotLeds` ek array hai.
- `[4]` ka matlab array mein 4 elements hain.
- `{4, 5, 6, 7}` Arduino ke woh pins hain jin par 4 green LEDs connected hain.

| Green LED | Arduino pin |
| --------- | ----------- |
| LED 1     | D4          |
| LED 2     | D5          |
| LED 3     | D6          |
| LED 4     | D7          |

Humne array kyon use kiya? Kyunki 4 LEDs ka kaam similar hai. Har LED ke liye alag-alag code likhne ke bajaye hum loop se sabko control kar sakte hain.

```
const byte FULL_LED = 8;
const byte EMPTY_LED = 9;
```

- `FULL_LED` red LED ko represent karta hai, jo D8 par connected hai.
- `EMPTY_LED` blue LED ko represent karta hai, jo D9 par connected hai.

Kyon? Red LED se parking full hone ka signal aur blue LED se parking empty hone ka signal milta hai.

```
const byte CAPACITY = 4;
byte carsParked = 0;
```

- `CAPACITY = 4`: parking mein maximum 4 cars aa sakti hain.
- `carsParked = 0`: shuru mein program maan kar chalta hai ki parking empty hai.

`CAPACITY` ko `const` rakha hai kyunki parking ki maximum capacity code mein fixed hai. `carsParked` ko fixed nahi rakha, kyunki buttons dabane par uski value badalti rahegi.

Example:

| Action           | `carsParked` |
| ---------------- | ------------ |
| Simulation start | 0            |
| ENTER ek baar    | 1            |
| ENTER dobara     | 2            |
| EXIT ek baar     | 1            |

## 4. `bool` variables — button ki state check karna

```
bool lastEnter = HIGH, stableEnter = HIGH;
bool lastExit = HIGH, stableExit = HIGH;
```

Pehle `bool` samjho. Boolean variable mein sirf do values hoti hain:

- `HIGH` — Arduino pin par HIGH signal.
- `LOW` — Arduino pin par LOW signal.

Humne har button ke liye do variables rakhe hain:

- `lastEnter`: ENTER button ki pichhli reading.
- `stableEnter`: ENTER button ki confirmed, stable state.
- `lastExit`: EXIT button ki pichhli reading.
- `stableExit`: EXIT button ki confirmed, stable state.

Shuru mein inhe `HIGH` rakha hai kyunki hum `INPUT_PULLUP` use kar rahe hain. Is setting mein button normally `HIGH` hota hai aur press karne par `LOW` hota hai.

Humne do variables per button kyon use kiye? Button press karne par electrical signal kabhi bahut chhote samay ke liye ON-OFF ho sakta hai. Isse ek press ko multiple presses samajhne ka risk hota hai. Dono states compare karke hum is problem ko control karte hain.

```
unsigned long enterChangedAt = 0, exitChangedAt = 0;
const unsigned long DEBOUNCE_MS = 35;
```

- `unsigned long`: ek aisa data type jo bade, non-negative numbers store karta hai.
- `enterChangedAt`: ENTER button ki reading aakhri baar badalne ka time.
- `exitChangedAt`: EXIT button ki reading aakhri baar badalne ka time.
- `DEBOUNCE_MS = 35`: button ki state ko stable confirm karne ke liye 35 milliseconds wait karna hai.

Humne 35 milliseconds kyon rakhe? Taaki button ke electrical bounce ki wajah se ek press ko baar-baar count na kiya jaye. Is technique ko debouncing kehte hain.

## 5. `updateOutputs()` function

```
void updateOutputs() {
```

- `void` ka matlab function koi value return nahi karta.
- `updateOutputs` function ka naam hai.
- `{` ke baad function ka code shuru hota hai.

Is function ka kaam hai: current parking count ke hisaab se LEDs update karna aur Serial Monitor par result dikhana.

### 5.1 Green LEDs control karna

```
for (byte i = 0; i < CAPACITY; i++)
  digitalWrite(slotLeds[i], carsParked > i ? HIGH : LOW);
```

Ye code thoda important hai, isliye ise parts mein samjho.

`for` loop:

```
for (byte i = 0; i < CAPACITY; i++)
```

- `byte i = 0`: loop index zero se start hota hai.
- `i < CAPACITY`: loop tab tak chalega jab `i`, `4` se chhota hai.
- `i++`: har round ke baad `i` mein 1 add hota hai.

Isliye `i` ki values hongi `0, 1, 2, 3`. Yaani loop 4 baar chalega, har LED ke liye ek baar.

LED control karne wala part:

```
digitalWrite(slotLeds[i], carsParked > i ? HIGH : LOW);
```

- `digitalWrite(...)` kisi digital output pin ko ON ya OFF signal deta hai.
- `slotLeds[i]` current LED ka pin select karta hai.
- `carsParked > i` check karta hai ki parked cars ki sankhya current LED ke index se badi hai ya nahi.
- `? HIGH : LOW` ek conditional operator hai: condition true ho to `HIGH`, warna `LOW`.

Example: agar `carsParked = 2` hai:

| `i` | LED         | Condition | Result |
| --- | ----------- | --------- | ------ |
| 0   | Green LED 1 | `2 > 0`   | ON     |
| 1   | Green LED 2 | `2 > 1`   | ON     |
| 2   | Green LED 3 | `2 > 2`   | OFF    |
| 3   | Green LED 4 | `2 > 3`   | OFF    |

Isliye 2 cars parked hone par exactly 2 green LEDs ON hongi.

Humne loop kyon use kiya? Chaar LEDs ke liye chaar alag `digitalWrite()` statements likhne ke bajaye ek hi logic ko 4 baar chalane ke liye. Isse code chhota aur maintain karna easy hota hai.

### 5.2 Parking FULL LED

```
digitalWrite(FULL_LED, carsParked == CAPACITY ? HIGH : LOW);
```

- `FULL_LED` red LED ka pin hai.
- `==` ka matlab hai dono values equal hain ya nahi, check karna.
- Agar `carsParked == CAPACITY`, yani `4 == 4`, to red LED ON.
- Agar count 4 nahi hai, to red LED OFF.

Kyon? Taaki user ko turant pata chale ki saari parking spaces bhar gayi hain.

Yaad rakho: `==` comparison ke liye hota hai, jabki `=` value assign karne ke liye hota hai.

### 5.3 Parking EMPTY LED

```
digitalWrite(EMPTY_LED, carsParked == 0 ? HIGH : LOW);
```

- Agar parked cars `0` hain, to blue LED ON.
- Agar ek ya zyada cars parked hain, to blue LED OFF.

Kyon? Taaki empty parking ka indication mile.

### 5.4 Serial Monitor par result dikhana

```
Serial.print("Cars parked: ");
Serial.print(carsParked);
Serial.print(" | Available spaces: ");
Serial.println(CAPACITY - carsParked);
```

Ye lines computer par parking ka status text ke form mein dikhati hain.

- `Serial.print("Cars parked: ");` text print karta hai.
- `Serial.print(carsParked);` parked cars ki current value print karta hai.
- `Serial.print(" | Available spaces: ");` agla label print karta hai.
- `Serial.println(CAPACITY - carsParked);` available spaces calculate karke print karta hai. `println` ke baad next output new line se shuru hota hai.

Formula:

\\[ \text{Available Spaces} = 4 - \text{Cars Parked} \\]

Example: 3 cars parked hain, to available spaces `4 - 3 = 1` hongi.

Humne Serial Monitor kyon use kiya? Taaki LEDs ke saath numerical result bhi dekh sakein. Wokwi mein Serial Monitor open karoge to messages dikhai denge.

```
}
```

Ye `updateOutputs()` function ka end hai.

## 6. `setup()` function — program start hote hi

```
void setup() {
```

Arduino mein `setup()` function sirf ek baar run hota hai, jab board start ya reset hota hai.

```
pinMode(ENTER_PIN, INPUT_PULLUP);
pinMode(EXIT_PIN, INPUT_PULLUP);
```

`pinMode()` Arduino ko batata hai ki koi pin input hai ya output.

- `ENTER_PIN` button ki reading lega.
- `EXIT_PIN` button ki reading lega.
- `INPUT_PULLUP` internal pull-up resistor enable karta hai.

Humne `INPUT_PULLUP` kyon use kiya? Isse button ke liye Arduino ka internal pull-up use hota hai. Is circuit mein button ka doosra terminal GND se connected hai, isliye:

| Button condition | Arduino reading |
| ---------------- | --------------- |
| Button release   | `HIGH`          |
| Button press     | `LOW`           |

Isliye code mein hum button press detect karne ke liye `LOW` check karte hain.

```
for (byte i = 0; i < CAPACITY; i++) pinMode(slotLeds[i], OUTPUT);
```

Ye loop 4 green LED pins ko `OUTPUT` banata hai.

- `OUTPUT` ka matlab Arduino in pins se signals bhejega.
- In signals se LEDs ON ya OFF hongi.

Loop kyon? Taaki D4, D5, D6 aur D7 sabko ek hi statement se configure kar sakein.

```
pinMode(FULL_LED, OUTPUT);
pinMode(EMPTY_LED, OUTPUT);
```

Red FULL LED aur blue EMPTY LED ko bhi output set karte hain.

```
Serial.begin(9600);
```

Ye Serial communication start karta hai, `9600` baud rate par.

9600 kyon? Ye Serial Monitor ke liye ek common, simple baud rate hai. Agar Serial Monitor ki baud rate bhi `9600` hai, to text sahi tarah display hoga.

```
Serial.println("Smart Parking System started");
```

Start hone par Serial Monitor mein startup message print hota hai. Isse pata chalta hai ki program start ho gaya hai.

```
updateOutputs();
```

Program start hote hi output update karne ke liye function call kiya jata hai.

Kyon? Shuru mein `carsParked = 0` hai, isliye program turant green LEDs OFF aur blue EMPTY LED ON kar sakta hai. Saath hi available spaces `4` print hongi.

```
}
```

Ye `setup()` function ka end hai.

## 7. `loop()` function — project ka main logic

```
void loop() {
```

`loop()` Arduino mein baar-baar chalta rehta hai jab tak board powered hai.

Humne kyon use kiya? Taaki Arduino continuously check karta rahe ki ENTER ya EXIT button press hua hai ya nahi.

### 7.1 Current time lena

```
unsigned long now = millis();
```

- `millis()` Arduino start hone ke baad guzre milliseconds batata hai.
- `now` us current time ko store karta hai.

Kyon? Button kitni der se ek state mein hai, ye check karne ke liye. Isse debouncing implement hoti hai.

### 7.2 ENTER button ki current reading

```
bool enterReading = digitalRead(ENTER_PIN);
```

- `digitalRead()` kisi input pin ki current state read karta hai.
- `ENTER_PIN` yani D2 ki reading `enterReading` mein store hoti hai.
- Result `HIGH` ya `LOW` hoga.

Kyon? Arduino ko pata chale ki ENTER button press hai ya release.

### 7.3 Check karna ki ENTER ki reading badli hai ya nahi

```
if (enterReading != lastEnter) {
  lastEnter = enterReading;
  enterChangedAt = now;
}
```

Line-by-line:

- `if`: condition check karta hai.
- `!=`: ka matlab hai equal nahi hai.
- `enterReading != lastEnter`: current reading aur previous reading compare hoti hain.
- `lastEnter = enterReading;`: nayi reading ko previous reading ke roop mein save karte hain.
- `enterChangedAt = now;`: reading badalne ka current time save karte hain.

Example: Button release tha (`HIGH`), ab press kiya (`LOW`). Dono readings different hain, to program change ka time save karega.

Kyon? Debouncing ke liye pata hona chahiye ki button ki state aakhri baar kab badli.

### 7.4 ENTER ki state stable hai ya nahi

```
if (now - enterChangedAt > DEBOUNCE_MS && enterReading != stableEnter) {
  stableEnter = enterReading;
```

Is condition mein do checks hain:

1. `now - enterChangedAt > DEBOUNCE_MS`: reading badalne ke baad 35 milliseconds se zyada ho gaye?
2. `enterReading != stableEnter`: current reading confirmed stable reading se different hai?

`&&` ka matlab AND hai. Dono conditions true honi chahiye.

Agar dono true hain, to:

```
stableEnter = enterReading;
```

Confirmed stable state ko update kar diya jata hai.

Kyon? Button ke electrical bounce ki wajah se false/multiple presses ko kam karne ke liye.

### 7.5 Confirmed button press par car count badhana

```
if (stableEnter == LOW) {
```

Agar confirmed state `LOW` hai, to iska matlab ENTER button press hua hai.

```
if (carsParked < CAPACITY) {
  carsParked++;
  Serial.println("ENTER: car accepted");
} else Serial.println("ENTER: parking FULL");
```

Ismein:

- `carsParked < CAPACITY`: check karta hai ki abhi 4 se kam cars parked hain.
- `carsParked++`: count mein 1 add karta hai.
- `"ENTER: car accepted"`: successful entry ka message print karta hai.
- `else`: agar parking pehle se full hai, to count nahi badhta aur `"ENTER: parking FULL"` print hota hai.

Humne capacity check kyon lagaya? Taaki parking mein 4 se zyada cars count na hon.

Example:

| Pehle count | ENTER press | Naya count |
| ----------- | ----------- | ---------- |
| 0           | Accept      | 1          |
| 1           | Accept      | 2          |
| 3           | Accept      | 4          |
| 4           | Reject      | 4          |

```
updateOutputs();
```

Count badalne ke baad LEDs aur Serial Monitor ko update karta hai.

```
}
```

Ye ENTER ke confirmed press wale block ka end hai.

### 7.6 EXIT button ki reading

Ab code isi tarah EXIT button check karta hai:

```
bool exitReading = digitalRead(EXIT_PIN);
```

D3 ki current reading `exitReading` mein save hoti hai.

```
if (exitReading != lastExit) {
  lastExit = exitReading;
  exitChangedAt = now;
}
```

Agar current reading previous reading se alag hai, to previous reading aur change ka time update hota hai.

```
if (now - exitChangedAt > DEBOUNCE_MS && exitReading != stableExit) {
  stableExit = exitReading;
```

Ye check karta hai ki EXIT button ki reading 35 milliseconds se zyada samay tak stable rahi aur confirmed state se badli hai.

Kyon? EXIT button par bhi debouncing zaroori hai, bilkul ENTER ki tarah.

### 7.7 EXIT press hone par car count ghatana

```
if (stableExit == LOW) {
  if (carsParked > 0) {
    carsParked--;
    Serial.println("EXIT: car left");
  } else Serial.println("EXIT: parking already EMPTY");
  updateOutputs();
}
```

Iska logic:

- `stableExit == LOW`: EXIT button press hua hai.
- `carsParked > 0`: parking mein kam se kam ek car hai.
- `carsParked--`: parked cars ka count 1 kam kar deta hai.
- `"EXIT: car left"`: car exit hone ka message print karta hai.
- `else`: agar count already 0 hai, to count kam nahi hota aur empty parking ka message print hota hai.
- `updateOutputs()`: LEDs aur available spaces dobara update karta hai.

Humne `carsParked > 0` kyon use kiya? Taaki count kabhi negative na ho.

Example:

| Pehle count | EXIT press | Naya count |
| ----------- | ---------- | ---------- |
| 4           | Car exits  | 3          |
| 2           | Car exits  | 1          |
| 1           | Car exits  | 0          |
| 0           | Reject     | 0          |

Aakhir mein:

```
}
```

Ye `loop()` function ka end hai. Arduino iske baad dobara `loop()` ke start par chala jata hai aur buttons check karta rehta hai.

## 8. Project ko ek example se samjho

Step 1 — Simulation start

0 cars parked; 0 green LEDs ON, blue EMPTY LED ON.

Step 2 — ENTER ek baar

Count 1; 1 green LED ON; available spaces 3.

Step 3 — ENTER chaar baar total

Count 4; all 4 green LEDs ON; red FULL LED ON.

Step 4 — EXIT ek baar

Count 3; 3 green LEDs ON; available spaces 1; red FULL LED OFF.

## 9. Viva ke liye important questions

| Question                                    | Simple answer                                                                  |
| ------------------------------------------- | ------------------------------------------------------------------------------ |
| `setup()` kya karta hai?                    | Program start par pins aur Serial Monitor initialize karta hai.                |
| `loop()` kya karta hai?                     | Buttons ko continuously check karta hai.                                       |
| `const` kyon use kiya?                      | Fixed values, jaise pin numbers aur capacity, define karne ke liye.            |
| `byte` kyon use kiya?                       | Chhoti positive integer values store karne ke liye.                            |
| `bool` kya hai?                             | `HIGH`/`LOW` jaisi do states represent karne wala data type.                   |
| `digitalRead()` kya karta hai?              | Button ki input state read karta hai.                                          |
| `digitalWrite()` kya karta hai?             | LED ko ON/OFF signal deta hai.                                                 |
| `INPUT_PULLUP` kyon use kiya?               | Internal pull-up ke saath button ko GND se connect karke read karne ke liye.   |
| Debouncing kya hai?                         | Ek physical button press ko multiple presses samajhne se bachane ki technique. |
| `millis()` kya karta hai?                   | Arduino start hone ke baad elapsed milliseconds deta hai.                      |
| `carsParked++` aur `carsParked--` kya hain? | Count ko ek badhana aur ek ghatana.                                            |
| `updateOutputs()` kyon banaya?              | LEDs aur Serial Monitor ko current count ke mutabik update karne ke liye.      |
| `Serial.begin(9600)` kyon?                  | Serial Monitor communication start karne ke liye.                              |

Sabse important baat, bhai: Is `sketch.ino` mein parking ki counting Arduino ke software se hoti hai. Green, red aur blue LEDs us count ko display karti hain. Ye Arduino-based simulation hai; is code mein count kisi external counter IC se nahi ho raha.
