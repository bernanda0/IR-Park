#include <HTTPClient.h>
#include <IRremote.hpp>
#include <WiFi.h>
#include <WiFiMulti.h>
#include <freertos/FreeRTOS.h>
#include <freertos/task.h>

#define IR_RECEIVE_PIN 15
#define LED_BUILTIN 2 // Replace with the actual built-in LED pin
#define MOTOR_PIN 4   // Replace with the actual pin controlling the DC motor

const char* ssid = "CogniSafe";
const char* password = "12345678";
const char* endpoint = "http://192.168.137.1:4444/plate/verify";

const String receivedID = "VID327C4B413C186A71";
const String location = "Main Gate South";
const String payload = "v_id=" + receivedID + "&location=" + location;

WiFiMulti wifiMulti;

SemaphoreHandle_t httpSemaphore, receiverSemaphore;

void taskIRReceiver(void *pvParameters) {
  while (1) {
    if (IrReceiver.decode()) {
      Serial.println(IrReceiver.decodedIRData.decodedRawData, HEX);
      IrReceiver.printIRResultShort(&Serial);
      IrReceiver.printIRSendUsage(&Serial);
      IrReceiver.resume();
      xSemaphoreGive(receiverSemaphore); 
    }
  
    vTaskDelay(10 / portTICK_PERIOD_MS);
  }
}

void taskHTTPClient(void *pvParameters) {
  while (1) {
    if (wifiMulti.run() == WL_CONNECTED 
        /*xSemaphoreTake(receiverSemaphore, portMAX_DELAY) == pdTRUE*/) {
      WiFiClient client;
      HTTPClient http;

      if (http.begin(client, endpoint)) {
        http.addHeader("Content-Type", "application/x-www-form-urlencoded");
        int httpResponseCode = http.POST(payload);

        if (httpResponseCode == 200) {
          Serial.println("Request Success");
          xSemaphoreGive(httpSemaphore); // Trigger other tasks
        } else {
          Serial.print("HTTP Response code: ");
          Serial.println(httpResponseCode);
          Serial.printf("[HTTP] POST... failed, error: %s\n", http.errorToString(httpResponseCode).c_str());
        }

        http.end();
      } else {
         Serial.println("Client failed!");
      }
    }
    vTaskDelay(5000 / portTICK_PERIOD_MS);
  }
}

void onRequestSuccess(void *pvParameters) {
  while (1) {
    if (xSemaphoreTake(httpSemaphore, portMAX_DELAY) == pdTRUE) {
      digitalWrite(LED_BUILTIN, HIGH); // Turn on the LED
      vTaskDelay(300 / portTICK_PERIOD_MS); // Keep the LED on for 1 second
      digitalWrite(LED_BUILTIN, LOW); // Turn off the LED
      
      // Control the DC motor to open the gate
      digitalWrite(MOTOR_PIN, HIGH);
      vTaskDelay(1000 / portTICK_PERIOD_MS); // Run the motor for 1 second
      digitalWrite(MOTOR_PIN, LOW);
    }
    vTaskDelay(10 / portTICK_PERIOD_MS);
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(LED_BUILTIN, OUTPUT);
  pinMode(MOTOR_PIN, OUTPUT);

  // Connect to Wi-Fi
  WiFi.mode(WIFI_STA);
  wifiMulti.addAP(ssid, password);
  while (wifiMulti.run() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.print("Connected to WiFi in ");
  Serial.print(WiFi.localIP());
  IrReceiver.begin(IR_RECEIVE_PIN, DISABLE_LED_FEEDBACK);

  httpSemaphore = xSemaphoreCreateBinary();
  receiverSemaphore = xSemaphoreCreateBinary();
  
  xTaskCreatePinnedToCore(taskHTTPClient, "HTTPClient", 10000, NULL, 1, NULL, 1);
  // xTaskCreatePinnedToCore(taskIRReceiver, "IRReceiver", 10000, NULL, 1, NULL, 1);
  xTaskCreatePinnedToCore(onRequestSuccess, "RequestSuccessCallback", 10000, NULL, 1, NULL, 1);

}

void loop() {
  // Not used, as tasks handle the work
}
