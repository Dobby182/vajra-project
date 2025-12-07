// test/utils.test.js
const { expect } = require("chai");
const { generateOTP, calculateTotal } = require("../utils");

describe("Utility Functions", () => {
    describe("generateOTP", () => {
        it("should return a string", () => {
            const otp = generateOTP();
            expect(otp).to.be.a("string");
        });

        it("should return a 4-digit number string", () => {
            const otp = generateOTP();
            expect(otp).to.match(/^\d{4}$/);
        });

        it("should return different OTPs on subsequent calls", () => {
            const otp1 = generateOTP();
            const otp2 = generateOTP();
            expect(otp1).to.not.equal(otp2);
        });
    });

    describe("calculateTotal", () => {
        it("should return 0 for empty items", () => {
            const total = calculateTotal([]);
            expect(total).to.equal(0);
        });

        it("should calculate total correctly for single item", () => {
            const items = [{ price: 100, quantity: 2 }];
            const total = calculateTotal(items);
            expect(total).to.equal(200);
        });

        it("should calculate total correctly for multiple items", () => {
            const items = [
                { price: 100, quantity: 2 },
                { price: 50, quantity: 1 },
            ];
            const total = calculateTotal(items);
            expect(total).to.equal(250);
        });
    });
});
