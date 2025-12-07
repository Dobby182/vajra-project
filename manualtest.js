// manual_test.js
const { calculateTotal, generateOTP } = require('./utils');

console.log("--- Manual Testing ---");

console.log("\n--- Testing calculateTotal ---");

// Test Case 1: Decimal Prices
console.log("\nTest Case 1: Decimal Prices");
const itemsDecimal = [{ price: 10.50, quantity: 2 }];
const totalDecimal = calculateTotal(itemsDecimal);
console.log(`Input: [{ price: 10.50, quantity: 2 }]`);
console.log(`Expected: 21`);
console.log(`Actual: ${totalDecimal}`);
console.log(totalDecimal === 21 ? "✅ PASS" : "❌ FAIL");

// Test Case 2: String Inputs
console.log("\nTest Case 2: String Inputs");
const itemsString = [{ price: "100", quantity: "2" }];
const totalString = calculateTotal(itemsString);
console.log(`Input: [{ price: "100", quantity: "2" }]`);
console.log(`Expected: 200`);
console.log(`Actual: ${totalString}`);
console.log(totalString === 200 ? " PASS" : "FAIL");

console.log("\n--- Testing generateOTP ---");

// Test Case 3: OTP Generation
console.log("\nTest Case 3: OTP Generation");
const otp1 = generateOTP();
const otp2 = generateOTP();
console.log(`OTP 1: ${otp1}`);
console.log(`OTP 2: ${otp2}`);

const isString = typeof otp1 === 'string';
const isLength4 = otp1.length === 4;
const isNumeric = /^\d{4}$/.test(otp1);
const areDifferent = otp1 !== otp2;

console.log(`Is String? ${isString ? "✅ PASS" : "❌ FAIL"}`);
console.log(`Is Length 4? ${isLength4 ? "✅ PASS" : "❌ FAIL"}`);
console.log(`Is Numeric? ${isNumeric ? "✅ PASS" : "❌ FAIL"}`);
console.log(`Are Different? ${areDifferent ? "✅ PASS" : "❌ FAIL"}`);

console.log("\n--- End of Test ---");
