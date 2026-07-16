// Centralized pricing configuration for AI-OS subscription plans
// All values are stored in paise (integers) to prevent floating-point rounding errors.

const PRICING = {
  monthly: {
    basePricePaise: 9900,         // ₹99.00
    platformChargePaise: 40,      // ₹0.40
    gstPaise: 200,                // ₹2.00
    totalPaise: 10140             // ₹101.40
  },
  yearly: {
    basePricePaise: 99900,        // ₹999.00
    platformChargePaise: 369,     // ₹3.69
    gstPaise: 2046,               // ₹20.46
    totalPaise: 102315            // ₹1023.15
  }
};

module.exports = { PRICING };
