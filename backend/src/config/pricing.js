// Centralized pricing configuration for AI-OS subscription plans
// All values are stored in paise (integers) to prevent floating-point rounding errors.
//
// GST CALCULATION (BUG-017 fix):
//   GST = 18% of base price (as required under Indian GST law for digital services).
//   Monthly:  Base ₹99.00 × 18% = ₹17.82 → 1782 paise
//   Yearly:   Base ₹999.00 × 18% = ₹179.82 → 17982 paise
//   Platform charge is a fixed convenience/gateway fee separate from GST.

const PRICING = {
  monthly: {
    basePricePaise:     9900,   // ₹99.00
    platformChargePaise: 40,   // ₹0.40  convenience fee
    gstPaise:           1782,   // ₹17.82 (18% of ₹99 base, as per Indian GST)
    totalPaise:         11722   // ₹117.22 (base + platform + GST)
  },
  yearly: {
    basePricePaise:     99900,  // ₹999.00
    platformChargePaise: 369,   // ₹3.69  convenience fee
    gstPaise:           17982,  // ₹179.82 (18% of ₹999 base, as per Indian GST)
    totalPaise:         118251  // ₹1182.51 (base + platform + GST)
  }
};

module.exports = { PRICING };
