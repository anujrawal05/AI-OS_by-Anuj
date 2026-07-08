const { fetchNewsByCategory } = require('../services/news/newsService');

async function getNews(req, res, next) {
  const { category } = req.query;

  try {
    const articles = await fetchNewsByCategory(category);

    return res.status(200).json({
      success: true,
      category,
      articles
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getNews
};
