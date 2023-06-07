const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader) {
    // Missing token in the Authorization header
    return res.status(401).send('token required');
  }

  // Extract the token from the Authorization header
  const token = authorizationHeader.replace('Bearer ', '');

  // Perform token validation here (e.g., check if it's valid and not expired)
  // You can use a library like jsonwebtoken to validate the token

  try {
    const decodedToken = jwt.verify(token, 'secret_key');
    req.userId = decodedToken.id; // Store the user ID in the request object for later use
    next();
  } catch (error) {
    // Invalid or expired token
    return res.status(401).send('token invalid');
  }
};
