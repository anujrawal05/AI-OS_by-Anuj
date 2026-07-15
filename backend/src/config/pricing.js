// Centralized pricing configuration for AI-OS subscription plans
// All values are stored in paise (integers) to prevent floating-point rounding errors.

const PRICING = {
  monthly: {
    basePricePaise: 9900,         // ₹99.00
    platformChargePaise: 200,     // ₹2.00
    gstPaise: 40,                 // ₹0.40
    totalPaise: 10140             // ₹101.40
  },
  yearly: {
    basePricePaise: 99900,        // ₹999.00
    platformChargePaise: 2046,    // ₹20.46
    gstPaise: 369,                // ₹3.69
    totalPaise: 102315            // ₹1023.15
  }
};

module.exports = { PRICING };
