'use strict';

const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const jwtToken =
    req.headers.authorization.slice(7) ||
    req.get('authorization') ||
    req.query.token ||
    req.body.token;
  if (!jwtToken) {
    const error = new Error('No token provided');
    error.status = 401;
    next(error);
    return;
  }

  jwt.verify(jwtToken, process.env.JWT_SECRET, (error, payload) => {
    if (error) {
      const error = new Error('Invalid token');
      error.status = 401;
      next(error);
      return;
    }

    // Si es válido
    req.apiUserId = payload._id;
    next();
  });
};
