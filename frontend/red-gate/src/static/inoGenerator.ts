// inoGenerator.js
export function generateInoContent(variableValue : any) {
    return `
      // Your .ino code here
      int myVariable = ${variableValue}; // Change the value to the desired value
      void setup() {
        // Your setup code here
      }
      void loop() {
        // Your loop code here
      }
    `;
  }
  