module.exports = (req, res, next) => {
  try {
    const userHeader = req.headers["x-user"];

    if (userHeader) {
      const decoded = decodeURIComponent(userHeader);
      req.user = JSON.parse(decoded);
    } else {
      req.user = null;
    }
  } catch (error) {
    req.user = null;
  }

  next();
};