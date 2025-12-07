// utils.js

/**
 * Generates a 4-digit OTP.
 * @returns {string} The generated OTP.
 */
function generateOTP() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

/**
 * Calculates the total amount from a list of items.
 * @param {Array} items - List of items with price and quantity.
 * @returns {number} The total amount.
 */
function calculateTotal(items) {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((total, item) => {
        const price = parseFloat(item.price) || 0;
        const quantity = parseFloat(item.quantity) || 1;
        return total + price * quantity;
    }, 0);
}

module.exports = {
    generateOTP,
    calculateTotal,
};
