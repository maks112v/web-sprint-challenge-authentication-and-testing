const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader) {
    return res.status(401).json({ message: 'token required' });
  }

  const token = authorizationHeader.replace('Bearer ', '');

  try {
    const decodedToken = jwt.verify(token, 'secret_key');
    req.userId = decodedToken.id;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'token invalid' });
  }
};
