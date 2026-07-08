const { fetchMarketQuote } = require('../services/finance/financeService');

async function getQuote(req, res, next) {
  const { symbol } = req.query;

  try {
    const quote = await fetchMarketQuote(symbol);

    return res.status(200).json({
      success: true,
      symbol,
      quote
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getQuote
};
